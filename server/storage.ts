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
  type IcsAdvisory, type InsertIcsAdvisory,
  type NewsletterSubscription, type InsertNewsletter,
  type SmsMessage, type InsertSmsMessage,
  type ExploitSubmission, type InsertExploitSubmission,
  type LiveChatSession, type InsertLiveChatSession,
  type ContentView,
  type DailyVisitorCount,
  type ApiKey, type InsertApiKey, type ApiKeyUsage,
  type AddOn, type InsertAddOn,
  type UserAddOn, type InsertUserAddOn,
  type MonitorAlertLog,
  users, sessions, cves, ransomwareIncidents, threatActors, newsArticles,
  maliciousIps, maliciousUrls, cisaKev, subscriptions, threatFeeds,
  userNotifications, watchlistItems, breachIncidents, cisaIcsAdvisories, newsletterSubscriptions,
  smsMessages, exploitSubmissions, liveChatSessions, contentViews, siteVisitors, dailyVisitorCounts,
  apiKeys, apiKeyUsage, addOns, userAddOns, monitorAlertLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and, gte } from "drizzle-orm";

export interface GroupStats {
  totalVictims: number;
  sectors: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  timeline: { month: string; count: number }[];
  avgDataSize: string | null;
  recentActivity: string | null;
}

export interface GroupAnalytics {
  topGroups: { name: string; victims: number; lastActive: string | null }[];
  topSectors: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
  totalGroups: number;
  totalVictims: number;
  totalCountries: number;
  totalSectors: number;
  activeGroupsLast30d: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  avgDailyAttacks: number;
  topSourceApis: { name: string; count: number }[];
  recentGroups: { name: string; victims: number; firstSeen: string | null }[];
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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
  getGroupProfile(groupName: string): Promise<{ actor: ThreatActor | undefined; incidents: RansomwareIncident[]; stats: GroupStats }>;
  getGroupAnalytics(): Promise<GroupAnalytics>;
  
  // News
  getNews(limit?: number, offset?: number, category?: string): Promise<NewsArticle[]>;
  getNewsById(id: string): Promise<NewsArticle | undefined>;
  createNews(article: InsertNews): Promise<NewsArticle>;
  upsertNews(article: InsertNews): Promise<{ article: NewsArticle; isNew: boolean }>;
  getNewsCount(): Promise<number>;
  
  // Malicious IPs
  getMaliciousIps(limit?: number, offset?: number, source?: string, threatType?: string): Promise<MaliciousIp[]>;
  getMaliciousIpsByAddress(ipAddress: string): Promise<MaliciousIp[]>;
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
  batchUpsertCisaKev(kevs: InsertCisaKev[]): Promise<void>;
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
  getThreatTrends(days: number): Promise<{
    cvesByDay: { date: string; count: number; critical: number }[];
    ransomwareByDay: { date: string; count: number }[];
    topThreats: { type: string; count: number }[];
    topGroups: { name: string; count: number }[];
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
  getAllActiveWatchlistItems(): Promise<WatchlistItem[]>;
  logMonitorAlert(log: { watchlistItemId: string; matchedDataType: string; matchedDataId: string; deliveryChannel: string; deliveryStatus?: string }): Promise<void>;
  hasAlertBeenSent(watchlistItemId: string, matchedDataType: string, matchedDataId: string): Promise<boolean>;
  
  // Breach Incidents
  getBreachIncidents(limit?: number, offset?: number, search?: string): Promise<BreachIncident[]>;
  getBreachById(id: string): Promise<BreachIncident | undefined>;
  upsertBreachIncident(breach: InsertBreach): Promise<BreachIncident>;
  searchBreaches(query: string, limit?: number): Promise<BreachIncident[]>;
  getBreachCount(): Promise<number>;
  
  // CISA ICS Advisories
  getIcsAdvisories(limit?: number, offset?: number): Promise<IcsAdvisory[]>;
  getIcsAdvisoryCount(): Promise<number>;
  batchUpsertIcsAdvisories(advisories: InsertIcsAdvisory[]): Promise<void>;

  // SMS Messages (Pro/Business feature)
  getSmsMessages(limit?: number, offset?: number): Promise<SmsMessage[]>;
  getSmsConversations(): Promise<{ phoneNumber: string; lastMessage: SmsMessage; unreadCount: number }[]>;
  getConversationMessages(phoneNumber: string, limit?: number): Promise<SmsMessage[]>;
  createSmsMessage(message: InsertSmsMessage): Promise<SmsMessage>;
  markMessageRead(id: string): Promise<void>;
  markConversationRead(phoneNumber: string): Promise<void>;
  getUnreadMessageCount(): Promise<number>;
  
  // Live Chat Sessions
  createLiveChatSession(session: InsertLiveChatSession): Promise<LiveChatSession>;
  getLiveChatSessionByToken(token: string): Promise<LiveChatSession | undefined>;
  getLiveChatSessionByPhone(phone: string): Promise<LiveChatSession | undefined>;
  updateLiveChatActivity(token: string): Promise<void>;
  closeLiveChatSession(token: string): Promise<void>;

  // Exploit Submissions
  createExploitSubmission(submission: InsertExploitSubmission): Promise<ExploitSubmission>;
  getExploitSubmissions(limit?: number, offset?: number): Promise<ExploitSubmission[]>;
  getExploitSubmissionById(id: string): Promise<ExploitSubmission | undefined>;
  updateExploitSubmissionStatus(id: string, status: string, reviewedBy?: string, reviewNotes?: string): Promise<void>;
  
  // Content Views & Popularity
  trackView(contentType: string, contentId: string): Promise<void>;
  getViewCount(contentType: string, contentId: string): Promise<number>;
  getTrendingContent(contentType: string, limit?: number): Promise<{ contentId: string; viewCount: number }[]>;

  // Visitor Tracking
  trackVisitor(visitorHash: string): Promise<boolean>;
  getVisitorStats(): Promise<{ totalUnique: number; today: number; thisWeek: number; thisMonth: number }>;
  getDailyVisitorCounts(days: number): Promise<DailyVisitorCount[]>;
  getNewSignupsCount(since: Date): Promise<number>;

  // API Keys
  createApiKey(data: InsertApiKey): Promise<ApiKey>;
  getApiKeysByUser(userId: string): Promise<ApiKey[]>;
  getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined>;
  revokeApiKey(id: string, userId: string): Promise<void>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  getApiKeyUsageToday(apiKeyId: string): Promise<ApiKeyUsage | undefined>;
  incrementApiKeyUsage(apiKeyId: string, isLiveLookup?: boolean): Promise<void>;
  getApiKeyUsageHistory(apiKeyId: string, days?: number): Promise<ApiKeyUsage[]>;

  // Add-Ons
  getAddOns(activeOnly?: boolean): Promise<AddOn[]>;
  getAddOnBySlug(slug: string): Promise<AddOn | undefined>;
  getUserAddOns(userId: string): Promise<(UserAddOn & { addOn?: AddOn })[]>;
  createUserAddOn(data: InsertUserAddOn): Promise<UserAddOn>;

  // Monitor Alert Log
  hasAlertBeenSent(watchlistItemId: string, matchedDataType: string, matchedDataId: string): Promise<boolean>;
  logMonitorAlert(watchlistItemId: string, matchedDataType: string, matchedDataId: string, deliveryChannel: string): Promise<void>;
  getAllActiveWatchlistItems(): Promise<(WatchlistItem & { user?: User })[]>;
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
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
  async getCves(limit = 500, offset = 0, search?: string): Promise<Cve[]> {
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
  async getRansomwareIncidents(limit = 500, offset = 0, group?: string, sector?: string): Promise<RansomwareIncident[]> {
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
  async getThreatActors(limit = 200): Promise<ThreatActor[]> {
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

  async getGroupProfile(groupName: string): Promise<{ actor: ThreatActor | undefined; incidents: RansomwareIncident[]; stats: GroupStats }> {
    const actor = await this.getThreatActorByName(groupName);
    const incidents = await db.select().from(ransomwareIncidents)
      .where(eq(ransomwareIncidents.groupName, groupName))
      .orderBy(desc(ransomwareIncidents.discoveredAt))
      .limit(500);

    const sectorCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};
    
    for (const inc of incidents) {
      if (inc.sector) sectorCounts[inc.sector] = (sectorCounts[inc.sector] || 0) + 1;
      if (inc.country) countryCounts[inc.country] = (countryCounts[inc.country] || 0) + 1;
      if (inc.discoveredAt) {
        const month = new Date(inc.discoveredAt).toISOString().slice(0, 7);
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    }

    const stats: GroupStats = {
      totalVictims: incidents.length,
      sectors: Object.entries(sectorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20),
      countries: Object.entries(countryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20),
      timeline: Object.entries(monthlyCounts).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
      avgDataSize: null,
      recentActivity: incidents.length > 0 && incidents[0].discoveredAt ? incidents[0].discoveredAt.toISOString() : null,
    };

    return { actor, incidents, stats };
  }

  async getGroupAnalytics(): Promise<GroupAnalytics> {
    const allIncidents = await db.select().from(ransomwareIncidents)
      .orderBy(desc(ransomwareIncidents.discoveredAt));

    const groupCounts: Record<string, { victims: number; lastActive: string | null; firstSeen: string | null }> = {};
    const sectorCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const activeGroups = new Set<string>();
    let newToday = 0;
    let newThisWeek = 0;
    let newThisMonth = 0;

    for (const inc of allIncidents) {
      const gn = inc.groupName;
      if (!groupCounts[gn]) groupCounts[gn] = { victims: 0, lastActive: null, firstSeen: null };
      groupCounts[gn].victims++;
      if (!groupCounts[gn].lastActive && inc.discoveredAt) groupCounts[gn].lastActive = inc.discoveredAt.toISOString();
      if (inc.discoveredAt) groupCounts[gn].firstSeen = inc.discoveredAt.toISOString();
      if (inc.sector) sectorCounts[inc.sector] = (sectorCounts[inc.sector] || 0) + 1;
      if (inc.country) countryCounts[inc.country] = (countryCounts[inc.country] || 0) + 1;
      if (inc.sourceApi) sourceCounts[inc.sourceApi] = (sourceCounts[inc.sourceApi] || 0) + 1;
      if (inc.discoveredAt) {
        const month = inc.discoveredAt.toISOString().slice(0, 7);
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        if (inc.discoveredAt >= ninetyDaysAgo) {
          const day = inc.discoveredAt.toISOString().slice(0, 10);
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        }
        if (inc.discoveredAt >= thirtyDaysAgo) {
          activeGroups.add(gn);
          newThisMonth++;
        }
        if (inc.discoveredAt >= sevenDaysAgo) newThisWeek++;
        if (inc.discoveredAt.toISOString().slice(0, 10) === todayStr) newToday++;
      }
    }

    const dailyTrendArr = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const daysWithData = dailyTrendArr.length || 1;
    const totalInPeriod = dailyTrendArr.reduce((s, d) => s + d.count, 0);

    const recentGroups = Object.entries(groupCounts)
      .filter(([, d]) => d.firstSeen && new Date(d.firstSeen) >= ninetyDaysAgo)
      .map(([name, d]) => ({ name, victims: d.victims, firstSeen: d.firstSeen }))
      .sort((a, b) => (b.firstSeen || "").localeCompare(a.firstSeen || ""))
      .slice(0, 10);

    return {
      topGroups: Object.entries(groupCounts)
        .map(([name, d]) => ({ name, victims: d.victims, lastActive: d.lastActive }))
        .sort((a, b) => b.victims - a.victims)
        .slice(0, 25),
      topSectors: Object.entries(sectorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20),
      topCountries: Object.entries(countryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20),
      monthlyTrend: Object.entries(monthlyCounts).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
      dailyTrend: dailyTrendArr.slice(-30),
      totalGroups: Object.keys(groupCounts).length,
      totalVictims: allIncidents.length,
      totalCountries: Object.keys(countryCounts).length,
      totalSectors: Object.keys(sectorCounts).length,
      activeGroupsLast30d: activeGroups.size,
      newToday,
      newThisWeek,
      newThisMonth,
      avgDailyAttacks: Math.round(totalInPeriod / daysWithData),
      topSourceApis: Object.entries(sourceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      recentGroups,
    };
  }

  // News
  async getNews(limit = 500, offset = 0, category?: string): Promise<NewsArticle[]> {
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

  async upsertNews(article: InsertNews): Promise<{ article: NewsArticle; isNew: boolean }> {
    if (article.sourceUrl) {
      const [existing] = await db.select().from(newsArticles)
        .where(eq(newsArticles.sourceUrl, article.sourceUrl))
        .limit(1);
      if (existing) {
        return { article: existing, isNew: false };
      }
    }
    if (article.title) {
      const [existing] = await db.select().from(newsArticles)
        .where(eq(newsArticles.title, article.title))
        .limit(1);
      if (existing) {
        return { article: existing, isNew: false };
      }
    }
    const [created] = await db.insert(newsArticles).values(article).returning();
    return { article: created, isNew: true };
  }

  async getNewsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(newsArticles);
    return Number(result[0]?.count || 0);
  }

  // Malicious IPs
  async getMaliciousIps(limit = 500, offset = 0, source?: string, threatType?: string): Promise<MaliciousIp[]> {
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

  async getMaliciousIpsByAddress(ipAddress: string): Promise<MaliciousIp[]> {
    return await db.select().from(maliciousIps)
      .where(eq(maliciousIps.ipAddress, ipAddress))
      .orderBy(desc(maliciousIps.lastSeen));
  }

  // Malicious URLs
  async getMaliciousUrls(limit = 500, offset = 0, source?: string, threatType?: string): Promise<MaliciousUrl[]> {
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
  async getCisaKev(limit = 500, offset = 0): Promise<CisaKev[]> {
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

  async batchUpsertCisaKev(kevs: InsertCisaKev[]): Promise<void> {
    const batchSize = 50;
    for (let i = 0; i < kevs.length; i += batchSize) {
      const batch = kevs.slice(i, i + batchSize);
      await db.insert(cisaKev)
        .values(batch)
        .onConflictDoUpdate({
          target: cisaKev.cveId,
          set: {
            vendorProject: sql`excluded.vendor_project`,
            product: sql`excluded.product`,
            vulnerabilityName: sql`excluded.vulnerability_name`,
            shortDescription: sql`excluded.short_description`,
            requiredAction: sql`excluded.required_action`,
            dueDate: sql`excluded.due_date`,
            knownRansomware: sql`excluded.known_ransomware`,
            notes: sql`excluded.notes`,
          },
        });
    }
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
    const activeGroupsResult = await db.select({ count: sql<number>`count(distinct ${ransomwareIncidents.groupName})` })
      .from(ransomwareIncidents);
    
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
      activeGroups: Number(activeGroupsResult[0]?.count || 0),
      criticalCves: Number(criticalCvesResult[0]?.count || 0),
      activeExploits: Number(activeExploitsResult[0]?.count || 0),
      totalIncidents,
      maliciousIps: maliciousIpCount,
      maliciousUrls: maliciousUrlCount,
      cisaKevCount: kevCount,
    };
  }

  async getThreatTrends(days: number): Promise<{
    cvesByDay: { date: string; count: number; critical: number }[];
    ransomwareByDay: { date: string; count: number }[];
    topThreats: { type: string; count: number }[];
    topGroups: { name: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const cvesByDayResult = await db.select({
      date: sql<string>`DATE(${cves.publishedDate})`,
      count: sql<number>`count(*)`,
      critical: sql<number>`SUM(CASE WHEN ${cves.severity} = 'CRITICAL' THEN 1 ELSE 0 END)`
    }).from(cves)
      .where(gte(cves.publishedDate, startDate))
      .groupBy(sql`DATE(${cves.publishedDate})`)
      .orderBy(sql`DATE(${cves.publishedDate})`);

    const ransomwareByDayResult = await db.select({
      date: sql<string>`DATE(${ransomwareIncidents.discoveredAt})`,
      count: sql<number>`count(*)`
    }).from(ransomwareIncidents)
      .where(gte(ransomwareIncidents.discoveredAt, startDate))
      .groupBy(sql`DATE(${ransomwareIncidents.discoveredAt})`)
      .orderBy(sql`DATE(${ransomwareIncidents.discoveredAt})`);

    const topThreatsResult = await db.select({
      type: maliciousIps.threatType,
      count: sql<number>`count(*)`
    }).from(maliciousIps)
      .where(gte(maliciousIps.lastSeen, startDate))
      .groupBy(maliciousIps.threatType)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const topGroupsResult = await db.select({
      name: ransomwareIncidents.groupName,
      count: sql<number>`count(*)`
    }).from(ransomwareIncidents)
      .where(gte(ransomwareIncidents.discoveredAt, startDate))
      .groupBy(ransomwareIncidents.groupName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      cvesByDay: cvesByDayResult.map(r => ({
        date: String(r.date),
        count: Number(r.count),
        critical: Number(r.critical || 0)
      })),
      ransomwareByDay: ransomwareByDayResult.map(r => ({
        date: String(r.date),
        count: Number(r.count)
      })),
      topThreats: topThreatsResult.filter(r => r.type).map(r => ({
        type: r.type || 'unknown',
        count: Number(r.count)
      })),
      topGroups: topGroupsResult.map(r => ({
        name: r.name,
        count: Number(r.count)
      }))
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
    
    const ipCondition = sql`${maliciousIps.lastSeen} < ${cutoffDate} OR (${maliciousIps.lastSeen} IS NULL AND ${maliciousIps.createdAt} < ${cutoffDate})`;
    const urlCondition = sql`${maliciousUrls.reportedAt} < ${cutoffDate} OR (${maliciousUrls.reportedAt} IS NULL AND ${maliciousUrls.createdAt} < ${cutoffDate})`;
    const newsCondition = sql`${newsArticles.publishedAt} < ${cutoffDate}`;

    const [ipsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousIps).where(ipCondition);
    const [urlsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousUrls).where(urlCondition);
    const [newsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(newsArticles).where(newsCondition);

    if (ipsCount.count > 0) await db.delete(maliciousIps).where(ipCondition);
    if (urlsCount.count > 0) await db.delete(maliciousUrls).where(urlCondition);
    if (newsCount.count > 0) await db.delete(newsArticles).where(newsCondition);
    
    return {
      ipsDeleted: ipsCount.count,
      urlsDeleted: urlsCount.count,
      newsDeleted: newsCount.count,
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

  async getAllActiveWatchlistItems(): Promise<WatchlistItem[]> {
    return db.select().from(watchlistItems)
      .where(eq(watchlistItems.alertOnMatch, true))
      .orderBy(watchlistItems.userId);
  }

  async logMonitorAlert(log: { watchlistItemId: string; matchedDataType: string; matchedDataId: string; deliveryChannel: string; deliveryStatus?: string }): Promise<void> {
    await db.insert(monitorAlertLog).values({
      watchlistItemId: log.watchlistItemId,
      matchedDataType: log.matchedDataType,
      matchedDataId: log.matchedDataId,
      deliveryChannel: log.deliveryChannel,
      deliveryStatus: log.deliveryStatus || "sent",
    });
  }

  async hasAlertBeenSent(watchlistItemId: string, matchedDataType: string, matchedDataId: string): Promise<boolean> {
    const [existing] = await db.select({ id: monitorAlertLog.id })
      .from(monitorAlertLog)
      .where(and(
        eq(monitorAlertLog.watchlistItemId, watchlistItemId),
        eq(monitorAlertLog.matchedDataType, matchedDataType),
        eq(monitorAlertLog.matchedDataId, matchedDataId),
      ))
      .limit(1);
    return !!existing;
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

  // CISA ICS Advisories
  async getIcsAdvisories(limit = 50, offset = 0): Promise<IcsAdvisory[]> {
    return db.select().from(cisaIcsAdvisories)
      .orderBy(desc(cisaIcsAdvisories.publishedDate))
      .limit(limit)
      .offset(offset);
  }

  async getIcsAdvisoryCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(cisaIcsAdvisories);
    return Number(result?.count || 0);
  }

  async batchUpsertIcsAdvisories(advisories: InsertIcsAdvisory[]): Promise<void> {
    if (advisories.length === 0) return;
    for (const advisory of advisories) {
      await db.insert(cisaIcsAdvisories)
        .values(advisory)
        .onConflictDoUpdate({
          target: cisaIcsAdvisories.advisoryId,
          set: {
            title: advisory.title,
            summary: advisory.summary,
            vendor: advisory.vendor,
            product: advisory.product,
            cvssScore: advisory.cvssScore,
            cveIds: advisory.cveIds,
            affectedSystems: advisory.affectedSystems,
            mitigations: advisory.mitigations,
            severity: advisory.severity,
            sourceUrl: advisory.sourceUrl,
            lastUpdated: advisory.lastUpdated,
          },
        });
    }
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

  // SMS Messages (Pro/Business feature)
  async getSmsMessages(limit: number = 100, offset: number = 0): Promise<SmsMessage[]> {
    return db.select().from(smsMessages)
      .orderBy(desc(smsMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSmsConversations(): Promise<{ phoneNumber: string; lastMessage: SmsMessage; unreadCount: number }[]> {
    const messages = await db.select().from(smsMessages)
      .orderBy(desc(smsMessages.createdAt));
    
    const conversationMap = new Map<string, { lastMessage: SmsMessage; unreadCount: number }>();
    
    for (const msg of messages) {
      const phoneNumber = msg.direction === 'inbound' ? msg.fromNumber : msg.toNumber;
      
      if (!conversationMap.has(phoneNumber)) {
        conversationMap.set(phoneNumber, {
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      if (msg.direction === 'inbound' && !msg.isRead) {
        const conv = conversationMap.get(phoneNumber)!;
        conv.unreadCount++;
      }
    }
    
    return Array.from(conversationMap.entries())
      .map(([phoneNumber, data]) => ({
        phoneNumber,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount
      }))
      .sort((a, b) => new Date(b.lastMessage.createdAt!).getTime() - new Date(a.lastMessage.createdAt!).getTime());
  }

  async getConversationMessages(phoneNumber: string, limit: number = 100): Promise<SmsMessage[]> {
    return db.select().from(smsMessages)
      .where(or(
        eq(smsMessages.fromNumber, phoneNumber),
        eq(smsMessages.toNumber, phoneNumber)
      ))
      .orderBy(desc(smsMessages.createdAt))
      .limit(limit);
  }

  async createSmsMessage(message: InsertSmsMessage): Promise<SmsMessage> {
    const [created] = await db.insert(smsMessages).values(message).returning();
    return created;
  }

  async markMessageRead(id: string): Promise<void> {
    await db.update(smsMessages)
      .set({ isRead: true })
      .where(eq(smsMessages.id, id));
  }

  async markConversationRead(phoneNumber: string): Promise<void> {
    await db.update(smsMessages)
      .set({ isRead: true })
      .where(and(
        eq(smsMessages.fromNumber, phoneNumber),
        eq(smsMessages.direction, 'inbound')
      ));
  }

  async getUnreadMessageCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(smsMessages)
      .where(and(
        eq(smsMessages.isRead, false),
        eq(smsMessages.direction, 'inbound')
      ));
    return Number(result[0]?.count || 0);
  }

  // Live Chat Sessions
  async createLiveChatSession(session: InsertLiveChatSession): Promise<LiveChatSession> {
    const [created] = await db.insert(liveChatSessions).values(session).returning();
    return created;
  }

  async getLiveChatSessionByToken(token: string): Promise<LiveChatSession | undefined> {
    const [session] = await db.select().from(liveChatSessions)
      .where(eq(liveChatSessions.sessionToken, token))
      .limit(1);
    return session;
  }

  async getLiveChatSessionByPhone(phone: string): Promise<LiveChatSession | undefined> {
    const [session] = await db.select().from(liveChatSessions)
      .where(and(
        eq(liveChatSessions.visitorPhone, phone),
        eq(liveChatSessions.status, 'active')
      ))
      .limit(1);
    return session;
  }

  async updateLiveChatActivity(token: string): Promise<void> {
    await db.update(liveChatSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(liveChatSessions.sessionToken, token));
  }

  async closeLiveChatSession(token: string): Promise<void> {
    await db.update(liveChatSessions)
      .set({ status: 'closed' })
      .where(eq(liveChatSessions.sessionToken, token));
  }

  // Exploit Submissions
  async createExploitSubmission(submission: InsertExploitSubmission): Promise<ExploitSubmission> {
    const [result] = await db.insert(exploitSubmissions).values(submission).returning();
    return result;
  }

  async getExploitSubmissions(limit: number = 100, offset: number = 0): Promise<ExploitSubmission[]> {
    return db.select().from(exploitSubmissions)
      .orderBy(desc(exploitSubmissions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getExploitSubmissionById(id: string): Promise<ExploitSubmission | undefined> {
    const [result] = await db.select().from(exploitSubmissions).where(eq(exploitSubmissions.id, id));
    return result;
  }

  async updateExploitSubmissionStatus(id: string, status: string, reviewedBy?: string, reviewNotes?: string): Promise<void> {
    await db.update(exploitSubmissions)
      .set({ 
        status, 
        reviewedBy, 
        reviewNotes,
        updatedAt: new Date()
      })
      .where(eq(exploitSubmissions.id, id));
  }

  // Content Views & Popularity
  async trackView(contentType: string, contentId: string): Promise<void> {
    const existing = await db.select().from(contentViews)
      .where(and(
        eq(contentViews.contentType, contentType),
        eq(contentViews.contentId, contentId)
      ));
    
    if (existing.length > 0) {
      await db.update(contentViews)
        .set({ 
          viewCount: (existing[0].viewCount || 0) + 1,
          lastViewedAt: new Date()
        })
        .where(eq(contentViews.id, existing[0].id));
    } else {
      await db.insert(contentViews).values({
        contentType,
        contentId,
        viewCount: 1
      });
    }
  }

  async getViewCount(contentType: string, contentId: string): Promise<number> {
    const [result] = await db.select().from(contentViews)
      .where(and(
        eq(contentViews.contentType, contentType),
        eq(contentViews.contentId, contentId)
      ));
    return result?.viewCount || 0;
  }

  async getTrendingContent(contentType: string, limit: number = 10): Promise<{ contentId: string; viewCount: number }[]> {
    const results = await db.select({
      contentId: contentViews.contentId,
      viewCount: contentViews.viewCount
    })
      .from(contentViews)
      .where(eq(contentViews.contentType, contentType))
      .orderBy(desc(contentViews.viewCount))
      .limit(limit);
    
    return results.map(r => ({ 
      contentId: r.contentId, 
      viewCount: r.viewCount || 0 
    }));
  }

  async trackVisitor(visitorHash: string): Promise<boolean> {
    const today = new Date().toISOString().split("T")[0];
    const [existing] = await db.select().from(siteVisitors)
      .where(eq(siteVisitors.visitorHash, visitorHash));

    if (existing) {
      await db.update(siteVisitors)
        .set({ lastSeen: new Date() })
        .where(eq(siteVisitors.visitorHash, visitorHash));

      await db.insert(dailyVisitorCounts)
        .values({ date: today, totalHits: 1 })
        .onConflictDoUpdate({
          target: dailyVisitorCounts.date,
          set: { totalHits: sql`${dailyVisitorCounts.totalHits} + 1` }
        });
      return false;
    }

    await db.insert(siteVisitors).values({ visitorHash });
    await db.insert(dailyVisitorCounts)
      .values({ date: today, uniqueCount: 1, totalHits: 1 })
      .onConflictDoUpdate({
        target: dailyVisitorCounts.date,
        set: {
          uniqueCount: sql`${dailyVisitorCounts.uniqueCount} + 1`,
          totalHits: sql`${dailyVisitorCounts.totalHits} + 1`
        }
      });
    return true;
  }

  async getVisitorStats(): Promise<{ totalUnique: number; today: number; thisWeek: number; thisMonth: number }> {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(siteVisitors);
    const totalUnique = Number(totalResult?.count || 0);

    const [todayResult] = await db.select({ count: sql<number>`coalesce(unique_count, 0)` })
      .from(dailyVisitorCounts).where(eq(dailyVisitorCounts.date, todayStr));
    const today = Number(todayResult?.count || 0);

    const weekResults = await db.select({ count: sql<number>`coalesce(sum(unique_count), 0)` })
      .from(dailyVisitorCounts).where(gte(dailyVisitorCounts.date, weekAgo));
    const thisWeek = Number(weekResults[0]?.count || 0);

    const monthResults = await db.select({ count: sql<number>`coalesce(sum(unique_count), 0)` })
      .from(dailyVisitorCounts).where(gte(dailyVisitorCounts.date, monthAgo));
    const thisMonth = Number(monthResults[0]?.count || 0);

    return { totalUnique, today, thisWeek, thisMonth };
  }

  async getDailyVisitorCounts(days: number): Promise<DailyVisitorCount[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return db.select().from(dailyVisitorCounts)
      .where(gte(dailyVisitorCounts.date, cutoff))
      .orderBy(desc(dailyVisitorCounts.date));
  }

  async getNewSignupsCount(since: Date): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(users).where(gte(users.createdAt, since));
    return Number(result?.count || 0);
  }

  // ===== API Keys =====
  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [key] = await db.insert(apiKeys).values(data).returning();
    return key;
  }

  async getApiKeysByUser(userId: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.prefix, prefix), eq(apiKeys.status, "active")));
    return key;
  }

  async revokeApiKey(id: string, userId: string): Promise<void> {
    await db.update(apiKeys)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }

  async getApiKeyUsageToday(apiKeyId: string): Promise<ApiKeyUsage | undefined> {
    const today = new Date().toISOString().split("T")[0];
    const [usage] = await db.select().from(apiKeyUsage)
      .where(and(eq(apiKeyUsage.apiKeyId, apiKeyId), eq(apiKeyUsage.date, today)));
    return usage;
  }

  async incrementApiKeyUsage(apiKeyId: string, isLiveLookup = false): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const existing = await this.getApiKeyUsageToday(apiKeyId);
    if (existing) {
      await db.update(apiKeyUsage)
        .set({
          requestCount: (existing.requestCount || 0) + 1,
          liveLookupCount: isLiveLookup ? (existing.liveLookupCount || 0) + 1 : existing.liveLookupCount,
          lastRequestAt: new Date(),
        })
        .where(eq(apiKeyUsage.id, existing.id));
    } else {
      await db.insert(apiKeyUsage).values({
        apiKeyId,
        date: today,
        requestCount: 1,
        liveLookupCount: isLiveLookup ? 1 : 0,
        lastRequestAt: new Date(),
      });
    }
  }

  async getApiKeyUsageHistory(apiKeyId: string, days = 30): Promise<ApiKeyUsage[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return db.select().from(apiKeyUsage)
      .where(and(eq(apiKeyUsage.apiKeyId, apiKeyId), gte(apiKeyUsage.date, cutoff)))
      .orderBy(desc(apiKeyUsage.date));
  }

  // ===== Add-Ons =====
  async getAddOns(activeOnly = true): Promise<AddOn[]> {
    if (activeOnly) {
      return db.select().from(addOns).where(eq(addOns.isActive, true));
    }
    return db.select().from(addOns);
  }

  async getAddOnBySlug(slug: string): Promise<AddOn | undefined> {
    const [addon] = await db.select().from(addOns).where(eq(addOns.slug, slug));
    return addon;
  }

  async getUserAddOns(userId: string): Promise<(UserAddOn & { addOn?: AddOn })[]> {
    const items = await db.select().from(userAddOns)
      .where(and(eq(userAddOns.userId, userId), eq(userAddOns.status, "active")));
    const enriched = await Promise.all(items.map(async (item) => {
      const [addon] = await db.select().from(addOns).where(eq(addOns.id, item.addOnId));
      return { ...item, addOn: addon };
    }));
    return enriched;
  }

  async createUserAddOn(data: InsertUserAddOn): Promise<UserAddOn> {
    const [item] = await db.insert(userAddOns).values(data).returning();
    return item;
  }

  // ===== Monitor Alert Log =====
  async hasAlertBeenSent(watchlistItemId: string, matchedDataType: string, matchedDataId: string): Promise<boolean> {
    const [existing] = await db.select({ id: monitorAlertLog.id }).from(monitorAlertLog)
      .where(and(
        eq(monitorAlertLog.watchlistItemId, watchlistItemId),
        eq(monitorAlertLog.matchedDataType, matchedDataType),
        eq(monitorAlertLog.matchedDataId, matchedDataId),
      ));
    return !!existing;
  }

  async logMonitorAlert(watchlistItemId: string, matchedDataType: string, matchedDataId: string, deliveryChannel: string): Promise<void> {
    await db.insert(monitorAlertLog).values({
      watchlistItemId,
      matchedDataType,
      matchedDataId,
      deliveryChannel,
    });
  }

  async getAllActiveWatchlistItems(): Promise<(WatchlistItem & { user?: User })[]> {
    const items = await db.select().from(watchlistItems)
      .where(eq(watchlistItems.alertOnMatch, true));
    const enriched = await Promise.all(items.map(async (item) => {
      const [user] = await db.select().from(users).where(eq(users.id, item.userId));
      return { ...item, user };
    }));
    return enriched;
  }
}

export const storage = new DatabaseStorage();
