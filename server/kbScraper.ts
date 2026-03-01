import { storage } from "./storage";
import { toSlug } from "@shared/schema";

const CYBERSEC_FEEDS = [
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News", type: "threat_intel" },
  { url: "https://www.bleepingcomputer.com/feed/", source: "BleepingComputer", type: "threat_intel" },
  { url: "https://krebsonsecurity.com/feed/", source: "Krebs on Security", type: "threat_intel" },
  { url: "https://www.darkreading.com/rss.xml", source: "Dark Reading", type: "threat_intel" },
  { url: "https://threatpost.com/feed/", source: "Threatpost", type: "threat_intel" },
  { url: "https://www.cisa.gov/news.xml", source: "CISA", type: "official_kb" },
  { url: "https://blog.talosintelligence.com/feeds/posts/default?alt=rss", source: "Cisco Talos", type: "threat_intel" },
  { url: "https://securelist.com/feed/", source: "Securelist (Kaspersky)", type: "threat_intel" },
  { url: "https://www.schneier.com/feed/atom/", source: "Schneier on Security", type: "threat_intel" },
  { url: "https://nakedsecurity.sophos.com/feed/", source: "Naked Security", type: "threat_intel" },
  { url: "https://www.sentinelone.com/blog/feed/", source: "SentinelOne", type: "threat_intel" },
  { url: "https://www.recordedfuture.com/feed", source: "Recorded Future", type: "threat_intel" },
];

const SYSTEM_AUTHOR_ID = "system-kb-scraper";

const CYBERSEC_TAGS: Record<string, string[]> = {
  ransomware: ["ransomware", "ransom", "lockbit", "blackcat", "alphv", "conti", "revil", "darkside", "hive", "clop"],
  malware: ["malware", "trojan", "botnet", "worm", "rootkit", "spyware", "adware", "backdoor", "rat "],
  vulnerability: ["cve-", "vulnerability", "zero-day", "0day", "exploit", "patch", "critical flaw", "rce", "buffer overflow"],
  phishing: ["phishing", "social engineering", "credential", "bec", "spear phishing"],
  "dark-web": ["dark web", "darknet", "tor ", "deep web", "underground", "forum"],
  "incident-response": ["incident response", "breach", "data leak", "data breach", "compromised"],
  "threat-actor": ["apt", "threat actor", "nation-state", "lazarus", "fancy bear", "cozy bear", "sandworm"],
  "law-enforcement": ["fbi", "europol", "interpol", "arrested", "seized", "takedown", "indicted", "law enforcement", "raid"],
  "critical-infrastructure": ["ics", "scada", "critical infrastructure", "industrial", "power grid", "water treatment"],
  cloud: ["cloud security", "aws ", "azure", "gcp", "saas", "kubernetes", "container"],
  iot: ["iot", "internet of things", "smart device", "firmware"],
  "ai-security": ["ai security", "machine learning", "deepfake", "llm", "artificial intelligence"],
};

function autoTag(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(CYBERSEC_TAGS)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }
  return tags.slice(0, 5);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFromXml(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdataMatch) return cdataMatch[1].trim();
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

function extractLink(itemXml: string): string {
  const linkMatch = itemXml.match(/<link[^>]*href="([^"]+)"[^>]*\/>/);
  if (linkMatch) return linkMatch[1];
  const linkTagMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/);
  if (linkTagMatch) return linkTagMatch[1].trim();
  return "";
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  type: string;
}

async function fetchFeed(feedUrl: string, source: string, type: string): Promise<FeedItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "STBCS-KnowledgeBase/1.0" },
    });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const xml = await response.text();

    const items: FeedItem[] = [];
    const itemMatches = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/g);
    if (!itemMatches) return [];

    for (const itemXml of itemMatches.slice(0, 5)) {
      const title = stripHtml(extractFromXml(itemXml, "title"));
      const link = extractLink(itemXml) || stripHtml(extractFromXml(itemXml, "link"));
      const description = stripHtml(
        extractFromXml(itemXml, "content:encoded") ||
        extractFromXml(itemXml, "content") ||
        extractFromXml(itemXml, "description") ||
        extractFromXml(itemXml, "summary")
      );
      const pubDate = extractFromXml(itemXml, "pubDate") || extractFromXml(itemXml, "published") || extractFromXml(itemXml, "updated");

      if (title && title.length > 10) {
        items.push({ title, link, description: description.slice(0, 2000), pubDate, source, type });
      }
    }
    return items;
  } catch (error) {
    console.log(`[KB Scraper] Failed to fetch ${source}: ${(error as Error).message}`);
    return [];
  }
}

function formatAsMarkdown(item: FeedItem): string {
  const parts: string[] = [];
  parts.push(`*Sourced from [${item.source}](${item.link})*\n`);

  if (item.description) {
    const desc = item.description.slice(0, 1500);
    parts.push(desc);
  }

  parts.push(`\n---\n*This article was automatically sourced by the STB Cybersecurity Knowledge Base. [Read the full article](${item.link})*`);
  return parts.join("\n\n");
}

async function ensureSystemUser(): Promise<string> {
  const existing = await storage.getUserByUsername("STB-KnowledgeBot");
  if (existing) return existing.id;

  try {
    const user = await storage.createUser({
      username: "STB-KnowledgeBot",
      password: "$2b$12$placeholder_hash_not_a_real_login_00000000000000",
      email: "kb-bot@stbcybersecurity.internal",
    });

    await storage.setUserTrusted(user.id, true);
    return user.id;
  } catch {
    const existing2 = await storage.getUserByUsername("STB-KnowledgeBot");
    if (existing2) return existing2.id;
    throw new Error("Failed to create KB system user");
  }
}

const SEED_MEMBERS = [
  { username: "CyberSentinel_Mike", email: "mike.s@stbcybersecurity.internal", tier: "pro", reputation: 187, isTrusted: true },
  { username: "IR_Analyst_Sarah", email: "sarah.k@stbcybersecurity.internal", tier: "business", reputation: 312, isTrusted: true },
  { username: "ThreatHunter_J", email: "jason.r@stbcybersecurity.internal", tier: "supporter", reputation: 74, isTrusted: true },
  { username: "BluTeam_Rachel", email: "rachel.m@stbcybersecurity.internal", tier: "pro", reputation: 145, isTrusted: true },
  { username: "NetSec_Dave", email: "dave.c@stbcybersecurity.internal", tier: "business", reputation: 228, isTrusted: true },
  { username: "SOC_Ops_Tyler", email: "tyler.b@stbcybersecurity.internal", tier: "supporter", reputation: 42, isTrusted: false },
  { username: "MalwareRE_Kim", email: "kim.l@stbcybersecurity.internal", tier: "pro", reputation: 96, isTrusted: true },
  { username: "DFIR_Nicole", email: "nicole.w@stbcybersecurity.internal", tier: "unlimited", reputation: 415, isTrusted: true },
];

export async function ensureSeedMembers(): Promise<void> {
  for (const member of SEED_MEMBERS) {
    const existing = await storage.getUserByUsername(member.username);
    if (existing) continue;
    try {
      const user = await storage.createUser({
        username: member.username,
        password: "$2b$12$placeholder_hash_not_a_real_login_00000000000000",
        email: member.email,
      });
      await storage.awardReputation(user.id, member.reputation);
      if (member.isTrusted) await storage.setUserTrusted(user.id, true);
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(users).set({ tier: member.tier }).where(eq(users.id, user.id));
      console.log(`[KB Seed] Created demo member: ${member.username} (${member.tier}, ${member.reputation} pts)`);
    } catch {
      // already exists or race condition
    }
  }
}

let lastFetchTime = 0;
const FETCH_INTERVAL = 4 * 60 * 60 * 1000;
const MAX_POSTS_PER_RUN = 15;
const DEDUP_DAYS = 7;

export async function scrapeKbFeeds(): Promise<number> {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) return 0;
  lastFetchTime = now;

  console.log("[KB Scraper] Starting cybersecurity feed scrape...");
  let created = 0;

  try {
    const botUserId = await ensureSystemUser();

    const feedPromises = CYBERSEC_FEEDS.map(f => fetchFeed(f.url, f.source, f.type));
    const allResults = await Promise.allSettled(feedPromises);
    const allItems: FeedItem[] = [];

    for (const result of allResults) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }

    allItems.sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });

    const cutoff = Date.now() - DEDUP_DAYS * 24 * 60 * 60 * 1000;
    const recentItems = allItems.filter(item => {
      if (!item.pubDate) return true;
      const d = new Date(item.pubDate).getTime();
      return d > cutoff;
    });

    for (const item of recentItems.slice(0, MAX_POSTS_PER_RUN)) {
      try {
        const baseSlug = toSlug(item.title);
        if (!baseSlug || baseSlug.length < 5) continue;

        let slug = baseSlug.slice(0, 100);
        const existing = await storage.getKbPostBySlug(slug);
        if (existing) continue;

        const tags = autoTag(item.title, item.description);
        tags.push(item.source.toLowerCase().replace(/[^a-z0-9]/g, "-"));

        const content = formatAsMarkdown(item);

        await storage.createKbPost({
          authorId: botUserId,
          title: item.title,
          slug,
          content,
          type: item.type,
          status: "published",
          isPinned: false,
          tags: [...new Set(tags)].slice(0, 6),
        });
        created++;
      } catch (err) {
        continue;
      }
    }

    if (created > 0) {
      console.log(`[KB Scraper] Created ${created} new KB articles`);
    } else {
      console.log("[KB Scraper] No new articles to add");
    }
  } catch (error) {
    console.error("[KB Scraper] Error:", (error as Error).message);
  }

  return created;
}

export async function cleanupOldKbPosts(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const oldPosts = await storage.getKbPosts({
      status: "published",
      limit: 100,
      offset: 0,
    });

    let deleted = 0;
    for (const post of oldPosts) {
      if (
        post.createdAt && new Date(post.createdAt) < cutoff &&
        (post.voteCount || 0) === 0 &&
        (post.commentCount || 0) === 0
      ) {
        const bot = await storage.getUserByUsername("STB-KnowledgeBot");
        if (bot && post.authorId === bot.id) {
          await storage.deleteKbPost(post.id);
          deleted++;
        }
      }
    }

    if (deleted > 0) {
      console.log(`[KB Scraper] Cleaned up ${deleted} stale auto-sourced articles`);
    }
    return deleted;
  } catch (error) {
    console.error("[KB Scraper] Cleanup error:", (error as Error).message);
    return 0;
  }
}

export function startKbScraper(): void {
  setTimeout(() => {
    scrapeKbFeeds().catch(err => console.error("[KB Scraper] Initial scrape failed:", err.message));
  }, 30000);

  setInterval(() => {
    scrapeKbFeeds().catch(err => console.error("[KB Scraper] Scheduled scrape failed:", err.message));
  }, FETCH_INTERVAL);

  setInterval(() => {
    cleanupOldKbPosts().catch(err => console.error("[KB Scraper] Cleanup failed:", err.message));
  }, 24 * 60 * 60 * 1000);

  console.log("[KB Scraper] Initialized - will scrape every 4 hours, cleanup daily");
}
