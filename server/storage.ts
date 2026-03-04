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
  type UptimeMonitor, type InsertUptimeMonitor, type UptimeCheck, type UptimeIncident,
  type DarkWebMonitor, type InsertDarkWebMonitor, type DarkWebFinding,
  type DailyThreatStats,
  type AttackSurfaceScan, type InsertAttackSurfaceScan,
  type AttackSurfaceAsset, type InsertAttackSurfaceAsset,
  type ThreatReport, type InsertThreatReport,
  type ReportSchedule, type InsertReportSchedule,
  type KbPost, type InsertKbPost,
  type KbComment, type InsertKbComment,
  type KbVote, type KbBookmark,
  type KbReport, type InsertKbReport,
  type FeedbackSubmission, type InsertFeedback,
  type SyncToken, type InsertSyncToken,
  KB_POINTS,
  users, sessions, cves, ransomwareIncidents, threatActors, newsArticles,
  maliciousIps, maliciousUrls, cisaKev, subscriptions, threatFeeds,
  userNotifications, watchlistItems, breachIncidents, cisaIcsAdvisories, newsletterSubscriptions,
  smsMessages, exploitSubmissions, liveChatSessions, contentViews, siteVisitors, dailyVisitorCounts,
  apiKeys, apiKeyUsage, addOns, userAddOns, monitorAlertLog,
  uptimeMonitors, uptimeChecks, uptimeIncidents, darkWebMonitors, darkWebFindings,
  dailyThreatStats, attackSurfaceScans, attackSurfaceAssets, threatReports, reportSchedules,
  kbPosts, kbComments, kbVotes, kbBookmarks, kbReports, feedbackSubmissions, syncTokens
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql, and, gte, asc, count, ne, inArray } from "drizzle-orm";

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
  enrichRansomwarePaymentsByGroup(groupName: string, data: { totalUSD: number; ransomCurrency?: string; bitcoinWallet?: string; paymentStatus?: string }): Promise<number>;
  searchRansomware(query: string, limit?: number): Promise<RansomwareIncident[]>;
  getRansomwareCount(): Promise<number>;
  getActiveGroups(): Promise<{ name: string; count: number }[]>;
  getGroupsDirectoryData(): Promise<any[]>;
  
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
  getAllActiveWatchlistItems(): Promise<(WatchlistItem & { user?: User })[]>;
  
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
  getTotalUserCount(): Promise<number>;

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
  logMonitorAlert(log: { watchlistItemId: string; matchedDataType: string; matchedDataId: string; deliveryChannel: string; deliveryStatus?: string }): Promise<void>;

  // Uptime Monitors
  getUptimeMonitorsByUser(userId: string): Promise<UptimeMonitor[]>;
  getUptimeMonitorById(id: string): Promise<UptimeMonitor | undefined>;
  createUptimeMonitor(data: InsertUptimeMonitor): Promise<UptimeMonitor>;
  updateUptimeMonitor(id: string, userId: string, updates: Partial<InsertUptimeMonitor>): Promise<UptimeMonitor>;
  deleteUptimeMonitor(id: string, userId: string): Promise<void>;
  getUptimeMonitorsDue(): Promise<UptimeMonitor[]>;
  updateMonitorState(id: string, state: Partial<UptimeMonitor>): Promise<void>;
  getUserMonitorCount(userId: string): Promise<number>;

  // Uptime Checks
  recordUptimeCheck(check: { monitorId: string; status: string; statusCode?: number; responseTime?: number; errorMessage?: string; sslValid?: boolean; sslDaysRemaining?: number }): Promise<UptimeCheck>;
  getUptimeChecks(monitorId: string, limit?: number): Promise<UptimeCheck[]>;
  getUptimeCheckStats(monitorId: string, hours?: number): Promise<{ totalChecks: number; upChecks: number; avgResponseTime: number; minResponseTime: number; maxResponseTime: number }>;
  cleanupOldChecks(retainDays?: number): Promise<number>;

  // Uptime Incidents
  createUptimeIncident(incident: { monitorId: string; userId: string; type: string; title: string; description?: string }): Promise<UptimeIncident>;
  resolveUptimeIncident(monitorId: string): Promise<void>;
  getActiveIncident(monitorId: string): Promise<UptimeIncident | undefined>;
  getUptimeIncidents(userId: string, limit?: number): Promise<UptimeIncident[]>;
  getUptimeIncidentsByMonitor(monitorId: string, limit?: number): Promise<UptimeIncident[]>;

  // Dark Web Monitors
  getDarkWebMonitorsByUser(userId: string): Promise<DarkWebMonitor[]>;
  getDarkWebMonitorById(id: string): Promise<DarkWebMonitor | undefined>;
  createDarkWebMonitor(data: InsertDarkWebMonitor): Promise<DarkWebMonitor>;
  updateDarkWebMonitor(id: string, userId: string, updates: Partial<InsertDarkWebMonitor>): Promise<DarkWebMonitor>;
  deleteDarkWebMonitor(id: string, userId: string): Promise<void>;
  getDarkWebMonitorsDue(): Promise<DarkWebMonitor[]>;
  updateDarkWebMonitorState(id: string, state: Partial<DarkWebMonitor>): Promise<void>;
  getUserDarkWebMonitorCount(userId: string): Promise<number>;

  // Dark Web Findings
  createDarkWebFinding(finding: { monitorId: string; userId: string; source: string; findingType: string; title: string; description?: string; severity?: string; rawData?: string; breachDate?: Date }): Promise<DarkWebFinding>;
  getDarkWebFindings(userId: string, limit?: number): Promise<DarkWebFinding[]>;
  getDarkWebFindingsByMonitor(monitorId: string, limit?: number): Promise<DarkWebFinding[]>;
  markDarkWebFindingRead(id: string, userId: string): Promise<void>;
  getDarkWebFindingCount(userId: string): Promise<number>;
  hasDarkWebFindingBeenRecorded(monitorId: string, source: string, title: string): Promise<boolean>;

  // Daily Threat Stats (historical snapshots)
  captureDailyThreatStats(): Promise<DailyThreatStats>;
  getDailyThreatStats(days?: number): Promise<DailyThreatStats[]>;
  getDailyThreatStatsByRange(startDate: string, endDate: string): Promise<DailyThreatStats[]>;

  // Attack Surface Scans
  createAttackSurfaceScan(data: InsertAttackSurfaceScan): Promise<AttackSurfaceScan>;
  getAttackSurfaceScans(userId: string, limit?: number): Promise<AttackSurfaceScan[]>;
  getAttackSurfaceScanById(id: string): Promise<AttackSurfaceScan | undefined>;
  updateAttackSurfaceScan(id: string, updates: Partial<AttackSurfaceScan>): Promise<void>;
  addAttackSurfaceAssets(assets: InsertAttackSurfaceAsset[]): Promise<void>;
  getAttackSurfaceAssets(scanId: string): Promise<AttackSurfaceAsset[]>;
  getUserScanCount(userId: string): Promise<number>;

  // Threat Reports
  createThreatReport(data: InsertThreatReport): Promise<ThreatReport>;
  getThreatReports(userId: string, limit?: number): Promise<ThreatReport[]>;
  getThreatReportById(id: string): Promise<ThreatReport | undefined>;
  updateThreatReport(id: string, updates: Partial<ThreatReport>): Promise<void>;

  // Report Schedules
  getReportSchedule(userId: string): Promise<ReportSchedule | undefined>;
  upsertReportSchedule(data: InsertReportSchedule): Promise<ReportSchedule>;
  getDueReportSchedules(): Promise<ReportSchedule[]>;
  updateReportSchedule(id: string, updates: Partial<ReportSchedule>): Promise<void>;

  // Knowledge Base Posts
  createKbPost(post: InsertKbPost): Promise<KbPost>;
  getKbPostBySlug(slug: string): Promise<KbPost | undefined>;
  getKbPostById(id: number): Promise<KbPost | undefined>;
  getKbPosts(options: { type?: string; status?: string; search?: string; tag?: string; authorId?: string; sort?: string; limit?: number; offset?: number }): Promise<KbPost[]>;
  getKbPostCount(options: { type?: string; status?: string; search?: string; tag?: string; authorId?: string }): Promise<number>;
  updateKbPost(id: number, updates: Partial<InsertKbPost>): Promise<KbPost>;
  deleteKbPost(id: number): Promise<void>;
  getPendingKbPosts(limit?: number, offset?: number): Promise<KbPost[]>;
  getPendingKbPostCount(): Promise<number>;

  // Knowledge Base Comments
  createKbComment(comment: InsertKbComment): Promise<KbComment>;
  getKbCommentsByPost(postId: number, sort?: string): Promise<KbComment[]>;
  getKbCommentById(id: number): Promise<KbComment | undefined>;
  updateKbComment(id: number, content: string): Promise<KbComment>;
  deleteKbComment(id: number): Promise<void>;

  // Knowledge Base Votes
  toggleKbPostVote(userId: string, postId: number): Promise<{ voted: boolean; newCount: number }>;
  toggleKbCommentVote(userId: string, commentId: number): Promise<{ voted: boolean; newCount: number }>;
  getKbUserVotes(userId: string, postIds?: number[], commentIds?: number[]): Promise<{ postVotes: number[]; commentVotes: number[] }>;

  // Knowledge Base Bookmarks
  toggleKbBookmark(userId: string, postId: number): Promise<{ bookmarked: boolean }>;
  getKbBookmarks(userId: string, limit?: number, offset?: number): Promise<KbPost[]>;
  getKbBookmarkCount(userId: string): Promise<number>;
  isKbBookmarked(userId: string, postIds: number[]): Promise<number[]>;

  // Knowledge Base Discovery
  incrementKbPostViews(id: number): Promise<void>;
  getPopularKbTags(limit?: number): Promise<{ tag: string; count: number }[]>;

  // Knowledge Base User Management
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
  setUserTrusted(userId: string, isTrusted: boolean): Promise<void>;
  getKbLeaderboard(limit?: number): Promise<{ userId: string; username: string; reputation: number; isTrusted: boolean; isAdmin: boolean; tier: string | null; avatarUrl: string | null }[]>;
  checkAutoPromotion(userId: string): Promise<boolean>;
  awardReputation(userId: string, points: number): Promise<void>;

  // Knowledge Base Reports
  createKbReport(report: InsertKbReport): Promise<KbReport>;
  getKbReports(options: { status?: string; limit?: number; offset?: number }): Promise<KbReport[]>;
  getKbReportCount(options: { status?: string }): Promise<number>;
  updateKbReportStatus(id: number, status: string, adminNotes?: string): Promise<KbReport>;
  getUserReportCount(userId: string, sinceHoursAgo?: number): Promise<number>;

  // Knowledge Base Drafts
  getKbDrafts(userId: string, limit?: number, offset?: number): Promise<KbPost[]>;
  getKbDraftCount(userId: string): Promise<number>;

  createFeedback(feedback: InsertFeedback): Promise<FeedbackSubmission>;
  getFeedbackSubmissions(options: { status?: string; category?: string; limit?: number; offset?: number }): Promise<FeedbackSubmission[]>;
  getFeedbackCount(options: { status?: string; category?: string }): Promise<number>;
  updateFeedbackStatus(id: number, status: string, adminNotes?: string): Promise<FeedbackSubmission>;

  // STB-Sync
  createSyncToken(token: InsertSyncToken): Promise<SyncToken>;
  getSyncTokenByToken(token: string): Promise<SyncToken | undefined>;
  getSyncTokensByUser(userId: number): Promise<SyncToken[]>;
  revokeSyncToken(id: string, userId: number): Promise<void>;
  updateSyncTokenPoll(id: string): Promise<void>;
  getTopMaliciousIps(limit: number): Promise<{ ipAddress: string; threatType: string | null; riskScore: number | null }[]>;
  getTopMaliciousDomains(limit: number): Promise<{ domain: string; threatType: string | null }[]>;
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
    const [result] = await db.insert(cves)
      .values(cve)
      .onConflictDoUpdate({
        target: cves.cveId,
        set: { ...cve, lastModified: new Date() },
      })
      .returning();
    return result;
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
    const [existing] = await db.select({ id: ransomwareIncidents.id })
      .from(ransomwareIncidents)
      .where(and(
        eq(ransomwareIncidents.victim, incident.victim),
        eq(ransomwareIncidents.groupName, incident.groupName)
      ))
      .limit(1);

    const [result] = await db.insert(ransomwareIncidents)
      .values(incident)
      .onConflictDoUpdate({
        target: [ransomwareIncidents.victim, ransomwareIncidents.groupName],
        set: {
          country: sql`COALESCE(excluded.country, ${ransomwareIncidents.country})`,
          website: sql`COALESCE(excluded.website, ${ransomwareIncidents.website})`,
          description: sql`COALESCE(excluded.description, ${ransomwareIncidents.description})`,
          status: sql`COALESCE(excluded.status, ${ransomwareIncidents.status})`,
          postUrl: sql`COALESCE(excluded.post_url, ${ransomwareIncidents.postUrl})`,
          screenshotUrl: sql`COALESCE(excluded.screenshot_url, ${ransomwareIncidents.screenshotUrl})`,
          activity: sql`COALESCE(excluded.activity, ${ransomwareIncidents.activity})`,
        },
      })
      .returning();

    return { incident: result, isNew: !existing };
  }

  async enrichRansomwarePaymentsByGroup(groupName: string, data: { totalUSD: number; ransomCurrency?: string; bitcoinWallet?: string; paymentStatus?: string }): Promise<number> {
    const normalizedName = groupName.toLowerCase().replace(/[^a-z0-9]/g, '');

    return await db.transaction(async (tx) => {
      const matchingIncidents = await tx.select({ id: ransomwareIncidents.id })
        .from(ransomwareIncidents)
        .where(and(
          sql`LOWER(REGEXP_REPLACE(${ransomwareIncidents.groupName}, '[^a-zA-Z0-9]', '', 'g')) = ${normalizedName}`,
          sql`${ransomwareIncidents.ransomAmount} IS NULL`
        ));

      if (matchingIncidents.length === 0) return 0;

      const perIncidentAmount = data.totalUSD / matchingIncidents.length;
      const formattedAmount = `$${perIncidentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

      const ids = matchingIncidents.map(i => i.id);
      const result = await tx.update(ransomwareIncidents)
        .set({
          ransomAmount: formattedAmount,
          ransomCurrency: data.ransomCurrency ?? undefined,
          bitcoinWallet: data.bitcoinWallet ?? undefined,
          paymentStatus: data.paymentStatus ?? undefined,
        })
        .where(sql`${ransomwareIncidents.id} = ANY(${ids})`)
        .returning();

      return result.length;
    });
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
    .limit(500);
    
    return result.map(r => ({ name: r.name, count: Number(r.count) }));
  }

  async getGroupsDirectoryData(): Promise<any[]> {
    const incidentAgg = await db.execute(sql`
      SELECT 
        LOWER(group_name) as group_key,
        MIN(group_name) as display_name,
        COUNT(*) as victim_count,
        COUNT(DISTINCT sector) FILTER (WHERE sector IS NOT NULL) as sector_count,
        COUNT(DISTINCT country) FILTER (WHERE country IS NOT NULL) as country_count,
        string_agg(DISTINCT sector, ' | ' ORDER BY sector) FILTER (WHERE sector IS NOT NULL) as incident_sectors,
        string_agg(DISTINCT country, ' | ' ORDER BY country) FILTER (WHERE country IS NOT NULL) as incident_countries,
        string_agg(DISTINCT attack_vector, ' | ' ORDER BY attack_vector) FILTER (WHERE attack_vector IS NOT NULL) as incident_vectors,
        MIN(discovered_at) as earliest_incident,
        MAX(discovered_at) as latest_incident,
        COUNT(ransom_amount) FILTER (WHERE ransom_amount IS NOT NULL) as ransom_demands,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
        COUNT(DISTINCT website) FILTER (WHERE website IS NOT NULL) as unique_sites
      FROM ransomware_incidents
      GROUP BY LOWER(group_name)
      ORDER BY COUNT(*) DESC
    `);

    const actors = await this.getThreatActors(600);
    const actorMap = new Map<string, typeof actors[0]>();
    for (const a of actors) {
      const key = a.name.toLowerCase();
      const existing = actorMap.get(key);
      if (!existing || (a.description && (!existing.description || a.description.length > existing.description.length))) {
        actorMap.set(key, a);
      }
    }

    const seenKeys = new Set<string>();
    const directory: any[] = [];

    for (const row of incidentAgg.rows as any[]) {
      const groupKey = row.group_key as string;
      if (seenKeys.has(groupKey)) continue;
      seenKeys.add(groupKey);

      const actor = actorMap.get(groupKey);
      const displayName = actor?.name || row.display_name;

      directory.push({
        name: displayName,
        victims: Number(row.victim_count),
        active: actor?.active ?? true,
        type: actor?.type || null,
        origin: actor?.origin || null,
        firstSeen: actor?.firstSeen || row.earliest_incident || null,
        lastActive: actor?.lastActive || row.latest_incident || null,
        description: actor?.description?.slice(0, 300) || null,
        aliases: actor?.aliases || null,
        ransomwareAsService: actor?.ransomwareAsService || false,
        doubleExtortion: actor?.doubleExtortion || false,
        dataExfiltration: actor?.dataExfiltration || false,
        totalRansomCollected: actor?.totalRansomCollected || null,
        averageRansom: actor?.averageRansom || null,
        targetSectors: actor?.targetSectors || row.incident_sectors || null,
        targetCountries: actor?.targetCountries || row.incident_countries || null,
        statusMessage: actor?.statusMessage || null,
        encryptionMethod: actor?.encryptionMethod || null,
        knownCves: actor?.knownCves || null,
        malwareFamilies: actor?.malwareFamilies || null,
        attackVectors: actor?.attackVectors || row.incident_vectors || null,
        affiliations: actor?.affiliations || null,
        infrastructure: actor?.infrastructure || null,
        governmentAdvisories: actor?.governmentAdvisories || null,
        lawEnforcementActions: actor?.lawEnforcementActions || null,
        sectorCount: Number(row.sector_count) || 0,
        countryCount: Number(row.country_count) || 0,
        ransomDemands: Number(row.ransom_demands) || 0,
        paidCount: Number(row.paid_count) || 0,
        uniqueSites: Number(row.unique_sites) || 0,
        earliestIncident: row.earliest_incident || null,
        latestIncident: row.latest_incident || null,
      });
    }

    for (const [key, actor] of Array.from(actorMap.entries())) {
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        directory.push({
          name: actor.name,
          victims: Number(actor.totalVictims) || 0,
          active: actor.active ?? true,
          type: actor.type || null,
          origin: actor.origin || null,
          firstSeen: actor.firstSeen || null,
          lastActive: actor.lastActive || null,
          description: actor.description?.slice(0, 300) || null,
          aliases: actor.aliases || null,
          ransomwareAsService: actor.ransomwareAsService || false,
          doubleExtortion: actor.doubleExtortion || false,
          dataExfiltration: actor.dataExfiltration || false,
          totalRansomCollected: actor.totalRansomCollected || null,
          averageRansom: actor.averageRansom || null,
          targetSectors: actor.targetSectors || null,
          targetCountries: actor.targetCountries || null,
          statusMessage: actor.statusMessage || null,
          encryptionMethod: actor.encryptionMethod || null,
          knownCves: actor.knownCves || null,
          malwareFamilies: actor.malwareFamilies || null,
          attackVectors: actor.attackVectors || null,
          affiliations: actor.affiliations || null,
          infrastructure: actor.infrastructure || null,
          governmentAdvisories: actor.governmentAdvisories || null,
          lawEnforcementActions: actor.lawEnforcementActions || null,
          sectorCount: 0,
          countryCount: 0,
          ransomDemands: 0,
          paidCount: 0,
          uniqueSites: 0,
          earliestIncident: null,
          latestIncident: null,
        });
      }
    }

    directory.sort((a, b) => b.victims - a.victims);
    return directory;
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
    if (article.title) {
      const [existing] = await db.select().from(newsArticles)
        .where(eq(newsArticles.title, article.title))
        .limit(1);
      if (existing) {
        return { article: existing, isNew: false };
      }
    }
    if (article.sourceUrl) {
      const [result] = await db.insert(newsArticles)
        .values(article)
        .onConflictDoNothing({ target: newsArticles.sourceUrl })
        .returning();
      if (result) {
        return { article: result, isNew: true };
      }
      const [existing] = await db.select().from(newsArticles)
        .where(eq(newsArticles.sourceUrl, article.sourceUrl))
        .limit(1);
      return { article: existing, isNew: false };
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
    const [result] = await db.insert(maliciousIps)
      .values(ip)
      .onConflictDoUpdate({
        target: [maliciousIps.ipAddress, maliciousIps.source],
        set: { ...ip, lastSeen: new Date() },
      })
      .returning();
    return result;
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
    const [result] = await db.insert(maliciousUrls)
      .values(url)
      .onConflictDoUpdate({
        target: [maliciousUrls.url, maliciousUrls.source],
        set: url,
      })
      .returning();
    return result;
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
    const [result] = await db.insert(cisaKev)
      .values(kev)
      .onConflictDoUpdate({
        target: cisaKev.cveId,
        set: kev,
      })
      .returning();
    return result;
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
    const [activeGroupsResult, criticalCvesResult, activeExploitsResult, totalIncidents, maliciousIpCount, maliciousUrlCount, kevCount] = await Promise.all([
      db.select({ count: sql<number>`count(distinct ${ransomwareIncidents.groupName})` }).from(ransomwareIncidents),
      db.select({ count: sql<number>`count(*)` }).from(cves).where(eq(cves.severity, "CRITICAL")),
      db.select({ count: sql<number>`count(*)` }).from(cves).where(eq(cves.exploitAvailable, true)),
      this.getRansomwareCount(),
      this.getMaliciousIpCount(),
      this.getMaliciousUrlCount(),
      this.getCisaKevCount(),
    ]);
    
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

    const [cvesByDayResult, ransomwareByDayResult, topThreatsResult, topGroupsResult] = await Promise.all([
      db.select({
        date: sql<string>`DATE(${cves.publishedDate})`,
        count: sql<number>`count(*)`,
        critical: sql<number>`SUM(CASE WHEN ${cves.severity} = 'CRITICAL' THEN 1 ELSE 0 END)`
      }).from(cves)
        .where(gte(cves.publishedDate, startDate))
        .groupBy(sql`DATE(${cves.publishedDate})`)
        .orderBy(sql`DATE(${cves.publishedDate})`),

      db.select({
        date: sql<string>`DATE(${ransomwareIncidents.discoveredAt})`,
        count: sql<number>`count(*)`
      }).from(ransomwareIncidents)
        .where(gte(ransomwareIncidents.discoveredAt, startDate))
        .groupBy(sql`DATE(${ransomwareIncidents.discoveredAt})`)
        .orderBy(sql`DATE(${ransomwareIncidents.discoveredAt})`),

      db.select({
        type: maliciousIps.threatType,
        count: sql<number>`count(*)`
      }).from(maliciousIps)
        .where(gte(maliciousIps.lastSeen, startDate))
        .groupBy(maliciousIps.threatType)
        .orderBy(desc(sql`count(*)`))
        .limit(10),

      db.select({
        name: ransomwareIncidents.groupName,
        count: sql<number>`count(*)`
      }).from(ransomwareIncidents)
        .where(gte(ransomwareIncidents.discoveredAt, startDate))
        .groupBy(ransomwareIncidents.groupName)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
    ]);

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

  async getTotalUserCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(users);
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

  async logMonitorAlert(log: { watchlistItemId: string; matchedDataType: string; matchedDataId: string; deliveryChannel: string; deliveryStatus?: string }): Promise<void> {
    await db.insert(monitorAlertLog).values({
      watchlistItemId: log.watchlistItemId,
      matchedDataType: log.matchedDataType,
      matchedDataId: log.matchedDataId,
      deliveryChannel: log.deliveryChannel,
      deliveryStatus: log.deliveryStatus || "sent",
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

  // ===== Uptime Monitors =====
  async getUptimeMonitorsByUser(userId: string): Promise<UptimeMonitor[]> {
    return db.select().from(uptimeMonitors)
      .where(and(eq(uptimeMonitors.userId, userId), eq(uptimeMonitors.status, "active")))
      .orderBy(desc(uptimeMonitors.createdAt));
  }

  async getUptimeMonitorById(id: string): Promise<UptimeMonitor | undefined> {
    const [mon] = await db.select().from(uptimeMonitors).where(eq(uptimeMonitors.id, id));
    return mon;
  }

  async createUptimeMonitor(data: InsertUptimeMonitor): Promise<UptimeMonitor> {
    const [mon] = await db.insert(uptimeMonitors).values({
      ...data,
      nextCheckAt: new Date(),
    }).returning();
    return mon;
  }

  async updateUptimeMonitor(id: string, userId: string, updates: Partial<InsertUptimeMonitor>): Promise<UptimeMonitor> {
    const [mon] = await db.update(uptimeMonitors)
      .set(updates)
      .where(and(eq(uptimeMonitors.id, id), eq(uptimeMonitors.userId, userId)))
      .returning();
    return mon;
  }

  async deleteUptimeMonitor(id: string, userId: string): Promise<void> {
    await db.update(uptimeMonitors)
      .set({ status: "deleted" })
      .where(and(eq(uptimeMonitors.id, id), eq(uptimeMonitors.userId, userId)));
  }

  async getUptimeMonitorsDue(): Promise<UptimeMonitor[]> {
    return db.select().from(uptimeMonitors)
      .where(and(
        eq(uptimeMonitors.status, "active"),
        sql`${uptimeMonitors.nextCheckAt} IS NULL OR ${uptimeMonitors.nextCheckAt} <= NOW()`
      ))
      .limit(100);
  }

  async updateMonitorState(id: string, state: Partial<UptimeMonitor>): Promise<void> {
    await db.update(uptimeMonitors).set(state).where(eq(uptimeMonitors.id, id));
  }

  async getUserMonitorCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(uptimeMonitors)
      .where(and(eq(uptimeMonitors.userId, userId), eq(uptimeMonitors.status, "active")));
    return Number(result[0]?.count || 0);
  }

  // ===== Uptime Checks =====
  async recordUptimeCheck(check: { monitorId: string; status: string; statusCode?: number; responseTime?: number; errorMessage?: string; sslValid?: boolean; sslDaysRemaining?: number }): Promise<UptimeCheck> {
    const [rec] = await db.insert(uptimeChecks).values(check).returning();
    return rec;
  }

  async getUptimeChecks(monitorId: string, limit = 100): Promise<UptimeCheck[]> {
    return db.select().from(uptimeChecks)
      .where(eq(uptimeChecks.monitorId, monitorId))
      .orderBy(desc(uptimeChecks.checkedAt))
      .limit(limit);
  }

  async getUptimeCheckStats(monitorId: string, hours = 24): Promise<{ totalChecks: number; upChecks: number; avgResponseTime: number; minResponseTime: number; maxResponseTime: number }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const result = await db.select({
      totalChecks: sql<number>`count(*)`,
      upChecks: sql<number>`count(*) filter (where ${uptimeChecks.status} = 'up')`,
      avgResponseTime: sql<number>`coalesce(avg(${uptimeChecks.responseTime}), 0)`,
      minResponseTime: sql<number>`coalesce(min(${uptimeChecks.responseTime}), 0)`,
      maxResponseTime: sql<number>`coalesce(max(${uptimeChecks.responseTime}), 0)`,
    }).from(uptimeChecks)
      .where(and(eq(uptimeChecks.monitorId, monitorId), gte(uptimeChecks.checkedAt, since)));
    return {
      totalChecks: Number(result[0]?.totalChecks || 0),
      upChecks: Number(result[0]?.upChecks || 0),
      avgResponseTime: Math.round(Number(result[0]?.avgResponseTime || 0)),
      minResponseTime: Math.round(Number(result[0]?.minResponseTime || 0)),
      maxResponseTime: Math.round(Number(result[0]?.maxResponseTime || 0)),
    };
  }

  async cleanupOldChecks(retainDays = 30): Promise<number> {
    const cutoff = new Date(Date.now() - retainDays * 24 * 60 * 60 * 1000);
    const result = await db.delete(uptimeChecks).where(sql`${uptimeChecks.checkedAt} < ${cutoff}`).returning();
    return result.length;
  }

  // ===== Uptime Incidents =====
  async createUptimeIncident(incident: { monitorId: string; userId: string; type: string; title: string; description?: string }): Promise<UptimeIncident> {
    const [inc] = await db.insert(uptimeIncidents).values(incident).returning();
    return inc;
  }

  async resolveUptimeIncident(monitorId: string): Promise<void> {
    const now = new Date();
    await db.update(uptimeIncidents)
      .set({
        status: "resolved",
        resolvedAt: now,
        duration: sql`EXTRACT(EPOCH FROM (${now}::timestamp - ${uptimeIncidents.startedAt}))::integer`,
      })
      .where(and(eq(uptimeIncidents.monitorId, monitorId), eq(uptimeIncidents.status, "ongoing")));
  }

  async getActiveIncident(monitorId: string): Promise<UptimeIncident | undefined> {
    const [inc] = await db.select().from(uptimeIncidents)
      .where(and(eq(uptimeIncidents.monitorId, monitorId), eq(uptimeIncidents.status, "ongoing")));
    return inc;
  }

  async getUptimeIncidents(userId: string, limit = 50): Promise<UptimeIncident[]> {
    return db.select().from(uptimeIncidents)
      .where(eq(uptimeIncidents.userId, userId))
      .orderBy(desc(uptimeIncidents.startedAt))
      .limit(limit);
  }

  async getUptimeIncidentsByMonitor(monitorId: string, limit = 20): Promise<UptimeIncident[]> {
    return db.select().from(uptimeIncidents)
      .where(eq(uptimeIncidents.monitorId, monitorId))
      .orderBy(desc(uptimeIncidents.startedAt))
      .limit(limit);
  }

  // ===== Dark Web Monitors =====
  async getDarkWebMonitorsByUser(userId: string): Promise<DarkWebMonitor[]> {
    return db.select().from(darkWebMonitors)
      .where(and(eq(darkWebMonitors.userId, userId), eq(darkWebMonitors.status, "active")))
      .orderBy(desc(darkWebMonitors.createdAt));
  }

  async getDarkWebMonitorById(id: string): Promise<DarkWebMonitor | undefined> {
    const [mon] = await db.select().from(darkWebMonitors).where(eq(darkWebMonitors.id, id));
    return mon;
  }

  async createDarkWebMonitor(data: InsertDarkWebMonitor): Promise<DarkWebMonitor> {
    const [mon] = await db.insert(darkWebMonitors).values({
      ...data,
      nextScanAt: new Date(),
    }).returning();
    return mon;
  }

  async updateDarkWebMonitor(id: string, userId: string, updates: Partial<InsertDarkWebMonitor>): Promise<DarkWebMonitor> {
    const [mon] = await db.update(darkWebMonitors)
      .set(updates)
      .where(and(eq(darkWebMonitors.id, id), eq(darkWebMonitors.userId, userId)))
      .returning();
    return mon;
  }

  async deleteDarkWebMonitor(id: string, userId: string): Promise<void> {
    await db.update(darkWebMonitors)
      .set({ status: "deleted" })
      .where(and(eq(darkWebMonitors.id, id), eq(darkWebMonitors.userId, userId)));
  }

  async getDarkWebMonitorsDue(): Promise<DarkWebMonitor[]> {
    return db.select().from(darkWebMonitors)
      .where(and(
        eq(darkWebMonitors.status, "active"),
        sql`${darkWebMonitors.nextScanAt} IS NULL OR ${darkWebMonitors.nextScanAt} <= NOW()`
      ))
      .limit(50);
  }

  async updateDarkWebMonitorState(id: string, state: Partial<DarkWebMonitor>): Promise<void> {
    await db.update(darkWebMonitors).set(state).where(eq(darkWebMonitors.id, id));
  }

  async getUserDarkWebMonitorCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(darkWebMonitors)
      .where(and(eq(darkWebMonitors.userId, userId), eq(darkWebMonitors.status, "active")));
    return Number(result[0]?.count || 0);
  }

  // ===== Dark Web Findings =====
  async createDarkWebFinding(finding: { monitorId: string; userId: string; source: string; findingType: string; title: string; description?: string; severity?: string; rawData?: string; breachDate?: Date }): Promise<DarkWebFinding> {
    const [f] = await db.insert(darkWebFindings).values(finding).returning();
    return f;
  }

  async getDarkWebFindings(userId: string, limit = 50): Promise<DarkWebFinding[]> {
    return db.select().from(darkWebFindings)
      .where(eq(darkWebFindings.userId, userId))
      .orderBy(desc(darkWebFindings.discoveredAt))
      .limit(limit);
  }

  async getDarkWebFindingsByMonitor(monitorId: string, limit = 50): Promise<DarkWebFinding[]> {
    return db.select().from(darkWebFindings)
      .where(eq(darkWebFindings.monitorId, monitorId))
      .orderBy(desc(darkWebFindings.discoveredAt))
      .limit(limit);
  }

  async markDarkWebFindingRead(id: string, userId: string): Promise<void> {
    await db.update(darkWebFindings)
      .set({ isRead: true })
      .where(and(eq(darkWebFindings.id, id), eq(darkWebFindings.userId, userId)));
  }

  async getDarkWebFindingCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(darkWebFindings)
      .where(eq(darkWebFindings.userId, userId));
    return Number(result[0]?.count || 0);
  }

  async hasDarkWebFindingBeenRecorded(monitorId: string, source: string, title: string): Promise<boolean> {
    const [existing] = await db.select({ id: darkWebFindings.id }).from(darkWebFindings)
      .where(and(
        eq(darkWebFindings.monitorId, monitorId),
        eq(darkWebFindings.source, source),
        eq(darkWebFindings.title, title),
      ))
      .limit(1);
    return !!existing;
  }

  async captureDailyThreatStats(): Promise<DailyThreatStats> {
    const today = new Date().toISOString().split("T")[0];
    const todayStart = new Date(today + "T00:00:00Z");

    const [existing] = await db.select().from(dailyThreatStats).where(eq(dailyThreatStats.date, today)).limit(1);
    if (existing) return existing;

    const [cveTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(cves);
    const [cveNew] = await db.select({ count: sql<number>`count(*)::int` }).from(cves).where(gte(cves.createdAt, todayStart));
    const [cveCritical] = await db.select({ count: sql<number>`count(*)::int` }).from(cves).where(gte(cves.score, 9.0));

    const [ransomTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(ransomwareIncidents);
    const [ransomNew] = await db.select({ count: sql<number>`count(*)::int` }).from(ransomwareIncidents).where(gte(ransomwareIncidents.createdAt, todayStart));
    const groupCounts = await db.select({ name: ransomwareIncidents.groupName, count: sql<number>`count(*)::int` })
      .from(ransomwareIncidents).groupBy(ransomwareIncidents.groupName).orderBy(desc(sql`count(*)`));
    const uniqueGroups = new Set(groupCounts.map(g => g.name.toLowerCase()));

    const [actorTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(threatActors);
    const [actorActive] = await db.select({ count: sql<number>`count(*)::int` }).from(threatActors).where(eq(threatActors.active, true));

    const [ipTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousIps);
    const [ipNew] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousIps).where(gte(maliciousIps.createdAt, todayStart));
    const [urlTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousUrls);
    const [urlNew] = await db.select({ count: sql<number>`count(*)::int` }).from(maliciousUrls).where(gte(maliciousUrls.createdAt, todayStart));

    const [breachTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(breachIncidents);
    const [kevTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(cisaKev);
    const [icsTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(cisaIcsAdvisories);
    const [feedTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(threatFeeds);
    const [feedActive] = await db.select({ count: sql<number>`count(*)::int` }).from(threatFeeds).where(eq(threatFeeds.isActive, true));

    const [userTotal] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [proSubs] = await db.select({ count: sql<number>`count(*)::int` }).from(subscriptions).where(and(eq(subscriptions.status, "active"), eq(subscriptions.plan, "pro")));
    const [bizSubs] = await db.select({ count: sql<number>`count(*)::int` }).from(subscriptions).where(and(eq(subscriptions.status, "active"), eq(subscriptions.plan, "business")));
    const [keysActive] = await db.select({ count: sql<number>`count(*)::int` }).from(apiKeys).where(eq(apiKeys.status, "active"));

    const topGroup = groupCounts[0];

    const sectorCounts = await db.select({ sector: ransomwareIncidents.sector, count: sql<number>`count(*)::int` })
      .from(ransomwareIncidents).where(sql`${ransomwareIncidents.sector} IS NOT NULL`)
      .groupBy(ransomwareIncidents.sector).orderBy(desc(sql`count(*)`)).limit(1);
    const countryCounts = await db.select({ country: ransomwareIncidents.country, count: sql<number>`count(*)::int` })
      .from(ransomwareIncidents).where(sql`${ransomwareIncidents.country} IS NOT NULL`)
      .groupBy(ransomwareIncidents.country).orderBy(desc(sql`count(*)`)).limit(1);

    const [inserted] = await db.insert(dailyThreatStats).values({
      date: today,
      totalCves: cveTotal.count,
      newCvesToday: cveNew.count,
      criticalCves: cveCritical.count,
      totalRansomwareIncidents: ransomTotal.count,
      newRansomwareToday: ransomNew.count,
      activeRansomwareGroups: actorActive.count,
      totalRansomwareGroups: uniqueGroups.size,
      totalMaliciousIps: ipTotal.count,
      newMaliciousIpsToday: ipNew.count,
      totalMaliciousUrls: urlTotal.count,
      newMaliciousUrlsToday: urlNew.count,
      totalThreatActors: actorTotal.count,
      totalBreaches: breachTotal.count,
      totalCisaKev: kevTotal.count,
      totalIcsAdvisories: icsTotal.count,
      totalThreatFeeds: feedTotal.count,
      activeFeedSources: feedActive.count,
      topGroupName: topGroup?.name || null,
      topGroupVictims: topGroup ? topGroup.count : 0,
      topSector: sectorCounts[0]?.sector || null,
      topCountry: countryCounts[0]?.country || null,
      registeredUsers: userTotal.count,
      proSubscribers: proSubs.count,
      businessSubscribers: bizSubs.count,
      apiKeysActive: keysActive.count,
    }).returning();

    return inserted;
  }

  async getDailyThreatStats(days = 90): Promise<DailyThreatStats[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return db.select().from(dailyThreatStats)
      .where(gte(dailyThreatStats.date, cutoff))
      .orderBy(desc(dailyThreatStats.date));
  }

  async getDailyThreatStatsByRange(startDate: string, endDate: string): Promise<DailyThreatStats[]> {
    return db.select().from(dailyThreatStats)
      .where(and(
        gte(dailyThreatStats.date, startDate),
        sql`${dailyThreatStats.date} <= ${endDate}`
      ))
      .orderBy(dailyThreatStats.date);
  }

  // Attack Surface Scans
  async createAttackSurfaceScan(data: InsertAttackSurfaceScan): Promise<AttackSurfaceScan> {
    const [scan] = await db.insert(attackSurfaceScans).values(data).returning();
    return scan;
  }

  async getAttackSurfaceScans(userId: string, limit = 20): Promise<AttackSurfaceScan[]> {
    return db.select().from(attackSurfaceScans)
      .where(eq(attackSurfaceScans.userId, userId))
      .orderBy(desc(attackSurfaceScans.createdAt))
      .limit(limit);
  }

  async getAttackSurfaceScanById(id: string): Promise<AttackSurfaceScan | undefined> {
    const [scan] = await db.select().from(attackSurfaceScans)
      .where(eq(attackSurfaceScans.id, id));
    return scan;
  }

  async updateAttackSurfaceScan(id: string, updates: Partial<AttackSurfaceScan>): Promise<void> {
    await db.update(attackSurfaceScans).set(updates).where(eq(attackSurfaceScans.id, id));
  }

  async addAttackSurfaceAssets(assets: InsertAttackSurfaceAsset[]): Promise<void> {
    if (assets.length === 0) return;
    await db.insert(attackSurfaceAssets).values(assets);
  }

  async getAttackSurfaceAssets(scanId: string): Promise<AttackSurfaceAsset[]> {
    return db.select().from(attackSurfaceAssets)
      .where(eq(attackSurfaceAssets.scanId, scanId))
      .orderBy(attackSurfaceAssets.assetType);
  }

  async getUserScanCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(attackSurfaceScans).where(eq(attackSurfaceScans.userId, userId));
    return result?.count ?? 0;
  }

  // Threat Reports
  async createThreatReport(data: InsertThreatReport): Promise<ThreatReport> {
    const [report] = await db.insert(threatReports).values(data).returning();
    return report;
  }

  async getThreatReports(userId: string, limit = 20): Promise<ThreatReport[]> {
    return db.select().from(threatReports)
      .where(eq(threatReports.userId, userId))
      .orderBy(desc(threatReports.createdAt))
      .limit(limit);
  }

  async getThreatReportById(id: string): Promise<ThreatReport | undefined> {
    const [report] = await db.select().from(threatReports)
      .where(eq(threatReports.id, id));
    return report;
  }

  async updateThreatReport(id: string, updates: Partial<ThreatReport>): Promise<void> {
    await db.update(threatReports).set(updates).where(eq(threatReports.id, id));
  }

  // Report Schedules
  async getReportSchedule(userId: string): Promise<ReportSchedule | undefined> {
    const [schedule] = await db.select().from(reportSchedules)
      .where(eq(reportSchedules.userId, userId));
    return schedule;
  }

  async upsertReportSchedule(data: InsertReportSchedule): Promise<ReportSchedule> {
    const existing = await this.getReportSchedule(data.userId);
    if (existing) {
      const nextRun = this.computeNextRun(data.cadence || "weekly");
      await db.update(reportSchedules).set({
        cadence: data.cadence,
        isActive: data.isActive,
        nextRunAt: nextRun,
      }).where(eq(reportSchedules.id, existing.id));
      return { ...existing, ...data, nextRunAt: nextRun };
    }
    const nextRun = this.computeNextRun(data.cadence || "weekly");
    const [schedule] = await db.insert(reportSchedules)
      .values({ ...data, nextRunAt: nextRun })
      .returning();
    return schedule;
  }

  private computeNextRun(cadence: string): Date {
    const now = new Date();
    if (cadence === "monthly") {
      return new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0);
    }
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    return new Date(now.getTime() + daysUntilMonday * 86400000);
  }

  async getDueReportSchedules(): Promise<ReportSchedule[]> {
    return db.select().from(reportSchedules)
      .where(and(
        eq(reportSchedules.isActive, true),
        sql`${reportSchedules.nextRunAt} <= NOW()`
      ));
  }

  async updateReportSchedule(id: string, updates: Partial<ReportSchedule>): Promise<void> {
    await db.update(reportSchedules).set(updates).where(eq(reportSchedules.id, id));
  }

  async createKbPost(post: InsertKbPost): Promise<KbPost> {
    const [created] = await db.insert(kbPosts).values(post).returning();
    return created;
  }

  async getKbPostBySlug(slug: string): Promise<KbPost | undefined> {
    const [post] = await db.select().from(kbPosts).where(eq(kbPosts.slug, slug));
    return post;
  }

  async getKbPostById(id: number): Promise<KbPost | undefined> {
    const [post] = await db.select().from(kbPosts).where(eq(kbPosts.id, id));
    return post;
  }

  async getKbPosts(options: { type?: string; status?: string; search?: string; tag?: string; authorId?: string; sort?: string; limit?: number; offset?: number }): Promise<KbPost[]> {
    const conditions = [];
    if (options.status) conditions.push(eq(kbPosts.status, options.status));
    if (options.type) conditions.push(eq(kbPosts.type, options.type));
    if (options.authorId) conditions.push(eq(kbPosts.authorId, options.authorId));
    if (options.search) {
      conditions.push(or(
        ilike(kbPosts.title, `%${options.search}%`),
        ilike(kbPosts.content, `%${options.search}%`)
      ));
    }
    if (options.tag) {
      conditions.push(sql`${options.tag} = ANY(${kbPosts.tags})`);
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderClauses;
    switch (options.sort) {
      case "popular":
        orderClauses = [desc(kbPosts.isPinned), desc(kbPosts.voteCount), desc(kbPosts.createdAt)];
        break;
      case "discussed":
        orderClauses = [desc(kbPosts.isPinned), desc(kbPosts.commentCount), desc(kbPosts.createdAt)];
        break;
      case "views":
        orderClauses = [desc(kbPosts.isPinned), desc(kbPosts.viewCount), desc(kbPosts.createdAt)];
        break;
      case "trending":
        orderClauses = [desc(kbPosts.isPinned), desc(sql`(COALESCE(${kbPosts.voteCount},0) * 2 + COALESCE(${kbPosts.commentCount},0) * 3 + COALESCE(${kbPosts.viewCount},0) * 0.1) / GREATEST(EXTRACT(EPOCH FROM (NOW() - ${kbPosts.createdAt})) / 86400.0, 1) ^ 0.5`), desc(kbPosts.createdAt)];
        break;
      default:
        orderClauses = [desc(kbPosts.isPinned), desc(kbPosts.createdAt)];
    }

    return db.select().from(kbPosts)
      .where(where)
      .orderBy(...orderClauses)
      .limit(options.limit || 20)
      .offset(options.offset || 0);
  }

  async getKbPostCount(options: { type?: string; status?: string; search?: string; tag?: string; authorId?: string }): Promise<number> {
    const conditions = [];
    if (options.status) conditions.push(eq(kbPosts.status, options.status));
    if (options.type) conditions.push(eq(kbPosts.type, options.type));
    if (options.authorId) conditions.push(eq(kbPosts.authorId, options.authorId));
    if (options.search) {
      conditions.push(or(
        ilike(kbPosts.title, `%${options.search}%`),
        ilike(kbPosts.content, `%${options.search}%`)
      ));
    }
    if (options.tag) {
      conditions.push(sql`${options.tag} = ANY(${kbPosts.tags})`);
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts).where(where);
    return result.count;
  }

  async updateKbPost(id: number, updates: Partial<InsertKbPost>): Promise<KbPost> {
    const [updated] = await db.update(kbPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kbPosts.id, id))
      .returning();
    return updated;
  }

  async deleteKbPost(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(kbVotes).where(eq(kbVotes.postId, id));
      const comments = await tx.select({ id: kbComments.id }).from(kbComments).where(eq(kbComments.postId, id));
      for (const c of comments) {
        await tx.delete(kbVotes).where(eq(kbVotes.commentId, c.id));
      }
      await tx.delete(kbComments).where(eq(kbComments.postId, id));
      await tx.delete(kbPosts).where(eq(kbPosts.id, id));
    });
  }

  async getPendingKbPosts(limit = 50, offset = 0): Promise<KbPost[]> {
    return db.select().from(kbPosts)
      .where(eq(kbPosts.status, "pending_review"))
      .orderBy(asc(kbPosts.createdAt))
      .limit(limit).offset(offset);
  }

  async getPendingKbPostCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts)
      .where(eq(kbPosts.status, "pending_review"));
    return result.count;
  }

  async createKbComment(comment: InsertKbComment): Promise<KbComment> {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(kbComments).values(comment).returning();
      await tx.update(kbPosts)
        .set({ commentCount: sql`${kbPosts.commentCount} + 1` })
        .where(eq(kbPosts.id, comment.postId));
      return created;
    });
  }

  async getKbCommentsByPost(postId: number, sort?: string): Promise<KbComment[]> {
    let orderClause;
    switch (sort) {
      case "newest":
        orderClause = [desc(kbComments.createdAt)];
        break;
      case "best":
        orderClause = [desc(kbComments.voteCount), asc(kbComments.createdAt)];
        break;
      default:
        orderClause = [asc(kbComments.createdAt)];
    }
    return db.select().from(kbComments)
      .where(eq(kbComments.postId, postId))
      .orderBy(...orderClause);
  }

  async getKbCommentById(id: number): Promise<KbComment | undefined> {
    const [comment] = await db.select().from(kbComments).where(eq(kbComments.id, id));
    return comment;
  }

  async updateKbComment(id: number, content: string): Promise<KbComment> {
    const [updated] = await db.update(kbComments)
      .set({ content, updatedAt: new Date() })
      .where(eq(kbComments.id, id))
      .returning();
    return updated;
  }

  async deleteKbComment(id: number): Promise<void> {
    const [comment] = await db.select().from(kbComments).where(eq(kbComments.id, id));
    if (!comment) return;
    await db.transaction(async (tx) => {
      const children = await tx.select({ id: kbComments.id }).from(kbComments).where(eq(kbComments.parentId, id));
      const totalDeleted = 1 + children.length;
      for (const child of children) {
        await tx.delete(kbVotes).where(eq(kbVotes.commentId, child.id));
      }
      await tx.delete(kbVotes).where(eq(kbVotes.commentId, id));
      await tx.delete(kbComments).where(eq(kbComments.parentId, id));
      await tx.delete(kbComments).where(eq(kbComments.id, id));
      await tx.update(kbPosts)
        .set({ commentCount: sql`GREATEST(${kbPosts.commentCount} - ${totalDeleted}, 0)` })
        .where(eq(kbPosts.id, comment.postId));
    });
  }

  async toggleKbPostVote(userId: string, postId: number): Promise<{ voted: boolean; newCount: number }> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(kbVotes)
        .where(and(eq(kbVotes.userId, userId), eq(kbVotes.postId, postId)));
      const [postRow] = await tx.select().from(kbPosts).where(eq(kbPosts.id, postId));
      if (!postRow) throw new Error("Post not found");
      if (postRow.authorId === userId) throw new Error("Cannot vote on your own post");
      if (existing) {
        await tx.delete(kbVotes).where(eq(kbVotes.id, existing.id));
        const [post] = await tx.update(kbPosts)
          .set({ voteCount: sql`GREATEST(${kbPosts.voteCount} - 1, 0)` })
          .where(eq(kbPosts.id, postId)).returning();
        await tx.update(users)
          .set({ kbReputation: sql`GREATEST(${users.kbReputation} - 1, 0)` })
          .where(eq(users.id, postRow.authorId));
        return { voted: false, newCount: post.voteCount || 0 };
      } else {
        await tx.insert(kbVotes).values({ userId, postId });
        const [post] = await tx.update(kbPosts)
          .set({ voteCount: sql`${kbPosts.voteCount} + 1` })
          .where(eq(kbPosts.id, postId)).returning();
        await tx.update(users)
          .set({ kbReputation: sql`LEAST(${users.kbReputation} + 1, 10000)` })
          .where(eq(users.id, postRow.authorId));
        return { voted: true, newCount: post.voteCount || 0 };
      }
    }).then(async (result) => {
      if (result.voted) {
        const [postRow] = await db.select().from(kbPosts).where(eq(kbPosts.id, postId));
        if (postRow) await this.checkAutoPromotion(postRow.authorId);
      }
      return result;
    });
  }

  async toggleKbCommentVote(userId: string, commentId: number): Promise<{ voted: boolean; newCount: number }> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(kbVotes)
        .where(and(eq(kbVotes.userId, userId), eq(kbVotes.commentId, commentId)));
      const [targetComment] = await tx.select().from(kbComments).where(eq(kbComments.id, commentId));
      if (targetComment && targetComment.authorId === userId) throw new Error("Cannot vote on your own comment");
      if (existing) {
        await tx.delete(kbVotes).where(eq(kbVotes.id, existing.id));
        const [comment] = await tx.update(kbComments)
          .set({ voteCount: sql`GREATEST(${kbComments.voteCount} - 1, 0)` })
          .where(eq(kbComments.id, commentId)).returning();
        if (comment) {
          await tx.update(users)
            .set({ kbReputation: sql`GREATEST(${users.kbReputation} - 1, 0)` })
            .where(eq(users.id, comment.authorId));
        }
        return { voted: false, newCount: comment?.voteCount || 0 };
      } else {
        await tx.insert(kbVotes).values({ userId, commentId });
        const [comment] = await tx.update(kbComments)
          .set({ voteCount: sql`${kbComments.voteCount} + 1` })
          .where(eq(kbComments.id, commentId)).returning();
        if (comment) {
          await tx.update(users)
            .set({ kbReputation: sql`LEAST(${users.kbReputation} + 1, 10000)` })
            .where(eq(users.id, comment.authorId));
        }
        return { voted: true, newCount: comment?.voteCount || 0, authorId: comment?.authorId };
      }
    }).then(async (result: any) => {
      if (result.voted && result.authorId) {
        await this.checkAutoPromotion(result.authorId);
      }
      return { voted: result.voted, newCount: result.newCount };
    });
  }

  async getKbUserVotes(userId: string, postIds?: number[], commentIds?: number[]): Promise<{ postVotes: number[]; commentVotes: number[] }> {
    const postVotes: number[] = [];
    const commentVotes: number[] = [];
    if (postIds && postIds.length > 0) {
      const safeIds = postIds.map(Number).filter(n => Number.isFinite(n));
      if (safeIds.length > 0) {
        const votes = await db.select().from(kbVotes)
          .where(and(eq(kbVotes.userId, userId), inArray(kbVotes.postId, safeIds)));
        for (const v of votes) { if (v.postId) postVotes.push(v.postId); }
      }
    }
    if (commentIds && commentIds.length > 0) {
      const safeIds = commentIds.map(Number).filter(n => Number.isFinite(n));
      if (safeIds.length > 0) {
        const votes = await db.select().from(kbVotes)
          .where(and(eq(kbVotes.userId, userId), inArray(kbVotes.commentId, safeIds)));
        for (const v of votes) { if (v.commentId) commentVotes.push(v.commentId); }
      }
    }
    return { postVotes, commentVotes };
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
  }

  async setUserTrusted(userId: string, isTrusted: boolean): Promise<void> {
    await db.update(users).set({ isTrusted }).where(eq(users.id, userId));
  }

  async getKbLeaderboard(limit = 20): Promise<{ userId: string; username: string; reputation: number; isTrusted: boolean; isAdmin: boolean; tier: string | null; avatarUrl: string | null }[]> {
    const results = await db.select({
      userId: users.id,
      username: users.username,
      reputation: users.kbReputation,
      isTrusted: users.isTrusted,
      isAdmin: users.isAdmin,
      tier: users.tier,
      avatarUrl: users.avatarUrl,
    }).from(users)
      .where(sql`${users.kbReputation} > 0`)
      .orderBy(desc(users.kbReputation))
      .limit(limit);
    return results.map(r => ({
      userId: r.userId,
      username: r.username,
      reputation: r.reputation || 0,
      isTrusted: r.isTrusted || false,
      isAdmin: r.isAdmin || false,
      tier: r.tier,
      avatarUrl: r.avatarUrl || null,
    }));
  }

  async checkAutoPromotion(userId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.isTrusted || user.isAdmin) return false;
    const threshold = 50;
    if ((user.kbReputation || 0) >= threshold) {
      await db.update(users).set({ isTrusted: true }).where(eq(users.id, userId));
      return true;
    }
    return false;
  }

  async awardReputation(userId: string, points: number): Promise<void> {
    const MAX_REPUTATION = 10000;
    if (points > 0) {
      await db.update(users)
        .set({ kbReputation: sql`LEAST(${users.kbReputation} + ${points}, ${MAX_REPUTATION})` })
        .where(eq(users.id, userId));
    } else if (points < 0) {
      await db.update(users)
        .set({ kbReputation: sql`GREATEST(${users.kbReputation} + ${points}, 0)` })
        .where(eq(users.id, userId));
    }
  }

  async createKbReport(report: InsertKbReport): Promise<KbReport> {
    const [created] = await db.insert(kbReports).values(report).returning();
    return created;
  }

  async getKbReports(options: { status?: string; limit?: number; offset?: number }): Promise<KbReport[]> {
    const conditions = [];
    if (options.status) conditions.push(eq(kbReports.status, options.status));
    return db.select().from(kbReports)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(kbReports.createdAt))
      .limit(options.limit || 20)
      .offset(options.offset || 0);
  }

  async getKbReportCount(options: { status?: string }): Promise<number> {
    const conditions = [];
    if (options.status) conditions.push(eq(kbReports.status, options.status));
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbReports)
      .where(conditions.length ? and(...conditions) : undefined);
    return result.count;
  }

  async updateKbReportStatus(id: number, status: string, adminNotes?: string): Promise<KbReport> {
    const updates: Record<string, any> = { status };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    const [updated] = await db.update(kbReports).set(updates).where(eq(kbReports.id, id)).returning();
    return updated;
  }

  async getUserReportCount(userId: string, sinceHoursAgo: number = 1): Promise<number> {
    const since = new Date(Date.now() - sinceHoursAgo * 60 * 60 * 1000);
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbReports)
      .where(and(eq(kbReports.reporterId, userId), gte(kbReports.createdAt, since)));
    return result.count;
  }

  async getKbDrafts(userId: string, limit: number = 20, offset: number = 0): Promise<KbPost[]> {
    return db.select().from(kbPosts)
      .where(and(eq(kbPosts.authorId, userId), eq(kbPosts.status, "draft")))
      .orderBy(desc(kbPosts.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getKbDraftCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbPosts)
      .where(and(eq(kbPosts.authorId, userId), eq(kbPosts.status, "draft")));
    return result.count;
  }

  async updateUserProfile(userId: string, updates: Record<string, any>): Promise<void> {
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  async getPublicProfile(username: string): Promise<any | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) return null;
    const isPublic = user.profilePublic !== false;
    const postCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbPosts).where(and(eq(kbPosts.authorId, user.id), eq(kbPosts.status, "published")));
    const commentCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbComments).where(eq(kbComments.authorId, user.id));
    const recentPosts = await db.select().from(kbPosts)
      .where(and(eq(kbPosts.authorId, user.id), eq(kbPosts.status, "published")))
      .orderBy(desc(kbPosts.createdAt)).limit(5);
    return {
      username: user.username,
      displayName: isPublic ? (user.displayName || null) : null,
      bio: isPublic ? (user.bio || null) : null,
      avatarUrl: user.avatarUrl || null,
      location: isPublic ? (user.location || null) : null,
      website: isPublic ? (user.website || null) : null,
      company: isPublic ? (user.company || null) : null,
      email: (isPublic && user.showEmail) ? user.email : null,
      tier: user.tier,
      isAdmin: user.isAdmin || false,
      isTrusted: user.isTrusted || false,
      kbReputation: user.kbReputation || 0,
      profilePublic: isPublic,
      createdAt: user.createdAt,
      stats: {
        posts: postCount[0]?.count || 0,
        comments: commentCount[0]?.count || 0,
      },
      recentPosts: recentPosts.map(p => ({
        id: p.id, title: p.title, slug: p.slug, type: p.type,
        voteCount: p.voteCount, commentCount: p.commentCount, viewCount: p.viewCount,
        createdAt: p.createdAt,
      })),
    };
  }

  async getKbActivityStats(): Promise<{
    totalPosts: number; newPosts24h: number; newPosts7d: number;
    totalComments: number; newComments24h: number; newComments7d: number;
    totalViews: number; pendingCount: number;
    topPostsWeek: { title: string; voteCount: number; viewCount: number; commentCount: number }[];
    topContributorsWeek: { username: string; reputation: number; postCount: number }[];
  }> {
    const now = new Date();
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalPostsR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts).where(eq(kbPosts.status, "published"));
    const [newPosts24hR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts).where(and(eq(kbPosts.status, "published"), sql`${kbPosts.createdAt} > ${day1}`));
    const [newPosts7dR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts).where(and(eq(kbPosts.status, "published"), sql`${kbPosts.createdAt} > ${day7}`));
    const [totalCommentsR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbComments);
    const [newComments24hR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbComments).where(sql`${kbComments.createdAt} > ${day1}`);
    const [newComments7dR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbComments).where(sql`${kbComments.createdAt} > ${day7}`);
    const [totalViewsR] = await db.select({ total: sql<number>`COALESCE(sum(${kbPosts.viewCount}), 0)::int` }).from(kbPosts);
    const [pendingR] = await db.select({ count: sql<number>`count(*)::int` }).from(kbPosts).where(eq(kbPosts.status, "pending_review"));

    const topPostsWeek = await db.select({
      title: kbPosts.title,
      voteCount: kbPosts.voteCount,
      viewCount: kbPosts.viewCount,
      commentCount: kbPosts.commentCount,
    }).from(kbPosts)
      .where(and(eq(kbPosts.status, "published"), sql`${kbPosts.createdAt} > ${day7}`))
      .orderBy(desc(kbPosts.voteCount))
      .limit(5);

    const topContributorsWeek = await db.execute(sql`
      SELECT u.username, u.kb_reputation as reputation,
        (SELECT count(*)::int FROM kb_posts WHERE author_id = u.id AND status = 'published' AND created_at > ${day7}) as post_count
      FROM users u
      WHERE u.kb_reputation > 0
      ORDER BY u.kb_reputation DESC
      LIMIT 5
    `);

    return {
      totalPosts: totalPostsR.count,
      newPosts24h: newPosts24hR.count,
      newPosts7d: newPosts7dR.count,
      totalComments: totalCommentsR.count,
      newComments24h: newComments24hR.count,
      newComments7d: newComments7dR.count,
      totalViews: totalViewsR.total,
      pendingCount: pendingR.count,
      topPostsWeek: topPostsWeek.map(p => ({
        title: p.title, voteCount: p.voteCount || 0,
        viewCount: p.viewCount || 0, commentCount: p.commentCount || 0,
      })),
      topContributorsWeek: (topContributorsWeek.rows as any[]).map(r => ({
        username: r.username, reputation: r.reputation || 0, postCount: r.post_count || 0,
      })),
    };
  }

  async incrementKbPostViews(id: number): Promise<void> {
    await db.update(kbPosts)
      .set({ viewCount: sql`COALESCE(${kbPosts.viewCount}, 0) + 1` })
      .where(eq(kbPosts.id, id));
  }

  async toggleKbBookmark(userId: string, postId: number): Promise<{ bookmarked: boolean }> {
    const [existing] = await db.select().from(kbBookmarks)
      .where(and(eq(kbBookmarks.userId, userId), eq(kbBookmarks.postId, postId)));
    if (existing) {
      await db.delete(kbBookmarks).where(eq(kbBookmarks.id, existing.id));
      return { bookmarked: false };
    }
    await db.insert(kbBookmarks).values({ userId, postId });
    return { bookmarked: true };
  }

  async getKbBookmarks(userId: string, limit = 20, offset = 0): Promise<KbPost[]> {
    const bookmarks = await db.select({ postId: kbBookmarks.postId })
      .from(kbBookmarks)
      .where(eq(kbBookmarks.userId, userId))
      .orderBy(desc(kbBookmarks.createdAt))
      .limit(limit).offset(offset);
    if (bookmarks.length === 0) return [];
    const postIds = bookmarks.map(b => b.postId);
    const posts = await db.select().from(kbPosts)
      .where(inArray(kbPosts.id, postIds));
    const postMap = new Map(posts.map(p => [p.id, p]));
    return postIds.map(id => postMap.get(id)).filter(Boolean) as KbPost[];
  }

  async getKbBookmarkCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(kbBookmarks)
      .where(eq(kbBookmarks.userId, userId));
    return result.count;
  }

  async isKbBookmarked(userId: string, postIds: number[]): Promise<number[]> {
    if (postIds.length === 0) return [];
    const safeIds = postIds.map(Number).filter(n => Number.isFinite(n));
    if (safeIds.length === 0) return [];
    const bookmarks = await db.select({ postId: kbBookmarks.postId })
      .from(kbBookmarks)
      .where(and(eq(kbBookmarks.userId, userId), inArray(kbBookmarks.postId, safeIds)));
    return bookmarks.map(b => b.postId);
  }

  async getPopularKbTags(limit = 30): Promise<{ tag: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT tag, COUNT(*)::int as count
      FROM kb_posts, UNNEST(tags) AS tag
      WHERE status = 'published' AND tag IS NOT NULL AND tag != ''
      GROUP BY tag
      ORDER BY count DESC
      LIMIT ${limit}
    `);
    return (result.rows as any[]).map(r => ({ tag: r.tag, count: r.count }));
  }

  async createFeedback(feedback: InsertFeedback): Promise<FeedbackSubmission> {
    const [created] = await db.insert(feedbackSubmissions).values(feedback).returning();
    return created;
  }

  async getFeedbackSubmissions(options: { status?: string; category?: string; limit?: number; offset?: number }): Promise<FeedbackSubmission[]> {
    const { status, category, limit = 50, offset = 0 } = options;
    const conditions = [];
    if (status) conditions.push(eq(feedbackSubmissions.status, status));
    if (category) conditions.push(eq(feedbackSubmissions.category, category));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(feedbackSubmissions)
      .where(whereClause)
      .orderBy(desc(feedbackSubmissions.createdAt))
      .limit(limit).offset(offset);
  }

  async getFeedbackCount(options: { status?: string; category?: string }): Promise<number> {
    const { status, category } = options;
    const conditions = [];
    if (status) conditions.push(eq(feedbackSubmissions.status, status));
    if (category) conditions.push(eq(feedbackSubmissions.category, category));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(feedbackSubmissions).where(whereClause);
    return result.count;
  }

  async updateFeedbackStatus(id: number, status: string, adminNotes?: string): Promise<FeedbackSubmission> {
    const updates: any = { status, updatedAt: new Date() };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    const [updated] = await db.update(feedbackSubmissions).set(updates).where(eq(feedbackSubmissions.id, id)).returning();
    return updated;
  }

  // STB-Sync
  async createSyncToken(token: InsertSyncToken): Promise<SyncToken> {
    const [result] = await db.insert(syncTokens).values(token).returning();
    return result;
  }

  async getSyncTokenByToken(token: string): Promise<SyncToken | undefined> {
    const [result] = await db.select().from(syncTokens).where(eq(syncTokens.token, token));
    return result;
  }

  async getSyncTokensByUser(userId: number): Promise<SyncToken[]> {
    return db.select().from(syncTokens)
      .where(eq(syncTokens.userId, userId))
      .orderBy(desc(syncTokens.createdAt));
  }

  async revokeSyncToken(id: string, userId: number): Promise<void> {
    await db.update(syncTokens)
      .set({ status: "revoked" })
      .where(and(eq(syncTokens.id, id), eq(syncTokens.userId, userId)));
  }

  async updateSyncTokenPoll(id: string): Promise<void> {
    await db.update(syncTokens)
      .set({ lastPolledAt: new Date(), pollCount: sql`${syncTokens.pollCount} + 1` })
      .where(eq(syncTokens.id, id));
  }

  async getTopMaliciousIps(limit: number): Promise<{ ipAddress: string; threatType: string | null; riskScore: number | null }[]> {
    const results = await db.execute(sql`
      SELECT DISTINCT ON (ip_address)
        ip_address as "ipAddress",
        threat_type as "threatType",
        COALESCE(risk_score, abuse_confidence_score, 50) as "riskScore"
      FROM malicious_ips
      WHERE ip_address IS NOT NULL AND ip_address != ''
      ORDER BY ip_address, COALESCE(risk_score, abuse_confidence_score, 50) DESC NULLS LAST, last_seen DESC NULLS LAST
    `);
    const deduped = (results.rows as any[])
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, limit);
    return deduped;
  }

  async getTopMaliciousDomains(limit: number): Promise<{ domain: string; threatType: string | null }[]> {
    const results = await db.execute(sql`
      SELECT DISTINCT ON (url)
        url as "domain",
        threat_type as "threatType"
      FROM malicious_urls
      WHERE url IS NOT NULL AND url != ''
        AND url NOT LIKE 'http://%' AND url NOT LIKE 'https://%'
      ORDER BY url, last_seen DESC NULLS LAST
      LIMIT ${limit}
    `);
    return results.rows as any[];
  }
}

export const storage = new DatabaseStorage();
