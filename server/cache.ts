interface CacheEntry<T = unknown> {
  data: T;
  expires: number;
  json?: string;
}

class ResponseCache {
  private store = new Map<string, CacheEntry>();
  private cleanupTimer: ReturnType<typeof setInterval>;
  private maxEntries = 500;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
  }

  get<T>(key: string): { data: T; json: string } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    if (!entry.json) {
      entry.json = JSON.stringify(entry.data);
    }
    return { data: entry.data as T, json: entry.json };
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = Array.from(this.store.keys())[0];
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
      json: JSON.stringify(data),
    });
  }

  invalidatePrefix(prefix: string): void {
    const toDelete: string[] = [];
    this.store.forEach((_, key) => {
      if (key.startsWith(prefix)) toDelete.push(key);
    });
    toDelete.forEach(k => this.store.delete(k));
  }

  invalidateAll(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];
    this.store.forEach((entry, key) => {
      if (now > entry.expires) expired.push(key);
    });
    expired.forEach(k => this.store.delete(k));
  }

  get size(): number {
    return this.store.size;
  }

  destroy(): void {
    clearInterval(this.cleanupTimer);
    this.store.clear();
  }
}

export const cache = new ResponseCache();

export const TTL = {
  STATS: 120,
  TRENDS: 300,
  FEEDS_LIST: 300,
  CVE_LIST: 180,
  CVE_DETAIL: 300,
  RANSOMWARE_LIST: 180,
  RANSOMWARE_GROUPS: 300,
  RANSOMWARE_DETAIL: 300,
  MALICIOUS_IPS: 180,
  MALICIOUS_URLS: 180,
  CISA_KEV: 300,
  THREAT_ACTORS: 300,
  NEWS: 180,
  SEARCH: 60,
  BREACHES: 300,
  SALE_STATUS: 600,
} as const;

export function cachedJson(res: import("express").Response, cacheKey: string, maxAge: number): boolean {
  const hit = cache.get(cacheKey);
  if (hit) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
    res.setHeader("X-Cache", "HIT");
    res.end(hit.json);
    return true;
  }
  return false;
}

export function cacheAndSend(res: import("express").Response, cacheKey: string, data: unknown, ttlSeconds: number): void {
  cache.set(cacheKey, data, ttlSeconds);
  const json = cache.get(cacheKey)!.json;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", `public, max-age=${Math.floor(ttlSeconds / 2)}, stale-while-revalidate=${ttlSeconds}`);
  res.setHeader("X-Cache", "MISS");
  res.end(json);
}
