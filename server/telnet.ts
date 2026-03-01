import type { Server as HTTPServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Express, Response } from "express";
import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
import { requireAuth, requirePro, type AuthenticatedRequest } from "./auth";
import rateLimit from "express-rate-limit";
import { log } from "./index";
import { storage } from "./storage";

interface TelnetSession {
  id: string;
  userId: string;
  hostname: string;
  resolvedIP: string;
  port: number;
  createdAt: number;
  lastActivity: number;
  tcpSocket: net.Socket | null;
  wsClient: WebSocket | null;
}

const activeSessions = new Map<string, TelnetSession>();
const MAX_SESSIONS_PER_USER = 3;
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

function cleanupSession(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  if (session.tcpSocket && !session.tcpSocket.destroyed) {
    try { session.tcpSocket.destroy(); } catch {}
  }
  if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
    try { session.wsClient.close(); } catch {}
  }
  activeSessions.delete(sessionId);
  log(`Telnet session ${sessionId.substring(0, 8)}... cleaned up`, "telnet");
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions) {
    if (now - session.createdAt > SESSION_TIMEOUT_MS) {
      log(`Telnet session ${id.substring(0, 8)}... max duration timeout`, "telnet");
      if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
        session.wsClient.send(JSON.stringify({ type: "error", message: "Session expired (15 minute maximum). Please reconnect." }));
      }
      cleanupSession(id);
    } else if (now - session.lastActivity > IDLE_TIMEOUT_MS) {
      log(`Telnet session ${id.substring(0, 8)}... idle timeout`, "telnet");
      if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
        session.wsClient.send(JSON.stringify({ type: "error", message: "Session closed due to inactivity (10 minutes idle)." }));
      }
      cleanupSession(id);
    }
  }
}, 30000);

const telnetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
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

const ALLOWED_PORTS = [
  23, 25, 80, 110, 143, 389, 443, 465, 587, 636, 993, 995,
  2525, 3306, 5432, 6379, 8080, 8443, 11211, 27017,
];
const MAX_PORT = 65535;

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

  let resolvedIP: string | null = null;

  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      for (const addr of addresses) {
        if (isPrivateIP(addr)) {
          throw new Error("Cannot connect to private/reserved IP addresses");
        }
      }
      resolvedIP = addresses[0];
    }
  } catch (err: any) {
    if (err.message?.includes("private") || err.message?.includes("reserved")) {
      throw err;
    }
  }

  if (!resolvedIP) {
    try {
      const addresses6 = await dns.resolve6(hostname);
      if (addresses6 && addresses6.length > 0) {
        for (const addr of addresses6) {
          if (isPrivateIP(addr)) {
            throw new Error("Cannot connect to private/reserved IP addresses");
          }
        }
        resolvedIP = addresses6[0];
      }
    } catch (err6: any) {
      if (err6.message?.includes("private") || err6.message?.includes("reserved")) {
        throw err6;
      }
    }
  }

  if (!resolvedIP) {
    throw new Error("Host not found. Check the hostname or IP address.");
  }

  return resolvedIP;
}

function parseCookieSession(req: IncomingMessage): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)session_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function registerTelnetRoutes(app: Express) {
  app.post("/api/telnet/connect", telnetLimiter, requireAuth, requirePro, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hostname, port } = req.body;

      if (!hostname) {
        return res.status(400).json({ error: "Hostname is required" });
      }

      const cleanHostname = String(hostname).trim();
      if (cleanHostname.length > 253) {
        return res.status(400).json({ error: "Hostname too long" });
      }

      const cleanPort = parseInt(String(port || "23"), 10);

      if (isNaN(cleanPort) || cleanPort < 1 || cleanPort > MAX_PORT) {
        return res.status(400).json({ error: "Invalid port number" });
      }

      if (!ALLOWED_PORTS.includes(cleanPort)) {
        return res.status(400).json({ error: `Port ${cleanPort} is not allowed. Permitted ports: ${ALLOWED_PORTS.join(", ")}` });
      }

      if (!ipRegex.test(cleanHostname) && !hostnameRegex.test(cleanHostname)) {
        return res.status(400).json({ error: "Invalid hostname or IP address" });
      }

      const resolvedIP = await resolveAndValidateHost(cleanHostname);

      const userId = req.user!.id;
      let userSessionCount = 0;
      for (const session of activeSessions.values()) {
        if (session.userId === userId) userSessionCount++;
      }
      if (userSessionCount >= MAX_SESSIONS_PER_USER) {
        return res.status(429).json({ error: `Maximum ${MAX_SESSIONS_PER_USER} concurrent Telnet sessions allowed` });
      }

      const sessionId = crypto.randomBytes(32).toString("hex");

      const session: TelnetSession = {
        id: sessionId,
        userId,
        hostname: cleanHostname,
        resolvedIP,
        port: cleanPort,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        tcpSocket: null,
        wsClient: null,
      };

      activeSessions.set(sessionId, session);

      log(`Telnet session created: ${sessionId.substring(0, 8)}... -> ${cleanHostname}:${cleanPort} by user ${userId}`, "telnet");

      res.json({
        sessionId,
        message: "Session created. Connect via WebSocket to begin.",
      });
    } catch (error: any) {
      log(`Telnet connect error: ${error.message}`, "telnet");

      if (error.message?.includes("private") || error.message?.includes("reserved")) {
        return res.status(400).json({ error: error.message });
      }

      let userMessage = "Failed to create Telnet session";
      if (error.message?.includes("Host not found")) {
        userMessage = error.message;
      }

      res.status(502).json({ error: userMessage });
    }
  });

  app.post("/api/telnet/disconnect/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

  app.get("/api/telnet/sessions", requireAuth, requirePro, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const userSessions = [];
    for (const session of activeSessions.values()) {
      if (session.userId === userId) {
        userSessions.push({
          id: session.id,
          hostname: session.hostname,
          port: session.port,
          createdAt: session.createdAt,
          connected: session.wsClient?.readyState === WebSocket.OPEN,
        });
      }
    }
    res.json(userSessions);
  });
}

export function setupTelnetWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", async (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/ws/telnet/")) return;

    const sessionId = url.replace("/ws/telnet/", "").split("?")[0];
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

    wss.handleUpgrade(req, socket, head, (ws) => {
      handleTelnetConnection(ws, session);
    });
  });
}

function handleTelnetConnection(ws: WebSocket, session: TelnetSession) {
  session.wsClient = ws;
  session.lastActivity = Date.now();

  log(`WebSocket connected for Telnet session ${session.id.substring(0, 8)}... -> ${session.hostname}:${session.port}`, "telnet");

  ws.send(JSON.stringify({ type: "status", status: "connecting" }));

  const tcpSocket = net.createConnection({
    host: session.resolvedIP,
    port: session.port,
    timeout: 10000,
  });

  session.tcpSocket = tcpSocket;

  tcpSocket.on("connect", () => {
    log(`TCP connection established to ${session.hostname}:${session.port}`, "telnet");
    ws.send(JSON.stringify({ type: "status", status: "connected" }));
  });

  tcpSocket.on("data", (data: Buffer) => {
    session.lastActivity = Date.now();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "output", data: data.toString("base64") }));
    }
  });

  tcpSocket.on("error", (err) => {
    log(`TCP error for Telnet session ${session.id.substring(0, 8)}...: ${err.message}`, "telnet");
    if (ws.readyState === WebSocket.OPEN) {
      let msg = `Connection error: ${err.message}`;
      if (err.message?.includes("ECONNREFUSED")) {
        msg = `Connection refused — no service is listening on ${session.hostname}:${session.port}`;
      } else if (err.message?.includes("ETIMEDOUT")) {
        msg = `Connection timed out — the host did not respond on port ${session.port}`;
      } else if (err.message?.includes("EHOSTUNREACH")) {
        msg = "Host unreachable — check network connectivity";
      }
      ws.send(JSON.stringify({ type: "error", message: msg }));
    }
  });

  tcpSocket.on("close", () => {
    log(`TCP connection closed for Telnet session ${session.id.substring(0, 8)}...`, "telnet");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "status", status: "disconnected" }));
      ws.close();
    }
  });

  tcpSocket.on("timeout", () => {
    log(`TCP timeout for Telnet session ${session.id.substring(0, 8)}...`, "telnet");
    tcpSocket.destroy();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "error", message: "Connection timed out. The remote host did not respond." }));
      ws.close();
    }
  });

  ws.on("message", (data) => {
    session.lastActivity = Date.now();

    try {
      const msg = JSON.parse(String(data));

      switch (msg.type) {
        case "input":
          if (tcpSocket && !tcpSocket.destroyed && msg.data) {
            const decoded = Buffer.from(msg.data, "base64");
            tcpSocket.write(decoded);
          }
          break;

        case "raw":
          if (tcpSocket && !tcpSocket.destroyed && msg.data) {
            tcpSocket.write(msg.data);
          }
          break;

        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;
      }
    } catch {}
  });

  ws.on("close", () => {
    log(`WebSocket closed for Telnet session ${session.id.substring(0, 8)}...`, "telnet");
    cleanupSession(session.id);
  });

  ws.on("error", (err) => {
    log(`WebSocket error for Telnet session ${session.id.substring(0, 8)}...: ${err.message}`, "telnet");
    cleanupSession(session.id);
  });
}
