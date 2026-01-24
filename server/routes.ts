import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { lookupIp, lookupDomain, scanPorts, isValidIp, isValidDomain, isPrivateIp, COMMON_PORTS } from "./tools";

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

  // Ransomware search endpoint
  app.get("/api/ransomware/search", strictLimiter, async (req: Request, res: Response) => {
    try {
      const query = String(req.query.q || "").trim();
      const limit = Math.min(parseInt(String(req.query.limit || "50")), 100);
      
      if (query.length < 2) {
        return res.status(400).json({ error: "Search query must be at least 2 characters" });
      }
      
      const results = await storage.searchRansomware(query, limit);
      res.json({ data: results, query, count: results.length });
    } catch (error) {
      console.error("Error searching ransomware:", error);
      res.status(500).json({ error: "Failed to search ransomware data" });
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
      const results = await storage.globalSearch(q, limit);
      
      const totalResults = 
        results.cves.length + 
        results.ransomware.length + 
        results.ips.length + 
        results.urls.length + 
        results.kev.length + 
        results.news.length;
      
      res.json({ query: q, totalResults, ...results });
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
      const result = await storage.cleanupOldData(365); // 1 year retention
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error cleaning up data:", error);
      res.status(500).json({ error: "Failed to cleanup data" });
    }
  });

  // Export data (Pro feature)
  app.get("/api/export/:type", strictLimiter, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const limit = 1000; // Max export limit
      
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
      res.json({ success: true, message: "Data refresh initiated" });
    } catch (error) {
      console.error("Error refreshing data:", error);
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

  return httpServer;
}
