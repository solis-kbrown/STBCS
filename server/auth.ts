import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 7;

const sessionCache = new Map<string, { user: AuthenticatedRequest["user"]; sessionId: string; expires: number }>();
const SESSION_CACHE_TTL = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sessionCache) {
    if (now > entry.expires) sessionCache.delete(key);
  }
}, 30_000);

export function invalidateSessionCache(token: string): void {
  sessionCache.delete(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_EXPIRY_DAYS);
  return expiry;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string | null;
    tier: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    createdAt?: Date | null;
  };
  session?: {
    id: string;
    token: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.session_token;
  
  const token = authHeader?.replace("Bearer ", "") || cookieToken;
  
  if (!token) {
    next();
    return;
  }

  const cached = sessionCache.get(token);
  if (cached && Date.now() < cached.expires) {
    req.user = cached.user;
    req.session = { id: cached.sessionId, token };
    next();
    return;
  }
  
  try {
    const session = await storage.getSessionByToken(token);
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      if (session) {
        await storage.deleteSession(session.id);
      }
      sessionCache.delete(token);
      next();
      return;
    }
    
    const user = await storage.getUserById(session.userId);
    
    if (!user) {
      await storage.deleteSession(session.id);
      sessionCache.delete(token);
      next();
      return;
    }
    
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      tier: user.tier || "free",
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      createdAt: user.createdAt,
    };

    sessionCache.set(token, { user: userData, sessionId: session.id, expires: Date.now() + SESSION_CACHE_TTL });

    req.user = userData;
    req.session = {
      id: session.id,
      token: session.token,
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function requirePro(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  
  const proTiers = ["supporter", "pro", "business", "enterprise"];
  if (!proTiers.includes(req.user.tier)) {
    res.status(403).json({ error: "Pro subscription required" });
    return;
  }
  next();
}

export function requireBusiness(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  
  const businessTiers = ["business", "enterprise"];
  if (!businessTiers.includes(req.user.tier)) {
    res.status(403).json({ error: "Business subscription required" });
    return;
  }
  next();
}
