import type { Server as HTTPServer, IncomingMessage } from "http";
import type { Express, Response } from "express";
import crypto from "crypto";
import dns from "dns/promises";
import path from "path";
import { Client as SSHClient } from "ssh2";
import type { SFTPWrapper } from "ssh2";
import { requireAuth, requireBusiness, type AuthenticatedRequest } from "./auth";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { log } from "./index";

interface SFTPSession {
  id: string;
  userId: string;
  hostname: string;
  resolvedIP: string;
  port: number;
  username: string;
  createdAt: number;
  lastActivity: number;
  sshClient: SSHClient | null;
  sftp: SFTPWrapper | null;
}

const activeSessions = new Map<string, SFTPSession>();
const MAX_SESSIONS_PER_USER = 3;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function cleanupSession(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  if (session.sftp) {
    try { session.sftp.end(); } catch {}
  }
  if (session.sshClient) {
    try { session.sshClient.end(); } catch {}
  }
  activeSessions.delete(sessionId);
  log(`SFTP session ${sessionId.substring(0, 8)}... cleaned up`, "sftp");
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions) {
    if (now - session.createdAt > SESSION_TIMEOUT_MS) {
      log(`SFTP session ${id.substring(0, 8)}... max duration timeout`, "sftp");
      cleanupSession(id);
    } else if (now - session.lastActivity > IDLE_TIMEOUT_MS) {
      log(`SFTP session ${id.substring(0, 8)}... idle timeout`, "sftp");
      cleanupSession(id);
    }
  }
}, 60000);

const sftpLimiter = rateLimit({
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
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

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

function getSession(sessionId: string, userId: string): SFTPSession | null {
  const session = activeSessions.get(sessionId);
  if (!session || session.userId !== userId) return null;
  session.lastActivity = Date.now();
  return session;
}

function getSftp(session: SFTPSession): SFTPWrapper | null {
  if (!session.sftp || !session.sshClient) return null;
  return session.sftp;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
});

function sanitizeRemotePath(remotePath: string): string {
  const normalized = path.posix.normalize(remotePath);
  if (!normalized.startsWith("/")) {
    return "/" + normalized;
  }
  return normalized;
}

export function registerSFTPRoutes(app: Express) {
  app.post("/api/sftp/connect", sftpLimiter, requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hostname, port, username, password, privateKey } = req.body;

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

      if (isNaN(cleanPort) || cleanPort < 1 || cleanPort > 65535) {
        return res.status(400).json({ error: "Invalid port number" });
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
        return res.status(429).json({ error: `Maximum ${MAX_SESSIONS_PER_USER} concurrent SFTP sessions allowed` });
      }

      const sessionId = crypto.randomBytes(32).toString("hex");

      const session: SFTPSession = {
        id: sessionId,
        userId,
        hostname: cleanHostname,
        resolvedIP,
        port: cleanPort,
        username: String(username),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        sshClient: null,
        sftp: null,
      };

      const sshClient = new SSHClient();

      const connectPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timed out after 15 seconds"));
          sshClient.end();
        }, 15000);

        sshClient.on("ready", () => {
          clearTimeout(timeout);
          sshClient.sftp((err, sftp) => {
            if (err) {
              reject(new Error("Failed to initialize SFTP subsystem: " + err.message));
              sshClient.end();
              return;
            }
            session.sshClient = sshClient;
            session.sftp = sftp;
            activeSessions.set(sessionId, session);
            log(`SFTP session created: ${sessionId.substring(0, 8)}... -> ${cleanHostname}:${cleanPort} by user ${userId}`, "sftp");
            resolve();
          });
        });

        sshClient.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        const connectConfig: any = {
          host: resolvedIP,
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
        message: "SFTP connection established.",
      });
    } catch (error: any) {
      log(`SFTP connect error: ${error.message}`, "sftp");
      let userMessage = "Failed to establish SFTP connection";

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
      } else if (error.message?.includes("SFTP subsystem")) {
        userMessage = error.message;
      }

      res.status(502).json({ error: userMessage });
    }
  });

  app.post("/api/sftp/disconnect/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

  app.get("/api/sftp/sessions", requireAuth, requireBusiness, (req: AuthenticatedRequest, res: Response) => {
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
          connected: !!session.sftp,
        });
      }
    }
    res.json(userSessions);
  });

  app.post("/api/sftp/list", requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId, path: remotePath } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const dirPath = sanitizeRemotePath(remotePath || "/");

      const files = await new Promise<any[]>((resolve, reject) => {
        sftp.readdir(dirPath, (err, list) => {
          if (err) {
            reject(err);
            return;
          }
          const entries = list.map((item) => ({
            name: item.filename,
            longname: item.longname,
            size: item.attrs.size,
            uid: item.attrs.uid,
            gid: item.attrs.gid,
            mode: item.attrs.mode,
            atime: item.attrs.atime,
            mtime: item.attrs.mtime,
            isDirectory: (item.attrs.mode! & 0o40000) !== 0,
            isSymlink: (item.attrs.mode! & 0o120000) === 0o120000,
            permissions: formatPermissions(item.attrs.mode!),
          }));
          entries.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
          resolve(entries);
        });
      });

      res.json({ path: dirPath, files });
    } catch (error: any) {
      log(`SFTP list error: ${error.message}`, "sftp");
      res.status(500).json({ error: `Failed to list directory: ${error.message}` });
    }
  });

  app.post("/api/sftp/download/:sessionId", requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { path: remotePath } = req.body;

      if (!remotePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const filePath = sanitizeRemotePath(remotePath);
      const fileName = path.posix.basename(filePath);

      const stats = await new Promise<any>((resolve, reject) => {
        sftp.stat(filePath, (err, stats) => {
          if (err) reject(err);
          else resolve(stats);
        });
      });

      if ((stats.mode! & 0o40000) !== 0) {
        return res.status(400).json({ error: "Cannot download a directory" });
      }

      if (stats.size > MAX_UPLOAD_SIZE) {
        return res.status(400).json({ error: "File too large to download (max 50MB)" });
      }

      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      if (stats.size) {
        res.setHeader("Content-Length", stats.size);
      }

      const readStream = sftp.createReadStream(filePath);
      readStream.on("error", (err) => {
        log(`SFTP download stream error: ${err.message}`, "sftp");
        if (!res.headersSent) {
          res.status(500).json({ error: `Download failed: ${err.message}` });
        }
      });
      readStream.pipe(res);
    } catch (error: any) {
      log(`SFTP download error: ${error.message}`, "sftp");
      if (!res.headersSent) {
        res.status(500).json({ error: `Failed to download file: ${error.message}` });
      }
    }
  });

  app.post("/api/sftp/upload/:sessionId", requireAuth, requireBusiness, upload.single("file"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const remotePath = req.body.path;

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      if (!remotePath) {
        return res.status(400).json({ error: "Remote path is required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const filePath = sanitizeRemotePath(remotePath);

      await new Promise<void>((resolve, reject) => {
        const writeStream = sftp.createWriteStream(filePath);
        writeStream.on("error", reject);
        writeStream.on("close", () => resolve());
        writeStream.end(req.file!.buffer);
      });

      res.json({ success: true, message: "File uploaded successfully", path: filePath });
    } catch (error: any) {
      log(`SFTP upload error: ${error.message}`, "sftp");
      res.status(500).json({ error: `Failed to upload file: ${error.message}` });
    }
  });

  app.post("/api/sftp/delete/:sessionId", requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { path: remotePath, isDirectory } = req.body;

      if (!remotePath) {
        return res.status(400).json({ error: "Path is required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const filePath = sanitizeRemotePath(remotePath);

      if (filePath === "/") {
        return res.status(400).json({ error: "Cannot delete root directory" });
      }

      await new Promise<void>((resolve, reject) => {
        if (isDirectory) {
          sftp.rmdir(filePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        } else {
          sftp.unlink(filePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });

      res.json({ success: true, message: isDirectory ? "Directory removed" : "File deleted" });
    } catch (error: any) {
      log(`SFTP delete error: ${error.message}`, "sftp");
      res.status(500).json({ error: `Failed to delete: ${error.message}` });
    }
  });

  app.post("/api/sftp/mkdir/:sessionId", requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { path: remotePath } = req.body;

      if (!remotePath) {
        return res.status(400).json({ error: "Directory path is required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const dirPath = sanitizeRemotePath(remotePath);

      await new Promise<void>((resolve, reject) => {
        sftp.mkdir(dirPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: "Directory created", path: dirPath });
    } catch (error: any) {
      log(`SFTP mkdir error: ${error.message}`, "sftp");
      res.status(500).json({ error: `Failed to create directory: ${error.message}` });
    }
  });

  app.post("/api/sftp/rename/:sessionId", requireAuth, requireBusiness, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { oldPath, newPath } = req.body;

      if (!oldPath || !newPath) {
        return res.status(400).json({ error: "Both old and new paths are required" });
      }

      const session = getSession(sessionId, req.user!.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found or unauthorized" });
      }

      const sftp = getSftp(session);
      if (!sftp) {
        return res.status(503).json({ error: "SFTP connection not available" });
      }

      const sanitizedOld = sanitizeRemotePath(oldPath);
      const sanitizedNew = sanitizeRemotePath(newPath);

      await new Promise<void>((resolve, reject) => {
        sftp.rename(sanitizedOld, sanitizedNew, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: "Renamed successfully", oldPath: sanitizedOld, newPath: sanitizedNew });
    } catch (error: any) {
      log(`SFTP rename error: ${error.message}`, "sftp");
      res.status(500).json({ error: `Failed to rename: ${error.message}` });
    }
  });
}

function formatPermissions(mode: number): string {
  const perms = [
    (mode & 0o400) ? "r" : "-",
    (mode & 0o200) ? "w" : "-",
    (mode & 0o100) ? "x" : "-",
    (mode & 0o040) ? "r" : "-",
    (mode & 0o020) ? "w" : "-",
    (mode & 0o010) ? "x" : "-",
    (mode & 0o004) ? "r" : "-",
    (mode & 0o002) ? "w" : "-",
    (mode & 0o001) ? "x" : "-",
  ];
  return perms.join("");
}
