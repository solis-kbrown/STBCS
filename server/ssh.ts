import type { Server as HTTPServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Express, Response } from "express";
import crypto from "crypto";
import dns from "dns/promises";
import { Client as SSHClient } from "ssh2";
import type { ClientChannel } from "ssh2";
import { requireAuth, requireBusiness, type AuthenticatedRequest } from "./auth";
import rateLimit from "express-rate-limit";
import { log } from "./index";
import { storage } from "./storage";

interface SSHSession {
  id: string;
  userId: string;
  hostname: string;
  port: number;
  username: string;
  createdAt: number;
  sshClient: SSHClient | null;
  shell: ClientChannel | null;
  wsClient: WebSocket | null;
  cols: number;
  rows: number;
  lastActivity: number;
}

const activeSessions = new Map<string, SSHSession>();
const MAX_SESSIONS_PER_USER = 3;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function cleanupSession(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  if (session.shell) {
    try { session.shell.close(); } catch {}
  }
  if (session.sshClient) {
    try { session.sshClient.end(); } catch {}
  }
  if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
    try { session.wsClient.close(); } catch {}
  }
  activeSessions.delete(sessionId);
  log(`SSH session ${sessionId.substring(0, 8)}... cleaned up`, "ssh");
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions) {
    if (now - session.createdAt > SESSION_TIMEOUT_MS) {
      log(`SSH session ${id.substring(0, 8)}... max duration timeout`, "ssh");
      if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
        session.wsClient.send(JSON.stringify({ type: "error", message: "Session expired (30 minute maximum). Please reconnect." }));
      }
      cleanupSession(id);
    } else if (now - session.lastActivity > IDLE_TIMEOUT_MS) {
      log(`SSH session ${id.substring(0, 8)}... idle timeout`, "ssh");
      if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
        session.wsClient.send(JSON.stringify({ type: "error", message: "Session closed due to inactivity (15 minutes idle)." }));
      }
      cleanupSession(id);
    }
  }
}, 60000);

const sshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many connection attempts. Please wait before trying again." },
});

const privateIpRanges = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^fd/,
];

const ipRegex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

const MAX_HOSTNAME_LEN = 253;
const MAX_USERNAME_LEN = 128;
const MAX_PASSWORD_LEN = 256;
const MAX_PRIVATE_KEY_LEN = 32768;

function isPrivateIP(ip: string): boolean {
  for (const range of privateIpRanges) {
    if (range.test(ip)) return true;
  }
  if (ip.startsWith("::ffff:")) {
    const v4 = ip.slice(7);
    for (const range of privateIpRanges) {
      if (range.test(v4)) return true;
    }
  }
  return false;
}

async function resolveAndValidateHost(hostname: string): Promise<string> {
  if (ipRegex.test(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error("Cannot connect to private/reserved IP addresses");
    }
    return hostname;
  }

  try {
    const addresses = await dns.resolve4(hostname);
    if (!addresses || addresses.length === 0) {
      throw new Error("Host not found");
    }
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        throw new Error("Cannot connect to private/reserved IP addresses");
      }
    }
  } catch (err: any) {
    if (err.message?.includes("private") || err.message?.includes("reserved")) {
      throw err;
    }
    try {
      const addresses6 = await dns.resolve6(hostname);
      if (addresses6 && addresses6.length > 0) {
        for (const addr of addresses6) {
          if (isPrivateIP(addr)) {
            throw new Error("Cannot connect to private/reserved IP addresses");
          }
        }
      }
    } catch (err6: any) {
      if (err6.message?.includes("private") || err6.message?.includes("reserved")) {
        throw err6;
      }
      throw new Error("Host not found. Check the hostname or IP address.");
    }
  }

  return hostname;
}

function parseCookieSession(req: IncomingMessage): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function registerSSHRoutes(app: Express) {
  app.post("/api/ssh/connect", sshLimiter, requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hostname, port, username, password, privateKey, cols, rows } = req.body;

      if (!hostname || !username) {
        return res.status(400).json({ error: "Hostname and username are required" });
      }

      if (!password && !privateKey) {
        return res.status(400).json({ error: "Password or private key is required" });
      }

      const cleanHostname = String(hostname).trim();
      if (cleanHostname.length > MAX_HOSTNAME_LEN) {
        return res.status(400).json({ error: "Hostname too long" });
      }
      if (String(username).length > MAX_USERNAME_LEN) {
        return res.status(400).json({ error: "Username too long" });
      }
      if (password && String(password).length > MAX_PASSWORD_LEN) {
        return res.status(400).json({ error: "Password too long" });
      }
      if (privateKey && String(privateKey).length > MAX_PRIVATE_KEY_LEN) {
        return res.status(400).json({ error: "Private key too large (max 32KB)" });
      }

      const cleanPort = parseInt(String(port || "22"), 10);
      const cleanCols = Math.min(Math.max(parseInt(String(cols || "120"), 10), 40), 400);
      const cleanRows = Math.min(Math.max(parseInt(String(rows || "30"), 10), 10), 200);

      if (isNaN(cleanPort) || cleanPort < 1 || cleanPort > 65535) {
        return res.status(400).json({ error: "Invalid port number" });
      }

      if (!ipRegex.test(cleanHostname) && !hostnameRegex.test(cleanHostname)) {
        return res.status(400).json({ error: "Invalid hostname or IP address" });
      }

      await resolveAndValidateHost(cleanHostname);

      const userId = req.user!.id;
      let userSessionCount = 0;
      for (const session of activeSessions.values()) {
        if (session.userId === userId) userSessionCount++;
      }
      if (userSessionCount >= MAX_SESSIONS_PER_USER) {
        return res.status(429).json({ error: `Maximum ${MAX_SESSIONS_PER_USER} concurrent SSH sessions allowed` });
      }

      const sessionId = crypto.randomBytes(32).toString("hex");

      const session: SSHSession = {
        id: sessionId,
        userId,
        hostname: cleanHostname,
        port: cleanPort,
        username: String(username),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        sshClient: null,
        shell: null,
        wsClient: null,
        cols: cleanCols,
        rows: cleanRows,
      };

      const sshClient = new SSHClient();

      const connectPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timed out after 15 seconds"));
          sshClient.end();
        }, 15000);

        sshClient.on("ready", () => {
          clearTimeout(timeout);
          session.sshClient = sshClient;
          activeSessions.set(sessionId, session);
          log(`SSH session created: ${sessionId.substring(0, 8)}... -> ${cleanHostname}:${cleanPort} by user ${userId}`, "ssh");
          resolve();
        });

        sshClient.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        const connectConfig: any = {
          host: cleanHostname,
          port: cleanPort,
          username: String(username),
          readyTimeout: 15000,
          keepaliveInterval: 10000,
          keepaliveCountMax: 3,
        };

        if (privateKey) {
          connectConfig.privateKey = String(privateKey);
          if (password) {
            connectConfig.passphrase = String(password);
          }
        } else {
          connectConfig.password = String(password);
        }

        sshClient.connect(connectConfig);
      });

      await connectPromise;

      res.json({
        sessionId,
        message: "SSH connection established. Connect via WebSocket for terminal access.",
      });
    } catch (error: any) {
      log(`SSH connect error: ${error.message}`, "ssh");
      let userMessage = "Failed to establish SSH connection";

      if (error.message?.includes("private") || error.message?.includes("reserved")) {
        return res.status(400).json({ error: error.message });
      } else if (error.message?.includes("timed out")) {
        userMessage = "Connection timed out. The remote host did not respond.";
      } else if (error.message?.includes("Authentication failed") || error.message?.includes("authentication")) {
        userMessage = "Authentication failed. Check your username and password/key.";
      } else if (error.message?.includes("ECONNREFUSED")) {
        userMessage = "Connection refused. Verify the host is running an SSH server on the specified port.";
      } else if (error.message?.includes("ENOTFOUND") || error.message?.includes("getaddrinfo")) {
        userMessage = "Host not found. Check the hostname or IP address.";
      } else if (error.message?.includes("EHOSTUNREACH")) {
        userMessage = "Host unreachable. Check network connectivity.";
      }

      res.status(502).json({ error: userMessage });
    }
  });

  app.post("/api/ssh/disconnect/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    cleanupSession(sessionId);
    res.json({ success: true, message: "Session disconnected" });
  });

  app.get("/api/ssh/sessions", requireAuth, requireBusiness, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const userSessions = [];
    for (const session of activeSessions.values()) {
      if (session.userId === userId) {
        userSessions.push({
          id: session.id,
          hostname: session.hostname,
          port: session.port,
          username: session.username,
          createdAt: session.createdAt,
          connected: session.wsClient?.readyState === WebSocket.OPEN,
        });
      }
    }
    res.json(userSessions);
  });
}

export function setupSSHWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", async (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/ws/ssh/")) return;

    const sessionId = url.replace("/ws/ssh/", "").split("?")[0];
    const session = activeSessions.get(sessionId);

    if (!session) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    const token = parseCookieSession(req);
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      const dbSession = await storage.getSessionByToken(token);
      if (!dbSession || new Date(dbSession.expiresAt) < new Date()) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }
      const user = await storage.getUser(dbSession.userId);
      if (!user || String(user.id) !== String(session.userId)) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }
    } catch {
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
      return;
    }

    if (!session.sshClient) {
      socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      handleSSHConnection(ws, session);
    });
  });
}

function handleSSHConnection(ws: WebSocket, session: SSHSession) {
  session.wsClient = ws;
  session.lastActivity = Date.now();

  log(`WebSocket connected for SSH session ${session.id.substring(0, 8)}...`, "ssh");

  const sshClient = session.sshClient!;

  sshClient.shell(
    {
      term: "xterm-256color",
      cols: session.cols,
      rows: session.rows,
    },
    (err, stream) => {
      if (err) {
        log(`Shell error for session ${session.id.substring(0, 8)}...: ${err.message}`, "ssh");
        ws.send(JSON.stringify({ type: "error", message: `Failed to open shell: ${err.message}` }));
        ws.close();
        return;
      }

      session.shell = stream;

      ws.send(JSON.stringify({ type: "status", status: "ready" }));

      stream.on("data", (data: Buffer) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "output", data: data.toString("base64") }));
        }
      });

      stream.stderr?.on("data", (data: Buffer) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "output", data: data.toString("base64") }));
        }
      });

      stream.on("close", () => {
        log(`Shell closed for session ${session.id.substring(0, 8)}...`, "ssh");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "status", status: "disconnected" }));
          ws.close();
        }
      });

      stream.on("error", (err: Error) => {
        log(`Shell stream error for session ${session.id.substring(0, 8)}...: ${err.message}`, "ssh");
      });

      ws.on("message", (data) => {
        session.lastActivity = Date.now();

        try {
          const msg = JSON.parse(String(data));

          switch (msg.type) {
            case "input":
              if (stream && !stream.destroyed && msg.data) {
                const decoded = Buffer.from(msg.data, "base64");
                stream.write(decoded);
              }
              break;

            case "resize":
              if (stream && !stream.destroyed && msg.cols && msg.rows) {
                const cols = Math.min(Math.max(parseInt(msg.cols, 10), 40), 400);
                const rows = Math.min(Math.max(parseInt(msg.rows, 10), 10), 200);
                stream.setWindow(rows, cols, 0, 0);
                session.cols = cols;
                session.rows = rows;
              }
              break;

            case "ping":
              ws.send(JSON.stringify({ type: "pong" }));
              break;
          }
        } catch {}
      });

      ws.on("close", () => {
        log(`WebSocket closed for SSH session ${session.id.substring(0, 8)}...`, "ssh");
        cleanupSession(session.id);
      });

      ws.on("error", (err) => {
        log(`WebSocket error for session ${session.id.substring(0, 8)}...: ${err.message}`, "ssh");
        cleanupSession(session.id);
      });
    }
  );

  sshClient.on("end", () => {
    log(`SSH client disconnected for session ${session.id.substring(0, 8)}...`, "ssh");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "status", status: "disconnected" }));
      ws.close();
    }
  });

  sshClient.on("error", (err) => {
    log(`SSH client error for session ${session.id.substring(0, 8)}...: ${err.message}`, "ssh");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "error", message: `SSH error: ${err.message}` }));
    }
    cleanupSession(session.id);
  });
}
