import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { apiKeyAuthMiddleware, checkLiveLookupQuota, generateApiKey, getTierLimits, hashApiKey } from "./apiKeyAuth";

const router = Router();

const iocCache = new Map<string, { data: any; expiresAt: number }>();
const IOC_CACHE_TTL = 2 * 60 * 60 * 1000;

function getCachedIOC(key: string) {
  const entry = iocCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) iocCache.delete(key);
  return null;
}
function setCachedIOC(key: string, data: any) {
  iocCache.set(key, { data, expiresAt: Date.now() + IOC_CACHE_TTL });
}

router.get("/v1/cves", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || undefined;
    const data = await storage.getCves(limit, offset, search);
    const total = await storage.getCveCount();
    res.json({ data, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CVE data" });
  }
});

router.get("/v1/cves/:cveId", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const cve = await storage.getCveByCveId(req.params.cveId as string);
    if (!cve) { res.status(404).json({ error: "CVE not found" }); return; }
    res.json({ data: cve });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CVE" });
  }
});

router.get("/v1/ransomware", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const group = req.query.group as string;
    const sector = req.query.sector as string;
    const data = await storage.getRansomwareIncidents(limit, offset, group, sector);
    const total = await storage.getRansomwareCount();
    res.json({ data, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ransomware data" });
  }
});

router.get("/v1/ips", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;
    const source = req.query.source as string;
    const threatType = req.query.threat_type as string;
    const data = await storage.getMaliciousIps(limit, offset, source, threatType);
    const total = await storage.getMaliciousIpCount();
    res.json({ data, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch malicious IP data" });
  }
});

router.get("/v1/urls", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;
    const source = req.query.source as string;
    const threatType = req.query.threat_type as string;
    const data = await storage.getMaliciousUrls(limit, offset, source, threatType);
    const total = await storage.getMaliciousUrlCount();
    res.json({ data, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch malicious URL data" });
  }
});

router.get("/v1/kev", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const data = await storage.getCisaKev(limit, offset);
    const total = await storage.getCisaKevCount();
    res.json({ data, total, limit, offset });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CISA KEV data" });
  }
});

router.get("/v1/threat-actors", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const data = await storage.getThreatActors(limit);
    res.json({ data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch threat actor data" });
  }
});

router.get("/v1/stats", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/v1/ioc/lookup", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const indicator = req.query.indicator as string;
    if (!indicator || indicator.length < 2) {
      res.status(400).json({ error: "Missing or invalid 'indicator' query parameter" });
      return;
    }

    const cacheKey = `ioc_${indicator.toLowerCase().trim()}`;
    const cached = getCachedIOC(cacheKey);
    if (cached) {
      res.json({ data: cached, cached: true, cacheExpiresIn: "up to 2 hours" });
      return;
    }

    const allowed = await checkLiveLookupQuota(req, res);
    if (!allowed) return;

    const results: any = { indicator, matches: [], riskLevel: "unknown", sources: [] };

    const ipMatch = indicator.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipMatch) {
      const ipResult = await storage.checkIpThreat(indicator);
      if (ipResult) {
        results.matches.push({ type: "malicious_ip", source: ipResult.source, threatType: ipResult.threatType, firstSeen: ipResult.firstSeen });
        results.riskLevel = "high";
        results.sources.push(ipResult.source || "threat_feeds");
      }
    }

    const urlResults = await storage.getMaliciousUrls(5, 0, undefined, undefined);
    const urlMatch = urlResults.find(u => u.url?.includes(indicator));
    if (urlMatch) {
      results.matches.push({ type: "malicious_url", url: urlMatch.url, source: urlMatch.source, threatType: urlMatch.threatType });
      results.riskLevel = "high";
      results.sources.push(urlMatch.source || "url_feeds");
    }

    const cveMatch = indicator.match(/^CVE-\d{4}-\d+$/i);
    if (cveMatch) {
      const cve = await storage.getCveByCveId(indicator.toUpperCase());
      if (cve) {
        results.matches.push({ type: "cve", cveId: cve.cveId, score: cve.score, severity: cve.severity, platform: cve.platform });
        results.riskLevel = (cve.score || 0) >= 9 ? "critical" : (cve.score || 0) >= 7 ? "high" : "medium";
        results.sources.push("NVD");
      }
    }

    if (results.matches.length === 0) results.riskLevel = "low";

    setCachedIOC(cacheKey, results);
    res.json({ data: results, cached: false });
  } catch (error) {
    res.status(500).json({ error: "IOC lookup failed" });
  }
});

router.get("/v1/key/usage", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    const usage = await storage.getApiKeyUsageHistory(apiKey.id, 30);
    const today = await storage.getApiKeyUsageToday(apiKey.id);
    res.json({
      key: { name: apiKey.name, prefix: apiKey.prefix, tier: apiKey.tier },
      limits: {
        dailyQuota: apiKey.dailyQuota,
        rateLimitPerMin: apiKey.rateLimitPerMin,
        liveLookupDailyLimit: apiKey.liveLookupDailyLimit,
      },
      today: {
        requestCount: today?.requestCount || 0,
        liveLookupCount: today?.liveLookupCount || 0,
        remainingRequests: (apiKey.dailyQuota || 1000) - (today?.requestCount || 0),
        remainingLiveLookups: (apiKey.liveLookupDailyLimit || 50) - (today?.liveLookupCount || 0),
      },
      history: usage,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch usage data" });
  }
});

export default router;
