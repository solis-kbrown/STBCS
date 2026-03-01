import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { visitorTrackingMiddleware } from "./visitors";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema, insertWatchlistItemSchema, toSlug, contentViews, logoVotes, siteSettings, users, sessions, insertKbPostSchema, insertKbCommentSchema, kbComments, KB_POINTS, insertFeedbackSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql as dsql } from "drizzle-orm";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { cache, cachedJson, cacheAndSend, TTL } from "./cache";

// Helper to safely extract string from Express params/query
function asString(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : (val ?? '');
}
import { lookupIp, lookupDomain, scanPorts, isValidIp, isValidDomain, isPrivateIp, COMMON_PORTS, lookupShodanInternetDB } from "./tools";
import crypto from "crypto";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { getQuoService, isQuoConfigured } from "./quoService";
import { reportCriticalError, sendAdminNotification } from "./maintenance";
import { sendAccountLockoutEmail } from "./email";
import apiV1Router from "./apiV1Routes";
import { fileUpload, scanFile } from "./file-scanner";
import { analyzeEmailHeadersFull, emailHeadersSchema } from "./email-analyzer";
import { generateApiKey, getTierLimits, hashApiKey } from "./apiKeyAuth";
import { 
  hashPassword, 
  verifyPassword, 
  generateSessionToken, 
  getSessionExpiry, 
  authMiddleware, 
  requireAuth, 
  requirePro,
  requireBusiness,
  type AuthenticatedRequest,
  invalidateSessionCache,
} from "./auth";

async function resolveGroupSlug(slug: string): Promise<string | null> {
  const actors = await storage.getThreatActors();
  for (const actor of actors) {
    if (toSlug(actor.name) === slug) return actor.name;
  }
  const groups = await storage.getActiveGroups();
  for (const group of groups) {
    if (toSlug(group.name) === slug) return group.name;
  }
  return null;
}

// Rate limiters for security
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Rate limit exceeded. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const freeToolsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Free tier rate limit reached. Upgrade to Pro for unlimited access." },
  standardHeaders: true,
  legacyHeaders: false,
});

const proToolsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Rate limit exceeded. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const businessToolsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: "Rate limit exceeded. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

const liveChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

function tieredToolsLimiter(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  const tier = authReq.user?.tier;
  if (tier && ["unlimited"].includes(tier)) {
    return businessToolsLimiter(req, res, next);
  } else if (tier && ["business", "enterprise"].includes(tier)) {
    return businessToolsLimiter(req, res, next);
  } else if (tier && ["pro", "supporter"].includes(tier)) {
    return proToolsLimiter(req, res, next);
  }
  return freeToolsLimiter(req, res, next);
}

// Validation schemas
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const ipQuerySchema = paginationSchema.extend({
  source: z.string().max(100).optional(),
  threatType: z.string().max(50).optional(),
});

const urlQuerySchema = paginationSchema.extend({
  source: z.string().max(100).optional(),
  threatType: z.string().max(50).optional(),
});

const cveQuerySchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
});

const ransomwareQuerySchema = paginationSchema.extend({
  group: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
});

const newsQuerySchema = paginationSchema.extend({
  category: z.string().max(50).optional(),
});

const limitOnlySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Auth validation schemas
const signupSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string().min(12, "Password must be at least 12 characters").max(128)
    .refine(p => /[a-z]/.test(p), "Password must include a lowercase letter")
    .refine(p => /[A-Z]/.test(p), "Password must include an uppercase letter")
    .refine(p => /[0-9]/.test(p), "Password must include a number"),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {


  app.get(['/sitemap_index.xml', '/sitemap-index.xml', '/sitemaps.xml', '/sitemap1.xml', '/post-sitemap.xml', '/sitemap0.xml', '/wp-sitemap.xml', '/page-sitemap.xml', '/news-sitemap.xml', '/category-sitemap.xml'], (_req: Request, res: Response) => {
    res.redirect(301, '/sitemap.xml');
  });

  app.get("/sitemap.xml", async (_req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const actors = await storage.getThreatActors(500);
      const uniqueNames = new Set<string>();
      const groupEntries = (actors || [])
        .filter((a: any) => {
          if (!a.name || uniqueNames.has(a.name.toLowerCase())) return false;
          uniqueNames.add(a.name.toLowerCase());
          return true;
        })
        .map((a: any) => `  <url>
    <loc>https://stbcybersecurity.com/group/${toSlug(a.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <url>
    <loc>https://stbcybersecurity.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/ransomware</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/groups</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/exploits</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/tools</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/search</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/intel</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/monitors</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/support</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/risk-score</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/ics-advisories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/breaches</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>


  <url>
    <loc>https://stbcybersecurity.com/api-docs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/sms-terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/logos</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/attack-surface</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/reports</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/knowledge-base</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://stbcybersecurity.com/feedback</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

${groupEntries}
</urlset>`;
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-Robots-Tag", "noindex");
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (_req: Request, res: Response) => {
    const txt = `# STB Cybersecurity - robots.txt
# https://stbcybersecurity.com

User-agent: *
Allow: /
Allow: /tools
Allow: /ransomware
Allow: /exploits
Allow: /intel
Allow: /search
Allow: /monitors
Allow: /support
Allow: /privacy
Allow: /terms
Allow: /sms-terms
Allow: /api-docs
Allow: /risk-score
Allow: /ics-advisories
Allow: /breaches
Allow: /about
Allow: /contact
Allow: /logos
Allow: /groups
Allow: /group/
Allow: /attack-surface
Allow: /reports

Disallow: /account
Disallow: /checkout
Disallow: /checkout/return

Disallow: /api/
Disallow: /admin/
Disallow: /messages
Disallow: /style-preview

Crawl-delay: 1

Sitemap: https://stbcybersecurity.com/sitemap.xml

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(txt);
  });

  app.get("/.well-known/security.txt", (_req: Request, res: Response) => {
    const txt = `Contact: mailto:security@stbcybersecurity.com
Contact: mailto:info@stbcybersecurity.com
Contact: tel:+1-855-782-1987
Expires: 2027-02-10T00:00:00.000Z
Preferred-Languages: en
Canonical: https://stbcybersecurity.com/.well-known/security.txt
Policy: https://stbcybersecurity.com/privacy
Hiring: https://stbcybersecurity.com/support
`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(txt);
  });

  // Cookie parser for session tokens
  app.use(cookieParser());

  // Visitor tracking - counts unique visitors privately
  app.use(visitorTrackingMiddleware());
  
  // Auth middleware - runs on all requests to populate req.user if logged in
  app.use(authMiddleware as any);

  // Apply rate limiting to all API routes
  app.use("/api", generalLimiter);

  // CORS headers for Public API v1 (allow external consumers)
  app.use("/api/v1", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "X-API-Key, Authorization, Content-Type");
    res.setHeader("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-Daily-Quota-Remaining");
    if (req.method === "OPTIONS") { res.status(204).end(); return; }
    next();
  });

  // Mount Public API v1 (API key authenticated, separate from session auth)
  app.use("/api", apiV1Router);

  // ===== AUTH ROUTES =====
  
  // Sign up
  app.post("/api/auth/signup", authLimiter, async (req: Request, res: Response) => {
    try {
      const data = signupSchema.parse(req.body);
      
      const [existingUser, existingEmail] = await Promise.all([
        storage.getUserByUsername(data.username),
        storage.getUserByEmail(data.email),
      ]);
      if (existingUser) {
        res.status(400).json({ error: "Username already taken" });
        return;
      }
      if (existingEmail) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }
      
      const hashedPassword = await hashPassword(data.password);
      const { user, token } = await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
          username: data.username,
          email: data.email,
          password: hashedPassword,
        }).returning();

        const sessionToken = generateSessionToken();
        await tx.insert(sessions).values({
          userId: newUser.id,
          token: sessionToken,
          expiresAt: getSessionExpiry(),
        });

        return { user: newUser, token: sessionToken };
      });

      res.cookie("session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tier: user.tier || "free",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Per-account login attempt tracking (brute force protection)
  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
  const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

  // Cleanup stale lockout entries every 30 minutes
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    loginAttempts.forEach((data, key) => {
      if (now - data.lastAttempt > LOGIN_LOCKOUT_MS * 2) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(k => loginAttempts.delete(k));
  }, 30 * 60 * 1000);

  // Login
  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(data.username);
      if (!user) {
        user = await storage.getUserByEmail(data.username);
      }
      
      if (!user) {
        await verifyPassword(data.password, "$2a$12$x".padEnd(60, "0"));
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Check account lockout
      const accountKey = user.id;
      const attempts = loginAttempts.get(accountKey);
      if (attempts && attempts.lockedUntil > Date.now()) {
        const remainingMs = attempts.lockedUntil - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        res.status(429).json({ error: `Account temporarily locked. Try again in ${remainingMin} minute${remainingMin === 1 ? '' : 's'}.` });
        return;
      }
      
      // Verify password
      const valid = await verifyPassword(data.password, user.password);
      if (!valid) {
        // Track failed attempt
        const current = loginAttempts.get(accountKey) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
        current.count++;
        current.lastAttempt = Date.now();
        if (current.count >= LOGIN_MAX_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
          current.count = 0;
          const clientIp = req.ip || req.socket.remoteAddress || "unknown";
          console.warn(`[Security] Account locked: ${user.username} after ${LOGIN_MAX_ATTEMPTS} failed attempts from ${clientIp}`);

          if (user.email) {
            sendAccountLockoutEmail(user.email, user.username, clientIp).catch(err =>
              console.error("[Security] Failed to send lockout email to user:", err)
            );
          }

          sendAdminNotification({
            type: "warning",
            title: "Account Lockout Triggered",
            message: `Account "${user.username}" was locked after ${LOGIN_MAX_ATTEMPTS} consecutive failed login attempts.`,
            details: `Username: ${user.username}\nEmail: ${user.email || "N/A"}\nIP Address: ${clientIp}\nLocked At: ${new Date().toISOString()}\nLockout Duration: 15 minutes\nAuto-unlocks at: ${new Date(Date.now() + LOGIN_LOCKOUT_MS).toISOString()}`
          }).catch(err =>
            console.error("[Security] Failed to send lockout admin notification:", err)
          );
        }
        loginAttempts.set(accountKey, current);

        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      
      // Successful login — clear any failed attempts
      loginAttempts.delete(accountKey);

      const ADMIN_EMAILS = ["kbpc.inc@gmail.com"];
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()) && !user.isAdmin) {
        await storage.setUserAdmin(user.id, true);
        await storage.setUserTrusted(user.id, true);
        user.isAdmin = true;
        user.isTrusted = true;
        console.log(`[Auth] Auto-promoted site owner to admin: ${user.username}`);
      }

      // Create session
      const token = generateSessionToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
      });
      
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tier: user.tier || "free",
          isAdmin: user.isAdmin || false,
          isTrusted: user.isTrusted || false,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.session) {
        invalidateSessionCache(req.session.token);
        await storage.deleteSession(req.session.id);
      }
      res.clearCookie("session_token");
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to log out" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ user: req.user });
  });

  // Dashboard Stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const key = "stats";
      if (cachedJson(res, key, TTL.STATS)) return;
      const stats = await storage.getDashboardStats();
      cacheAndSend(res, key, stats, TTL.STATS);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/last-refresh", (req: Request, res: Response) => {
    try {
      const { getLastRefreshTimestamp } = require("./scrapers");
      const ts = getLastRefreshTimestamp();
      res.json({ lastRefresh: ts ? new Date(ts).toISOString() : null, timestamp: ts, nextRefreshIn: ts ? Math.max(0, 15 * 60 * 1000 - (Date.now() - ts)) : null });
    } catch {
      res.json({ lastRefresh: null, timestamp: 0, nextRefreshIn: null });
    }
  });

  // Threat Trends - Analytics data for threat trends over time
  app.get("/api/trends", async (req: Request, res: Response) => {
    try {
      const days = Math.min(parseInt(req.query.days as string) || 30, 90);
      const key = `trends:${days}`;
      if (cachedJson(res, key, TTL.TRENDS)) return;
      const trends = await storage.getThreatTrends(days);
      cacheAndSend(res, key, trends, TTL.TRENDS);
    } catch (error) {
      console.error("Error fetching threat trends:", error);
      res.status(500).json({ error: "Failed to fetch threat trends" });
    }
  });

  // CVEs
  app.get("/api/cves", async (req: Request, res: Response) => {
    try {
      const parsed = cveQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset, search } = parsed.data;
      
      const key = `cves:${limit}:${offset}:${search || ''}`;
      if (cachedJson(res, key, TTL.CVE_LIST)) return;
      const [cves, total] = await Promise.all([
        storage.getCves(limit, offset, search),
        storage.getCveCount(),
      ]);
      const result = { data: cves, total, limit, offset };
      cacheAndSend(res, key, result, TTL.CVE_LIST);
    } catch (error) {
      console.error("Error fetching CVEs:", error);
      res.status(500).json({ error: "Failed to fetch CVEs" });
    }
  });

  app.get("/api/cves/:id", async (req: Request, res: Response) => {
    try {
      const id = asString(req.params.id);
      const key = `cve:${id}`;
      if (cachedJson(res, key, TTL.CVE_DETAIL)) return;
      const cve = await storage.getCveById(id);
      if (!cve) {
        return res.status(404).json({ error: "CVE not found" });
      }
      cacheAndSend(res, key, cve, TTL.CVE_DETAIL);
    } catch (error) {
      console.error("Error fetching CVE:", error);
      res.status(500).json({ error: "Failed to fetch CVE" });
    }
  });

  // CVE Priority Analysis - Uses EPSS scores to prioritize patching
  app.post("/api/cves/priority", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        cveIds: z.array(z.string().min(1).max(50)).min(1).max(50)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid CVE IDs" });
      }
      
      const results = [];
      for (const cveId of parsed.data.cveIds) {
        const cve = await storage.getCveById(cveId);
        if (cve) {
          results.push({
            cveId: cve.cveId,
            description: cve.description,
            score: cve.score,
            severity: cve.severity,
            epssScore: cve.epssScore || 0,
            epssPercentile: cve.epssPercentile || 0,
            cweId: cve.cweId,
            cweName: cve.cweName,
            inCisaKev: cve.inCisaKev || false,
            exploitAvailable: cve.exploitAvailable,
            publishedDate: cve.publishedDate
          });
        } else {
          results.push({
            cveId: cveId,
            description: 'CVE not found in database',
            score: null,
            epssScore: 0,
            inCisaKev: false
          });
        }
      }
      
      res.json({ results });
    } catch (error) {
      console.error("CVE priority analysis error:", error);
      res.status(500).json({ error: "Failed to analyze CVE priorities" });
    }
  });

  // IP Reputation Aggregator - Check IP against all threat feeds
  app.get("/api/ip/reputation/:ip", async (req: Request, res: Response) => {
    try {
      const ip = req.params.ip as string;
      if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        return res.status(400).json({ error: "Invalid IP address format" });
      }
      
      const feedMatches = await storage.getMaliciousIpsByAddress(ip);
      
      let riskScore = 0;
      let threatType = null;
      let country = null;
      let asn = null;
      let isp = null;
      
      if (feedMatches.length > 0) {
        riskScore = Math.min(100, feedMatches.length * 20 + (feedMatches[0].abuseConfidenceScore || 0));
        threatType = feedMatches[0].threatType;
        country = feedMatches[0].country;
        asn = feedMatches[0].asn;
        isp = feedMatches[0].isp;
      }
      
      res.json({
        ip,
        riskScore,
        threatType,
        country,
        asn,
        isp,
        feedMatches: feedMatches.map(m => ({
          source: m.source,
          threatType: m.threatType,
          lastSeen: m.lastSeen,
          riskScore: m.riskScore
        }))
      });
    } catch (error) {
      console.error("IP reputation check error:", error);
      res.status(500).json({ error: "Failed to check IP reputation" });
    }
  });

  // Ransomware Incidents
  app.get("/api/ransomware", async (req: Request, res: Response) => {
    try {
      const parsed = ransomwareQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset, group, sector } = parsed.data;
      
      const key = `ransomware:${limit}:${offset}:${group || ''}:${sector || ''}`;
      if (cachedJson(res, key, TTL.RANSOMWARE_LIST)) return;
      const [incidents, total] = await Promise.all([
        storage.getRansomwareIncidents(limit, offset, group, sector),
        storage.getRansomwareCount(),
      ]);
      const result = { data: incidents, total, limit, offset };
      cacheAndSend(res, key, result, TTL.RANSOMWARE_LIST);
    } catch (error) {
      console.error("Error fetching ransomware incidents:", error);
      res.status(500).json({ error: "Failed to fetch ransomware incidents" });
    }
  });

  app.get("/api/ransomware/groups", async (req: Request, res: Response) => {
    try {
      const key = "ransomware:groups";
      if (cachedJson(res, key, TTL.RANSOMWARE_GROUPS)) return;
      const groups = await storage.getActiveGroups();
      cacheAndSend(res, key, groups, TTL.RANSOMWARE_GROUPS);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch active groups" });
    }
  });

  app.get("/api/ransomware/groups/directory", async (req: Request, res: Response) => {
    try {
      const key = "ransomware:groups:directory";
      if (cachedJson(res, key, TTL.RANSOMWARE_GROUPS)) return;
      const directory = await storage.getGroupsDirectoryData();
      cacheAndSend(res, key, directory, TTL.RANSOMWARE_GROUPS);
    } catch (error) {
      console.error("Error fetching groups directory:", error);
      res.status(500).json({ error: "Failed to fetch groups directory" });
    }
  });

  app.get("/api/ransomware/analytics", async (req: Request, res: Response) => {
    try {
      const key = "ransomware:analytics";
      if (cachedJson(res, key, TTL.RANSOMWARE_GROUPS)) return;
      const analytics = await storage.getGroupAnalytics();
      cacheAndSend(res, key, analytics, TTL.RANSOMWARE_GROUPS);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch ransomware analytics" });
    }
  });

  // Ransomware search endpoint
  app.get("/api/ransomware/search", strictLimiter, async (req: Request, res: Response) => {
    try {
      const query = String(req.query.q || "").trim();
      const limit = Math.min(parseInt(String(req.query.limit || "50")), 100);
      
      if (query.length < 2) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
      }
      
      const key = `ransomware:search:${query}:${limit}`;
      if (cachedJson(res, key, TTL.SEARCH)) return;
      const results = await storage.searchRansomware(query, limit);
      const result = { data: results, query, count: results.length };
      cacheAndSend(res, key, result, TTL.SEARCH);
    } catch (error) {
      console.error("Error searching ransomware:", error);
      res.status(500).json({ error: "Failed to search ransomware data" });
    }
  });

  app.get("/api/ransomware/:id", async (req: Request, res: Response) => {
    try {
      const id = asString(req.params.id);
      const key = `ransomware:${id}`;
      if (cachedJson(res, key, TTL.RANSOMWARE_DETAIL)) return;
      const incident = await storage.getRansomwareById(id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      cacheAndSend(res, key, incident, TTL.RANSOMWARE_DETAIL);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  // Threat Actors
  app.get("/api/threat-actors", async (req: Request, res: Response) => {
    try {
      const parsed = limitOnlySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit } = parsed.data;
      const key = `actors:${limit}`;
      if (cachedJson(res, key, TTL.THREAT_ACTORS)) return;
      const actors = await storage.getThreatActors(limit);
      cacheAndSend(res, key, actors, TTL.THREAT_ACTORS);
    } catch (error) {
      console.error("Error fetching threat actors:", error);
      res.status(500).json({ error: "Failed to fetch threat actors" });
    }
  });

  app.get("/api/threat-actors/:name", async (req: Request, res: Response) => {
    try {
      const rawParam = decodeURIComponent(asString(req.params.name));
      const key = `actor:profile:${rawParam}`;
      if (cachedJson(res, key, TTL.THREAT_ACTORS)) return;

      let profile = await storage.getGroupProfile(rawParam);
      if (!profile.actor && profile.incidents.length === 0) {
        const resolved = await resolveGroupSlug(rawParam);
        if (resolved && resolved !== rawParam) {
          profile = await storage.getGroupProfile(resolved);
        }
      }
      if (!profile.actor && profile.incidents.length === 0) {
        return res.status(404).json({ error: "Group not found" });
      }
      cacheAndSend(res, key, profile, TTL.THREAT_ACTORS);
    } catch (error) {
      console.error("Error fetching group profile:", error);
      res.status(500).json({ error: "Failed to fetch group profile" });
    }
  });

  // News
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const parsed = newsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset, category } = parsed.data;
      
      const key = `news:${limit}:${offset}:${category || ''}`;
      if (cachedJson(res, key, TTL.NEWS)) return;
      const [news, total] = await Promise.all([
        storage.getNews(limit, offset, category),
        storage.getNewsCount(),
      ]);
      const result = { data: news, total, limit, offset };
      cacheAndSend(res, key, result, TTL.NEWS);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const article = await storage.getNewsById(asString(req.params.id));
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Malicious IPs - Apply stricter rate limiting
  app.get("/api/malicious-ips", strictLimiter, async (req: Request, res: Response) => {
    try {
      const parsed = ipQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset, source, threatType } = parsed.data;
      
      const key = `ips:${limit}:${offset}:${source || ''}:${threatType || ''}`;
      if (cachedJson(res, key, TTL.MALICIOUS_IPS)) return;
      const [ips, total] = await Promise.all([
        storage.getMaliciousIps(limit, offset, source, threatType),
        storage.getMaliciousIpCount(),
      ]);
      const result = { data: ips, total, limit, offset };
      cacheAndSend(res, key, result, TTL.MALICIOUS_IPS);
    } catch (error) {
      console.error("Error fetching malicious IPs:", error);
      res.status(500).json({ error: "Failed to fetch malicious IPs" });
    }
  });

  // Malicious URLs - Apply stricter rate limiting
  app.get("/api/malicious-urls", strictLimiter, async (req: Request, res: Response) => {
    try {
      const parsed = urlQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset, source, threatType } = parsed.data;
      
      const key = `urls:${limit}:${offset}:${source || ''}:${threatType || ''}`;
      if (cachedJson(res, key, TTL.MALICIOUS_URLS)) return;
      const [urls, total] = await Promise.all([
        storage.getMaliciousUrls(limit, offset, source, threatType),
        storage.getMaliciousUrlCount(),
      ]);
      const result = { data: urls, total, limit, offset };
      cacheAndSend(res, key, result, TTL.MALICIOUS_URLS);
    } catch (error) {
      console.error("Error fetching malicious URLs:", error);
      res.status(500).json({ error: "Failed to fetch malicious URLs" });
    }
  });

  // CISA Known Exploited Vulnerabilities
  app.get("/api/cisa-kev", strictLimiter, async (req: Request, res: Response) => {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.issues });
      }
      const { limit, offset } = parsed.data;
      
      const key = `kev:${limit}:${offset}`;
      if (cachedJson(res, key, TTL.CISA_KEV)) return;
      const [kev, total] = await Promise.all([
        storage.getCisaKev(limit, offset),
        storage.getCisaKevCount(),
      ]);
      const result = { data: kev, total, limit, offset };
      cacheAndSend(res, key, result, TTL.CISA_KEV);
    } catch (error) {
      console.error("Error fetching CISA KEV:", error);
      res.status(500).json({ error: "Failed to fetch CISA KEV" });
    }
  });

  // Threat Feeds
  app.get("/api/threat-feeds", async (req: Request, res: Response) => {
    try {
      const key = "feeds";
      if (cachedJson(res, key, TTL.FEEDS_LIST)) return;
      const feeds = await storage.getThreatFeeds();
      cacheAndSend(res, key, feeds, TTL.FEEDS_LIST);
    } catch (error) {
      console.error("Error fetching threat feeds:", error);
      res.status(500).json({ error: "Failed to fetch threat feeds" });
    }
  });

  // STIX 2.1 Export - Format threat data as STIX bundle
  app.get("/api/export/stix", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const exportSchema = z.object({
        type: z.enum(["ips", "urls", "cves", "kev", "all"]).default("all"),
        limit: z.coerce.number().int().min(1).max(500).default(100),
        format: z.enum(["json", "download"]).default("json"),
      });
      const parsed = exportSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid parameters", details: parsed.error.issues });
      }
      const { type, limit, format } = parsed.data;
      const key = `stix:${type}:${limit}`;
      if (format === "json" && cachedJson(res, key, TTL.FEEDS_LIST)) return;

      const stixObjects: any[] = [];
      const identity = {
        type: "identity",
        spec_version: "2.1",
        id: "identity--stbcs-threat-intel",
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: "STB Cybersecurity",
        identity_class: "organization",
        description: "STB Cybersecurity Threat Intelligence Platform",
      };
      stixObjects.push(identity);

      if (type === "ips" || type === "all") {
        const ips = await storage.getMaliciousIps(limit);
        for (const ip of ips) {
          stixObjects.push({
            type: "indicator",
            spec_version: "2.1",
            id: `indicator--ip-${Buffer.from(ip.ipAddress).toString("hex").slice(0, 36)}`,
            created: ip.lastSeen || new Date().toISOString(),
            modified: ip.lastSeen || new Date().toISOString(),
            name: `Malicious IP: ${ip.ipAddress}`,
            description: `${ip.threatType || "Malicious"} IP from ${ip.source || "threat feed"}`,
            indicator_types: ["malicious-activity"],
            pattern: `[ipv4-addr:value = '${ip.ipAddress}']`,
            pattern_type: "stix",
            valid_from: ip.lastSeen || new Date().toISOString(),
            labels: [ip.threatType || "malicious", ip.source || "unknown"].filter(Boolean),
          });
        }
      }

      if (type === "urls" || type === "all") {
        const urls = await storage.getMaliciousUrls(limit);
        for (const url of urls) {
          const safeUrl = url.url.replace(/'/g, "\\'");
          stixObjects.push({
            type: "indicator",
            spec_version: "2.1",
            id: `indicator--url-${Buffer.from(url.url).toString("hex").slice(0, 36)}`,
            created: (url.reportedAt || url.lastOnline || new Date()).toISOString?.() || new Date().toISOString(),
            modified: (url.reportedAt || url.lastOnline || new Date()).toISOString?.() || new Date().toISOString(),
            name: `Malicious URL: ${url.url.slice(0, 80)}`,
            description: `${url.threatType || "Malware"} URL from ${url.source || "threat feed"}`,
            indicator_types: ["malicious-activity"],
            pattern: `[url:value = '${safeUrl}']`,
            pattern_type: "stix",
            valid_from: (url.reportedAt || url.lastOnline || new Date()).toISOString?.() || new Date().toISOString(),
            labels: [url.threatType || "malicious", url.source || "unknown"].filter(Boolean),
          });
        }
      }

      if (type === "cves" || type === "all") {
        const cves = await storage.getCves(Math.min(limit, 50));
        for (const cve of cves) {
          stixObjects.push({
            type: "vulnerability",
            spec_version: "2.1",
            id: `vulnerability--${cve.cveId.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
            created: cve.publishedDate || new Date().toISOString(),
            modified: cve.lastModified || new Date().toISOString(),
            name: cve.cveId,
            description: cve.description?.slice(0, 500) || `Vulnerability ${cve.cveId}`,
            external_references: [
              { source_name: "cve", external_id: cve.cveId, url: `https://nvd.nist.gov/vuln/detail/${cve.cveId}` },
            ],
          });
        }
      }

      if (type === "kev" || type === "all") {
        const kevs = await storage.getCisaKev(Math.min(limit, 50));
        for (const kev of kevs) {
          stixObjects.push({
            type: "vulnerability",
            spec_version: "2.1",
            id: `vulnerability--kev-${kev.cveId.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
            created: kev.dateAdded || new Date().toISOString(),
            modified: kev.dateAdded || new Date().toISOString(),
            name: `${kev.cveId} (CISA KEV)`,
            description: `${kev.vulnerabilityName || kev.cveId} - Known Exploited. ${kev.shortDescription || ""}`.trim(),
            external_references: [
              { source_name: "cve", external_id: kev.cveId },
              { source_name: "cisa-kev", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
            ],
            labels: ["known-exploited"],
          });
        }
      }

      const bundle = {
        type: "bundle",
        id: `bundle--stbcs-${Date.now()}`,
        spec_version: "2.1",
        created: new Date().toISOString(),
        objects: stixObjects,
      };

      if (format === "download") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="stbcs-stix-${type}-${new Date().toISOString().slice(0, 10)}.json"`);
        return res.json(bundle);
      }

      cacheAndSend(res, key, bundle, TTL.FEEDS_LIST);
    } catch (error) {
      console.error("Error generating STIX export:", error);
      res.status(500).json({ error: "Failed to generate STIX export" });
    }
  });

  // Global Search across all threat data
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const searchSchema = z.object({
        q: z.string().min(2).max(200),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      });
      
      const parsed = searchSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid search query", details: parsed.error.issues });
      }
      
      const { q, limit } = parsed.data;
      const key = `search:${q}:${limit}`;
      if (cachedJson(res, key, TTL.SEARCH)) return;
      const results = await storage.globalSearch(q, limit);
      
      const totalResults = 
        results.cves.length + 
        results.ransomware.length + 
        results.ips.length + 
        results.urls.length + 
        results.kev.length + 
        results.news.length;
      
      const result = { query: q, totalResults, ...results };
      cacheAndSend(res, key, result, TTL.SEARCH);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  });

  // Admin: Storage statistics
  app.get("/api/admin/stats", strictLimiter, async (req: Request, res: Response) => {
    try {
      const adminKey = process.env.ADMIN_STATS_KEY;
      if (!adminKey || adminKey.length < 16) {
        return res.status(503).json({ error: "Admin endpoint not configured" });
      }
      const headerKey = req.headers["x-admin-key"];
      if (!headerKey || typeof headerKey !== 'string' || headerKey !== adminKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const stats = await storage.getStorageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Admin: Data cleanup (trigger old data removal)
  app.post("/api/admin/cleanup", strictLimiter, async (req: Request, res: Response) => {
    try {
      const adminKey = process.env.ADMIN_STATS_KEY;
      if (!adminKey || adminKey.length < 16) {
        return res.status(503).json({ error: "Admin endpoint not configured" });
      }
      const headerKey = req.headers["x-admin-key"];
      if (!headerKey || typeof headerKey !== 'string' || headerKey !== adminKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const result = await storage.cleanupOldData(730); // 2 year retention
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error cleaning up data:", error);
      res.status(500).json({ error: "Failed to cleanup data" });
    }
  });

  // Admin: Unlock a locked account immediately
  app.post("/api/admin/unlock-account", strictLimiter, async (req: Request, res: Response) => {
    try {
      const adminKey = process.env.ADMIN_STATS_KEY;
      if (!adminKey || adminKey.length < 16) {
        return res.status(503).json({ error: "Admin endpoint not configured" });
      }
      const headerKey = req.headers["x-admin-key"];
      if (!headerKey || typeof headerKey !== 'string' || headerKey !== adminKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const schema = z.object({ username: z.string().min(1).max(100) });
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Must provide a valid username" });
      }

      const user = await storage.getUserByUsername(result.data.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const accountKey = user.id;
      const attempts = loginAttempts.get(accountKey);
      if (!attempts || attempts.lockedUntil <= Date.now()) {
        return res.json({ success: true, message: "Account is not currently locked" });
      }

      loginAttempts.delete(accountKey);
      console.info(`[Security] Admin manually unlocked account: ${user.username}`);

      res.json({ success: true, message: `Account "${user.username}" has been unlocked` });
    } catch (error) {
      console.error("Admin unlock error:", error);
      res.status(500).json({ error: "Failed to unlock account" });
    }
  });

  // Get grand opening sale status
  app.get("/api/sale-status", async (req: Request, res: Response) => {
    try {
      const key = "sale-status";
      if (cachedJson(res, key, TTL.SALE_STATUS)) return;
      const { isGrandOpeningActive, getGrandOpeningEndDate } = await import("./maintenance");
      const endDate = await getGrandOpeningEndDate();
      const isActive = await isGrandOpeningActive();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      
      const result = {
        active: isActive,
        endDate: endDate.toISOString(),
        daysRemaining,
        discount: isActive ? "50%" : null,
        coupon: isActive ? "GRANDOPENING50" : null
      };
      cacheAndSend(res, key, result, TTL.SALE_STATUS);
    } catch (error) {
      console.error("Error fetching sale status:", error);
      res.status(500).json({ error: "Failed to fetch sale status" });
    }
  });


  // Manual data refresh trigger (for admin use)
  app.post("/api/refresh", async (req: Request, res: Response) => {
    try {
      const { fetchAllData } = await import("./scrapers");
      await fetchAllData();
      cache.invalidateAll();
      res.json({ success: true, message: "Data refresh initiated" });
    } catch (error) {
      console.error("Error refreshing data:", error);
      cache.invalidateAll();
      res.status(500).json({ error: "Failed to refresh data" });
    }
  });

  // ============ SECURITY TOOLS ENDPOINTS ============

  // IP Lookup Tool
  app.get("/api/tools/ip-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ip: z.string().min(7).max(45),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IP address format" });
      }
      
      const { ip } = parsed.data;
      
      if (!isValidIp(ip)) {
        return res.status(400).json({ error: "Invalid IP address" });
      }
      
      if (isPrivateIp(ip)) {
        return res.status(400).json({ error: "Cannot lookup private/internal IP addresses" });
      }
      
      const result = await lookupIp(ip);
      res.json(result);
    } catch (error) {
      console.error("IP lookup error:", error);
      res.status(500).json({ error: "Failed to lookup IP address" });
    }
  });

  // Domain Lookup Tool
  app.get("/api/tools/domain-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(253),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain format" });
      }
      
      const { domain } = parsed.data;
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      
      if (!isValidDomain(cleanDomain)) {
        return res.status(400).json({ error: "Invalid domain name" });
      }
      
      const result = await lookupDomain(cleanDomain);
      res.json(result);
    } catch (error) {
      console.error("Domain lookup error:", error);
      res.status(500).json({ error: "Failed to lookup domain" });
    }
  });

  // Port Scanner Tool
  app.get("/api/tools/port-scan", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        target: z.string().min(3).max(253),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid target format" });
      }
      
      const { target } = parsed.data;
      // Note: Pro tier scanning requires authentication - currently all users get free tier
      // TODO: Implement user authentication to enable Pro tier port scanning
      const isPro = false; // Server-enforced - no client-side bypass
      let ipToScan = target;
      
      if (!isValidIp(target)) {
        if (isValidDomain(target)) {
          const domainResult = await lookupDomain(target);
          if (domainResult.aRecords && domainResult.aRecords.length > 0) {
            ipToScan = domainResult.aRecords[0];
          } else {
            return res.status(400).json({ error: "Could not resolve domain to IP address" });
          }
        } else {
          return res.status(400).json({ error: "Invalid IP address or domain name" });
        }
      }
      
      if (isPrivateIp(ipToScan)) {
        return res.status(400).json({ error: "Cannot scan private/internal IP addresses" });
      }
      
      const results = await scanPorts(ipToScan, isPro);
      res.json({
        target,
        ip: ipToScan,
        scannedAt: new Date().toISOString(),
        ports: results,
        openPorts: results.filter(p => p.open),
        tier: isPro ? 'pro' : 'free',
      });
    } catch (error) {
      console.error("Port scan error:", error);
      res.status(500).json({ error: "Failed to scan ports" });
    }
  });

  // Get available ports info
  app.get("/api/tools/ports-info", (req: Request, res: Response) => {
    res.json({
      commonPorts: COMMON_PORTS,
      freeTierPorts: [21, 22, 25, 53, 80, 110, 143, 443, 993, 995],
      proTierPorts: [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080, 8443],
    });
  });

  // DNS Lookup Tool
  app.get("/api/tools/dns-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(253),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain format" });
      }
      
      const { domain } = parsed.data;
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      
      if (!isValidDomain(cleanDomain)) {
        return res.status(400).json({ error: "Invalid domain name" });
      }
      
      const result = await lookupDomain(cleanDomain);
      res.json({
        domain: cleanDomain,
        aRecords: result.aRecords || [],
        aaaaRecords: result.aaaaRecords || [],
        mxRecords: result.mxRecords || [],
        nsRecords: result.nsRecords || [],
        txtRecords: result.txtRecords || [],
      });
    } catch (error) {
      console.error("DNS lookup error:", error);
      res.status(500).json({ error: "Failed to lookup DNS records" });
    }
  });

  // Check if IP is in our threat database
  app.get("/api/tools/threat-check", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ip: z.string().min(7).max(45),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IP address format" });
      }
      
      const { ip } = parsed.data;
      
      if (!isValidIp(ip)) {
        return res.status(400).json({ error: "Invalid IP address" });
      }
      
      // Direct database lookup for efficiency
      const foundThreat = await storage.checkIpThreat(ip);
      
      if (foundThreat) {
        res.json({
          ip,
          isThreat: true,
          threatDetails: {
            source: foundThreat.source,
            threatType: foundThreat.threatType,
            riskScore: foundThreat.riskScore,
            lastSeen: foundThreat.lastSeen,
            country: foundThreat.country,
          },
        });
      } else {
        res.json({
          ip,
          isThreat: false,
          message: "IP not found in our threat database. This does not guarantee safety.",
        });
      }
    } catch (error) {
      console.error("Threat check error:", error);
      res.status(500).json({ error: "Failed to check threat database" });
    }
  });

  // ==========================================
  // PRO TIER - ALERTS & NOTIFICATIONS
  // ==========================================

  // Get user notifications
  app.get("/api/notifications", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        unreadOnly: z.coerce.boolean().default(false),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
      
      const { userId, limit, unreadOnly } = parsed.data;
      const [notifications, unreadCount] = await Promise.all([
        storage.getUserNotifications(userId, limit, unreadOnly),
        storage.getUnreadNotificationCount(userId),
      ]);
      
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      await storage.markNotificationRead(asString(req.params.id), parsed.data.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      await storage.markAllNotificationsRead(parsed.data.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // Dismiss notification
  app.post("/api/notifications/:id/dismiss", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      await storage.dismissNotification(asString(req.params.id), parsed.data.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Dismiss notification error:", error);
      res.status(500).json({ error: "Failed to dismiss notification" });
    }
  });

  // Watchlist routes moved to authenticated section (see "PRO FEATURES" block below)

  // ==========================================
  // BREACH INCIDENTS
  // ==========================================

  // Get breach incidents
  app.get("/api/breaches", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = paginationSchema.extend({
        search: z.string().max(200).optional(),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }
      
      const { limit, offset, search } = parsed.data;
      const [breaches, count] = await Promise.all([
        storage.getBreachIncidents(limit, offset, search),
        storage.getBreachCount(),
      ]);
      
      res.json({ data: breaches, total: count, limit, offset });
    } catch (error) {
      console.error("Get breaches error:", error);
      res.status(500).json({ error: "Failed to fetch breach incidents" });
    }
  });

  // CISA ICS-CERT Advisories
  app.get("/api/ics-advisories", strictLimiter, async (req: Request, res: Response) => {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }
      const { limit, offset } = parsed.data;
      const [advisories, count] = await Promise.all([
        storage.getIcsAdvisories(limit, offset),
        storage.getIcsAdvisoryCount(),
      ]);
      res.json({ data: advisories, total: count, limit, offset });
    } catch (error) {
      console.error("Get ICS advisories error:", error);
      res.status(500).json({ error: "Failed to fetch ICS advisories" });
    }
  });

  // Search breaches
  app.get("/api/breaches/search", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        q: z.string().min(2).max(200),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
      }
      
      const { q, limit } = parsed.data;
      const breaches = await storage.searchBreaches(q, limit);
      
      res.json({ data: breaches, query: q, count: breaches.length });
    } catch (error) {
      console.error("Search breaches error:", error);
      res.status(500).json({ error: "Failed to search breaches" });
    }
  });

  // Get single breach
  app.get("/api/breaches/:id", strictLimiter, async (req: Request, res: Response) => {
    try {
      const breach = await storage.getBreachById(asString(req.params.id));
      if (!breach) {
        return res.status(404).json({ error: "Breach incident not found" });
      }
      res.json(breach);
    } catch (error) {
      console.error("Get breach error:", error);
      res.status(500).json({ error: "Failed to fetch breach incident" });
    }
  });

  // ==========================================
  // SHODAN INTERNETDB - FREE TOOL
  // ==========================================

  // Shodan InternetDB lookup (free, no API key needed)
  app.get("/api/tools/shodan-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ip: z.string().min(7).max(45),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IP address format" });
      }
      
      const { ip } = parsed.data;
      
      if (!isValidIp(ip)) {
        return res.status(400).json({ error: "Invalid IP address format" });
      }
      
      if (isPrivateIp(ip)) {
        return res.status(400).json({ error: "Cannot lookup private/internal IP addresses" });
      }
      
      const result = await lookupShodanInternetDB(ip);
      
      if (!result) {
        return res.json({ 
          ip,
          found: false,
          message: "No data found for this IP in Shodan InternetDB",
          ports: [],
          hostnames: [],
          vulns: [],
          cpes: [],
          tags: []
        });
      }
      
      res.json({
        ...result,
        found: true,
        source: "Shodan InternetDB"
      });
    } catch (error) {
      console.error("Shodan lookup error:", error);
      res.status(500).json({ error: "Failed to lookup IP in Shodan InternetDB" });
    }
  });

  // ==========================================
  // EMAIL SECURITY TOOLS (MXToolbox-style)
  // ==========================================

  // MX Record Lookup
  app.post("/api/tools/mx-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { lookupMxRecords } = await import("./tools.js");
      const result = await lookupMxRecords(parsed.data.domain);
      res.json(result);
    } catch (error) {
      console.error("MX lookup error:", error);
      res.status(500).json({ error: "Failed to lookup MX records" });
    }
  });

  // SPF Record Lookup
  app.post("/api/tools/spf-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { lookupSpfRecord } = await import("./tools.js");
      const result = await lookupSpfRecord(parsed.data.domain);
      res.json(result);
    } catch (error) {
      console.error("SPF lookup error:", error);
      res.status(500).json({ error: "Failed to lookup SPF record" });
    }
  });

  // DKIM Record Lookup
  app.post("/api/tools/dkim-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(255),
        selector: z.string().max(100).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { lookupDkimRecord } = await import("./tools.js");
      const result = await lookupDkimRecord(parsed.data.domain, parsed.data.selector);
      res.json(result);
    } catch (error) {
      console.error("DKIM lookup error:", error);
      res.status(500).json({ error: "Failed to lookup DKIM record" });
    }
  });

  // DMARC Record Lookup
  app.post("/api/tools/dmarc-lookup", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { lookupDmarcRecord } = await import("./tools.js");
      const result = await lookupDmarcRecord(parsed.data.domain);
      res.json(result);
    } catch (error) {
      console.error("DMARC lookup error:", error);
      res.status(500).json({ error: "Failed to lookup DMARC record" });
    }
  });

  // Comprehensive Email Security Check
  app.post("/api/tools/email-security", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { checkEmailSecurity } = await import("./tools.js");
      const result = await checkEmailSecurity(parsed.data.domain);
      res.json(result);
    } catch (error) {
      console.error("Email security check error:", error);
      res.status(500).json({ error: "Failed to check email security" });
    }
  });

  // ==========================================
  // FREE THREAT INTELLIGENCE APIs
  // ==========================================

  // ThreatFox IOC Lookup (No API key required)
  app.post("/api/tools/threatfox", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ioc: z.string().min(1).max(500),
        iocType: z.enum(['ip', 'domain', 'url', 'hash']).optional().default('hash'),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IOC value" });
      }
      
      const { lookupThreatFox } = await import("./tools.js");
      const result = await lookupThreatFox(parsed.data.ioc, parsed.data.iocType);
      res.json(result);
    } catch (error) {
      console.error("ThreatFox lookup error:", error);
      res.status(500).json({ error: "Failed to lookup IOC in ThreatFox" });
    }
  });

  // Malware Bazaar Hash Lookup (No API key required)
  app.post("/api/tools/malware-bazaar", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        hash: z.string().min(32).max(64).regex(/^[a-fA-F0-9]+$/),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hash (MD5, SHA1, or SHA256)" });
      }
      
      const { lookupMalwareBazaar } = await import("./tools.js");
      const result = await lookupMalwareBazaar(parsed.data.hash);
      res.json(result);
    } catch (error) {
      console.error("Malware Bazaar lookup error:", error);
      res.status(500).json({ error: "Failed to lookup hash in Malware Bazaar" });
    }
  });

  // SSL Labs Grade Check (No API key required)
  app.post("/api/tools/ssl-labs", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        host: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hostname" });
      }
      
      const { checkSSLLabs } = await import("./tools.js");
      const result = await checkSSLLabs(parsed.data.host);
      res.json(result);
    } catch (error) {
      console.error("SSL Labs check error:", error);
      res.status(500).json({ error: "Failed to check SSL configuration" });
    }
  });

  // URLScan.io Domain Search (Free tier)
  app.post("/api/tools/urlscan", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        query: z.string().min(3).max(255),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { searchURLScan } = await import("./tools.js");
      const result = await searchURLScan(parsed.data.query);
      res.json({ results: result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("URLScan.io search error:", error);
      res.status(500).json({ error: "Failed to search URLScan.io" });
    }
  });

  // PhishTank URL Check (Free with limitations)
  app.post("/api/tools/phishtank", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        url: z.string().min(10).max(2000).url(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid URL" });
      }
      
      const { checkPhishTank } = await import("./tools.js");
      const result = await checkPhishTank(parsed.data.url);
      res.json(result);
    } catch (error) {
      console.error("PhishTank check error:", error);
      res.status(500).json({ error: "Failed to check URL in PhishTank" });
    }
  });

  // Enhanced IP Geolocation (No API key required)
  app.get("/api/tools/ip-geo", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        ip: z.string().min(7).max(45),
      });
      
      const parsed = schema.safeParse({ ip: req.query.ip });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid IP address" });
      }
      
      const { getEnhancedIPInfo } = await import("./tools.js");
      const result = await getEnhancedIPInfo(parsed.data.ip);
      res.json(result);
    } catch (error) {
      console.error("Enhanced IP geo error:", error);
      res.status(500).json({ error: "Failed to get IP geolocation" });
    }
  });

  // ==========================================
  // NEW FREE SECURITY TOOLS
  // ==========================================

  // Password Strength Checker
  app.post("/api/tools/password-strength", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        password: z.string().min(1).max(128),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid password" });
      }
      
      const { checkPasswordStrength } = await import("./tools.js");
      const result = checkPasswordStrength(parsed.data.password);
      res.json(result);
    } catch (error) {
      console.error("Password strength check error:", error);
      res.status(500).json({ error: "Failed to analyze password" });
    }
  });

  // Subnet/CIDR Calculator
  app.get("/api/tools/subnet-calc", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        cidr: z.string().min(7).max(18),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid CIDR notation" });
      }
      
      const { calculateSubnet } = await import("./tools.js");
      const result = calculateSubnet(parsed.data.cidr);
      
      if (!result) {
        return res.status(400).json({ error: "Invalid CIDR notation" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Subnet calc error:", error);
      res.status(500).json({ error: "Failed to calculate subnet" });
    }
  });

  // Base64 Encode/Decode
  app.post("/api/tools/base64", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        input: z.string().max(100000),
        operation: z.enum(["encode", "decode"]),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }
      
      const { base64Encode, base64Decode } = await import("./tools.js");
      const result = parsed.data.operation === "encode" 
        ? base64Encode(parsed.data.input)
        : base64Decode(parsed.data.input);
      
      res.json(result);
    } catch (error) {
      console.error("Base64 error:", error);
      res.status(500).json({ error: "Failed to process Base64" });
    }
  });

  // URL Encode/Decode
  app.post("/api/tools/url-encode", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        input: z.string().max(100000),
        operation: z.enum(["encode", "decode"]),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid input" });
      }
      
      const { urlEncode, urlDecode } = await import("./tools.js");
      const result = parsed.data.operation === "encode" 
        ? urlEncode(parsed.data.input)
        : urlDecode(parsed.data.input);
      
      res.json(result);
    } catch (error) {
      console.error("URL encode error:", error);
      res.status(500).json({ error: "Failed to process URL encoding" });
    }
  });

  // Email Header Analyzer
  app.post("/api/tools/email-headers", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        headers: z.string().min(10).max(500000),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email headers" });
      }
      
      const { analyzeEmailHeaders } = await import("./tools.js");
      const result = analyzeEmailHeaders(parsed.data.headers);
      res.json(result);
    } catch (error) {
      console.error("Email header analysis error:", error);
      res.status(500).json({ error: "Failed to analyze email headers" });
    }
  });

  app.post("/api/analyze/email-headers", requireAuth as any, requirePro as any, proToolsLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsed = emailHeadersSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid email headers", details: parsed.error.issues });
        return;
      }
      const result = analyzeEmailHeadersFull(parsed.data.headers);
      res.json(result);
    } catch (error) {
      console.error("Email header analysis error:", error);
      res.status(500).json({ error: "Failed to analyze email headers" });
    }
  });

  app.get("/api/tools/service-status", async (_req: Request, res: Response) => {
    try {
      const cacheKey = "service-status";
      if (cachedJson(res, cacheKey, 60)) return;

      const statusPages = [
        { name: "GitHub", category: "development", url: "https://www.githubstatus.com/api/v2/status.json", statusPage: "https://www.githubstatus.com" },
        { name: "Cloudflare", category: "cdn_dns", url: "https://www.cloudflarestatus.com/api/v2/status.json", statusPage: "https://www.cloudflarestatus.com" },
        { name: "Datadog", category: "security", url: "https://status.datadoghq.com/api/v2/status.json", statusPage: "https://status.datadoghq.com" },
        { name: "Vercel", category: "hosting", url: "https://www.vercel-status.com/api/v2/status.json", statusPage: "https://www.vercel-status.com" },
        { name: "Netlify", category: "hosting", url: "https://www.netlifystatus.com/api/v2/status.json", statusPage: "https://www.netlifystatus.com" },
        { name: "Atlassian", category: "development", url: "https://status.atlassian.com/api/v2/status.json", statusPage: "https://status.atlassian.com" },
        { name: "Twilio", category: "communication", url: "https://status.twilio.com/api/v2/status.json", statusPage: "https://status.twilio.com" },
        { name: "PagerDuty", category: "security", url: "https://status.pagerduty.com/api/v2/status.json", statusPage: "https://status.pagerduty.com" },
        { name: "Fastly", category: "cdn_dns", url: "https://status.fastly.com/api/v2/status.json", statusPage: "https://status.fastly.com" },
        { name: "DigitalOcean", category: "cloud", url: "https://status.digitalocean.com/api/v2/status.json", statusPage: "https://status.digitalocean.com" },
        { name: "Render", category: "hosting", url: "https://status.render.com/api/v2/status.json", statusPage: "https://status.render.com" },
        { name: "HashiCorp", category: "development", url: "https://status.hashicorp.com/api/v2/status.json", statusPage: "https://status.hashicorp.com" },
      ];

      const slackService = { name: "Slack", category: "communication", url: "https://status.slack.com/api/v2.0.0/current", statusPage: "https://status.slack.com" };

      const stbcsServices = [
        { name: "STBCS Platform", category: "stbcs", status: "operational" as const, description: "Main application and threat intelligence dashboard", lastUpdated: new Date().toISOString(), url: "https://stbcybersecurity.com" },
        { name: "STBCS API", category: "stbcs", status: "operational" as const, description: "REST API endpoints for threat data and tools", lastUpdated: new Date().toISOString(), url: "https://stbcybersecurity.com/api/stats" },
        { name: "STBCS Threat Feeds", category: "stbcs", status: "operational" as const, description: "73 active threat intelligence feed scrapers", lastUpdated: new Date().toISOString(), url: "https://stbcybersecurity.com/intel" },
        { name: "STBCS Monitoring", category: "stbcs", status: "operational" as const, description: "Uptime, dark web, and alert monitoring engines", lastUpdated: new Date().toISOString(), url: "https://stbcybersecurity.com/monitors" },
        { name: "STBCS Knowledge Base", category: "stbcs", status: "operational" as const, description: "Community hub, articles, and threat advisories", lastUpdated: new Date().toISOString(), url: "https://stbcybersecurity.com/knowledge-base" },
      ];

      const staticServices = [
        { name: "AWS", category: "cloud", status: "operational" as const, description: "Amazon Web Services — compute, storage, networking", lastUpdated: new Date().toISOString(), url: "https://health.aws.amazon.com/health/status" },
        { name: "Microsoft Azure", category: "cloud", status: "operational" as const, description: "Microsoft cloud infrastructure and services", lastUpdated: new Date().toISOString(), url: "https://status.azure.com" },
        { name: "Google Cloud", category: "cloud", status: "operational" as const, description: "GCP compute, storage, AI/ML, and networking", lastUpdated: new Date().toISOString(), url: "https://status.cloud.google.com" },
        { name: "Oracle Cloud", category: "cloud", status: "operational" as const, description: "Oracle Cloud Infrastructure (OCI)", lastUpdated: new Date().toISOString(), url: "https://ocistatus.oraclecloud.com" },
        { name: "IBM Cloud", category: "cloud", status: "operational" as const, description: "IBM Cloud platform and Watson services", lastUpdated: new Date().toISOString(), url: "https://cloud.ibm.com/status" },
        { name: "Akamai", category: "cdn_dns", status: "operational" as const, description: "Global CDN, DDoS protection, and edge compute", lastUpdated: new Date().toISOString(), url: "https://www.akamai.com/company/network-status" },
        { name: "Cloudflare DNS", category: "cdn_dns", status: "operational" as const, description: "1.1.1.1 public DNS resolver", lastUpdated: new Date().toISOString(), url: "https://www.cloudflarestatus.com" },
        { name: "Google DNS", category: "cdn_dns", status: "operational" as const, description: "8.8.8.8 / 8.8.4.4 public DNS", lastUpdated: new Date().toISOString(), url: "https://status.cloud.google.com" },
        { name: "Microsoft 365", category: "communication", status: "operational" as const, description: "Exchange, Teams, SharePoint, OneDrive", lastUpdated: new Date().toISOString(), url: "https://status.office.com" },
        { name: "Google Workspace", category: "communication", status: "operational" as const, description: "Gmail, Drive, Meet, and Calendar", lastUpdated: new Date().toISOString(), url: "https://www.google.com/appsstatus/dashboard/" },
        { name: "Zoom", category: "communication", status: "operational" as const, description: "Video conferencing and collaboration", lastUpdated: new Date().toISOString(), url: "https://status.zoom.us" },
        { name: "CrowdStrike", category: "security", status: "operational" as const, description: "Endpoint detection and response (EDR)", lastUpdated: new Date().toISOString(), url: "https://status.crowdstrike.com" },
        { name: "Okta", category: "security", status: "operational" as const, description: "Identity and access management (IAM)", lastUpdated: new Date().toISOString(), url: "https://status.okta.com" },
        { name: "SentinelOne", category: "security", status: "operational" as const, description: "AI-powered endpoint security platform", lastUpdated: new Date().toISOString(), url: "https://status.sentinelone.com" },
        { name: "Splunk", category: "security", status: "operational" as const, description: "SIEM, log management, and observability", lastUpdated: new Date().toISOString(), url: "https://www.splunkstatus.com" },
        { name: "Stripe", category: "infrastructure", status: "operational" as const, description: "Payment processing and financial APIs", lastUpdated: new Date().toISOString(), url: "https://status.stripe.com" },
        { name: "Docker Hub", category: "development", status: "operational" as const, description: "Container image registry and build service", lastUpdated: new Date().toISOString(), url: "https://www.dockerstatus.com" },
        { name: "npm Registry", category: "development", status: "operational" as const, description: "Node.js package registry", lastUpdated: new Date().toISOString(), url: "https://status.npmjs.org" },
        { name: "Let's Encrypt", category: "security", status: "operational" as const, description: "Free TLS/SSL certificate authority", lastUpdated: new Date().toISOString(), url: "https://letsencrypt.status.io" },
        { name: "Equinix", category: "infrastructure", status: "operational" as const, description: "Data center colocation and interconnection", lastUpdated: new Date().toISOString(), url: "https://status.equinix.com" },
      ];

      async function fetchStatusPage(service: typeof statusPages[0]) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const resp = await fetch(service.url, {
            signal: controller.signal,
            headers: { "User-Agent": "STBCS-StatusMonitor/1.0" },
          });
          clearTimeout(timeout);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const json = await resp.json();
          const indicator = json?.status?.indicator || "none";
          const desc = json?.status?.description || `${service.name} status`;
          const updatedAt = json?.page?.updated_at || new Date().toISOString();
          let status: "operational" | "degraded" | "outage" | "unknown" = "unknown";
          if (indicator === "none") status = "operational";
          else if (indicator === "minor" || indicator === "maintenance") status = "degraded";
          else if (indicator === "major" || indicator === "critical") status = "outage";
          return { name: service.name, category: service.category, status, description: desc, lastUpdated: updatedAt, url: service.statusPage };
        } catch {
          clearTimeout(timeout);
          return { name: service.name, category: service.category, status: "unknown" as const, description: `Unable to reach ${service.name} status page`, lastUpdated: null, url: service.statusPage };
        }
      }

      async function fetchSlack() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const resp = await fetch(slackService.url, { signal: controller.signal, headers: { "User-Agent": "STBCS-StatusMonitor/1.0" } });
          clearTimeout(timeout);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const json = await resp.json();
          const slackStatus = json.status || "active";
          return {
            name: "Slack", category: "communication",
            status: slackStatus === "active" ? "operational" as const : slackStatus === "maintenance" ? "degraded" as const : "outage" as const,
            description: json.date_updated ? `Status: ${slackStatus}` : "Slack messaging platform",
            lastUpdated: json.date_updated || new Date().toISOString(),
            url: slackService.statusPage,
          };
        } catch {
          clearTimeout(timeout);
          return { name: "Slack", category: "communication", status: "unknown" as const, description: "Unable to reach Slack status", lastUpdated: null, url: slackService.statusPage };
        }
      }

      const [liveResults, slackResult] = await Promise.all([
        Promise.allSettled(statusPages.map(fetchStatusPage)),
        fetchSlack(),
      ]);

      const allServices = [
        ...stbcsServices,
        ...liveResults.map(r => r.status === "fulfilled" ? r.value : null).filter(Boolean),
        slackResult,
        ...staticServices,
      ];

      cacheAndSend(res, cacheKey, allServices, 60);
    } catch (error) {
      console.error("Service status error:", error);
      res.status(500).json({ error: "Failed to fetch service status" });
    }
  });

  // SSL Certificate Checker
  app.get("/api/tools/ssl-check", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(253),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }
      
      const { checkSSLCertificate, isValidDomain } = await import("./tools.js");
      
      if (!isValidDomain(parsed.data.domain)) {
        return res.status(400).json({ error: "Invalid domain format" });
      }
      
      const result = await checkSSLCertificate(parsed.data.domain);
      res.json(result);
    } catch (error) {
      console.error("SSL check error:", error);
      res.status(500).json({ error: "Failed to check SSL certificate" });
    }
  });

  // Comprehensive SSL Checker (Pro+)
  app.post("/api/tools/ssl-check-full", requireAuth as any, requirePro as any, proToolsLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        hostname: z.string().min(3).max(253),
        port: z.coerce.number().int().min(1).max(65535).default(443),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid parameters", details: parsed.error.issues });
      }

      const { isValidDomain } = await import("./tools.js");
      if (!isValidDomain(parsed.data.hostname)) {
        return res.status(400).json({ error: "Invalid hostname format" });
      }

      const allowedPorts = [443, 8443, 993, 995, 465, 587];
      if (!allowedPorts.includes(parsed.data.port)) {
        return res.status(400).json({ error: `Port not allowed. Supported ports: ${allowedPorts.join(', ')}` });
      }

      const { performFullSSLCheck } = await import("./ssl-checker.js");
      const result = await performFullSSLCheck(parsed.data.hostname, parsed.data.port);
      res.json(result);
    } catch (error) {
      console.error("Full SSL check error:", error);
      res.status(500).json({ error: "Failed to perform comprehensive SSL check" });
    }
  });

  // Web Server Fingerprinter (Pro+)
  app.post("/api/tools/web-fingerprint", requireAuth as any, requirePro as any, proToolsLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        hostname: z.string().min(3).max(253),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid parameters", details: parsed.error.issues });
      }

      const { isValidDomain } = await import("./tools.js");
      if (!isValidDomain(parsed.data.hostname)) {
        return res.status(400).json({ error: "Invalid hostname format" });
      }

      const { performWebFingerprint } = await import("./web-fingerprint.js");
      const result = await performWebFingerprint(parsed.data.hostname);

      if (result.error && result.error.includes('private IP')) {
        return res.status(400).json({ error: "Target resolves to a private/reserved IP address" });
      }

      res.json(result);
    } catch (error) {
      console.error("Web fingerprint error:", error);
      res.status(500).json({ error: "Failed to perform web server fingerprinting" });
    }
  });

  // Hash Analyzer
  app.get("/api/tools/hash-analyze", tieredToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        hash: z.string().min(16).max(256),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hash" });
      }
      
      const { analyzeHash } = await import("./tools.js");
      const basicResult = analyzeHash(parsed.data.hash);
      
      const hash = parsed.data.hash.trim().toLowerCase();
      const sources: any[] = [];
      let malwareVerdict = "Unknown";
      let malwareFamily = null as string | null;
      let detectionRate = null as string | null;
      let tags: string[] = [];
      
      const vtKey = process.env.VIRUSTOTAL_API_KEY;
      if (vtKey) {
        try {
          const vtRes = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
            headers: { 'x-apikey': vtKey },
            signal: AbortSignal.timeout(10000),
          });
          if (vtRes.ok) {
            const vtData = await vtRes.json() as any;
            const attrs = vtData.data?.attributes;
            if (attrs) {
              const stats = attrs.last_analysis_stats || {};
              const malicious = stats.malicious || 0;
              const total = (stats.malicious || 0) + (stats.undetected || 0) + (stats.harmless || 0);
              detectionRate = `${malicious}/${total}`;
              if (malicious > 0) malwareVerdict = "Malicious";
              if (attrs.popular_threat_classification?.suggested_threat_label) {
                malwareFamily = attrs.popular_threat_classification.suggested_threat_label;
              }
              if (attrs.tags) tags.push(...attrs.tags.slice(0, 10));
              sources.push({
                name: "VirusTotal",
                status: malicious > 0 ? "malicious" : "clean",
                detections: detectionRate,
                malwareFamily: malwareFamily,
                firstSeen: attrs.first_submission_date ? new Date(attrs.first_submission_date * 1000).toISOString() : null,
                fileType: attrs.type_description || null,
                fileSize: attrs.size || null,
                fileName: attrs.meaningful_name || null,
              });
            }
          } else {
            sources.push({ name: "VirusTotal", status: "not_found" });
          }
        } catch { sources.push({ name: "VirusTotal", status: "error" }); }
      }
      
      try {
        const mbRes = await fetch("https://mb-api.abuse.ch/api/v1/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `query=get_info&hash=${hash}`,
          signal: AbortSignal.timeout(10000),
        });
        if (mbRes.ok) {
          const mbData = await mbRes.json() as any;
          if (mbData.query_status === "ok" && mbData.data && mbData.data.length > 0) {
            const sample = mbData.data[0];
            if (malwareVerdict !== "Malicious") malwareVerdict = "Malicious";
            if (!malwareFamily && sample.signature) malwareFamily = sample.signature;
            if (sample.tags) tags.push(...sample.tags);
            sources.push({
              name: "MalwareBazaar",
              status: "malicious",
              malwareFamily: sample.signature || null,
              fileType: sample.file_type || null,
              fileSize: sample.file_size || null,
              fileName: sample.file_name || null,
              firstSeen: sample.first_seen || null,
              tags: sample.tags || [],
              deliveryMethod: sample.delivery_method || null,
            });
          } else {
            sources.push({ name: "MalwareBazaar", status: "not_found" });
          }
        }
      } catch { sources.push({ name: "MalwareBazaar", status: "error" }); }
      
      const haKey = process.env.HYBRID_ANALYSIS_API_KEY;
      if (haKey) {
        try {
          const haRes = await fetch("https://www.hybrid-analysis.com/api/v2/search/hash", {
            method: "POST",
            headers: {
              "api-key": haKey,
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "STBCS/1.0",
            },
            body: `hash=${hash}`,
            signal: AbortSignal.timeout(10000),
          });
          if (haRes.ok) {
            const haData = await haRes.json() as any;
            if (Array.isArray(haData) && haData.length > 0) {
              const sample = haData[0];
              const threatScore = sample.threat_score || 0;
              if (threatScore > 50 && malwareVerdict !== "Malicious") malwareVerdict = "Suspicious";
              if (threatScore > 70 && malwareVerdict !== "Malicious") malwareVerdict = "Malicious";
              sources.push({
                name: "Hybrid Analysis",
                status: threatScore > 70 ? "malicious" : threatScore > 50 ? "suspicious" : "clean",
                threatScore,
                verdict: sample.verdict || null,
                malwareFamily: sample.vx_family || null,
                environment: sample.environment_description || null,
              });
            } else {
              sources.push({ name: "Hybrid Analysis", status: "not_found" });
            }
          }
        } catch { sources.push({ name: "Hybrid Analysis", status: "error" }); }
      }
      
      if (sources.length === 0 || sources.every(s => s.status === "not_found")) {
        malwareVerdict = "Not Found";
      } else if (sources.every(s => s.status === "clean" || s.status === "not_found")) {
        malwareVerdict = "Clean";
      }
      
      res.json({
        ...basicResult,
        malwareVerdict,
        malwareFamily,
        detectionRate,
        tags: Array.from(new Set(tags)).slice(0, 15),
        sources,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Hash analysis error:", error);
      res.status(500).json({ error: "Failed to analyze hash" });
    }
  });

  // ==========================================
  // ADVANCED NMAP-STYLE PORT SCANNER (Pro/Business)
  // ==========================================

  // Per-user scan tracking for abuse prevention
  const scanHistory: Map<string, { count: number; lastScan: number; cooldownUntil: number }> = new Map();

  // Nmap scanner rate limiter (stricter for this powerful tool)
  const nmapScannerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 scans per hour
    message: { error: "Scan rate limit exceeded. Please wait before running more scans." },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => req.user?.id || 'anonymous',
  });

  app.post("/api/tools/nmap-scan", requirePro as any, nmapScannerLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        target: z.string().min(7).max(255),
        scanType: z.enum(["quick", "standard", "comprehensive"]).default("quick"),
        customPorts: z.string().max(500).optional(),
        grabBanners: z.boolean().default(true),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid scan parameters", details: parsed.error.issues });
      }

      const { target, scanType, customPorts, grabBanners } = parsed.data;
      const userId = req.user!.id;

      // Import scanner functions
      const { isBlockedIP, nmapScan, parsePortSpec, isValidIp } = await import("./tools.js");

      // Validate target is a valid IP
      if (!isValidIp(target)) {
        return res.status(400).json({ error: "Invalid target IP address. Please provide a valid IPv4 address." });
      }

      // Block internal/private IP scanning
      if (isBlockedIP(target)) {
        return res.status(403).json({ 
          error: "Scanning private, internal, or reserved IP ranges is not permitted.",
          reason: "This includes localhost (127.x.x.x), private networks (10.x, 172.16-31.x, 192.168.x), and other reserved ranges."
        });
      }

      // Per-user abuse prevention
      const userTracking = scanHistory.get(userId) || { count: 0, lastScan: 0, cooldownUntil: 0 };
      const now = Date.now();

      // Check cooldown (30 seconds between scans)
      if (now < userTracking.cooldownUntil) {
        const waitTime = Math.ceil((userTracking.cooldownUntil - now) / 1000);
        return res.status(429).json({ 
          error: `Please wait ${waitTime} seconds before starting another scan.`,
          cooldownRemaining: waitTime
        });
      }

      // Check daily limit based on tier
      const isBusinessTier = ["business", "enterprise"].includes(req.user!.tier);
      const dailyLimit = isBusinessTier ? 100 : 30; // Business: 100/day, Pro: 30/day

      // Reset count if it's a new day
      const lastScanDate = new Date(userTracking.lastScan).toDateString();
      const today = new Date().toDateString();
      if (lastScanDate !== today) {
        userTracking.count = 0;
      }

      if (userTracking.count >= dailyLimit) {
        return res.status(429).json({ 
          error: `Daily scan limit reached (${dailyLimit} scans). Your limit resets at midnight.`,
          limit: dailyLimit,
          tier: req.user!.tier
        });
      }

      // Validate custom ports if provided
      let portCount = 0;
      if (customPorts) {
        const parsedPorts = parsePortSpec(customPorts);
        portCount = parsedPorts.length;
        if (portCount === 0) {
          return res.status(400).json({ error: "Invalid port specification" });
        }
        if (portCount > 500) {
          return res.status(400).json({ error: "Maximum 500 ports allowed per scan" });
        }
      } else {
        portCount = scanType === 'quick' ? 16 : scanType === 'standard' ? 100 : 500;
      }

      // Update tracking
      scanHistory.set(userId, {
        count: userTracking.count + 1,
        lastScan: now,
        cooldownUntil: now + 30000, // 30 second cooldown
      });

      // Run the scan
      console.log(`[NMAP] User ${userId} (${req.user!.tier}) scanning ${target} - Type: ${scanType}, Ports: ${portCount}`);

      const scanResult = await nmapScan(target, {
        scanType,
        customPorts,
        grabBanners,
        timeout: 2000,
        maxConcurrent: 50,
      });

      res.json({
        success: true,
        scan: scanResult,
        usage: {
          scansToday: userTracking.count + 1,
          dailyLimit,
          tier: req.user!.tier,
        }
      });

    } catch (error) {
      console.error("Nmap scan error:", error);
      res.status(500).json({ error: "Scan failed. Please try again later." });
    }
  });

  // Get scan usage stats for current user
  app.get("/api/tools/nmap-scan/usage", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const userTracking = scanHistory.get(userId);
      const isBusinessTier = ["business", "enterprise"].includes(req.user!.tier);
      const dailyLimit = isBusinessTier ? 100 : 30;

      const now = Date.now();
      let scansToday = 0;
      let cooldownRemaining = 0;

      if (userTracking) {
        const lastScanDate = new Date(userTracking.lastScan).toDateString();
        const today = new Date().toDateString();
        scansToday = lastScanDate === today ? userTracking.count : 0;
        cooldownRemaining = Math.max(0, Math.ceil((userTracking.cooldownUntil - now) / 1000));
      }

      res.json({
        scansToday,
        dailyLimit,
        scansRemaining: Math.max(0, dailyLimit - scansToday),
        cooldownRemaining,
        tier: req.user!.tier,
      });

    } catch (error) {
      console.error("Scan usage error:", error);
      res.status(500).json({ error: "Failed to get usage stats" });
    }
  });

  // ==========================================
  // EXCHANGE SERVER CHECKER
  // ==========================================

  app.post("/api/tools/exchange-check", requireAuth as any, requirePro as any, proToolsLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        hostname: z.string().min(4).max(255),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hostname", details: parsed.error.issues });
      }

      let { hostname } = parsed.data;
      hostname = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");

      if (!isValidDomain(hostname)) {
        return res.status(400).json({ error: "Invalid domain name" });
      }

      const { checkExchangeServer } = await import("./exchange-checker.js");
      const result = await checkExchangeServer(hostname);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Target resolves to a private IP address") {
        return res.status(403).json({ error: "Scanning private/internal IP addresses is not permitted." });
      }
      console.error("Exchange check error:", error);
      res.status(500).json({ error: "Exchange server check failed" });
    }
  });

  // ==========================================
  // HTTP SECURITY HEADERS SCANNER (Free tier)
  // ==========================================

  app.post("/api/tools/headers-scan", freeToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        hostname: z.string().min(3).max(253),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hostname format" });
      }

      const { hostname } = parsed.data;
      const cleanHostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

      if (!isValidDomain(cleanHostname)) {
        return res.status(400).json({ error: "Invalid domain name" });
      }

      const { scanHeaders } = await import("./headers-scanner.js");
      const result = await scanHeaders(cleanHostname);
      res.json(result);
    } catch (error: any) {
      console.error("Headers scan error:", error);
      if (error.message?.includes('private') || error.message?.includes('internal')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to scan headers. The target may be unreachable." });
    }
  });

  // ==========================================
  // DNS SECURITY ANALYZER (Pro)
  // ==========================================

  app.post("/api/tools/dns-security", requireAuth as any, requirePro as any, proToolsLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        domain: z.string().min(3).max(253),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid domain" });
      }

      const cleanDomain = parsed.data.domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();

      if (!isValidDomain(cleanDomain)) {
        return res.status(400).json({ error: "Invalid domain name" });
      }

      const { analyzeDnsSecurity } = await import("./dns-analyzer.js");
      const result = await analyzeDnsSecurity(cleanDomain);
      res.json(result);
    } catch (error) {
      console.error("DNS security analysis error:", error);
      res.status(500).json({ error: "Failed to analyze DNS security" });
    }
  });

  // ==========================================
  // FILE SCANNER
  // ==========================================

  app.post("/api/scan/file", requireAuth as any, requirePro as any, fileUpload.single("file"), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const result = await scanFile(file.path, file.originalname);
      res.json(result);
    } catch (error) {
      console.error("File scan error:", error);
      res.status(500).json({ error: "Failed to scan file" });
    }
  });

  // ==========================================
  // NEWSLETTER SUBSCRIPTIONS
  // ==========================================

  // Subscribe to newsletter
  app.post("/api/newsletter/subscribe", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email().max(255),
        name: z.string().max(100).optional(),
        preferences: z.object({
          ransomware: z.boolean().default(true),
          cves: z.boolean().default(true),
          news: z.boolean().default(true),
          breaches: z.boolean().default(true),
        }).optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address or request body" });
      }
      
      const { email, name, preferences, frequency } = parsed.data;
      
      // Check if already subscribed
      const existing = await storage.getNewsletterByEmail(email);
      if (existing && !existing.unsubscribedAt) {
        return res.status(409).json({ error: "This email is already subscribed" });
      }
      
      // Generate tokens
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      
      const subscription = await storage.createNewsletterSubscription({
        email,
        name: name || null,
        preferences: preferences ? JSON.stringify(preferences) : JSON.stringify({ ransomware: true, cves: true, news: true, breaches: true }),
        frequency,
        verificationToken,
        unsubscribeToken,
        verified: false,
      });
      
      res.status(201).json({ 
        success: true,
        message: "Successfully subscribed! Check your email for verification (coming soon).",
        email,
      });
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  // Unsubscribe from newsletter
  app.post("/api/newsletter/unsubscribe", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email().max(255).optional(),
        token: z.string().min(10).max(100).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const { email, token } = parsed.data;
      
      if (!email && !token) {
        return res.status(400).json({ error: "Email or unsubscribe token required" });
      }
      
      let subscription;
      if (token) {
        subscription = await storage.getNewsletterByUnsubscribeToken(token);
      } else if (email) {
        subscription = await storage.getNewsletterByEmail(email);
      }
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      await storage.unsubscribeNewsletter(subscription.id);
      
      res.json({ 
        success: true,
        message: "Successfully unsubscribed from the newsletter."
      });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      res.status(500).json({ error: "Failed to unsubscribe from newsletter" });
    }
  });

  // Update newsletter preferences
  app.patch("/api/newsletter/preferences", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email().max(255),
        preferences: z.object({
          ransomware: z.boolean().optional(),
          cves: z.boolean().optional(),
          news: z.boolean().optional(),
          breaches: z.boolean().optional(),
        }).optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const { email, preferences, frequency } = parsed.data;
      
      const subscription = await storage.getNewsletterByEmail(email);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      const updates: any = {};
      if (preferences) {
        const currentPrefs = subscription.preferences ? JSON.parse(subscription.preferences) : {};
        updates.preferences = JSON.stringify({ ...currentPrefs, ...preferences });
      }
      if (frequency) {
        updates.frequency = frequency;
      }
      
      await storage.updateNewsletterPreferences(subscription.id, updates);
      
      res.json({ 
        success: true,
        message: "Preferences updated successfully."
      });
    } catch (error) {
      console.error("Newsletter preferences error:", error);
      res.status(500).json({ error: "Failed to update newsletter preferences" });
    }
  });

  // Get newsletter subscription status
  app.get("/api/newsletter/status", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email().max(255),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      const { email } = parsed.data;
      const subscription = await storage.getNewsletterByEmail(email);
      
      if (!subscription) {
        return res.json({ subscribed: false });
      }
      
      res.json({
        subscribed: !subscription.unsubscribedAt,
        verified: subscription.verified,
        frequency: subscription.frequency,
        preferences: subscription.preferences ? JSON.parse(subscription.preferences) : null,
        subscribedAt: subscription.subscribedAt,
      });
    } catch (error) {
      console.error("Newsletter status error:", error);
      res.status(500).json({ error: "Failed to check newsletter status" });
    }
  });

  // ===== EXPLOIT/CVE SUBMISSION ROUTES =====
  
  // Submit an exploit or CVE
  app.post("/api/exploits/submit", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        submitterEmail: z.string().email().max(255),
        submitterName: z.string().max(100).optional(),
        cveId: z.string().max(50).optional(),
        title: z.string().min(5).max(200),
        description: z.string().min(20).max(5000),
        affectedProduct: z.string().max(200).optional(),
        affectedVersions: z.string().max(200).optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        exploitType: z.enum(["rce", "sqli", "xss", "lfi", "rfi", "auth_bypass", "privilege_escalation", "dos", "other"]).optional(),
        pocCode: z.string().max(10000).optional(),
        pocUrl: z.string().url().max(500).optional(),
        stepsToReproduce: z.string().max(5000).optional(),
        impact: z.string().max(2000).optional(),
        mitigation: z.string().max(2000).optional(),
        references: z.string().max(2000).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid submission data", details: parsed.error.issues });
      }
      
      const submission = await storage.createExploitSubmission(parsed.data);
      
      res.status(201).json({ 
        success: true,
        message: "Exploit submission received. Our security team will review it shortly.",
        submissionId: submission.id
      });
    } catch (error) {
      console.error("Exploit submission error:", error);
      res.status(500).json({ error: "Failed to submit exploit" });
    }
  });

  // ===== VIEW TRACKING & POPULARITY ROUTES =====
  
  // Track a content view
  app.post("/api/views/track", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        contentType: z.enum(["cve", "ransomware", "ip", "url", "actor", "news", "tool"]),
        contentId: z.string().max(100),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
      }
      
      await storage.trackView(parsed.data.contentType, parsed.data.contentId);
      res.json({ success: true });
    } catch (error) {
      console.error("View tracking error:", error);
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Get trending content
  app.get("/api/trending/:contentType", strictLimiter, async (req: Request, res: Response) => {
    try {
      const contentType = req.params.contentType as string;
      const validTypes = ["cve", "ransomware", "ip", "url", "actor", "news", "tool"];
      
      if (!validTypes.includes(contentType)) {
        return res.status(400).json({ error: "Invalid content type" });
      }
      
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const trending = await storage.getTrendingContent(contentType, limit);
      
      res.json({ trending });
    } catch (error) {
      console.error("Trending content error:", error);
      res.status(500).json({ error: "Failed to get trending content" });
    }
  });

  // ===== STRIPE PAYMENT ROUTES =====
  
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe config error:", error);
      res.status(500).json({ error: "Payment system unavailable" });
    }
  });

  // List available products and prices (for donation/membership tiers)
  app.get("/api/stripe/products", async (req: Request, res: Response) => {
    try {
      const products = await stripeService.listProductsWithPrices();
      
      // Group by product
      const productsMap = new Map();
      for (const row of products) {
        const r = row as any;
        if (!productsMap.has(r.product_id)) {
          productsMap.set(r.product_id, {
            id: r.product_id,
            name: r.product_name,
            description: r.product_description,
            metadata: r.product_metadata,
            prices: []
          });
        }
        if (r.price_id) {
          productsMap.get(r.product_id).prices.push({
            id: r.price_id,
            unit_amount: r.unit_amount,
            currency: r.currency,
            recurring: r.recurring,
          });
        }
      }
      
      const validNames = ['STBCS Supporter', 'STBCS Pro', 'STBCS Business', 'STBCS Unlimited Everything'];
      const filtered = Array.from(productsMap.values()).filter((p: any) => validNames.includes(p.name));
      res.json({ products: filtered });
    } catch (error) {
      console.error("Products error:", error);
      reportCriticalError(error instanceof Error ? error : new Error(String(error)), "Stripe Products");
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Create checkout session for subscription/membership
  app.post("/api/stripe/checkout", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        priceId: z.string().min(1),
        customerEmail: z.string().email().optional(),
        mode: z.enum(['payment', 'subscription']).default('subscription'),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }
      
      const { priceId, customerEmail, mode } = parsed.data;
      
      // Validate price exists and belongs to an allowed STBCS product
      const price = await stripeService.getPrice(priceId);
      if (!price) {
        return res.status(400).json({ error: "Invalid price" });
      }
      
      // Verify the price belongs to an STBCS membership product
      const product = await stripeService.getProduct(price.product as string);
      if (!product || !(product.name as string)?.includes('STBCS')) {
        return res.status(400).json({ error: "Invalid product" });
      }
      
      const customDomain = process.env.CUSTOM_DOMAIN || 'stbcybersecurity.com';
      const baseUrl = `https://${customDomain}`;
      
      const session = await stripeService.createCheckoutSession({
        priceId,
        returnUrl: `${baseUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        customerEmail,
        mode,
        metadata: { source: 'stbcs_support' },
      });
      
      res.json({ clientSecret: session.client_secret });
    } catch (error) {
      console.error("Checkout error:", error);
      reportCriticalError(error instanceof Error ? error : new Error(String(error)), "Stripe Checkout");
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Create checkout session for one-time donation
  app.post("/api/stripe/donate", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        amount: z.number().min(100).max(100000), // $1 to $1000 in cents
        customerEmail: z.string().email().optional(),
        donorName: z.string().max(100).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }
      
      const { amount, customerEmail, donorName } = parsed.data;
      const customDomain = process.env.CUSTOM_DOMAIN || 'stbcybersecurity.com';
      const baseUrl = `https://${customDomain}`;
      
      const session = await stripeService.createDonationCheckout({
        amount,
        returnUrl: `${baseUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        customerEmail,
        donorName,
      });
      
      res.json({ clientSecret: session.client_secret });
    } catch (error) {
      console.error("Donation error:", error);
      reportCriticalError(error instanceof Error ? error : new Error(String(error)), "Stripe Donation");
      res.status(500).json({ error: "Failed to create donation session" });
    }
  });

  // Get checkout session status (for embedded checkout return page)
  app.get("/api/stripe/session-status", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
        return res.status(400).json({ error: "Invalid session" });
      }
      const status = await stripeService.getSessionStatus(sessionId);
      res.json({
        status: status.status,
        payment_status: status.payment_status,
        mode: status.mode,
        metadata: status.metadata ? { type: status.metadata.type } : null,
      });
    } catch (error) {
      console.error("Session status error:", error);
      res.status(500).json({ error: "Failed to retrieve session status" });
    }
  });

  // Create Stripe Customer Portal session for managing subscriptions
  app.post("/api/stripe/portal", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (!req.user.stripeCustomerId) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      
      const customDomain = process.env.CUSTOM_DOMAIN || 'stbcybersecurity.com';
      const baseUrl = `https://${customDomain}`;
      
      const session = await stripeService.createCustomerPortalSession(
        req.user.stripeCustomerId,
        `${baseUrl}/account`
      );
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Portal error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // Get account details with subscription info
  app.get("/api/account", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      let subscription = null;
      if (req.user.stripeSubscriptionId) {
        subscription = await stripeService.getSubscription(req.user.stripeSubscriptionId);
      }
      
      res.json({
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          tier: req.user.tier || "free",
          createdAt: req.user.createdAt,
          hasStripeCustomer: !!req.user.stripeCustomerId,
        },
        subscription: subscription ? {
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          currentPeriodStart: subscription.current_period_start,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        } : null,
      });
    } catch (error) {
      console.error("Account error:", error);
      res.status(500).json({ error: "Failed to fetch account details" });
    }
  });

  // ==================== QUO PHONE INTEGRATION ====================

  // Check Quo integration status
  app.get("/api/quo/status", generalLimiter, async (req: Request, res: Response) => {
    res.json({
      configured: isQuoConfigured(),
      hotline: "(855) STB-1987",
      hotlineE164: "+18557821987",
    });
  });

  // Internal API key for server-side SMS operations (use for internal automation only)
  const verifyInternalApiKey = (req: Request, res: Response, next: Function) => {
    const expectedKey = process.env.INTERNAL_API_KEY;
    if (!expectedKey) {
      return res.status(503).json({ error: "Internal API not configured" });
    }
    const internalKey = req.headers['x-internal-api-key'];
    if (!internalKey || typeof internalKey !== 'string' || internalKey !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Send SMS via Quo (internal use only - requires API key)
  app.post("/api/quo/send-sms", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo phone integration not configured" });
      }

      const schema = z.object({
        to: z.string().min(10).max(20),
        message: z.string().min(1).max(1600),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const quoService = getQuoService();
      const result = await quoService.sendSMS(parsed.data.to, parsed.data.message);

      res.json({
        success: true,
        messageId: result.data.id,
        to: result.data.to,
      });
    } catch (error) {
      console.error("Quo SMS error:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // Send incident alert SMS (internal use only)
  app.post("/api/quo/incident-alert", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo phone integration not configured" });
      }

      const schema = z.object({
        to: z.string().min(10).max(20),
        incidentType: z.string().min(1).max(100),
        details: z.string().min(1).max(500),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const quoService = getQuoService();
      const result = await quoService.sendIncidentAlert(
        parsed.data.to,
        parsed.data.incidentType,
        parsed.data.details
      );

      res.json({
        success: true,
        messageId: result.data.id,
      });
    } catch (error) {
      console.error("Quo incident alert error:", error);
      res.status(500).json({ error: "Failed to send incident alert" });
    }
  });

  // Send threat alert SMS (internal use only)
  app.post("/api/quo/threat-alert", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo phone integration not configured" });
      }

      const schema = z.object({
        to: z.string().min(10).max(20),
        threatType: z.string().min(1).max(100),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        description: z.string().min(1).max(500),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const quoService = getQuoService();
      const result = await quoService.sendThreatAlert(
        parsed.data.to,
        parsed.data.threatType,
        parsed.data.severity,
        parsed.data.description
      );

      res.json({
        success: true,
        messageId: result.data.id,
      });
    } catch (error) {
      console.error("Quo threat alert error:", error);
      res.status(500).json({ error: "Failed to send threat alert" });
    }
  });

  // Admin endpoint: Get recent call logs (protected)
  app.get("/api/quo/calls", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo integration not configured" });
      }

      const limitParam = z.coerce.number().int().min(1).max(100).default(50).safeParse(req.query.limit);
      const limit = limitParam.success ? limitParam.data : 50;

      const quoService = getQuoService();
      const calls = await quoService.getRecentCalls(undefined, limit);
      res.json(calls);
    } catch (error) {
      console.error("Quo get calls error:", error);
      res.status(500).json({ error: "Failed to fetch call logs" });
    }
  });

  // Admin endpoint: Get contacts (protected)
  app.get("/api/quo/contacts", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo integration not configured" });
      }

      const limitParam = z.coerce.number().int().min(1).max(100).default(50).safeParse(req.query.limit);
      const limit = limitParam.success ? limitParam.data : 50;

      const quoService = getQuoService();
      const contacts = await quoService.getContacts(limit);
      res.json(contacts);
    } catch (error) {
      console.error("Quo get contacts error:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Admin endpoint: Create new contact (protected)
  app.post("/api/quo/contacts", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo integration not configured" });
      }

      const contactSchema = z.object({
        firstName: z.string().max(100).optional(),
        lastName: z.string().max(100).optional(),
        company: z.string().max(200).optional(),
        emails: z.array(z.string().email()).optional(),
        phoneNumbers: z.array(z.string().max(20)).min(1),
      });

      const result = contactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid contact data", details: result.error.issues });
      }

      const quoService = getQuoService();
      const contact = await quoService.createContact(result.data);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Quo create contact error:", error);
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  // Specialized alert: Send ransomware attack notification (protected)
  app.post("/api/quo/ransomware-alert", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo integration not configured" });
      }

      const alertSchema = z.object({
        to: z.string().min(1).max(20),
        groupName: z.string().min(1).max(100),
        victim: z.string().min(1).max(200),
        sector: z.string().max(100).optional(),
      });

      const result = alertSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid ransomware alert data", details: result.error.issues });
      }

      const quoService = getQuoService();
      const message = await quoService.sendRansomwareAlert(
        result.data.to,
        result.data.groupName,
        result.data.victim,
        result.data.sector
      );
      res.json({ success: true, message });
    } catch (error) {
      console.error("Quo ransomware alert error:", error);
      res.status(500).json({ error: "Failed to send ransomware alert" });
    }
  });

  // Specialized alert: Send CVE vulnerability notification (protected)
  app.post("/api/quo/cve-alert", strictLimiter, verifyInternalApiKey, async (req: Request, res: Response) => {
    try {
      if (!isQuoConfigured()) {
        return res.status(503).json({ error: "Quo integration not configured" });
      }

      const alertSchema = z.object({
        to: z.string().min(1).max(20),
        cveId: z.string().regex(/^CVE-\d{4}-\d+$/),
        severity: z.string().max(20),
        description: z.string().max(1000),
      });

      const result = alertSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid CVE alert data", details: result.error.issues });
      }

      const quoService = getQuoService();
      const message = await quoService.sendCVEAlert(
        result.data.to,
        result.data.cveId,
        result.data.severity,
        result.data.description
      );
      res.json({ success: true, message });
    } catch (error) {
      console.error("Quo CVE alert error:", error);
      res.status(500).json({ error: "Failed to send CVE alert" });
    }
  });

  // Webhook endpoint for incoming Quo messages/calls (with signature verification)
  app.post("/api/quo/webhook", async (req: Request, res: Response) => {
    try {
      // Verify webhook signature if configured
      const webhookSecret = process.env.QUO_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers['x-openphone-signature'] || req.headers['x-quo-signature'];
        if (!signature) {
          console.warn("[Quo Webhook] Missing signature header");
          return res.status(401).json({ error: "Missing webhook signature" });
        }
        // Note: Implement proper HMAC verification when Quo provides signature format
      }

      const event = req.body;
      console.log("[Quo Webhook] Received event:", event.type || "unknown");
      
      // Handle different event types
      switch (event.type) {
        case "message.received":
          console.log("[Quo] Incoming message from:", event.data?.from);
          break;
        case "call.completed":
          console.log("[Quo] Call completed:", event.data?.id);
          break;
        case "call.recording.completed":
          console.log("[Quo] Call recording ready:", event.data?.id);
          break;
        default:
          console.log("[Quo] Unhandled event type:", event.type);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Quo webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ===== API KEY MANAGEMENT (Pro/Business) =====

  app.get("/api/account/api-keys", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user!.tier || req.user!.tier === "free") {
        res.status(403).json({ error: "API keys require a Pro or Business subscription" });
        return;
      }
      const keys = await storage.getApiKeysByUser(req.user!.id);
      const keysWithUsage = await Promise.all(keys.map(async (key) => {
        const usage = await storage.getApiKeyUsageToday(key.id);
        const history = await storage.getApiKeyUsageHistory(key.id, 7);
        return {
          id: key.id,
          name: key.name,
          prefix: key.prefix,
          tier: key.tier,
          status: key.status,
          rateLimitPerMin: key.rateLimitPerMin,
          dailyQuota: key.dailyQuota,
          liveLookupDailyLimit: key.liveLookupDailyLimit,
          lastUsedAt: key.lastUsedAt,
          createdAt: key.createdAt,
          revokedAt: key.revokedAt,
          todayUsage: { requests: usage?.requestCount || 0, liveLookups: usage?.liveLookupCount || 0 },
          weeklyUsage: history,
        };
      }));
      const limits = getTierLimits(req.user!.tier);
      res.json({ keys: keysWithUsage, tierLimits: limits });
    } catch (error) {
      console.error("API keys fetch error:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/account/api-keys", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") {
        res.status(403).json({ error: "API keys require a Pro or Business subscription" });
        return;
      }
      const limits = getTierLimits(tier);
      const existingKeys = await storage.getApiKeysByUser(req.user!.id);
      const activeKeys = existingKeys.filter(k => k.status === "active");
      if (activeKeys.length >= limits.maxKeys) {
        res.status(400).json({ error: `Maximum ${limits.maxKeys} active API key(s) for your tier. Revoke an existing key first.` });
        return;
      }
      const nameSchema = z.object({ name: z.string().min(1).max(50) });
      const { name } = nameSchema.parse(req.body);
      const { rawKey, prefix, keyHash } = generateApiKey(tier);
      const apiKey = await storage.createApiKey({
        userId: req.user!.id,
        name,
        keyHash,
        prefix,
        tier,
        status: "active",
        rateLimitPerMin: limits.rateLimitPerMin,
        dailyQuota: limits.dailyQuota,
        liveLookupDailyLimit: limits.liveLookupDaily,
      });
      res.json({
        key: rawKey,
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        message: "Save this key now. You won't be able to see it again.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Please provide a name for your API key" });
        return;
      }
      console.error("API key creation error:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.delete("/api/account/api-keys/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.revokeApiKey(asString(req.params.id), req.user!.id);
      res.json({ success: true, message: "API key revoked" });
    } catch (error) {
      console.error("API key revoke error:", error);
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  });

  // ===== PRO FEATURES =====

  // Get user's watchlist items
  app.get("/api/watchlist", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const items = await storage.getWatchlistItems(req.user!.id);
      res.json({ items });
    } catch (error) {
      console.error("Watchlist fetch error:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Add item to watchlist
  app.post("/api/watchlist", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        itemType: z.enum(["cve", "ip", "domain", "ransomware_group", "keyword", "sector", "country", "company"]),
        itemValue: z.string().min(1).max(500),
        label: z.string().max(100).optional(),
        alertOnMatch: z.boolean().default(true),
        emailOnMatch: z.boolean().default(false),
        smsOnMatch: z.boolean().default(false),
        notes: z.string().max(1000).optional(),
      });
      
      const data = schema.parse(req.body);
      
      if (data.smsOnMatch && req.user!.tier !== "business") {
        res.status(403).json({ error: "SMS alerts are only available for Business tier" });
        return;
      }
      
      const item = await storage.createWatchlistItem({
        userId: req.user!.id,
        itemType: data.itemType,
        itemValue: data.itemValue,
        label: data.label,
        alertOnMatch: data.alertOnMatch,
        emailOnMatch: data.emailOnMatch,
        smsOnMatch: data.smsOnMatch,
        notes: data.notes,
      });
      
      res.json({ item });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Watchlist add error:", error);
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  // Update watchlist item
  app.patch("/api/watchlist/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        label: z.string().max(100).optional(),
        alertOnMatch: z.boolean().optional(),
        emailOnMatch: z.boolean().optional(),
        smsOnMatch: z.boolean().optional(),
        notes: z.string().max(1000).optional(),
      });
      
      const data = schema.parse(req.body);
      
      if (data.smsOnMatch && req.user!.tier !== "business") {
        res.status(403).json({ error: "SMS alerts are only available for Business tier" });
        return;
      }
      
      const item = await storage.updateWatchlistItem(asString(id), req.user!.id, data);
      
      if (!item) {
        res.status(404).json({ error: "Watchlist item not found" });
        return;
      }
      
      res.json({ item });
    } catch (error) {
      console.error("Watchlist update error:", error);
      res.status(500).json({ error: "Failed to update watchlist item" });
    }
  });

  // Delete watchlist item
  app.delete("/api/watchlist/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteWatchlistItem(asString(id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Watchlist delete error:", error);
      res.status(500).json({ error: "Failed to delete watchlist item" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        unreadOnly: z.coerce.boolean().default(false),
      });
      
      const { limit, unreadOnly } = schema.parse(req.query);
      const notifications = await storage.getUserNotifications(req.user!.id, limit, unreadOnly);
      const unreadCount = await storage.getUnreadNotificationCount(req.user!.id);
      
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Notifications fetch error:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(asString(id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Notifications read-all error:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Dismiss notification
  app.post("/api/notifications/:id/dismiss", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await storage.dismissNotification(asString(id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Notification dismiss error:", error);
      res.status(500).json({ error: "Failed to dismiss notification" });
    }
  });

  // Check email in breach database (Pro feature)
  app.post("/api/breaches/check", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email(),
      });
      
      const { email } = schema.parse(req.body);
      const domain = email.split("@")[1];
      
      // Search for breaches matching the domain
      const breaches = await storage.searchBreaches(domain, 50);
      
      res.json({ 
        email,
        domain,
        breachesFound: breaches.length,
        breaches: breaches.map(b => ({
          name: b.name,
          breachDate: b.breachDate,
          pwnCount: b.pwnCount,
          dataClasses: b.dataClasses,
          description: b.description,
        })),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Breach check error:", error);
      res.status(500).json({ error: "Failed to check breaches" });
    }
  });

  // Export data (Pro feature)
  app.get("/api/export/:type", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type } = req.params;
      const format = (req.query.format as string) || "json";
      const isBusinessTier = ["business", "enterprise"].includes(req.user!.tier);
      const maxLimit = isBusinessTier ? 10000 : 5000;
      const limit = Math.min(parseInt(req.query.limit as string) || maxLimit, maxLimit);
      
      let data: any[];
      let filename: string;
      
      switch (type) {
        case "cves":
          data = await storage.getCves(limit, 0);
          filename = "stbcs_cves";
          break;
        case "ransomware":
          data = await storage.getRansomwareIncidents(limit, 0);
          filename = "stbcs_ransomware";
          break;
        case "ips":
          data = await storage.getMaliciousIps(limit, 0);
          filename = "stbcs_malicious_ips";
          break;
        case "urls":
          data = await storage.getMaliciousUrls(limit, 0);
          filename = "stbcs_malicious_urls";
          break;
        case "kev":
          data = await storage.getCisaKev(limit, 0);
          filename = "stbcs_cisa_kev";
          break;
        case "breaches":
          data = await storage.getBreachIncidents(limit, 0);
          filename = "stbcs_breaches";
          break;
        case "threat-actors":
          data = await storage.getThreatActors(limit);
          filename = "stbcs_threat_actors";
          break;
        default:
          res.status(400).json({ error: "Invalid export type" });
          return;
      }
      
      if (format === "csv") {
        // Convert to CSV
        if (data.length === 0) {
          res.status(404).json({ error: "No data to export" });
          return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(","),
          ...data.map(row => 
            headers.map(h => {
              const val = (row as any)[h];
              if (val === null || val === undefined) return "";
              if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return String(val);
            }).join(",")
          )
        ];
        
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
        res.send(csvRows.join("\n"));
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.json"`);
        res.json({ data, exportedAt: new Date().toISOString(), count: data.length });
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Advanced search with filters (Pro feature)
  app.post("/api/search/advanced", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        query: z.string().min(1).max(200),
        types: z.array(z.enum(["cves", "ransomware", "ips", "urls", "kev", "news"])).default(["cves", "ransomware", "ips", "urls", "kev", "news"]),
        filters: z.object({
          severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
          source: z.string().max(100).optional(),
          country: z.string().max(100).optional(),
          sector: z.string().max(100).optional(),
        }).optional(),
        limit: z.number().int().min(1).max(100).default(20),
      });
      
      const data = schema.parse(req.body);
      
      // For now, use global search - advanced filters can be added later
      const results = await (storage as any).globalSearch(data.query, data.limit);
      
      // Filter by types requested
      const filteredResults: any = {};
      if (data.types.includes("cves")) filteredResults.cves = results.cves;
      if (data.types.includes("ransomware")) filteredResults.ransomware = results.ransomware;
      if (data.types.includes("ips")) filteredResults.ips = results.ips;
      if (data.types.includes("urls")) filteredResults.urls = results.urls;
      if (data.types.includes("kev")) filteredResults.kev = results.kev;
      if (data.types.includes("news")) filteredResults.news = results.news;
      
      res.json({ results: filteredResults, query: data.query });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Advanced search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ========================================
  // SMS Messaging Routes (Business Only - Exclusive Feature)
  // ========================================

  // Get all SMS conversations
  app.get("/api/messages/conversations", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const conversations = await storage.getSmsConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/messages/conversation/:phoneNumber", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const phoneNumber = decodeURIComponent(req.params.phoneNumber as string);
      const messages = await storage.getConversationMessages(phoneNumber);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a new SMS message
  app.post("/api/messages/send", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        to: z.string().min(10).max(20),
        content: z.string().min(1).max(1600),
      });
      
      const data = schema.parse(req.body);
      
      if (!isQuoConfigured()) {
        res.status(503).json({ error: "SMS service not configured" });
        return;
      }
      
      const quoService = getQuoService();
      const result = await quoService.sendSMS(data.to, data.content);
      
      // Store the message in our database
      const fromNumber = '+18557821987'; // STBCS number
      const message = await storage.createSmsMessage({
        externalId: result.data.id,
        direction: 'outbound',
        fromNumber: fromNumber,
        toNumber: data.to.startsWith('+') ? data.to : `+1${data.to.replace(/\\D/g, '')}`,
        content: data.content,
        status: 'delivered',
        conversationId: data.to.replace(/\\D/g, ''),
        userId: req.user?.id,
        isRead: true,
      });
      
      res.json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Mark a message as read
  app.post("/api/messages/:id/read", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.markMessageRead(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Mark entire conversation as read
  app.post("/api/messages/conversation/:phoneNumber/read", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const phoneNumber = decodeURIComponent(req.params.phoneNumber as string);
      await storage.markConversationRead(phoneNumber);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking conversation read:", error);
      res.status(500).json({ error: "Failed to mark conversation as read" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const count = await storage.getUnreadMessageCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // ========================================
  // Live Chat Widget Routes (Public - No Auth Required)
  // ========================================

  app.post("/api/live-chat/start", liveChatLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        phone: z.string().min(10).max(20),
        name: z.string().max(100).optional(),
        tcpaConsent: z.boolean().refine(v => v === true, { message: "TCPA consent is required" }),
      });

      const data = schema.parse(req.body);
      const formattedPhone = data.phone.startsWith('+') ? data.phone : `+1${data.phone.replace(/\D/g, '')}`;

      const existing = await storage.getLiveChatSessionByPhone(formattedPhone);
      if (existing) {
        res.json({ sessionToken: existing.sessionToken, resumed: true });
        return;
      }

      const crypto = await import('crypto');
      const sessionToken = crypto.randomBytes(32).toString('hex');

      await storage.createLiveChatSession({
        sessionToken,
        visitorPhone: formattedPhone,
        visitorName: data.name || null,
        tcpaConsent: true,
        consentTimestamp: new Date(),
        status: 'active',
      });

      if (isQuoConfigured()) {
        try {
          const quoService = getQuoService();
          const greeting = data.name ? `Hi ${data.name}!` : 'Hello!';
          await quoService.sendSMS(formattedPhone, `${greeting} Thanks for reaching out to STB Cybersecurity. A team member will reply shortly. For emergencies, call (855) STB-1987.`);

          await storage.createSmsMessage({
            direction: 'outbound',
            fromNumber: '+18557821987',
            toNumber: formattedPhone,
            content: `${greeting} Thanks for reaching out to STB Cybersecurity. A team member will reply shortly. For emergencies, call (855) STB-1987.`,
            status: 'delivered',
            conversationId: formattedPhone.replace(/\D/g, ''),
            isRead: true,
          });
        } catch (smsErr) {
          console.error("[Live Chat] Welcome SMS failed:", smsErr);
        }
      }

      res.json({ sessionToken, resumed: false });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("[Live Chat] Start error:", error);
      res.status(500).json({ error: "Failed to start chat session" });
    }
  });

  app.post("/api/live-chat/send", liveChatLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        sessionToken: z.string().min(1),
        content: z.string().min(1).max(1600),
      });

      const data = schema.parse(req.body);
      const session = await storage.getLiveChatSessionByToken(data.sessionToken);

      if (!session || session.status !== 'active') {
        res.status(404).json({ error: "Chat session not found or closed" });
        return;
      }

      const chatPrefix = `[LIVE CHAT${session.visitorName ? ` - ${session.visitorName}` : ''}] `;

      await storage.createSmsMessage({
        direction: 'inbound',
        fromNumber: session.visitorPhone,
        toNumber: '+18557821987',
        content: `${chatPrefix}${data.content}`,
        status: 'delivered',
        conversationId: session.visitorPhone.replace(/\D/g, ''),
        isRead: false,
      });

      await storage.updateLiveChatActivity(data.sessionToken);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error("[Live Chat] Send error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/live-chat/messages", liveChatLimiter, async (req: Request, res: Response) => {
    try {
      const sessionToken = asString(req.query.sessionToken as string);
      if (!sessionToken) {
        res.status(400).json({ error: "Session token required" });
        return;
      }

      const session = await storage.getLiveChatSessionByToken(sessionToken);
      if (!session) {
        res.status(404).json({ error: "Chat session not found" });
        return;
      }

      const messages = await storage.getConversationMessages(session.visitorPhone, 50);

      const chatMessages = messages
        .map(msg => {
          let content = msg.content;
          if (msg.direction === 'inbound') {
            content = content.replace(/^\[LIVE CHAT(?:\s*-\s*[^\]]*)?\]\s*/, '');
          }
          return {
            id: msg.id,
            content,
            direction: msg.direction === 'inbound' ? 'visitor' : 'support',
            createdAt: msg.createdAt,
          };
        })
        .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

      res.json(chatMessages);
    } catch (error) {
      console.error("[Live Chat] Messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/live-chat/end", liveChatLimiter, async (req: Request, res: Response) => {
    try {
      const { sessionToken } = z.object({ sessionToken: z.string() }).parse(req.body);
      await storage.closeLiveChatSession(sessionToken);
      res.json({ success: true });
    } catch (error) {
      console.error("[Live Chat] End error:", error);
      res.status(500).json({ error: "Failed to end chat session" });
    }
  });

  // Webhook for incoming SMS (from Quo/OpenPhone)
  app.post("/api/webhooks/sms", async (req: Request, res: Response) => {
    try {
      // Validate webhook signature if configured
      const payload = req.body;
      
      // Handle different webhook event types from OpenPhone
      if (payload.type === 'message.received' && payload.data) {
        const messageData = payload.data;
        
        await storage.createSmsMessage({
          externalId: messageData.id,
          direction: 'inbound',
          fromNumber: messageData.from || '',
          toNumber: messageData.to?.[0] || '+18557821987',
          content: messageData.content || messageData.body || '',
          status: 'delivered',
          conversationId: (messageData.from || '').replace(/\\D/g, ''),
          isRead: false,
        });
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      // Return 200 to acknowledge receipt even on error (avoid retries)
      res.json({ received: true, error: "Processing failed" });
    }
  });

  // ===== ADMIN VISITOR STATS (Private - requires admin key via header only) =====
  const ADMIN_KEY = process.env.ADMIN_STATS_KEY;

  app.get("/api/admin/visitors", strictLimiter, async (req: Request, res: Response) => {
    try {
      if (!ADMIN_KEY) {
        return res.status(503).json({ error: "Admin endpoint not configured" });
      }
      const key = req.headers["x-admin-key"];
      if (!key || typeof key !== 'string' || key.length < 16 || key !== ADMIN_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const stats = await storage.getVisitorStats();
      const daily = await storage.getDailyVisitorCounts(30);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newSignups = await storage.getNewSignupsCount(weekAgo);
      const totalUsers = (await storage.getAllUsers()).length;

      res.json({
        visitors: stats,
        dailyCounts: daily,
        newSignupsLast7Days: newSignups,
        totalRegisteredUsers: totalUsers,
      });
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
      res.status(500).json({ error: "Failed to fetch visitor stats" });
    }
  });

  // === Logo Gallery: Page Views & Votes ===
  app.post("/api/logos/view", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(contentViews).where(eq(contentViews.contentType, "logo_gallery")).limit(1);
      if (result.length > 0) {
        await db.update(contentViews)
          .set({ viewCount: dsql`COALESCE(${contentViews.viewCount}, 0) + 1`, lastViewedAt: new Date() })
          .where(eq(contentViews.contentType, "logo_gallery"));
      } else {
        await db.insert(contentViews).values({ contentType: "logo_gallery", contentId: "page", viewCount: 1 });
      }
      const updated = await db.select().from(contentViews).where(eq(contentViews.contentType, "logo_gallery")).limit(1);
      res.json({ views: updated[0]?.viewCount ?? 1 });
    } catch (error) {
      console.error("Error recording logo page view:", error);
      res.status(500).json({ error: "Failed to record view" });
    }
  });

  // Hero background site setting (DB-persisted)
  app.get("/api/site-settings/hero-bg", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const key = "settings:hero-bg";
      if (cachedJson(res, key, 300)) return;
      const result = await db.select().from(siteSettings).where(eq(siteSettings.key, "hero-bg")).limit(1);
      cacheAndSend(res, key, { value: result[0]?.value || "threat-map" }, 300);
    } catch {
      res.json({ value: "threat-map" });
    }
  });

  app.post("/api/site-settings/hero-bg", generalLimiter, async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      const validIds = ["threat-map", "static-dots", "cyber-grid", "matrix-rain", "honeycomb", "radar-sweep", "circuit-trace", "pulse-rings", "waveform", "global-network", "data-center", "routing-map", "command-center", "threat-landscape", "secure-blueprint", "firewall-defense", "satellite-network", "blockchain-grid", "neural-defense", "submarine-cables", "zero-trust", "cloud-security", "endpoint-grid", "siem-flow", "darkweb-intel", "threat-hunting", "incident-response", "quantum-crypto", "ics-scada", "pentest-surface", "dns-sinkhole", "vuln-heatmap", "kill-chain", "honeypot-net", "intel-fusion", "cyber-battlefield", "supply-chain", "soc-panorama", "malware-sandbox", "identity-mesh", "ransomware-contain", "5g-security", "risk-matrix", "forensics-trail", "soar-automation", "globe-packets", "data-flow", "cyber-mesh", "threat-streams", "net-topology"];
      if (!value || !validIds.includes(value)) {
        res.status(400).json({ error: "Invalid background ID" });
        return;
      }
      await db.insert(siteSettings)
        .values({ key: "hero-bg", value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      cache.invalidatePrefix("settings:");
      res.json({ value, updated: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  const LOGO_THEMES = [
    "default", "sentinel-shield", "neural-lock", "fortress-radar",
    "sword-key", "quantum-core", "cyber-eye", "spartan-helm", "bio-helix",
    "chain-shield", "lighthouse-beacon", "samurai-cyber", "radar-hex", "chess-knight",
    "phoenix-rise", "dragon-fire", "shadow-hacker", "cyber-skull", "vault-server",
    "crypto-lock", "firewall-barrier", "terminal-ops", "bio-print", "soc-command",
    "zero-trust", "chip-shield", "orbital-intel", "breach-patch", "darkweb-intel",
    "honeypot-trap", "redblue-team", "wolf-hunter", "eagle-scan", "cobra-strike",
    "kraken-deep", "bear-circuit", "cyber-iris", "sentinel-eye", "target-eye",
    "shield-eye", "data-eye", "hex-vision", "ghost-hacker", "cyber-mask",
    "ops-desk", "vr-skull", "ai-sentinel", "breach-force", "key-access",
    "web-spider", "threat-scope", "athena-guard", "cyber-ninja", "holo-lock",
    "code-blade", "global-guard", "cyber-phoenix", "digital-fort", "neural-brain",
    "space-ops", "rune-guard", "medusa-net", "cyber-clock", "bug-hunter",
    "cyber-trident", "gene-shield", "signal-shield", "hex-maze", "smart-city",
    "pack-ops", "intel-book",
  ];

  app.get("/api/site-settings/logo-theme", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const key = "settings:logo-theme";
      if (cachedJson(res, key, 300)) return;
      const result = await db.select().from(siteSettings).where(eq(siteSettings.key, "logo-theme")).limit(1);
      cacheAndSend(res, key, { value: result[0]?.value || "default" }, 300);
    } catch {
      res.json({ value: "default" });
    }
  });

  app.post("/api/site-settings/logo-theme", generalLimiter, async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      if (!value || !LOGO_THEMES.includes(value)) {
        res.status(400).json({ error: "Invalid logo theme" });
        return;
      }
      await db.insert(siteSettings)
        .values({ key: "logo-theme", value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      cache.invalidatePrefix("settings:");
      res.json({ value, updated: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update logo theme" });
    }
  });

  const ICON_THEMES = [
    "default", "neon-green", "cyber-blue", "blood-red", "plasma-purple",
    "arctic-cyan", "solar-amber", "toxic-lime", "rose-signal", "emerald-shield",
    "ghost-white", "indigo-ops", "fire-orange-glow", "teal-sentinel",
    "duotone-blue-orange", "duotone-green-red", "duotone-purple-cyan",
    "neon-badge-green", "neon-badge-blue", "neon-badge-red",
    "outlined-cyan", "outlined-amber", "bold-orange", "bold-blue", "bold-red",
    "holo-violet", "midnight-blue", "infrared", "gold-command", "sky-patrol",
  ];

  app.get("/api/site-settings/icon-theme", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const key = "settings:icon-theme";
      if (cachedJson(res, key, 300)) return;
      const result = await db.select().from(siteSettings).where(eq(siteSettings.key, "icon-theme")).limit(1);
      cacheAndSend(res, key, { value: result[0]?.value || "default" }, 300);
    } catch {
      res.json({ value: "default" });
    }
  });

  app.post("/api/site-settings/icon-theme", generalLimiter, async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      if (!value || !ICON_THEMES.includes(value)) {
        res.status(400).json({ error: "Invalid icon theme" });
        return;
      }
      await db.insert(siteSettings)
        .values({ key: "icon-theme", value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      cache.invalidatePrefix("settings:");
      res.json({ value, updated: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update icon theme" });
    }
  });

  app.get("/api/logos/views", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(contentViews).where(eq(contentViews.contentType, "logo_gallery")).limit(1);
      res.json({ views: result[0]?.viewCount ?? 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to get views" });
    }
  });

  app.get("/api/logos/votes", generalLimiter, async (_req: Request, res: Response) => {
    try {
      const results = await db.select({
        logoVariant: logoVotes.logoVariant,
        count: dsql<number>`count(*)::int`,
      }).from(logoVotes).groupBy(logoVotes.logoVariant);
      const voteCounts: Record<string, number> = {};
      for (const r of results) {
        voteCounts[r.logoVariant] = r.count;
      }
      res.json({ votes: voteCounts });
    } catch (error) {
      res.status(500).json({ error: "Failed to get votes" });
    }
  });

  app.post("/api/logos/vote", strictLimiter, async (req: Request, res: Response) => {
    try {
      const { variant } = req.body;
      if (!variant || typeof variant !== "string") {
        return res.status(400).json({ error: "Missing variant" });
      }
      const ip = (req.headers["x-forwarded-for"] as string || req.ip || "unknown").split(",")[0].trim();
      const voterHash = crypto.createHash("sha256").update(ip + "_logo_vote").digest("hex").slice(0, 16);
      
      const existing = await db.select().from(logoVotes).where(
        and(eq(logoVotes.voterHash, voterHash), eq(logoVotes.logoVariant, variant))
      ).limit(1);
      
      if (existing.length > 0) {
        return res.status(409).json({ error: "Already voted for this variant", alreadyVoted: true });
      }

      await db.insert(logoVotes).values({ logoVariant: variant, voterHash });
      
      const results = await db.select({
        logoVariant: logoVotes.logoVariant,
        count: dsql<number>`count(*)::int`,
      }).from(logoVotes).groupBy(logoVotes.logoVariant);
      const voteCounts: Record<string, number> = {};
      for (const r of results) {
        voteCounts[r.logoVariant] = r.count;
      }
      res.json({ votes: voteCounts, voted: variant });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(500).json({ error: "Failed to record vote" });
    }
  });

  app.get("/api/logos/my-votes", generalLimiter, async (req: Request, res: Response) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string || req.ip || "unknown").split(",")[0].trim();
      const voterHash = crypto.createHash("sha256").update(ip + "_logo_vote").digest("hex").slice(0, 16);
      const myVotes = await db.select({ logoVariant: logoVotes.logoVariant }).from(logoVotes).where(eq(logoVotes.voterHash, voterHash));
      res.json({ votedFor: myVotes.map(v => v.logoVariant) });
    } catch (error) {
      res.status(500).json({ error: "Failed to get votes" });
    }
  });

  app.post("/api/contact", strictLimiter, async (req: Request, res: Response) => {
    try {
      const { insertContactMessageSchema } = await import("@shared/schema");
      const result = insertContactMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Please fill in all fields correctly", details: result.error.issues });
      }

      const { contactMessages } = await import("@shared/schema");
      await db.insert(contactMessages).values(result.data);

      try {
        const { sendEmail } = await import("./email");
        await sendEmail({
          to: "kbpc.inc@gmail.com",
          subject: `[STBCS Contact] ${result.data.category.toUpperCase()}: ${result.data.subject}`,
          html: `<div style="font-family:sans-serif;color:#fff;background:#1a1a1a;padding:20px;border-radius:8px;">
            <h2 style="color:#f97316;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${result.data.name} &lt;${result.data.email}&gt;</p>
            <p><strong>Category:</strong> ${result.data.category}</p>
            <p><strong>Subject:</strong> ${result.data.subject}</p>
            <hr style="border-color:#333;"/>
            <p style="white-space:pre-wrap;">${result.data.message}</p>
          </div>`,
          text: `New Contact: ${result.data.name} (${result.data.email})\nCategory: ${result.data.category}\nSubject: ${result.data.subject}\n\n${result.data.message}`,
        });
      } catch (emailErr) {
        console.error("Contact email notification failed:", emailErr);
      }

      res.json({ success: true, message: "Message received. We'll respond within 24 hours." });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to send message. Please try again." });
    }
  });

  // ===== UPTIME & DARK WEB MONITORING (Pro/Business) =====
  
  const monitorTierLimits: Record<string, { uptimeMonitors: number; darkWebMonitors: number; darkWebSources: number }> = {
    free: { uptimeMonitors: 0, darkWebMonitors: 0, darkWebSources: 0 },
    pro: { uptimeMonitors: 5, darkWebMonitors: 5, darkWebSources: 5 },
    supporter: { uptimeMonitors: 5, darkWebMonitors: 5, darkWebSources: 5 },
    business: { uptimeMonitors: 25, darkWebMonitors: 25, darkWebSources: 12 },
    enterprise: { uptimeMonitors: 100, darkWebMonitors: 100, darkWebSources: 12 },
  };

  app.get("/api/monitors/uptime", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Uptime monitoring requires a Pro or Business subscription" }); return; }
      const monitors = await storage.getUptimeMonitorsByUser(req.user!.id);
      const limits = monitorTierLimits[tier] || monitorTierLimits.free;
      res.json({ monitors, limits, tier });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitors" });
    }
  });

  app.post("/api/monitors/uptime", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Uptime monitoring requires a Pro or Business subscription" }); return; }
      const limits = monitorTierLimits[tier] || monitorTierLimits.free;
      const count = await storage.getUserMonitorCount(req.user!.id);
      if (count >= limits.uptimeMonitors) { res.status(400).json({ error: `Maximum ${limits.uptimeMonitors} monitors for your plan. Upgrade to add more.` }); return; }
      const schema = z.object({
        name: z.string().min(1).max(100),
        url: z.string().min(1).max(500),
        protocol: z.enum(["http", "https", "tcp"]).default("https"),
        checkInterval: z.number().min(60).max(3600).default(300),
        timeout: z.number().min(5).max(120).default(30),
        expectedStatusCode: z.number().min(100).max(599).default(200),
        alertOnDown: z.boolean().default(true),
        alertOnSslExpiry: z.boolean().default(true),
        sslExpiryThresholdDays: z.number().min(1).max(90).default(14),
        emailAlert: z.boolean().default(true),
        smsAlert: z.boolean().default(false),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ error: "Invalid monitor configuration", details: parsed.error.issues }); return; }
      const monitor = await storage.createUptimeMonitor({ ...parsed.data, userId: req.user!.id, status: "active" });
      res.json({ monitor, message: "Monitor created. First check will run shortly." });
    } catch (error) {
      console.error("Create monitor error:", error);
      res.status(500).json({ error: "Failed to create monitor" });
    }
  });

  app.put("/api/monitors/uptime/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      const id = asString(req.params.id);
      const existing = await storage.getUptimeMonitorById(id);
      if (!existing || existing.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      const schema = z.object({
        name: z.string().min(1).max(100).optional(),
        url: z.string().min(1).max(500).optional(),
        protocol: z.enum(["http", "https", "tcp"]).optional(),
        checkInterval: z.number().min(60).max(3600).optional(),
        timeout: z.number().min(5).max(120).optional(),
        expectedStatusCode: z.number().min(100).max(599).optional(),
        alertOnDown: z.boolean().optional(),
        alertOnSslExpiry: z.boolean().optional(),
        sslExpiryThresholdDays: z.number().min(1).max(90).optional(),
        emailAlert: z.boolean().optional(),
        smsAlert: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
      const updated = await storage.updateUptimeMonitor(id, req.user!.id, parsed.data);
      res.json({ monitor: updated });
    } catch (error) {
      res.status(500).json({ error: "Failed to update monitor" });
    }
  });

  app.delete("/api/monitors/uptime/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      await storage.deleteUptimeMonitor(asString(req.params.id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete monitor" });
    }
  });

  app.get("/api/monitors/uptime/:id/checks", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = asString(req.params.id);
      const monitor = await storage.getUptimeMonitorById(id);
      if (!monitor || monitor.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const checks = await storage.getUptimeChecks(id, limit);
      const stats24h = await storage.getUptimeCheckStats(id, 24);
      const stats7d = await storage.getUptimeCheckStats(id, 168);
      const stats30d = await storage.getUptimeCheckStats(id, 720);
      res.json({ checks, stats24h, stats7d, stats30d });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch checks" });
    }
  });

  app.get("/api/monitors/uptime/:id/incidents", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = asString(req.params.id);
      const monitor = await storage.getUptimeMonitorById(id);
      if (!monitor || monitor.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      const incidents = await storage.getUptimeIncidentsByMonitor(id, 50);
      res.json({ incidents });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/monitors/incidents", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      const incidents = await storage.getUptimeIncidents(req.user!.id, 100);
      res.json({ incidents });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/monitors/ssl/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (!["business", "enterprise"].includes(tier)) { res.status(403).json({ error: "SSL certificate monitoring requires a Business subscription" }); return; }
      const id = asString(req.params.id);
      const monitor = await storage.getUptimeMonitorById(id);
      if (!monitor || monitor.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      try {
        const parsed = new URL(monitor.url.startsWith("http") ? monitor.url : `https://${monitor.url}`);
        const { checkSslCertificate } = await import("./uptimeEngine");
        const sslInfo = await checkSslCertificate(parsed.hostname, parseInt(parsed.port) || 443);
        res.json({ ssl: sslInfo, monitor: { id: monitor.id, name: monitor.name, url: monitor.url } });
      } catch {
        res.json({ ssl: null, error: "Could not check SSL certificate" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to check SSL" });
    }
  });

  app.get("/api/monitors/summary", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      const uptimeMonitors = await storage.getUptimeMonitorsByUser(req.user!.id);
      const darkWebMonitors = await storage.getDarkWebMonitorsByUser(req.user!.id);
      const incidents = await storage.getUptimeIncidents(req.user!.id, 10);
      const darkWebFindings = await storage.getDarkWebFindings(req.user!.id, 10);
      const limits = monitorTierLimits[tier] || monitorTierLimits.free;

      const totalUp = uptimeMonitors.filter(m => m.currentState === "up").length;
      const totalDown = uptimeMonitors.filter(m => m.currentState === "down").length;
      const totalDegraded = uptimeMonitors.filter(m => m.currentState === "degraded").length;
      const avgUptime = uptimeMonitors.length > 0
        ? Math.round(uptimeMonitors.reduce((sum, m) => sum + (m.uptimePercent || 0), 0) / uptimeMonitors.length * 100) / 100
        : 100;
      const sslExpiring = uptimeMonitors.filter(m => m.sslExpiresAt && new Date(m.sslExpiresAt).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000).length;
      const activeIncidents = incidents.filter(i => i.status === "ongoing").length;
      const unreadFindings = darkWebFindings.filter(f => !f.isRead).length;

      res.json({
        uptime: { total: uptimeMonitors.length, up: totalUp, down: totalDown, degraded: totalDegraded, avgUptime, sslExpiring, activeIncidents },
        darkWeb: { total: darkWebMonitors.length, totalFindings: darkWebFindings.length, unreadFindings },
        limits,
        tier,
        recentIncidents: incidents.slice(0, 5),
        recentFindings: darkWebFindings.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitor summary" });
    }
  });

  // Dark Web Monitoring Routes
  app.get("/api/monitors/darkweb", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Dark web monitoring requires a Pro or Business subscription" }); return; }
      const monitors = await storage.getDarkWebMonitorsByUser(req.user!.id);
      const limits = monitorTierLimits[tier] || monitorTierLimits.free;
      res.json({ monitors, limits, tier });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dark web monitors" });
    }
  });

  app.post("/api/monitors/darkweb", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Dark web monitoring requires a Pro or Business subscription" }); return; }
      const limits = monitorTierLimits[tier] || monitorTierLimits.free;
      const count = await storage.getUserDarkWebMonitorCount(req.user!.id);
      if (count >= limits.darkWebMonitors) { res.status(400).json({ error: `Maximum ${limits.darkWebMonitors} dark web monitors for your plan.` }); return; }
      const schema = z.object({
        targetType: z.enum(["domain", "email", "ip", "keyword", "url"]),
        targetValue: z.string().min(1).max(500),
        label: z.string().max(100).optional(),
        emailAlert: z.boolean().default(true),
        smsAlert: z.boolean().default(false),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ error: "Invalid monitor configuration" }); return; }
      const monitor = await storage.createDarkWebMonitor({ ...parsed.data, userId: req.user!.id, status: "active" });
      res.json({ monitor, message: "Dark web monitor created. Initial scan will run shortly." });
    } catch (error) {
      console.error("Create dark web monitor error:", error);
      res.status(500).json({ error: "Failed to create dark web monitor" });
    }
  });

  app.put("/api/monitors/darkweb/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      const id = asString(req.params.id);
      const existing = await storage.getDarkWebMonitorById(id);
      if (!existing || existing.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      const schema = z.object({
        label: z.string().max(100).optional(),
        emailAlert: z.boolean().optional(),
        smsAlert: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
      const updated = await storage.updateDarkWebMonitor(id, req.user!.id, parsed.data);
      res.json({ monitor: updated });
    } catch (error) {
      res.status(500).json({ error: "Failed to update monitor" });
    }
  });

  app.delete("/api/monitors/darkweb/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      await storage.deleteDarkWebMonitor(asString(req.params.id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete monitor" });
    }
  });

  app.get("/api/monitors/darkweb/:id/findings", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = asString(req.params.id);
      const monitor = await storage.getDarkWebMonitorById(id);
      if (!monitor || monitor.userId !== req.user!.id) { res.status(404).json({ error: "Monitor not found" }); return; }
      const findings = await storage.getDarkWebFindingsByMonitor(id, 100);
      res.json({ findings });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch findings" });
    }
  });

  app.get("/api/monitors/darkweb/findings/all", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tier = req.user!.tier || "free";
      if (tier === "free") { res.status(403).json({ error: "Upgrade required" }); return; }
      const findings = await storage.getDarkWebFindings(req.user!.id, 200);
      res.json({ findings });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch findings" });
    }
  });

  app.post("/api/monitors/darkweb/findings/:id/read", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await storage.markDarkWebFindingRead(asString(req.params.id), req.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark finding as read" });
    }
  });

  // ===== Attack Surface Discovery (Pro+) =====
  app.post("/api/attack-surface/scans", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({ domain: z.string().min(3).max(253) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid domain" });

      const cleanDomain = parsed.data.domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
      if (!isValidDomain(cleanDomain)) return res.status(400).json({ error: "Invalid domain name" });

      const existingScans = await storage.getAttackSurfaceScans(req.user!.id, 1);
      if (existingScans.length > 0 && existingScans[0].status === "running") {
        return res.status(409).json({ error: "A scan is already in progress. Please wait for it to complete." });
      }

      const scan = await storage.createAttackSurfaceScan({ userId: req.user!.id, domain: cleanDomain });
      await storage.updateAttackSurfaceScan(scan.id, { status: "running", startedAt: new Date() });

      runAttackSurfaceScan(scan.id, cleanDomain).catch(err => {
        console.error("[AttackSurface] Scan failed:", err);
        storage.updateAttackSurfaceScan(scan.id, { status: "failed", lastError: String(err), completedAt: new Date() });
      });

      res.json({ scan: { ...scan, status: "running" } });
    } catch (error) {
      console.error("[AttackSurface] Error starting scan:", error);
      res.status(500).json({ error: "Failed to start scan" });
    }
  });

  app.get("/api/attack-surface/scans", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const scans = await storage.getAttackSurfaceScans(req.user!.id);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  app.get("/api/attack-surface/scans/:id", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const scan = await storage.getAttackSurfaceScanById(asString(req.params.id));
      if (!scan || scan.userId !== req.user!.id) return res.status(404).json({ error: "Scan not found" });
      const assets = await storage.getAttackSurfaceAssets(scan.id);
      res.json({ scan, assets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan" });
    }
  });

  async function runAttackSurfaceScan(scanId: string, domain: string) {
    const assets: { assetType: string; value: string; metadata?: string; severity?: string }[] = [];

    const safeRun = async (label: string, fn: () => Promise<void>) => {
      try { await fn(); } catch (e) { console.error(`[AttackSurface] ${label} failed:`, e); }
    };

    await Promise.all([
      safeRun("Subdomains", async () => {
        const resp = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`, { signal: AbortSignal.timeout(15000) });
        if (resp.ok) {
          const certs: any[] = await resp.json();
          const subdomains = new Set<string>();
          for (const cert of certs) {
            const names = (cert.name_value || "").split("\n").map((n: string) => n.trim().toLowerCase());
            names.forEach((n: string) => { if (n.endsWith(domain) && n !== `*.${domain}`) subdomains.add(n); });
          }
          subdomains.forEach(sub => {
            assets.push({ assetType: "subdomain", value: sub, severity: "info" });
          });
        }
      }),

      safeRun("DNS", async () => {
        const dnsResult = await lookupDomain(domain);
        if (dnsResult.aRecords) {
          for (const ip of dnsResult.aRecords) assets.push({ assetType: "dns_a", value: ip, metadata: JSON.stringify({ type: "A" }), severity: "info" });
        }
        if (dnsResult.mxRecords) {
          for (const mx of dnsResult.mxRecords) assets.push({ assetType: "dns_mx", value: typeof mx === 'string' ? mx : mx.exchange || String(mx), severity: "info" });
        }
        if (dnsResult.nsRecords) {
          for (const ns of dnsResult.nsRecords) assets.push({ assetType: "dns_ns", value: String(ns), severity: "info" });
        }
        if (dnsResult.txtRecords) {
          for (const txt of dnsResult.txtRecords) assets.push({ assetType: "dns_txt", value: String(txt), severity: "info" });
        }
      }),

      safeRun("OpenPorts", async () => {
        const domainResult = await lookupDomain(domain);
        const ip = domainResult.aRecords?.[0];
        if (ip && !isPrivateIp(ip)) {
          const shodanData = await lookupShodanInternetDB(ip);
          if (shodanData) {
            if (shodanData.ports) {
              for (const port of shodanData.ports) {
                const severity = [22, 23, 3389, 445, 3306, 5432].includes(port) ? "high" : 
                                 [21, 25, 110, 143, 8080].includes(port) ? "medium" : "info";
                assets.push({ assetType: "open_port", value: String(port), metadata: JSON.stringify({ ip, source: "shodan" }), severity });
              }
            }
            if (shodanData.hostnames) {
              for (const h of shodanData.hostnames) {
                if (!assets.some(a => a.assetType === "subdomain" && a.value === h)) {
                  assets.push({ assetType: "subdomain", value: h, metadata: JSON.stringify({ source: "shodan" }), severity: "info" });
                }
              }
            }
            if (shodanData.vulns) {
              for (const vuln of shodanData.vulns) {
                assets.push({ assetType: "vulnerability", value: vuln, severity: "critical" });
              }
            }
            if (shodanData.tags) {
              for (const tag of shodanData.tags) {
                assets.push({ assetType: "tag", value: tag, severity: tag === "compromised" ? "critical" : "info" });
              }
            }
          }
        }
      }),

      safeRun("EmailSecurity", async () => {
        const dns = await import("dns").then(m => m.promises);
        const checks: { type: string; found: boolean; value?: string }[] = [];
        try {
          const txtRecords = await dns.resolveTxt(domain);
          const spf = txtRecords.flat().find(r => r.startsWith("v=spf1"));
          checks.push({ type: "SPF", found: !!spf, value: spf });
          if (!spf) assets.push({ assetType: "email_security", value: "Missing SPF record", severity: "high" });
        } catch { checks.push({ type: "SPF", found: false }); assets.push({ assetType: "email_security", value: "Missing SPF record", severity: "high" }); }
        try {
          const dmarc = await dns.resolveTxt(`_dmarc.${domain}`);
          const dmarcRecord = dmarc.flat().find(r => r.startsWith("v=DMARC1"));
          checks.push({ type: "DMARC", found: !!dmarcRecord, value: dmarcRecord });
          if (!dmarcRecord) assets.push({ assetType: "email_security", value: "Missing DMARC record", severity: "high" });
          else if (dmarcRecord.includes("p=none")) assets.push({ assetType: "email_security", value: "DMARC policy set to none (not enforced)", severity: "medium" });
        } catch { checks.push({ type: "DMARC", found: false }); assets.push({ assetType: "email_security", value: "Missing DMARC record", severity: "high" }); }
        try {
          await dns.resolveTxt(`default._domainkey.${domain}`);
          checks.push({ type: "DKIM", found: true });
        } catch { checks.push({ type: "DKIM", found: false }); assets.push({ assetType: "email_security", value: "DKIM not detected (default selector)", severity: "medium" }); }
        assets.push({ assetType: "email_summary", value: JSON.stringify(checks), severity: "info" });
      }),

      safeRun("SSL", async () => {
        try {
          const tls = await import("tls");
          const result = await new Promise<any>((resolve, reject) => {
            const socket = tls.connect(443, domain, { servername: domain, timeout: 8000 }, () => {
              const cert = socket.getPeerCertificate();
              socket.end();
              resolve(cert);
            });
            socket.on("error", reject);
            socket.setTimeout(8000, () => { socket.destroy(); reject(new Error("timeout")); });
          });
          if (result) {
            const validTo = new Date(result.valid_to);
            const daysLeft = Math.floor((validTo.getTime() - Date.now()) / 86400000);
            const severity = daysLeft < 7 ? "critical" : daysLeft < 30 ? "high" : daysLeft < 60 ? "medium" : "info";
            assets.push({
              assetType: "ssl_cert",
              value: `${result.subject?.CN || domain}`,
              metadata: JSON.stringify({ issuer: result.issuer?.O, validTo: result.valid_to, daysRemaining: daysLeft, serialNumber: result.serialNumber }),
              severity,
            });
          }
        } catch (e: any) {
          assets.push({ assetType: "ssl_cert", value: "SSL connection failed", metadata: JSON.stringify({ error: e.message }), severity: "critical" });
        }
      }),

      safeRun("TechDetection", async () => {
        try {
          const dnsModule = await import("dns");
          const { promisify } = await import("util");
          const resolve4 = promisify(dnsModule.resolve4);
          const ips = await resolve4(domain);
          const privateRanges = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;
          if (ips.some((ip: string) => privateRanges.test(ip))) throw new Error("private IP blocked");
          const resp = await fetch(`https://${domain}`, { signal: AbortSignal.timeout(10000), redirect: "follow" });
          const headers = Object.fromEntries(resp.headers.entries());
          const techs: string[] = [];
          if (headers["server"]) techs.push(`Server: ${headers["server"]}`);
          if (headers["x-powered-by"]) techs.push(`Powered by: ${headers["x-powered-by"]}`);
          if (headers["x-aspnet-version"]) techs.push(`ASP.NET: ${headers["x-aspnet-version"]}`);
          if (headers["x-generator"]) techs.push(`Generator: ${headers["x-generator"]}`);
          const secHeaders = ["strict-transport-security", "content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"];
          const missingHeaders = secHeaders.filter(h => !headers[h]);
          for (const tech of techs) assets.push({ assetType: "technology", value: tech, severity: "info" });
          for (const missing of missingHeaders) assets.push({ assetType: "missing_header", value: `Missing: ${missing}`, severity: missing === "strict-transport-security" ? "high" : "medium" });
          if (headers["strict-transport-security"]) assets.push({ assetType: "security_header", value: `HSTS: ${headers["strict-transport-security"]}`, severity: "info" });
          if (headers["content-security-policy"]) assets.push({ assetType: "security_header", value: "CSP configured", severity: "info" });
        } catch {}
      }),
    ]);

    const criticalCount = assets.filter(a => a.severity === "critical").length;
    const highCount = assets.filter(a => a.severity === "high").length;
    const mediumCount = assets.filter(a => a.severity === "medium").length;
    const summary = JSON.stringify({
      totalAssets: assets.length,
      subdomains: assets.filter(a => a.assetType === "subdomain").length,
      openPorts: assets.filter(a => a.assetType === "open_port").length,
      vulnerabilities: assets.filter(a => a.assetType === "vulnerability").length,
      findings: { critical: criticalCount, high: highCount, medium: mediumCount },
      riskScore: Math.min(100, criticalCount * 25 + highCount * 10 + mediumCount * 3),
    });

    await storage.addAttackSurfaceAssets(assets.map(a => ({ scanId, ...a })));
    await storage.updateAttackSurfaceScan(scanId, { status: "complete", completedAt: new Date(), summary });
  }

  // ===== Threat Reports (Pro+) =====
  app.post("/api/reports/generate", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const now = new Date();
      const periodStart = new Date(now.getTime() - 7 * 86400000);
      const report = await storage.createThreatReport({
        userId: req.user!.id,
        title: `Threat Intelligence Report — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        periodStart,
        periodEnd: now,
      });

      generateThreatReport(report.id, req.user!.id, periodStart, now).catch(err => {
        console.error("[Reports] Generation failed:", err);
        storage.updateThreatReport(report.id, { status: "failed", lastError: String(err) });
      });

      res.json({ report: { ...report, status: "generating" } });
    } catch (error) {
      console.error("[Reports] Error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/reports", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reports = await storage.getThreatReports(req.user!.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", requirePro as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const report = await storage.getThreatReportById(asString(req.params.id));
      if (!report || report.userId !== req.user!.id) return res.status(404).json({ error: "Report not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/schedule", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schedule = await storage.getReportSchedule(req.user!.id);
      res.json(schedule || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.post("/api/reports/schedule", requireBusiness as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        cadence: z.enum(["weekly", "monthly"]),
        isActive: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid schedule data" });

      const schedule = await storage.upsertReportSchedule({
        userId: req.user!.id,
        cadence: parsed.data.cadence,
        isActive: parsed.data.isActive ?? true,
      });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  async function generateThreatReport(reportId: string, userId: string, periodStart: Date, periodEnd: Date) {
    await storage.updateThreatReport(reportId, { status: "generating" });

    const [stats, trends, ransomware, cves, recentScans, threatActors] = await Promise.all([
      storage.getDashboardStats(),
      storage.getThreatTrends(7),
      storage.getRansomwareIncidents(10),
      storage.getCves(10),
      storage.getAttackSurfaceScans(userId, 3),
      storage.getThreatActors(10),
    ]);

    let scanSummaries: any[] = [];
    for (const scan of recentScans) {
      if (scan.status === "complete" && scan.summary) {
        try { scanSummaries.push({ domain: scan.domain, ...JSON.parse(scan.summary), scannedAt: scan.completedAt }); } catch {}
      }
    }

    const reportData = {
      generatedAt: new Date().toISOString(),
      period: { start: periodStart.toISOString(), end: periodEnd.toISOString() },
      executiveSummary: {
        totalThreats: stats.activeGroups + stats.criticalCves + stats.activeExploits,
        activeRansomwareGroups: stats.activeGroups,
        criticalCves: stats.criticalCves,
        activeExploits: stats.activeExploits,
        maliciousIps: stats.maliciousIps,
        maliciousUrls: stats.maliciousUrls,
        cisaKev: stats.cisaKevCount,
      },
      ransomwareLandscape: {
        topGroups: trends.topGroups?.slice(0, 5) || [],
        recentIncidents: ransomware.slice(0, 5).map(r => ({
          group: r.groupName,
          victim: r.victim,
          sector: r.sector,
          date: r.discoveredAt,
        })),
        dailyTrend: trends.ransomwareByDay || [],
      },
      vulnerabilities: {
        recentCritical: cves.filter((c: any) => c.severity === "CRITICAL" || (c.cvssScore && parseFloat(c.cvssScore) >= 9.0)).slice(0, 5).map((c: any) => ({
          cveId: c.cveId,
          description: c.description?.substring(0, 200),
          severity: c.severity,
          cvss: c.cvssScore,
        })),
        cveTrend: trends.cvesByDay || [],
      },
      threatActors: threatActors.slice(0, 5).map((a: any) => ({
        name: a.name,
        type: a.type,
        country: a.country,
        lastActive: a.lastActive,
      })),
      attackSurface: scanSummaries,
      recommendations: generateRecommendations(stats, scanSummaries),
    };

    await storage.updateThreatReport(reportId, {
      status: "complete",
      reportData: JSON.stringify(reportData),
      generatedAt: new Date(),
    });
  }

  // ===================== KNOWLEDGE BASE ROUTES =====================

  const kbLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Too many requests" },
  });

  const kbWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many requests" },
  });

  app.get("/api/kb/posts", kbLimiter, async (req: Request, res: Response) => {
    try {
      const type = asString(req.query.type as string) || undefined;
      const search = asString(req.query.search as string) || undefined;
      const tag = asString(req.query.tag as string) || undefined;
      const authorId = asString(req.query.authorId as string) || undefined;
      const page = parseInt(asString(req.query.page as string) || "1");
      const limit = Math.min(parseInt(asString(req.query.limit as string) || "20"), 50);
      const offset = (page - 1) * limit;

      const authReq = req as AuthenticatedRequest;
      const isAdmin = authReq.user?.isAdmin;
      const status = isAdmin && req.query.status ? asString(req.query.status as string) : "published";

      const [posts, total] = await Promise.all([
        storage.getKbPosts({ type, status, search, tag, authorId, limit, offset }),
        storage.getKbPostCount({ type, status, search, tag, authorId }),
      ]);

      const authorIds = [...new Set(posts.map(p => p.authorId))];
      const authors: Record<string, { username: string; tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }> = {};
      for (const aid of authorIds) {
        const u = await storage.getUser(aid);
        if (u) authors[aid] = { username: u.username, tier: u.tier, isTrusted: u.isTrusted, isAdmin: u.isAdmin };
      }

      res.json({
        posts: posts.map(p => ({ ...p, author: authors[p.authorId] || null })),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/kb/posts/:slug", kbLimiter, async (req: Request, res: Response) => {
    try {
      const post = await storage.getKbPostBySlug(req.params.slug);
      if (!post) { res.status(404).json({ error: "Post not found" }); return; }

      const authReq = req as AuthenticatedRequest;
      if (post.status !== "published" && !authReq.user?.isAdmin && post.authorId !== authReq.user?.id) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const author = await storage.getUser(post.authorId);
      res.json({
        ...post,
        author: author ? { username: author.username, tier: author.tier, isTrusted: author.isTrusted, isAdmin: author.isAdmin } : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/kb/posts", requireAuth as any, kbWriteLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      if (user.tier === "free") { res.status(403).json({ error: "Paid membership required to create posts" }); return; }

      const { title, content, type, tags } = req.body;
      if (!title || !content) { res.status(400).json({ error: "Title and content are required" }); return; }

      const MAX_TITLE_LEN = 200;
      const MAX_CONTENT_LEN = 50000;
      const MAX_TAGS = 10;
      const MAX_TAG_LEN = 50;
      if (title.length > MAX_TITLE_LEN) { res.status(400).json({ error: `Title must be under ${MAX_TITLE_LEN} characters` }); return; }
      if (content.length > MAX_CONTENT_LEN) { res.status(400).json({ error: `Content must be under ${MAX_CONTENT_LEN} characters` }); return; }

      const validTypes = ["official_kb", "bug_report", "feature_request", "threat_intel", "general_idea"];
      const postType = validTypes.includes(type) ? type : "general_idea";

      if (postType === "official_kb" && !user.isAdmin) {
        res.status(403).json({ error: "Only admins can create official KB articles" });
        return;
      }

      const sanitizedTags = Array.isArray(tags)
        ? tags.slice(0, MAX_TAGS).map((t: string) => String(t).slice(0, MAX_TAG_LEN).trim()).filter(Boolean)
        : [];

      const baseSlug = toSlug(title);
      let slug = baseSlug;
      let counter = 0;
      while (await storage.getKbPostBySlug(slug)) {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }

      const bypassModeration = user.isAdmin || user.isTrusted;
      const status = bypassModeration ? "published" : "pending_review";

      const post = await storage.createKbPost({
        authorId: user.id,
        title: title.slice(0, MAX_TITLE_LEN),
        slug,
        content: content.slice(0, MAX_CONTENT_LEN),
        type: postType,
        status,
        isPinned: false,
        tags: sanitizedTags,
      });

      await storage.awardReputation(user.id, KB_POINTS.POST_CREATED);

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/kb/posts/:id", requireAuth as any, kbWriteLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getKbPostById(postId);
      if (!post) { res.status(404).json({ error: "Post not found" }); return; }

      const user = req.user!;
      if (post.authorId !== user.id && !user.isAdmin) {
        res.status(403).json({ error: "Not authorized" });
        return;
      }

      const { title, content, type, tags, isPinned } = req.body;
      const validTypes = ["official_kb", "bug_report", "feature_request", "threat_intel", "general_idea"];
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (type !== undefined && validTypes.includes(type)) {
        if (type === "official_kb" && !user.isAdmin) {
          res.status(403).json({ error: "Only admins can set official KB type" });
          return;
        }
        updates.type = type;
      }
      if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags.slice(0, 10) : [];
      if (isPinned !== undefined && user.isAdmin) updates.isPinned = isPinned;

      const updated = await storage.updateKbPost(postId, updates);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/kb/posts/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      if (!user.isAdmin) { res.status(403).json({ error: "Admin access required to delete posts" }); return; }
      const postId = parseInt(req.params.id);
      const post = await storage.getKbPostById(postId);
      if (!post) { res.status(404).json({ error: "Post not found" }); return; }
      await storage.deleteKbPost(postId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.post("/api/kb/posts/:id/vote", requireAuth as any, kbWriteLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      if (user.tier === "free") { res.status(403).json({ error: "Paid membership required to vote" }); return; }
      const postId = parseInt(req.params.id);
      const post = await storage.getKbPostById(postId);
      if (!post) { res.status(404).json({ error: "Post not found" }); return; }
      if (post.authorId === user.id) { res.status(403).json({ error: "Cannot vote on your own post" }); return; }
      const result = await storage.toggleKbPostVote(user.id, postId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  app.get("/api/kb/posts/:id/comments", kbLimiter, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getKbCommentsByPost(postId);

      const authorIds = [...new Set(comments.map(c => c.authorId))];
      const authors: Record<string, { username: string; tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }> = {};
      for (const aid of authorIds) {
        const u = await storage.getUser(aid);
        if (u) authors[aid] = { username: u.username, tier: u.tier, isTrusted: u.isTrusted, isAdmin: u.isAdmin };
      }

      res.json(comments.map(c => ({ ...c, author: authors[c.authorId] || null })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/kb/posts/:id/comments", requireAuth as any, kbWriteLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      if (user.tier === "free") { res.status(403).json({ error: "Paid membership required to comment" }); return; }

      const postId = parseInt(req.params.id);
      const { content, parentId } = req.body;
      if (!content || content.trim().length < 1) { res.status(400).json({ error: "Content is required" }); return; }
      const MAX_COMMENT_LEN = 5000;
      if (content.length > MAX_COMMENT_LEN) { res.status(400).json({ error: `Comment must be under ${MAX_COMMENT_LEN} characters` }); return; }

      const comment = await storage.createKbComment({
        postId,
        authorId: user.id,
        parentId: parentId || null,
        content: content.trim().slice(0, MAX_COMMENT_LEN),
      });

      await storage.awardReputation(user.id, KB_POINTS.COMMENT_CREATED);

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/kb/comments/:id", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const commentId = parseInt(req.params.id);
      if (!user.isAdmin) { res.status(403).json({ error: "Not authorized" }); return; }
      await storage.deleteKbComment(commentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.post("/api/kb/comments/:id/vote", requireAuth as any, kbWriteLimiter, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      if (user.tier === "free") { res.status(403).json({ error: "Paid membership required to vote" }); return; }
      const commentId = parseInt(req.params.id);
      const [comment] = await db.select().from(kbComments).where(eq(kbComments.id, commentId));
      if (!comment) { res.status(404).json({ error: "Comment not found" }); return; }
      if (comment.authorId === user.id) { res.status(403).json({ error: "Cannot vote on your own comment" }); return; }
      const result = await storage.toggleKbCommentVote(user.id, commentId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to vote" });
    }
  });

  app.get("/api/kb/votes", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const postIdsParam = asString(req.query.postIds as string);
      const commentIdsParam = asString(req.query.commentIds as string);
      const postIds = postIdsParam ? postIdsParam.split(",").map(Number).filter(n => !isNaN(n)) : [];
      const commentIds = commentIdsParam ? commentIdsParam.split(",").map(Number).filter(n => !isNaN(n)) : [];
      const result = await storage.getKbUserVotes(user.id, postIds, commentIds);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch votes" });
    }
  });

  app.post("/api/kb/admin/posts/:id/approve", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      const postId = parseInt(req.params.id);
      const post = await storage.getKbPostById(postId);
      const updated = await storage.updateKbPost(postId, { status: "published" });
      if (post) await storage.awardReputation(post.authorId, KB_POINTS.POST_APPROVED);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve post" });
    }
  });

  app.post("/api/kb/admin/posts/:id/reject", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      const postId = parseInt(req.params.id);
      const updated = await storage.updateKbPost(postId, { status: "rejected" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject post" });
    }
  });

  app.get("/api/kb/admin/pending", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      const page = parseInt(asString(req.query.page as string) || "1");
      const limit = 20;
      const offset = (page - 1) * limit;
      const [posts, total] = await Promise.all([
        storage.getPendingKbPosts(limit, offset),
        storage.getPendingKbPostCount(),
      ]);

      const authorIds = [...new Set(posts.map(p => p.authorId))];
      const authors: Record<string, { username: string; tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }> = {};
      for (const aid of authorIds) {
        const u = await storage.getUser(aid);
        if (u) authors[aid] = { username: u.username, tier: u.tier, isTrusted: u.isTrusted, isAdmin: u.isAdmin };
      }

      res.json({
        posts: posts.map(p => ({ ...p, author: authors[p.authorId] || null })),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending posts" });
    }
  });

  app.post("/api/kb/admin/users/:id/promote", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      await storage.setUserTrusted(req.params.id, true);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to promote user" });
    }
  });

  app.post("/api/kb/admin/users/:id/demote", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      await storage.setUserTrusted(req.params.id, false);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to demote user" });
    }
  });

  app.get("/api/kb/leaderboard", kbLimiter, async (_req: Request, res: Response) => {
    try {
      const { getKbRank } = await import("@shared/schema");
      const leaderboard = await storage.getKbLeaderboard(20);
      res.json(leaderboard.map(l => ({
        ...l,
        rank: getKbRank(l.reputation),
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // ===================== END KNOWLEDGE BASE ROUTES =====================

  // ===================== FEEDBACK / BUG REPORT ROUTES =====================
  const feedbackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

  app.post("/api/feedback", feedbackLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, category, subject, description } = req.body;
      if (!subject || !description) {
        res.status(400).json({ error: "Subject and description are required" });
        return;
      }
      if (String(subject).length > 200 || String(description).length > 5000) {
        res.status(400).json({ error: "Subject (max 200) or description (max 5000) too long" });
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        res.status(400).json({ error: "Invalid email format" });
        return;
      }

      const validCategories = ["bug_report", "site_issue", "feature_request", "general_feedback", "recommendation", "security_concern"];
      const feedbackCategory = validCategories.includes(category) ? category : "general_feedback";

      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id || null;

      const feedback = await storage.createFeedback({
        userId,
        name: name ? String(name).slice(0, 100) : null,
        email: email ? String(email).slice(0, 200) : null,
        category: feedbackCategory,
        subject: String(subject).slice(0, 200),
        description: String(description).slice(0, 5000),
      });

      res.status(201).json({ success: true, id: feedback.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      const status = asString(req.query.status as string) || undefined;
      const category = asString(req.query.category as string) || undefined;
      const page = parseInt(asString(req.query.page as string) || "1");
      const limit = 30;
      const offset = (page - 1) * limit;
      const [submissions, total] = await Promise.all([
        storage.getFeedbackSubmissions({ status, category, limit, offset }),
        storage.getFeedbackCount({ status, category }),
      ]);
      res.json({ submissions, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.put("/api/feedback/:id/status", requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) { res.status(403).json({ error: "Admin access required" }); return; }
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      const validStatuses = ["open", "in_progress", "resolved", "closed", "wont_fix"];
      if (!validStatuses.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }
      const updated = await storage.updateFeedbackStatus(id, status, adminNotes);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });

  // ===================== END FEEDBACK ROUTES =====================

  function generateRecommendations(stats: any, scanSummaries: any[]): string[] {
    const recs: string[] = [];
    if (stats.criticalCves > 0) recs.push(`Review and patch ${stats.criticalCves} critical CVEs identified this period.`);
    if (stats.activeGroups > 5) recs.push(`${stats.activeGroups} ransomware groups are currently active. Ensure backup and recovery procedures are tested.`);
    if (stats.activeExploits > 0) recs.push(`${stats.activeExploits} active exploits detected. Prioritize patching affected systems.`);
    for (const scan of scanSummaries) {
      if (scan.findings?.critical > 0) recs.push(`${scan.domain}: ${scan.findings.critical} critical findings require immediate attention.`);
      if (scan.findings?.high > 0) recs.push(`${scan.domain}: ${scan.findings.high} high-severity issues should be addressed this week.`);
      if (scan.openPorts > 5) recs.push(`${scan.domain}: ${scan.openPorts} open ports detected. Review and close unnecessary services.`);
    }
    if (recs.length === 0) recs.push("Continue monitoring threat feeds and maintaining security hygiene.");
    return recs;
  }

  return httpServer;
}
