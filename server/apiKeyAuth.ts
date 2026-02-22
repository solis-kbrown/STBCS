import { Request, Response, NextFunction } from "express";
import { createHash, randomBytes } from "crypto";
import { storage } from "./storage";

const TIER_LIMITS = {
  pro: { maxKeys: 1, dailyQuota: 1000, rateLimitPerMin: 60, liveLookupDaily: 50 },
  business: { maxKeys: 5, dailyQuota: 10000, rateLimitPerMin: 120, liveLookupDaily: 200 },
  enterprise: { maxKeys: 5, dailyQuota: 10000, rateLimitPerMin: 120, liveLookupDaily: 200 },
};

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(tier: string): { rawKey: string; prefix: string; keyHash: string } {
  const prefixTag = tier === "business" || tier === "enterprise" ? "biz" : "pro";
  const prefix = `stbcs_${prefixTag}_${randomBytes(4).toString("hex")}`;
  const secret = randomBytes(24).toString("hex");
  const rawKey = `${prefix}_${secret}`;
  const keyHash = hashApiKey(rawKey);
  return { rawKey, prefix, keyHash };
}

export function getTierLimits(tier: string) {
  return TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.pro;
}

export async function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const xApiKey = req.headers["x-api-key"] as string | undefined;
  const authHeader = req.headers.authorization;

  let rawKey: string | undefined;
  if (xApiKey && xApiKey.startsWith("stbcs_")) {
    rawKey = xApiKey.trim();
  } else if (authHeader && authHeader.startsWith("Bearer ")) {
    rawKey = authHeader.slice(7).trim();
  }

  if (!rawKey) {
    res.status(401).json({
      error: "Missing API key",
      message: "Include your API key in the X-API-Key header or Authorization: Bearer header",
      docs: "/api-docs",
    });
    return;
  }
  if (!rawKey.startsWith("stbcs_")) {
    res.status(401).json({ error: "Invalid API key format" });
    return;
  }

  const parts = rawKey.split("_");
  if (parts.length < 3) {
    res.status(401).json({ error: "Invalid API key format" });
    return;
  }
  const prefix = `${parts[0]}_${parts[1]}_${parts[2]}`;

  const apiKey = await storage.getApiKeyByPrefix(prefix);
  if (!apiKey) {
    res.status(401).json({ error: "Invalid or revoked API key" });
    return;
  }

  const keyHash = hashApiKey(rawKey);
  if (keyHash !== apiKey.keyHash) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  const now = Date.now();
  const rateKey = `apikey_${apiKey.id}`;
  const rateData = rateLimitMap.get(rateKey);
  const windowMs = 60 * 1000;

  if (rateData && now - rateData.windowStart < windowMs) {
    rateData.count++;
    if (rateData.count > (apiKey.rateLimitPerMin || 60)) {
      res.status(429).json({
        error: "Rate limit exceeded",
        message: `Max ${apiKey.rateLimitPerMin} requests per minute. Try again shortly.`,
        retryAfter: Math.ceil((windowMs - (now - rateData.windowStart)) / 1000),
      });
      return;
    }
  } else {
    rateLimitMap.set(rateKey, { count: 1, windowStart: now });
  }

  const usage = await storage.getApiKeyUsageToday(apiKey.id);
  const todayCount = usage?.requestCount || 0;
  if (todayCount >= (apiKey.dailyQuota || 1000)) {
    res.status(429).json({
      error: "Daily quota exceeded",
      message: `You've used ${todayCount}/${apiKey.dailyQuota} requests today. Resets at midnight UTC.`,
    });
    return;
  }

  storage.updateApiKeyLastUsed(apiKey.id).catch(() => {});
  storage.incrementApiKeyUsage(apiKey.id, false).catch(() => {});

  const currentRate = rateLimitMap.get(rateKey);
  const rateLimit = apiKey.rateLimitPerMin || 60;
  const remaining = Math.max(0, rateLimit - (currentRate?.count || 1));
  res.setHeader("X-RateLimit-Limit", String(rateLimit));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-Daily-Quota-Remaining", String(Math.max(0, (apiKey.dailyQuota || 1000) - todayCount - 1)));

  (req as any).apiKey = apiKey;
  (req as any).apiKeyUser = await storage.getUser(apiKey.userId);
  next();
}

export async function checkLiveLookupQuota(req: Request, res: Response): Promise<boolean> {
  const apiKey = (req as any).apiKey;
  if (!apiKey) return false;

  const usage = await storage.getApiKeyUsageToday(apiKey.id);
  const liveLookups = usage?.liveLookupCount || 0;
  const limit = apiKey.liveLookupDailyLimit || 50;

  if (liveLookups >= limit) {
    res.status(429).json({
      error: "Live lookup daily limit exceeded",
      message: `You've used ${liveLookups}/${limit} live lookups today. Use cached endpoints or upgrade your plan.`,
    });
    return false;
  }

  storage.incrementApiKeyUsage(apiKey.id, true).catch(() => {});
  return true;
}

setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitMap.keys());
  keys.forEach((key) => {
    const data = rateLimitMap.get(key);
    if (data && now - data.windowStart > 120000) {
      rateLimitMap.delete(key);
    }
  });
}, 60000);
