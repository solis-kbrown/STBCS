import type { Server as HTTPServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { requireAuth, requireBusiness, type AuthenticatedRequest } from "./auth";
import rateLimit from "express-rate-limit";
import net from "net";
import dns from "dns/promises";
import { log } from "./index";
import { storage } from "./storage";

interface RDPSession {
  id: string;
  userId: string;
  hostname: string;
  resolvedIP: string;
  port: number;
  width: number;
  height: number;
  security: string;
  createdAt: number;
  tcpSocket: net.Socket | null;
  wsClient: WebSocket | null;
}

const ipRegex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;

function isPrivateIP(ip: string): boolean {
  if (/^127\./.test(ip)) return true;
  if (/^10\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^0\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true;
  if (ip === "::1" || ip === "::") return true;
  if (/^fe80:/i.test(ip)) return true;
  if (/^fc00:/i.test(ip)) return true;
  if (/^fd/i.test(ip)) return true;
  if (/^::ffff:(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|169\.254\.)/i.test(ip)) return true;
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

const activeSessions = new Map<string, RDPSession>();
const MAX_SESSIONS_PER_USER = 2;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function cleanupSession(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  if (session.tcpSocket && !session.tcpSocket.destroyed) {
    session.tcpSocket.destroy();
  }
  if (session.wsClient && session.wsClient.readyState === WebSocket.OPEN) {
    session.wsClient.close();
  }
  activeSessions.delete(sessionId);
  log(`RDP session ${sessionId.substring(0, 8)}... cleaned up`, "rdp");
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions) {
    if (now - session.createdAt > SESSION_TIMEOUT_MS) {
      log(`RDP session ${id.substring(0, 8)}... timed out`, "rdp");
      cleanupSession(id);
    }
  }
}, 60000);

const rdpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many connection attempts. Please wait before trying again." },
});

export function registerRDPRoutes(app: Express) {
  app.post("/api/rdp/connect", rdpLimiter, requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hostname, port, username, password, domain, width, height, security } = req.body;

      if (!hostname || !username || !password) {
        return res.status(400).json({ error: "Hostname, username, and password are required" });
      }

      const cleanHostname = String(hostname).trim();
      const cleanPort = parseInt(String(port || "3389"), 10);
      const cleanWidth = Math.min(Math.max(parseInt(String(width || "1920"), 10), 640), 3840);
      const cleanHeight = Math.min(Math.max(parseInt(String(height || "1080"), 10), 480), 2160);

      if (isNaN(cleanPort) || cleanPort < 1 || cleanPort > 65535) {
        return res.status(400).json({ error: "Invalid port number" });
      }

      if (cleanHostname.length > 253) {
        return res.status(400).json({ error: "Hostname too long" });
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
        return res.status(429).json({ error: `Maximum ${MAX_SESSIONS_PER_USER} concurrent sessions allowed` });
      }

      const sessionId = crypto.randomBytes(32).toString("hex");

      const session: RDPSession = {
        id: sessionId,
        userId,
        hostname: cleanHostname,
        resolvedIP,
        port: cleanPort,
        width: cleanWidth,
        height: cleanHeight,
        security: String(security || "nla"),
        createdAt: Date.now(),
        tcpSocket: null,
        wsClient: null,
      };

      activeSessions.set(sessionId, session);

      log(`RDP session created: ${sessionId.substring(0, 8)}... -> ${cleanHostname}:${cleanPort} by user ${userId}`, "rdp");

      res.json({
        sessionId,
        message: "Session created. Connect via WebSocket to begin.",
      });
    } catch (error: any) {
      console.error("RDP connect error:", error);
      res.status(500).json({ error: "Failed to create RDP session" });
    }
  });

  app.post("/api/rdp/disconnect/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

  app.get("/api/rdp/sessions", requireAuth, requireBusiness, (req: AuthenticatedRequest, res: Response) => {
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

export function setupRDPWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", async (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/ws/rdp/")) return;

    const sessionId = url.replace("/ws/rdp/", "").split("?")[0];
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
    } catch (err) {
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      handleRDPConnection(ws, session);
    });
  });
}

function handleRDPConnection(ws: WebSocket, session: RDPSession) {
  session.wsClient = ws;

  log(`WebSocket connected for RDP session ${session.id.substring(0, 8)}...`, "rdp");

  ws.send(JSON.stringify({
    type: "resize",
    width: session.width,
    height: session.height,
  }));

  const tcpSocket = net.createConnection({
    host: session.resolvedIP,
    port: session.port,
    timeout: 10000,
  });

  session.tcpSocket = tcpSocket;

  tcpSocket.on("connect", () => {
    log(`TCP connection established to ${session.hostname}:${session.port}`, "rdp");
    ws.send(JSON.stringify({ type: "status", status: "tcp_connected" }));
  });

  tcpSocket.on("data", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  tcpSocket.on("error", (err) => {
    log(`TCP error for session ${session.id.substring(0, 8)}...: ${err.message}`, "rdp");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "error",
        message: `Connection error: ${err.message}`,
      }));
    }
  });

  tcpSocket.on("close", () => {
    log(`TCP connection closed for session ${session.id.substring(0, 8)}...`, "rdp");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "status", status: "disconnected" }));
      ws.close();
    }
  });

  tcpSocket.on("timeout", () => {
    log(`TCP timeout for session ${session.id.substring(0, 8)}...`, "rdp");
    tcpSocket.destroy();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Connection timed out. The remote host did not respond.",
      }));
      ws.close();
    }
  });

  ws.on("message", (data) => {
    if (tcpSocket && !tcpSocket.destroyed) {
      if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
        tcpSocket.write(Buffer.from(data as ArrayBuffer));
      } else {
        try {
          const msg = JSON.parse(String(data));
          if (msg.type === "raw" && msg.data) {
            tcpSocket.write(Buffer.from(msg.data, "base64"));
          }
        } catch {}
      }
    }
  });

  ws.on("close", () => {
    log(`WebSocket closed for RDP session ${session.id.substring(0, 8)}...`, "rdp");
    cleanupSession(session.id);
  });

  ws.on("error", (err) => {
    log(`WebSocket error for session ${session.id.substring(0, 8)}...: ${err.message}`, "rdp");
    cleanupSession(session.id);
  });
}
