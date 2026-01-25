import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { lookupIp, lookupDomain, scanPorts, isValidIp, isValidDomain, isPrivateIp, COMMON_PORTS, lookupShodanInternetDB } from "./tools";
import crypto from "crypto";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

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
      
      await storage.markNotificationRead(req.params.id, parsed.data.userId);
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
      
      await storage.dismissNotification(req.params.id, parsed.data.userId);
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
      const item = await storage.updateWatchlistItem(req.params.id, userId, updates);
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
      
      await storage.deleteWatchlistItem(req.params.id, parsed.data.userId);
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
      const breach = await storage.getBreachById(req.params.id);
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
      
      res.json({ products: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Products error:", error);
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
      res.status(500).json({ error: "Failed to create donation session" });
    }
  });

  return httpServer;
}
