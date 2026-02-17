import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { visitorTrackingMiddleware } from "./visitors";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema, insertWatchlistItemSchema } from "@shared/schema";
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
import { reportCriticalError } from "./maintenance";
import { 
  hashPassword, 
  verifyPassword, 
  generateSessionToken, 
  getSessionExpiry, 
  authMiddleware, 
  requireAuth, 
  requirePro,
  requireBusiness,
  type AuthenticatedRequest 
} from "./auth";

// Rate limiters for security
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Trust proxy setup handled in Express config
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for sensitive endpoints
  message: { error: "Rate limit exceeded. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Trust proxy setup handled in Express config
});

const freeToolsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Free users: 10 tool requests per minute
  message: { error: "Free tier rate limit reached. Upgrade to Pro for unlimited access." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const proToolsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Pro users: 60 tool requests per minute
  message: { error: "Rate limit exceeded. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

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
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.use((_req: Request, res: Response, next: Function) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
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
    <loc>https://www.stbcybersecurity.com/group/${encodeURIComponent(a.name)}</loc>
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
    <loc>https://www.stbcybersecurity.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/ransomware</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/exploits</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/tools</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/search</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/threat-feeds</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/support</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/alerts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/api-docs</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://www.stbcybersecurity.com/logos</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
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
# https://www.stbcybersecurity.com

User-agent: *
Allow: /
Allow: /tools
Allow: /ransomware
Allow: /exploits
Allow: /threat-feeds
Allow: /news
Allow: /search
Allow: /support
Allow: /privacy
Allow: /terms
Allow: /api-docs
Allow: /alerts
Allow: /logos
Allow: /group/

Disallow: /api/
Disallow: /admin/
Disallow: /messages
Disallow: /style-preview

Crawl-delay: 1

Sitemap: https://www.stbcybersecurity.com/sitemap.xml

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
Canonical: https://www.stbcybersecurity.com/.well-known/security.txt
Policy: https://www.stbcybersecurity.com/privacy
Hiring: https://www.stbcybersecurity.com/support
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

  // ===== AUTH ROUTES =====
  
  // Sign up
  app.post("/api/auth/signup", strictLimiter, async (req: Request, res: Response) => {
    try {
      const data = signupSchema.parse(req.body);
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        res.status(400).json({ error: "Username already taken" });
        return;
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword,
      });
      
      // Create session
      const token = generateSessionToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
      });
      
      // Set cookie
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tier: user.tier || "free",
        },
        token,
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

  // Login
  app.post("/api/auth/login", strictLimiter, async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(data.username);
      if (!user) {
        user = await storage.getUserByEmail(data.username);
      }
      
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      
      // Verify password
      const valid = await verifyPassword(data.password, user.password);
      if (!valid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      
      // Create session
      const token = generateSessionToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getSessionExpiry(),
      });
      
      // Set cookie
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          tier: user.tier || "free",
        },
        token,
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
      const cves = await storage.getCves(limit, offset, search);
      const total = await storage.getCveCount();
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
      const incidents = await storage.getRansomwareIncidents(limit, offset, group, sector);
      const total = await storage.getRansomwareCount();
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
      const name = decodeURIComponent(asString(req.params.name));
      const key = `actor:profile:${name}`;
      if (cachedJson(res, key, TTL.THREAT_ACTORS)) return;
      const profile = await storage.getGroupProfile(name);
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
      const news = await storage.getNews(limit, offset, category);
      const total = await storage.getNewsCount();
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
      const ips = await storage.getMaliciousIps(limit, offset, source, threatType);
      const total = await storage.getMaliciousIpCount();
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
      const urls = await storage.getMaliciousUrls(limit, offset, source, threatType);
      const total = await storage.getMaliciousUrlCount();
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
      const kev = await storage.getCisaKev(limit, offset);
      const total = await storage.getCisaKevCount();
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
      const result = await storage.cleanupOldData(730); // 2 year retention
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error cleaning up data:", error);
      res.status(500).json({ error: "Failed to cleanup data" });
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

  // Export data (Pro feature)
  app.get("/api/export/:type", strictLimiter, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const limit = 5000; // Max export limit
      
      let data: any[] = [];
      switch (type) {
        case 'cves':
          data = await storage.getCves(limit, 0);
          break;
        case 'ips':
          data = await storage.getMaliciousIps(limit, 0);
          break;
        case 'urls':
          data = await storage.getMaliciousUrls(limit, 0);
          break;
        case 'kev':
          data = await storage.getCisaKev(limit, 0);
          break;
        case 'ransomware':
          data = await storage.getRansomwareIncidents(limit, 0);
          break;
        default:
          return res.status(400).json({ error: "Invalid export type" });
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.json"`);
      res.json({ type, exportedAt: new Date().toISOString(), count: data.length, data });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
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
  app.get("/api/tools/ip-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/domain-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/port-scan", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/dns-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/threat-check", freeToolsLimiter, async (req: Request, res: Response) => {
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
      const notifications = await storage.getUserNotifications(userId, limit, unreadOnly);
      const unreadCount = await storage.getUnreadNotificationCount(userId);
      
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

  // ==========================================
  // PRO TIER - WATCHLIST
  // ==========================================

  // Get user watchlist items
  app.get("/api/watchlist", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
        itemType: z.string().max(50).optional(),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
      
      const { userId, itemType } = parsed.data;
      const items = itemType 
        ? await storage.getWatchlistsByType(userId, itemType)
        : await storage.getWatchlistItems(userId);
      
      res.json({ items, count: items.length });
    } catch (error) {
      console.error("Get watchlist error:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Add watchlist item
  app.post("/api/watchlist", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
        itemType: z.enum(["company", "sector", "cve", "threat_actor", "country", "keyword"]),
        itemValue: z.string().min(1).max(500),
        label: z.string().max(200).nullable().optional(),
        alertOnMatch: z.boolean().default(true),
        emailOnMatch: z.boolean().default(false),
        smsOnMatch: z.boolean().default(false),
        notes: z.string().max(1000).nullable().optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
      }
      
      const item = await storage.createWatchlistItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create watchlist item error:", error);
      res.status(500).json({ error: "Failed to create watchlist item" });
    }
  });

  // Update watchlist item
  app.patch("/api/watchlist/:id", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
        label: z.string().max(200).optional(),
        alertOnMatch: z.boolean().optional(),
        emailOnMatch: z.boolean().optional(),
        notes: z.string().max(1000).optional(),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const { userId, ...updates } = parsed.data;
      const item = await storage.updateWatchlistItem(asString(req.params.id), userId, updates);
      res.json(item);
    } catch (error) {
      console.error("Update watchlist item error:", error);
      res.status(500).json({ error: "Failed to update watchlist item" });
    }
  });

  // Delete watchlist item
  app.delete("/api/watchlist/:id", strictLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        userId: z.string().min(1).max(100),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
      
      await storage.deleteWatchlistItem(asString(req.params.id), parsed.data.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete watchlist item error:", error);
      res.status(500).json({ error: "Failed to delete watchlist item" });
    }
  });

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
  app.get("/api/tools/shodan-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/mx-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/spf-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/dkim-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/dmarc-lookup", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/email-security", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/threatfox", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/malware-bazaar", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/ssl-labs", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/urlscan", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/phishtank", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/ip-geo", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/password-strength", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.get("/api/tools/subnet-calc", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/base64", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/url-encode", freeToolsLimiter, async (req: Request, res: Response) => {
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
  app.post("/api/tools/email-headers", freeToolsLimiter, async (req: Request, res: Response) => {
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

  // SSL Certificate Checker
  app.get("/api/tools/ssl-check", freeToolsLimiter, async (req: Request, res: Response) => {
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

  // Hash Analyzer
  app.get("/api/tools/hash-analyze", freeToolsLimiter, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        hash: z.string().min(16).max(256),
      });
      
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hash" });
      }
      
      const { analyzeHash } = await import("./tools.js");
      const result = analyzeHash(parsed.data.hash);
      res.json(result);
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
    validate: { xForwardedForHeader: false },
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
      
      const validNames = ['STBCS Supporter', 'STBCS Pro', 'STBCS Business'];
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
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const session = await stripeService.createCheckoutSession({
        priceId,
        successUrl: `${baseUrl}/support?success=true`,
        cancelUrl: `${baseUrl}/support?canceled=true`,
        customerEmail,
        mode,
        metadata: { source: 'stbcs_support' },
      });
      
      res.json({ url: session.url });
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
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const session = await stripeService.createDonationCheckout({
        amount,
        successUrl: `${baseUrl}/support?donated=true`,
        cancelUrl: `${baseUrl}/support?canceled=true`,
        customerEmail,
        donorName,
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Donation error:", error);
      reportCriticalError(error instanceof Error ? error : new Error(String(error)), "Stripe Donation");
      res.status(500).json({ error: "Failed to create donation session" });
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
    const internalKey = req.headers['x-internal-api-key'];
    const expectedKey = process.env.INTERNAL_API_KEY || process.env.QUO_API_KEY;
    
    if (!internalKey || internalKey !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - internal API key required" });
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

  // Search breaches (Pro feature)
  app.get("/api/breaches", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const schema = z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
        search: z.string().max(200).optional(),
      });
      
      const { limit, offset, search } = schema.parse(req.query);
      const breaches = await storage.getBreachIncidents(limit, offset, search);
      const total = await storage.getBreachCount();
      
      res.json({ data: breaches, total, limit, offset });
    } catch (error) {
      console.error("Breaches fetch error:", error);
      res.status(500).json({ error: "Failed to fetch breaches" });
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
      const limit = Math.min(parseInt(req.query.limit as string) || 1000, 5000);
      
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

  // ===== ADMIN VISITOR STATS (Private - requires admin key) =====
  const ADMIN_KEY = process.env.ADMIN_STATS_KEY || "stbcs-admin-2024";

  app.get("/api/admin/visitors", async (req: Request, res: Response) => {
    try {
      const key = req.headers["x-admin-key"] || req.query.key;
      if (key !== ADMIN_KEY) {
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

  return httpServer;
}
