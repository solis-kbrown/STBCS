import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

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

// Validation schemas
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Apply rate limiting to all API routes
  app.use("/api", generalLimiter);

  // Dashboard Stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
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
      
      const cves = await storage.getCves(limit, offset, search);
      const total = await storage.getCveCount();
      
      res.json({ data: cves, total, limit, offset });
    } catch (error) {
      console.error("Error fetching CVEs:", error);
      res.status(500).json({ error: "Failed to fetch CVEs" });
    }
  });

  app.get("/api/cves/:id", async (req: Request, res: Response) => {
    try {
      const cve = await storage.getCveById(req.params.id);
      if (!cve) {
        return res.status(404).json({ error: "CVE not found" });
      }
      res.json(cve);
    } catch (error) {
      console.error("Error fetching CVE:", error);
      res.status(500).json({ error: "Failed to fetch CVE" });
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
      
      const incidents = await storage.getRansomwareIncidents(limit, offset, group, sector);
      const total = await storage.getRansomwareCount();
      
      res.json({ data: incidents, total, limit, offset });
    } catch (error) {
      console.error("Error fetching ransomware incidents:", error);
      res.status(500).json({ error: "Failed to fetch ransomware incidents" });
    }
  });

  app.get("/api/ransomware/groups", async (req: Request, res: Response) => {
    try {
      const groups = await storage.getActiveGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Failed to fetch active groups" });
    }
  });

  app.get("/api/ransomware/:id", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getRansomwareById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
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
      const actors = await storage.getThreatActors(limit);
      res.json(actors);
    } catch (error) {
      console.error("Error fetching threat actors:", error);
      res.status(500).json({ error: "Failed to fetch threat actors" });
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
      
      const news = await storage.getNews(limit, offset, category);
      const total = await storage.getNewsCount();
      
      res.json({ data: news, total, limit, offset });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const article = await storage.getNewsById(req.params.id);
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
      
      const ips = await storage.getMaliciousIps(limit, offset, source, threatType);
      const total = await storage.getMaliciousIpCount();
      
      res.json({ data: ips, total, limit, offset });
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
      
      const urls = await storage.getMaliciousUrls(limit, offset, source, threatType);
      const total = await storage.getMaliciousUrlCount();
      
      res.json({ data: urls, total, limit, offset });
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
      
      const kev = await storage.getCisaKev(limit, offset);
      const total = await storage.getCisaKevCount();
      
      res.json({ data: kev, total, limit, offset });
    } catch (error) {
      console.error("Error fetching CISA KEV:", error);
      res.status(500).json({ error: "Failed to fetch CISA KEV" });
    }
  });

  // Threat Feeds
  app.get("/api/threat-feeds", async (req: Request, res: Response) => {
    try {
      const feeds = await storage.getThreatFeeds();
      res.json(feeds);
    } catch (error) {
      console.error("Error fetching threat feeds:", error);
      res.status(500).json({ error: "Failed to fetch threat feeds" });
    }
  });

  // Manual data refresh trigger (for admin use)
  app.post("/api/refresh", async (req: Request, res: Response) => {
    try {
      const { fetchAllData } = await import("./scrapers");
      await fetchAllData();
      res.json({ success: true, message: "Data refresh initiated" });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ error: "Failed to refresh data" });
    }
  });

  return httpServer;
}
