import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { apiKeyAuthMiddleware, checkLiveLookupQuota } from "./apiKeyAuth";
import { cache, TTL } from "./cache";

const router = Router();

const iocCache = new Map<string, { data: any; expiresAt: number }>();
const IOC_CACHE_TTL = 2 * 60 * 60 * 1000;
const IOC_CACHE_MAX = 1000;

function getCachedIOC(key: string) {
  const entry = iocCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) iocCache.delete(key);
  return null;
}
function setCachedIOC(key: string, data: any) {
  if (iocCache.size >= IOC_CACHE_MAX) {
    const oldest = iocCache.keys().next().value;
    if (oldest) iocCache.delete(oldest);
  }
  iocCache.set(key, { data, expiresAt: Date.now() + IOC_CACHE_TTL });
}

setInterval(() => {
  const now = Date.now();
  const expired: string[] = [];
  iocCache.forEach((entry, key) => {
    if (entry.expiresAt < now) expired.push(key);
  });
  expired.forEach(k => iocCache.delete(k));
}, 10 * 60 * 1000);

router.get("/v1/cves", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || undefined;
    const cacheKey = `apiv1_cves_${limit}_${offset}_${search || ""}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getCves(limit, offset, search);
    const total = await storage.getCveCount();
    const result = { data, total, limit, offset };
    cache.set(cacheKey, result, TTL.CVE_LIST);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CVE data" });
  }
});

router.get("/v1/cves/:cveId", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const cveId = req.params.cveId as string;
    const cacheKey = `apiv1_cve_${cveId}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const cve = await storage.getCveByCveId(cveId);
    if (!cve) { res.status(404).json({ error: "CVE not found" }); return; }
    const result = { data: cve };
    cache.set(cacheKey, result, TTL.CVE_DETAIL);
    res.json(result);
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
    const cacheKey = `apiv1_ransom_${limit}_${offset}_${group || ""}_${sector || ""}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getRansomwareIncidents(limit, offset, group, sector);
    const total = await storage.getRansomwareCount();
    const result = { data, total, limit, offset };
    cache.set(cacheKey, result, TTL.RANSOMWARE_LIST);
    res.json(result);
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
    const cacheKey = `apiv1_ips_${limit}_${offset}_${source || ""}_${threatType || ""}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getMaliciousIps(limit, offset, source, threatType);
    const total = await storage.getMaliciousIpCount();
    const result = { data, total, limit, offset };
    cache.set(cacheKey, result, TTL.MALICIOUS_IPS);
    res.json(result);
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
    const cacheKey = `apiv1_urls_${limit}_${offset}_${source || ""}_${threatType || ""}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getMaliciousUrls(limit, offset, source, threatType);
    const total = await storage.getMaliciousUrlCount();
    const result = { data, total, limit, offset };
    cache.set(cacheKey, result, TTL.MALICIOUS_URLS);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch malicious URL data" });
  }
});

router.get("/v1/kev", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const cacheKey = `apiv1_kev_${limit}_${offset}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getCisaKev(limit, offset);
    const total = await storage.getCisaKevCount();
    const result = { data, total, limit, offset };
    cache.set(cacheKey, result, TTL.CISA_KEV);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CISA KEV data" });
  }
});

router.get("/v1/threat-actors", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const cacheKey = `apiv1_actors_${limit}`;
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const data = await storage.getThreatActors(limit);
    const result = { data, total: data.length };
    cache.set(cacheKey, result, TTL.THREAT_ACTORS);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch threat actor data" });
  }
});

router.get("/v1/stats", apiKeyAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const cacheKey = "apiv1_stats";
    const hit = cache.get(cacheKey);
    if (hit) { res.json(hit.data); return; }
    const stats = await storage.getDashboardStats();
    const result = { data: stats };
    cache.set(cacheKey, result, TTL.STATS);
    res.json(result);
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

    const normalizedIndicator = indicator.toLowerCase().trim();
    const cacheKey = `ioc_${normalizedIndicator}`;
    const cached = getCachedIOC(cacheKey);
    if (cached) {
      res.json({ data: cached, cached: true, cacheExpiresIn: "up to 2 hours" });
      return;
    }

    const allowed = await checkLiveLookupQuota(req, res);
    if (!allowed) return;

    const results: any = { indicator: normalizedIndicator, matches: [], riskLevel: "unknown", sources: [] };

    const ipMatch = normalizedIndicator.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipMatch) {
      const ipResult = await storage.checkIpThreat(normalizedIndicator);
      if (ipResult) {
        results.matches.push({ type: "malicious_ip", source: ipResult.source, threatType: ipResult.threatType, firstSeen: ipResult.firstSeen });
        results.riskLevel = "high";
        results.sources.push(ipResult.source || "threat_feeds");
      }
    }

    const cvePattern = normalizedIndicator.match(/^cve-\d{4}-\d+$/);
    if (cvePattern) {
      const cve = await storage.getCveByCveId(normalizedIndicator.toUpperCase());
      if (cve) {
        results.matches.push({ type: "cve", cveId: cve.cveId, score: cve.score, severity: cve.severity, platform: cve.platform });
        results.riskLevel = (cve.score || 0) >= 9 ? "critical" : (cve.score || 0) >= 7 ? "high" : "medium";
        results.sources.push("NVD");
      }
    }

    if (!ipMatch && !cvePattern) {
      const urlResults = await storage.getMaliciousUrls(50, 0, undefined, undefined);
      const urlMatch = urlResults.find(u => u.url?.toLowerCase().includes(normalizedIndicator));
      if (urlMatch) {
        results.matches.push({ type: "malicious_url", url: urlMatch.url, source: urlMatch.source, threatType: urlMatch.threatType });
        results.riskLevel = "high";
        results.sources.push(urlMatch.source || "url_feeds");
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
