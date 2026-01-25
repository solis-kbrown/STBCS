import { 
  type User, type InsertUser,
  type Session, type InsertSession,
  type Cve, type InsertCve,
  type RansomwareIncident, type InsertRansomware,
  type ThreatActor, type InsertThreatActor,
  type NewsArticle, type InsertNews,
  type MaliciousIp, type InsertMaliciousIp,
  type MaliciousUrl, type InsertMaliciousUrl,
  type CisaKev, type InsertCisaKev,
  type Subscription, type InsertSubscription,
  type ThreatFeed, type InsertThreatFeed,
  type UserNotification, type InsertNotification,
  type WatchlistItem, type InsertWatchlistItem,
  type BreachIncident, type InsertBreach,
  type NewsletterSubscription, type InsertNewsletter,
  users, sessions, cves, ransomwareIncidents, threatActors, newsArticles,
  maliciousIps, maliciousUrls, cisaKev, subscriptions, threatFeeds,
  userNotifications, watchlistItems, breachIncidents, newsletterSubscriptions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTier(userId: string, tier: string): Promise<void>;
  updateUserStripe(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<void>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
  
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
  upsertRansomwareIncident(incident: InsertRansomware): Promise<RansomwareIncident>;
  upsertRansomwareIncidentWithFlag(incident: InsertRansomware): Promise<{ incident: RansomwareIncident; isNew: boolean }>;
  searchRansomware(query: string, limit?: number): Promise<RansomwareIncident[]>;
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
  checkIpThreat(ip: string): Promise<MaliciousIp | null>;
  
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
  
  // User Notifications
  getUserNotifications(userId: string, limit?: number, unreadOnly?: boolean): Promise<UserNotification[]>;
  createNotification(notification: InsertNotification): Promise<UserNotification>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  dismissNotification(id: string, userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Watchlist Items
  getWatchlistItems(userId: string): Promise<WatchlistItem[]>;
  createWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem>;
  updateWatchlistItem(id: string, userId: string, updates: Partial<InsertWatchlistItem>): Promise<WatchlistItem>;
  deleteWatchlistItem(id: string, userId: string): Promise<void>;
  getWatchlistsByType(userId: string, itemType: string): Promise<WatchlistItem[]>;
  
  // Breach Incidents
  getBreachIncidents(limit?: number, offset?: number, search?: string): Promise<BreachIncident[]>;
  getBreachById(id: string): Promise<BreachIncident | undefined>;
  upsertBreachIncident(breach: InsertBreach): Promise<BreachIncident>;
  searchBreaches(query: string, limit?: number): Promise<BreachIncident[]>;
  getBreachCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserTier(userId: string, tier: string): Promise<void> {
    await db.update(users).set({ tier }).where(eq(users.id, userId));
  }

  async updateUserStripe(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<void> {
    const updates: Partial<User> = { stripeCustomerId };
    if (stripeSubscriptionId) {
      updates.stripeSubscriptionId = stripeSubscriptionId;
    }
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const [created] = await db.insert(sessions).values(session).returning();
    return created;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`${sessions.expiresAt} < NOW()`);
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

  async upsertRansomwareIncident(incident: InsertRansomware): Promise<RansomwareIncident> {
    const result = await this.upsertRansomwareIncidentWithFlag(incident);
    return result.incident;
  }
  
  async upsertRansomwareIncidentWithFlag(incident: InsertRansomware): Promise<{ incident: RansomwareIncident; isNew: boolean }> {
    // Check if victim with same name and group exists
    const existing = await db.select()
      .from(ransomwareIncidents)
      .where(and(
        eq(ransomwareIncidents.victim, incident.victim),
        eq(ransomwareIncidents.groupName, incident.groupName)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db.update(ransomwareIncidents)
        .set({
          country: incident.country ?? existing[0].country,
          website: incident.website ?? existing[0].website,
          description: incident.description ?? existing[0].description,
          status: incident.status ?? existing[0].status,
          postUrl: incident.postUrl ?? existing[0].postUrl,
          screenshotUrl: incident.screenshotUrl ?? existing[0].screenshotUrl,
          activity: incident.activity ?? existing[0].activity,
        })
        .where(eq(ransomwareIncidents.id, existing[0].id))
        .returning();
      return { incident: updated, isNew: false };
    }
    
    const [created] = await db.insert(ransomwareIncidents).values(incident).returning();
    return { incident: created, isNew: true };
  }

  async searchRansomware(query: string, limit = 50): Promise<RansomwareIncident[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    return db.select()
      .from(ransomwareIncidents)
      .where(or(
        sql`LOWER(${ransomwareIncidents.victim}) LIKE ${searchPattern}`,
        sql`LOWER(${ransomwareIncidents.groupName}) LIKE ${searchPattern}`,
        sql`LOWER(${ransomwareIncidents.country}) LIKE ${searchPattern}`,
        sql`LOWER(${ransomwareIncidents.sector}) LIKE ${searchPattern}`,
        sql`LOWER(${ransomwareIncidents.website}) LIKE ${searchPattern}`
      ))
      .orderBy(desc(ransomwareIncidents.discoveredAt))
      .limit(limit);
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

  // Global Search across all data types
  async globalSearch(query: string, limit = 20): Promise<{
    cves: Cve[];
    ransomware: RansomwareIncident[];
    ips: MaliciousIp[];
    urls: MaliciousUrl[];
    kev: CisaKev[];
    news: NewsArticle[];
  }> {
    const searchTerm = `%${query}%`;
    
    const [cveResults, ransomwareResults, ipResults, urlResults, kevResults, newsResults] = await Promise.all([
      db.select().from(cves)
        .where(or(
          ilike(cves.cveId, searchTerm),
          ilike(cves.description, searchTerm),
          ilike(cves.platform, searchTerm)
        ))
        .orderBy(desc(cves.score))
        .limit(limit),
      
      db.select().from(ransomwareIncidents)
        .where(or(
          ilike(ransomwareIncidents.victim, searchTerm),
          ilike(ransomwareIncidents.groupName, searchTerm),
          ilike(ransomwareIncidents.sector, searchTerm),
          ilike(ransomwareIncidents.country, searchTerm)
        ))
        .orderBy(desc(ransomwareIncidents.discoveredAt))
        .limit(limit),
      
      db.select().from(maliciousIps)
        .where(or(
          ilike(maliciousIps.ipAddress, searchTerm),
          ilike(maliciousIps.source, searchTerm),
          ilike(maliciousIps.threatType, searchTerm),
          ilike(maliciousIps.country, searchTerm)
        ))
        .orderBy(desc(maliciousIps.lastSeen))
        .limit(limit),
      
      db.select().from(maliciousUrls)
        .where(or(
          ilike(maliciousUrls.url, searchTerm),
          ilike(maliciousUrls.source, searchTerm),
          ilike(maliciousUrls.threatType, searchTerm),
          ilike(maliciousUrls.malwareFamily, searchTerm)
        ))
        .orderBy(desc(maliciousUrls.reportedAt))
        .limit(limit),
      
      db.select().from(cisaKev)
        .where(or(
          ilike(cisaKev.cveId, searchTerm),
          ilike(cisaKev.vendorProject, searchTerm),
          ilike(cisaKev.product, searchTerm),
          ilike(cisaKev.vulnerabilityName, searchTerm),
          ilike(cisaKev.shortDescription, searchTerm)
        ))
        .orderBy(desc(cisaKev.dateAdded))
        .limit(limit),
      
      db.select().from(newsArticles)
        .where(or(
          ilike(newsArticles.title, searchTerm),
          ilike(newsArticles.summary, searchTerm),
          ilike(newsArticles.source, searchTerm),
          ilike(newsArticles.category, searchTerm)
        ))
        .orderBy(desc(newsArticles.publishedAt))
        .limit(limit),
    ]);
    
    return {
      cves: cveResults,
      ransomware: ransomwareResults,
      ips: ipResults,
      urls: urlResults,
      kev: kevResults,
      news: newsResults,
    };
  }

  // Data retention cleanup - remove data older than retention period
  async cleanupOldData(retentionDays = 365): Promise<{
    ipsDeleted: number;
    urlsDeleted: number;
    newsDeleted: number;
  }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    // Delete old malicious IPs (keep last seen within retention)
    const ipsResult = await db.delete(maliciousIps)
      .where(sql`${maliciousIps.lastSeen} < ${cutoffDate} OR (${maliciousIps.lastSeen} IS NULL AND ${maliciousIps.createdAt} < ${cutoffDate})`)
      .returning();
    
    // Delete old malicious URLs
    const urlsResult = await db.delete(maliciousUrls)
      .where(sql`${maliciousUrls.reportedAt} < ${cutoffDate} OR (${maliciousUrls.reportedAt} IS NULL AND ${maliciousUrls.createdAt} < ${cutoffDate})`)
      .returning();
    
    // Delete old news (but keep important ones)
    const newsResult = await db.delete(newsArticles)
      .where(sql`${newsArticles.publishedAt} < ${cutoffDate}`)
      .returning();
    
    return {
      ipsDeleted: ipsResult.length,
      urlsDeleted: urlsResult.length,
      newsDeleted: newsResult.length,
    };
  }

  // Check if IP is in threat database (optimized lookup)
  async checkIpThreat(ip: string): Promise<MaliciousIp | null> {
    const [result] = await db.select().from(maliciousIps)
      .where(eq(maliciousIps.ipAddress, ip))
      .limit(1);
    return result || null;
  }

  // Get storage statistics for admin dashboard
  async getStorageStats(): Promise<{
    totalCves: number;
    totalRansomware: number;
    totalIps: number;
    totalUrls: number;
    totalKev: number;
    totalNews: number;
    totalUsers: number;
    oldestRecord: Date | null;
  }> {
    const [cveCount, ransomCount, ipCount, urlCount, kevCount, newsCount, userCount] = await Promise.all([
      this.getCveCount(),
      this.getRansomwareCount(),
      this.getMaliciousIpCount(),
      this.getMaliciousUrlCount(),
      this.getCisaKevCount(),
      this.getNewsCount(),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);
    
    // Get oldest record date across all tables
    const [oldestCve, oldestRansomware, oldestIp, oldestUrl, oldestNews] = await Promise.all([
      db.select({ created: cves.createdAt }).from(cves).orderBy(cves.createdAt).limit(1),
      db.select({ created: ransomwareIncidents.createdAt }).from(ransomwareIncidents).orderBy(ransomwareIncidents.createdAt).limit(1),
      db.select({ created: maliciousIps.createdAt }).from(maliciousIps).orderBy(maliciousIps.createdAt).limit(1),
      db.select({ created: maliciousUrls.createdAt }).from(maliciousUrls).orderBy(maliciousUrls.createdAt).limit(1),
      db.select({ created: newsArticles.createdAt }).from(newsArticles).orderBy(newsArticles.createdAt).limit(1),
    ]);
    
    const dates = [
      oldestCve[0]?.created,
      oldestRansomware[0]?.created,
      oldestIp[0]?.created,
      oldestUrl[0]?.created,
      oldestNews[0]?.created,
    ].filter((d): d is Date => d != null);
    
    const oldestRecord = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    
    return {
      totalCves: cveCount,
      totalRansomware: ransomCount,
      totalIps: ipCount,
      totalUrls: urlCount,
      totalKev: kevCount,
      totalNews: newsCount,
      totalUsers: Number(userCount[0]?.count || 0),
      oldestRecord,
    };
  }

  // User Notifications
  async getUserNotifications(userId: string, limit = 50, unreadOnly = false): Promise<UserNotification[]> {
    if (unreadOnly) {
      return db.select().from(userNotifications)
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.read, false),
          eq(userNotifications.dismissed, false)
        ))
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit);
    }
    return db.select().from(userNotifications)
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.dismissed, false)
      ))
      .orderBy(desc(userNotifications.createdAt))
      .limit(limit);
  }

  async createNotification(notification: InsertNotification): Promise<UserNotification> {
    const [created] = await db.insert(userNotifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await db.update(userNotifications)
      .set({ read: true })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(userNotifications)
      .set({ read: true })
      .where(eq(userNotifications.userId, userId));
  }

  async dismissNotification(id: string, userId: string): Promise<void> {
    await db.update(userNotifications)
      .set({ dismissed: true })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, userId)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(userNotifications)
      .where(and(
        eq(userNotifications.userId, userId),
        eq(userNotifications.read, false),
        eq(userNotifications.dismissed, false)
      ));
    return Number(result?.count || 0);
  }

  // Watchlist Items
  async getWatchlistItems(userId: string): Promise<WatchlistItem[]> {
    return db.select().from(watchlistItems)
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.createdAt));
  }

  async createWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const [created] = await db.insert(watchlistItems).values(item).returning();
    return created;
  }

  async updateWatchlistItem(id: string, userId: string, updates: Partial<InsertWatchlistItem>): Promise<WatchlistItem> {
    const [updated] = await db.update(watchlistItems)
      .set(updates)
      .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)))
      .returning();
    return updated;
  }

  async deleteWatchlistItem(id: string, userId: string): Promise<void> {
    await db.delete(watchlistItems)
      .where(and(eq(watchlistItems.id, id), eq(watchlistItems.userId, userId)));
  }

  async getWatchlistsByType(userId: string, itemType: string): Promise<WatchlistItem[]> {
    return db.select().from(watchlistItems)
      .where(and(eq(watchlistItems.userId, userId), eq(watchlistItems.itemType, itemType)))
      .orderBy(desc(watchlistItems.createdAt));
  }

  // Breach Incidents
  async getBreachIncidents(limit = 50, offset = 0, search?: string): Promise<BreachIncident[]> {
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      return db.select().from(breachIncidents)
        .where(or(
          ilike(breachIncidents.name, searchPattern),
          ilike(breachIncidents.domain, searchPattern),
          ilike(breachIncidents.description, searchPattern)
        ))
        .orderBy(desc(breachIncidents.breachDate))
        .limit(limit)
        .offset(offset);
    }
    return db.select().from(breachIncidents)
      .orderBy(desc(breachIncidents.breachDate))
      .limit(limit)
      .offset(offset);
  }

  async getBreachById(id: string): Promise<BreachIncident | undefined> {
    const [breach] = await db.select().from(breachIncidents).where(eq(breachIncidents.id, id));
    return breach;
  }

  async upsertBreachIncident(breach: InsertBreach): Promise<BreachIncident> {
    const existing = await db.select().from(breachIncidents)
      .where(eq(breachIncidents.name, breach.name))
      .limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db.update(breachIncidents)
        .set({
          domain: breach.domain ?? existing[0].domain,
          description: breach.description ?? existing[0].description,
          pwnCount: breach.pwnCount ?? existing[0].pwnCount,
          dataClasses: breach.dataClasses ?? existing[0].dataClasses,
          modifiedDate: new Date(),
        })
        .where(eq(breachIncidents.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(breachIncidents).values(breach).returning();
    return created;
  }

  async searchBreaches(query: string, limit = 50): Promise<BreachIncident[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    return db.select().from(breachIncidents)
      .where(or(
        ilike(breachIncidents.name, searchPattern),
        ilike(breachIncidents.domain, searchPattern),
        ilike(breachIncidents.description, searchPattern),
        ilike(breachIncidents.dataClasses, searchPattern)
      ))
      .orderBy(desc(breachIncidents.breachDate))
      .limit(limit);
  }

  async getBreachCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(breachIncidents);
    return Number(result?.count || 0);
  }

  // Newsletter Subscriptions
  async getNewsletterByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db.select().from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return subscription;
  }

  async getNewsletterByUnsubscribeToken(token: string): Promise<NewsletterSubscription | undefined> {
    const [subscription] = await db.select().from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.unsubscribeToken, token));
    return subscription;
  }

  async createNewsletterSubscription(data: InsertNewsletter): Promise<NewsletterSubscription> {
    // Check for existing unsubscribed user and reactivate
    const existing = await this.getNewsletterByEmail(data.email!);
    if (existing) {
      const [updated] = await db.update(newsletterSubscriptions)
        .set({
          name: data.name,
          preferences: data.preferences,
          frequency: data.frequency,
          verificationToken: data.verificationToken,
          unsubscribeToken: data.unsubscribeToken,
          verified: false,
          unsubscribedAt: null,
          subscribedAt: new Date(),
        })
        .where(eq(newsletterSubscriptions.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(newsletterSubscriptions).values(data).returning();
    return created;
  }

  async unsubscribeNewsletter(id: string): Promise<void> {
    await db.update(newsletterSubscriptions)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscriptions.id, id));
  }

  async updateNewsletterPreferences(id: string, updates: Partial<InsertNewsletter>): Promise<NewsletterSubscription> {
    const [updated] = await db.update(newsletterSubscriptions)
      .set(updates)
      .where(eq(newsletterSubscriptions.id, id))
      .returning();
    return updated;
  }

  async getActiveNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return db.select().from(newsletterSubscriptions)
      .where(and(
        eq(newsletterSubscriptions.verified, true),
        sql`${newsletterSubscriptions.unsubscribedAt} IS NULL`
      ))
      .orderBy(desc(newsletterSubscriptions.subscribedAt));
  }

  async getActiveNewsletterSubscribers(frequency: string): Promise<NewsletterSubscription[]> {
    return db.select().from(newsletterSubscriptions)
      .where(and(
        eq(newsletterSubscriptions.frequency, frequency),
        eq(newsletterSubscriptions.verified, true),
        sql`${newsletterSubscriptions.unsubscribedAt} IS NULL`
      ))
      .orderBy(desc(newsletterSubscriptions.subscribedAt));
  }
}

export const storage = new DatabaseStorage();
