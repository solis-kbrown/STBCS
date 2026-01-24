import { 
  type User, type InsertUser,
  type Cve, type InsertCve,
  type RansomwareIncident, type InsertRansomware,
  type ThreatActor, type InsertThreatActor,
  type NewsArticle, type InsertNews,
  type MaliciousIp, type InsertMaliciousIp,
  type MaliciousUrl, type InsertMaliciousUrl,
  type CisaKev, type InsertCisaKev,
  type Subscription, type InsertSubscription,
  type ThreatFeed, type InsertThreatFeed,
  users, cves, ransomwareIncidents, threatActors, newsArticles,
  maliciousIps, maliciousUrls, cisaKev, subscriptions, threatFeeds
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CVEs
  getCves(limit?: number, offset?: number, search?: string): Promise<Cve[]>;
  getCveById(id: string): Promise<Cve | undefined>;
  getCveByCveId(cveId: string): Promise<Cve | undefined>;
  upsertCve(cve: InsertCve): Promise<Cve>;
  getCveCount(): Promise<number>;
  
  // Ransomware Incidents
  getRansomwareIncidents(limit?: number, offset?: number, group?: string, sector?: string): Promise<RansomwareIncident[]>;
  getRansomwareById(id: string): Promise<RansomwareIncident | undefined>;
  createRansomwareIncident(incident: InsertRansomware): Promise<RansomwareIncident>;
  getRansomwareCount(): Promise<number>;
  getActiveGroups(): Promise<{ name: string; count: number }[]>;
  
  // Threat Actors
  getThreatActors(limit?: number): Promise<ThreatActor[]>;
  getThreatActorByName(name: string): Promise<ThreatActor | undefined>;
  upsertThreatActor(actor: InsertThreatActor): Promise<ThreatActor>;
  
  // News
  getNews(limit?: number, offset?: number, category?: string): Promise<NewsArticle[]>;
  getNewsById(id: string): Promise<NewsArticle | undefined>;
  createNews(article: InsertNews): Promise<NewsArticle>;
  getNewsCount(): Promise<number>;
  
  // Malicious IPs
  getMaliciousIps(limit?: number, offset?: number, source?: string, threatType?: string): Promise<MaliciousIp[]>;
  upsertMaliciousIp(ip: InsertMaliciousIp): Promise<MaliciousIp>;
  getMaliciousIpCount(): Promise<number>;
  
  // Malicious URLs
  getMaliciousUrls(limit?: number, offset?: number, source?: string, threatType?: string): Promise<MaliciousUrl[]>;
  upsertMaliciousUrl(url: InsertMaliciousUrl): Promise<MaliciousUrl>;
  getMaliciousUrlCount(): Promise<number>;
  
  // CISA KEV
  getCisaKev(limit?: number, offset?: number): Promise<CisaKev[]>;
  upsertCisaKev(kev: InsertCisaKev): Promise<CisaKev>;
  getCisaKevCount(): Promise<number>;
  
  // Threat Feeds
  getThreatFeeds(): Promise<ThreatFeed[]>;
  updateFeedLastFetched(name: string): Promise<void>;
  upsertThreatFeed(feed: InsertThreatFeed): Promise<ThreatFeed>;
  
  // Stats
  getDashboardStats(): Promise<{
    activeGroups: number;
    criticalCves: number;
    activeExploits: number;
    totalIncidents: number;
    maliciousIps: number;
    maliciousUrls: number;
    cisaKevCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // CVEs
  async getCves(limit = 50, offset = 0, search?: string): Promise<Cve[]> {
    if (search) {
      return db.select().from(cves)
        .where(or(
          ilike(cves.cveId, `%${search}%`),
          ilike(cves.description, `%${search}%`),
          ilike(cves.platform, `%${search}%`)
        ))
        .orderBy(desc(cves.score))
        .limit(limit)
        .offset(offset);
    }
    
    return db.select().from(cves).orderBy(desc(cves.publishedDate)).limit(limit).offset(offset);
  }

  async getCveById(id: string): Promise<Cve | undefined> {
    const [cve] = await db.select().from(cves).where(eq(cves.id, id));
    return cve;
  }

  async getCveByCveId(cveId: string): Promise<Cve | undefined> {
    const [cve] = await db.select().from(cves).where(eq(cves.cveId, cveId));
    return cve;
  }

  async upsertCve(cve: InsertCve): Promise<Cve> {
    const existing = await this.getCveByCveId(cve.cveId);
    if (existing) {
      const [updated] = await db.update(cves)
        .set({ ...cve, lastModified: new Date() })
        .where(eq(cves.cveId, cve.cveId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cves).values(cve).returning();
    return created;
  }

  async getCveCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(cves);
    return Number(result[0]?.count || 0);
  }

  // Ransomware Incidents
  async getRansomwareIncidents(limit = 50, offset = 0, group?: string, sector?: string): Promise<RansomwareIncident[]> {
    let baseQuery = db.select().from(ransomwareIncidents);
    
    if (group) {
      baseQuery = baseQuery.where(eq(ransomwareIncidents.groupName, group)) as typeof baseQuery;
    }
    if (sector) {
      baseQuery = baseQuery.where(eq(ransomwareIncidents.sector, sector)) as typeof baseQuery;
    }
    
    return baseQuery.orderBy(desc(ransomwareIncidents.discoveredAt)).limit(limit).offset(offset);
  }

  async getRansomwareById(id: string): Promise<RansomwareIncident | undefined> {
    const [incident] = await db.select().from(ransomwareIncidents).where(eq(ransomwareIncidents.id, id));
    return incident;
  }

  async createRansomwareIncident(incident: InsertRansomware): Promise<RansomwareIncident> {
    const [created] = await db.insert(ransomwareIncidents).values(incident).returning();
    return created;
  }

  async getRansomwareCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(ransomwareIncidents);
    return Number(result[0]?.count || 0);
  }

  async getActiveGroups(): Promise<{ name: string; count: number }[]> {
    const result = await db.select({
      name: ransomwareIncidents.groupName,
      count: sql<number>`count(*)`
    })
    .from(ransomwareIncidents)
    .groupBy(ransomwareIncidents.groupName)
    .orderBy(desc(sql`count(*)`))
    .limit(20);
    
    return result.map(r => ({ name: r.name, count: Number(r.count) }));
  }

  // Threat Actors
  async getThreatActors(limit = 50): Promise<ThreatActor[]> {
    return db.select().from(threatActors).orderBy(desc(threatActors.lastActive)).limit(limit);
  }

  async getThreatActorByName(name: string): Promise<ThreatActor | undefined> {
    const [actor] = await db.select().from(threatActors).where(eq(threatActors.name, name));
    return actor;
  }

  async upsertThreatActor(actor: InsertThreatActor): Promise<ThreatActor> {
    const existing = await this.getThreatActorByName(actor.name);
    if (existing) {
      const [updated] = await db.update(threatActors)
        .set(actor)
        .where(eq(threatActors.name, actor.name))
        .returning();
      return updated;
    }
    const [created] = await db.insert(threatActors).values(actor).returning();
    return created;
  }

  // News
  async getNews(limit = 50, offset = 0, category?: string): Promise<NewsArticle[]> {
    let baseQuery = db.select().from(newsArticles);
    
    if (category) {
      baseQuery = baseQuery.where(eq(newsArticles.category, category)) as typeof baseQuery;
    }
    
    return baseQuery.orderBy(desc(newsArticles.publishedAt)).limit(limit).offset(offset);
  }

  async getNewsById(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async createNews(article: InsertNews): Promise<NewsArticle> {
    const [created] = await db.insert(newsArticles).values(article).returning();
    return created;
  }

  async getNewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(newsArticles);
    return Number(result[0]?.count || 0);
  }

  // Malicious IPs
  async getMaliciousIps(limit = 50, offset = 0, source?: string, threatType?: string): Promise<MaliciousIp[]> {
    let baseQuery = db.select().from(maliciousIps);
    
    if (source && threatType) {
      baseQuery = baseQuery.where(and(
        eq(maliciousIps.source, source),
        eq(maliciousIps.threatType, threatType)
      )) as typeof baseQuery;
    } else if (source) {
      baseQuery = baseQuery.where(eq(maliciousIps.source, source)) as typeof baseQuery;
    } else if (threatType) {
      baseQuery = baseQuery.where(eq(maliciousIps.threatType, threatType)) as typeof baseQuery;
    }
    
    return baseQuery.orderBy(desc(maliciousIps.lastSeen)).limit(limit).offset(offset);
  }

  async upsertMaliciousIp(ip: InsertMaliciousIp): Promise<MaliciousIp> {
    const [existing] = await db.select().from(maliciousIps)
      .where(and(
        eq(maliciousIps.ipAddress, ip.ipAddress),
        eq(maliciousIps.source, ip.source)
      ));
    
    if (existing) {
      const [updated] = await db.update(maliciousIps)
        .set({ ...ip, lastSeen: new Date() })
        .where(eq(maliciousIps.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(maliciousIps).values(ip).returning();
    return created;
  }

  async getMaliciousIpCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(maliciousIps);
    return Number(result[0]?.count || 0);
  }

  // Malicious URLs
  async getMaliciousUrls(limit = 50, offset = 0, source?: string, threatType?: string): Promise<MaliciousUrl[]> {
    let baseQuery = db.select().from(maliciousUrls);
    
    if (source && threatType) {
      baseQuery = baseQuery.where(and(
        eq(maliciousUrls.source, source),
        eq(maliciousUrls.threatType, threatType)
      )) as typeof baseQuery;
    } else if (source) {
      baseQuery = baseQuery.where(eq(maliciousUrls.source, source)) as typeof baseQuery;
    } else if (threatType) {
      baseQuery = baseQuery.where(eq(maliciousUrls.threatType, threatType)) as typeof baseQuery;
    }
    
    return baseQuery.orderBy(desc(maliciousUrls.reportedAt)).limit(limit).offset(offset);
  }

  async upsertMaliciousUrl(url: InsertMaliciousUrl): Promise<MaliciousUrl> {
    const [existing] = await db.select().from(maliciousUrls)
      .where(and(
        eq(maliciousUrls.url, url.url),
        eq(maliciousUrls.source, url.source)
      ));
    
    if (existing) {
      const [updated] = await db.update(maliciousUrls)
        .set(url)
        .where(eq(maliciousUrls.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(maliciousUrls).values(url).returning();
    return created;
  }

  async getMaliciousUrlCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(maliciousUrls);
    return Number(result[0]?.count || 0);
  }

  // CISA KEV
  async getCisaKev(limit = 50, offset = 0): Promise<CisaKev[]> {
    return db.select().from(cisaKev).orderBy(desc(cisaKev.dateAdded)).limit(limit).offset(offset);
  }

  async upsertCisaKev(kev: InsertCisaKev): Promise<CisaKev> {
    const [existing] = await db.select().from(cisaKev).where(eq(cisaKev.cveId, kev.cveId));
    
    if (existing) {
      const [updated] = await db.update(cisaKev)
        .set(kev)
        .where(eq(cisaKev.cveId, kev.cveId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(cisaKev).values(kev).returning();
    return created;
  }

  async getCisaKevCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(cisaKev);
    return Number(result[0]?.count || 0);
  }

  // Threat Feeds
  async getThreatFeeds(): Promise<ThreatFeed[]> {
    return db.select().from(threatFeeds).orderBy(threatFeeds.name);
  }

  async updateFeedLastFetched(name: string): Promise<void> {
    await db.update(threatFeeds)
      .set({ lastFetched: new Date() })
      .where(eq(threatFeeds.name, name));
  }

  async upsertThreatFeed(feed: InsertThreatFeed): Promise<ThreatFeed> {
    const [existing] = await db.select().from(threatFeeds).where(eq(threatFeeds.name, feed.name));
    
    if (existing) {
      const [updated] = await db.update(threatFeeds)
        .set(feed)
        .where(eq(threatFeeds.name, feed.name))
        .returning();
      return updated;
    }
    const [created] = await db.insert(threatFeeds).values(feed).returning();
    return created;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    activeGroups: number;
    criticalCves: number;
    activeExploits: number;
    totalIncidents: number;
    maliciousIps: number;
    maliciousUrls: number;
    cisaKevCount: number;
  }> {
    const groups = await this.getActiveGroups();
    
    const criticalCvesResult = await db.select({ count: sql<number>`count(*)` })
      .from(cves)
      .where(eq(cves.severity, "CRITICAL"));
    
    const activeExploitsResult = await db.select({ count: sql<number>`count(*)` })
      .from(cves)
      .where(eq(cves.exploitAvailable, true));
    
    const totalIncidents = await this.getRansomwareCount();
    const maliciousIpCount = await this.getMaliciousIpCount();
    const maliciousUrlCount = await this.getMaliciousUrlCount();
    const kevCount = await this.getCisaKevCount();
    
    return {
      activeGroups: groups.length,
      criticalCves: Number(criticalCvesResult[0]?.count || 0),
      activeExploits: Number(activeExploitsResult[0]?.count || 0),
      totalIncidents,
      maliciousIps: maliciousIpCount,
      maliciousUrls: maliciousUrlCount,
      cisaKevCount: kevCount,
    };
  }
}

export const storage = new DatabaseStorage();
