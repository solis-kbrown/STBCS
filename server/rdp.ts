import type { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { requireAuth, requireBusiness, type AuthenticatedRequest } from "./auth";
import rateLimit from "express-rate-limit";
import net from "net";
import { log } from "./index";

interface RDPSession {
  id: string;
  userId: string;
  hostname: string;
  port: number;
  width: number;
  height: number;
  security: string;
  createdAt: number;
  tcpSocket: net.Socket | null;
  wsClient: WebSocket | null;
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

      const ipRegex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
      const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!ipRegex.test(cleanHostname) && !hostnameRegex.test(cleanHostname)) {
        return res.status(400).json({ error: "Invalid hostname or IP address" });
      }

      const privateIpRanges = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^0\./,
        /^169\.254\./,
      ];

      if (ipRegex.test(cleanHostname)) {
        for (const range of privateIpRanges) {
          if (range.test(cleanHostname)) {
            return res.status(400).json({ error: "Cannot connect to private/reserved IP addresses" });
          }
        }
      }

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

  httpServer.on("upgrade", (req, socket, head) => {
    const url = req.url || "";
    if (!url.startsWith("/ws/rdp/")) return;

    const sessionId = url.replace("/ws/rdp/", "").split("?")[0];
    const session = activeSessions.get(sessionId);

    if (!session) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
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
    host: session.hostname,
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
