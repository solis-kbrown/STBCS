import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCveSchema, insertRansomwareSchema, insertNewsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string | undefined;
      
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
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const group = req.query.group as string | undefined;
      const sector = req.query.sector as string | undefined;
      
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
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
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
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string | undefined;
      
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
