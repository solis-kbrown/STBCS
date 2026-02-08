import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  tier: text("tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  emailVerified: boolean("email_verified").default(false),
  smsAlertsEnabled: boolean("sms_alerts_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_stripe_idx").on(table.stripeCustomerId),
]);

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("sessions_token_idx").on(table.token),
  index("sessions_user_idx").on(table.userId),
]);

export const cves = pgTable("cves", {
  id: varchar("id").primaryKey(),
  cveId: text("cve_id").notNull().unique(),
  description: text("description"),
  severity: text("severity"),
  score: real("score"),
  platform: text("platform"),
  vendor: text("vendor"),
  status: text("status").default("Active"),
  publishedDate: timestamp("published_date"),
  lastModified: timestamp("last_modified"),
  references: text("references"),
  exploitAvailable: boolean("exploit_available").default(false),
  epssScore: real("epss_score"),
  epssPercentile: real("epss_percentile"),
  cweId: text("cwe_id"),
  cweName: text("cwe_name"),
  inCisaKev: boolean("in_cisa_kev").default(false),
  affectedProducts: text("affected_products"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("cve_severity_idx").on(table.severity),
  index("cve_score_idx").on(table.score),
  index("cve_published_idx").on(table.publishedDate),
  index("cve_epss_idx").on(table.epssScore),
]);

export const ransomwareIncidents = pgTable("ransomware_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  victim: text("victim").notNull(),
  groupName: text("group_name").notNull(),
  sector: text("sector"),
  country: text("country"),
  description: text("description"),
  dataSize: text("data_size"),
  status: text("status").default("claimed"),
  website: text("website"),
  discoveredAt: timestamp("discovered_at").defaultNow(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  postUrl: text("post_url"),
  screenshotUrl: text("screenshot_url"),
  proofUrl: text("proof_url"),
  activity: text("activity"),
  sourceApi: text("source_api").default("ransomware.live"),
  ransomAmount: text("ransom_amount"),
  ransomCurrency: text("ransom_currency"),
  bitcoinWallet: text("bitcoin_wallet"),
  paymentStatus: text("payment_status"),
  attackVector: text("attack_vector"),
  victimRevenue: text("victim_revenue"),
  employeeCount: text("employee_count"),
}, (table) => [
  index("ransom_group_idx").on(table.groupName),
  index("ransom_sector_idx").on(table.sector),
  index("ransom_status_idx").on(table.status),
  index("ransom_victim_idx").on(table.victim),
  index("ransom_country_idx").on(table.country),
]);

export const threatActors = pgTable("threat_actors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  aliases: text("aliases"),
  description: text("description"),
  type: text("type"),
  origin: text("origin"),
  firstSeen: timestamp("first_seen"),
  lastActive: timestamp("last_active"),
  ttps: text("ttps"),
  targetSectors: text("target_sectors"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  targetCountries: text("target_countries"),
  knownCves: text("known_cves"),
  malwareFamilies: text("malware_families"),
  infrastructure: text("infrastructure"),
  ransomwareNote: text("ransomware_note"),
  negotiationTactics: text("negotiation_tactics"),
  affiliations: text("affiliations"),
  governmentAdvisories: text("government_advisories"),
  lawEnforcementActions: text("law_enforcement_actions"),
  totalVictims: real("total_victims"),
  totalRansomCollected: text("total_ransom_collected"),
  averageRansom: text("average_ransom"),
  encryptionMethod: text("encryption_method"),
  attackVectors: text("attack_vectors"),
  profileUrl: text("profile_url"),
  ransomwareAsService: boolean("raas").default(false),
  dataExfiltration: boolean("data_exfiltration").default(true),
  doubleExtortion: boolean("double_extortion").default(false),
  websiteUrl: text("website_url"),
  mirrorUrls: text("mirror_urls"),
  statusMessage: text("status_message"),
}, (table) => [
  index("actor_name_idx").on(table.name),
  index("actor_active_idx").on(table.active),
]);

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  source: text("source"),
  sourceUrl: text("source_url"),
  category: text("category"),
  tags: text("tags"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("news_category_idx").on(table.category),
  index("news_published_idx").on(table.publishedAt),
]);

// Malicious IPs from various threat feeds
export const maliciousIps = pgTable("malicious_ips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull(),
  source: text("source").notNull(),
  threatType: text("threat_type"),
  riskScore: real("risk_score"),
  country: text("country"),
  asn: text("asn"),
  lastSeen: timestamp("last_seen"),
  firstSeen: timestamp("first_seen"),
  reportCount: real("report_count"),
  abuseConfidenceScore: real("abuse_confidence_score"),
  isp: text("isp"),
  domain: text("domain"),
  usageType: text("usage_type"),
  reverseDns: text("reverse_dns"),
  openPorts: text("open_ports"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ip_address_idx").on(table.ipAddress),
  index("ip_source_idx").on(table.source),
  index("ip_threat_idx").on(table.threatType),
  index("ip_abuse_score_idx").on(table.abuseConfidenceScore),
]);

// Malicious URLs from URLhaus, PhishTank, etc.
export const maliciousUrls = pgTable("malicious_urls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  source: text("source").notNull(), // URLhaus, PhishTank, OpenPhish
  threatType: text("threat_type"), // malware, phishing, c2
  status: text("status").default("active"), // active, offline, unknown
  malwareFamily: text("malware_family"),
  country: text("country"),
  hostIp: text("host_ip"),
  lastOnline: timestamp("last_online"),
  reportedAt: timestamp("reported_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("url_source_idx").on(table.source),
  index("url_threat_idx").on(table.threatType),
  index("url_status_idx").on(table.status),
]);

// CISA Known Exploited Vulnerabilities
export const cisaKev = pgTable("cisa_kev", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cveId: text("cve_id").notNull().unique(),
  vendorProject: text("vendor_project"),
  product: text("product"),
  vulnerabilityName: text("vulnerability_name"),
  dateAdded: timestamp("date_added"),
  shortDescription: text("short_description"),
  requiredAction: text("required_action"),
  dueDate: timestamp("due_date"),
  knownRansomware: boolean("known_ransomware").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("kev_cve_idx").on(table.cveId),
  index("kev_vendor_idx").on(table.vendorProject),
  index("kev_ransomware_idx").on(table.knownRansomware),
]);

// User subscriptions for Pro tier
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").default("free"), // free, pro, enterprise
  status: text("status").default("active"), // active, canceled, past_due
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("sub_user_idx").on(table.userId),
  index("sub_status_idx").on(table.status),
]);

// Threat feed sources configuration
export const threatFeeds = pgTable("threat_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  url: text("url").notNull(),
  feedType: text("feed_type"), // ip, url, cve, malware, news
  updateFrequency: text("update_frequency"), // hourly, daily, weekly
  lastFetched: timestamp("last_fetched"),
  isActive: boolean("is_active").default(true),
  requiresProTier: boolean("requires_pro_tier").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export const insertCveSchema = createInsertSchema(cves).omit({
  createdAt: true,
});

export const insertRansomwareSchema = createInsertSchema(ransomwareIncidents).omit({
  id: true,
  createdAt: true,
});

export const insertThreatActorSchema = createInsertSchema(threatActors).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
});

export const insertMaliciousIpSchema = createInsertSchema(maliciousIps).omit({
  id: true,
  createdAt: true,
});

export const insertMaliciousUrlSchema = createInsertSchema(maliciousUrls).omit({
  id: true,
  createdAt: true,
});

export const insertCisaKevSchema = createInsertSchema(cisaKev).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThreatFeedSchema = createInsertSchema(threatFeeds).omit({
  id: true,
  createdAt: true,
});

// User preferences and settings for Pro users
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  theme: text("theme").default("dark"),
  emailAlerts: boolean("email_alerts").default(true),
  slackWebhook: text("slack_webhook"),
  alertSeverity: text("alert_severity").default("critical"), // low, medium, high, critical
  watchedCves: text("watched_cves"), // JSON array of CVE IDs
  watchedGroups: text("watched_groups"), // JSON array of ransomware groups
  watchedSectors: text("watched_sectors"), // JSON array of sectors
  dashboardLayout: text("dashboard_layout"), // JSON for custom dashboard
  defaultView: text("default_view").default("dashboard"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("settings_user_idx").on(table.userId),
]);

// Saved searches for Pro users
export const savedSearches = pgTable("saved_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  searchType: text("search_type").notNull(), // global, cves, ips, urls, ransomware
  query: text("query").notNull(),
  filters: text("filters"), // JSON for additional filters
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("saved_search_user_idx").on(table.userId),
]);

// Audit log for admin tracking
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(), // login, search, export, settings_change, etc.
  resource: text("resource"), // cves, ips, urls, etc.
  details: text("details"), // JSON with action details
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("audit_user_idx").on(table.userId),
  index("audit_action_idx").on(table.action),
  index("audit_created_idx").on(table.createdAt),
]);

// User notifications for real-time alerts
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // ransomware, cve, breach, threat_actor, news
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").default("medium"), // low, medium, high, critical
  relatedId: text("related_id"), // ID of related record (CVE, incident, etc.)
  relatedType: text("related_type"), // cve, ransomware, ip, url, news
  read: boolean("read").default(false),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notif_user_idx").on(table.userId),
  index("notif_read_idx").on(table.read),
  index("notif_type_idx").on(table.type),
  index("notif_created_idx").on(table.createdAt),
]);

// Watchlist items for Pro users - detailed tracking
export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemType: text("item_type").notNull(), // company, sector, cve, threat_actor, country, keyword
  itemValue: text("item_value").notNull(), // the actual value to watch
  label: text("label"), // user-friendly label
  alertOnMatch: boolean("alert_on_match").default(true),
  emailOnMatch: boolean("email_on_match").default(false),
  smsOnMatch: boolean("sms_on_match").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("watchlist_user_idx").on(table.userId),
  index("watchlist_type_idx").on(table.itemType),
]);

// Breach incidents from various sources
export const breachIncidents = pgTable("breach_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain"),
  breachDate: timestamp("breach_date"),
  addedDate: timestamp("added_date"),
  modifiedDate: timestamp("modified_date"),
  pwnCount: text("pwn_count"), // number of accounts affected
  description: text("description"),
  dataClasses: text("data_classes"), // JSON array: emails, passwords, etc.
  isVerified: boolean("is_verified").default(false),
  isFabricated: boolean("is_fabricated").default(false),
  isSensitive: boolean("is_sensitive").default(false),
  isRetired: boolean("is_retired").default(false),
  isSpamList: boolean("is_spam_list").default(false),
  sourceUrl: text("source_url"),
  sourceApi: text("source_api"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("breach_name_idx").on(table.name),
  index("breach_date_idx").on(table.breachDate),
  index("breach_domain_idx").on(table.domain),
]);

// System configuration for admins
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

// Newsletter subscriptions for email marketing
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  tier: text("tier").default("free"), // free or pro
  preferences: text("preferences"), // JSON: { ransomware: true, cves: true, news: true, breaches: true }
  frequency: text("frequency").default("weekly"), // daily, weekly, monthly
  verified: boolean("verified").default(false),
  verificationToken: text("verification_token"),
  unsubscribeToken: text("unsubscribe_token"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  lastEmailSent: timestamp("last_email_sent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("newsletter_email_idx").on(table.email),
  index("newsletter_verified_idx").on(table.verified),
]);

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCve = z.infer<typeof insertCveSchema>;
export type Cve = typeof cves.$inferSelect;

export type InsertRansomware = z.infer<typeof insertRansomwareSchema>;
export type RansomwareIncident = typeof ransomwareIncidents.$inferSelect;

export type InsertThreatActor = z.infer<typeof insertThreatActorSchema>;
export type ThreatActor = typeof threatActors.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertMaliciousIp = z.infer<typeof insertMaliciousIpSchema>;
export type MaliciousIp = typeof maliciousIps.$inferSelect;

export type InsertMaliciousUrl = z.infer<typeof insertMaliciousUrlSchema>;
export type MaliciousUrl = typeof maliciousUrls.$inferSelect;

export type InsertCisaKev = z.infer<typeof insertCisaKevSchema>;
export type CisaKev = typeof cisaKev.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertThreatFeed = z.infer<typeof insertThreatFeedSchema>;
export type ThreatFeed = typeof threatFeeds.$inferSelect;

export const insertNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertBreachSchema = createInsertSchema(breachIncidents).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

export type InsertBreach = z.infer<typeof insertBreachSchema>;
export type BreachIncident = typeof breachIncidents.$inferSelect;

export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
  subscribedAt: true,
});

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export type SystemConfig = typeof systemConfig.$inferSelect;

// SMS Messages for Pro/Business users
export const smsMessages = pgTable("sms_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalId: text("external_id").unique(),
  direction: text("direction").notNull(), // 'inbound' or 'outbound'
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  content: text("content").notNull(),
  status: text("status").default("delivered"), // pending, delivered, failed
  conversationId: varchar("conversation_id"),
  userId: varchar("user_id"), // who sent/received (for outbound, staff member)
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("sms_conversation_idx").on(table.conversationId),
  index("sms_from_idx").on(table.fromNumber),
  index("sms_created_idx").on(table.createdAt),
]);

export const insertSmsMessageSchema = createInsertSchema(smsMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertSmsMessage = z.infer<typeof insertSmsMessageSchema>;
export type SmsMessage = typeof smsMessages.$inferSelect;

export const exploitSubmissions = pgTable("exploit_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submitterEmail: text("submitter_email").notNull(),
  submitterName: text("submitter_name"),
  cveId: text("cve_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  affectedProduct: text("affected_product"),
  affectedVersions: text("affected_versions"),
  severity: text("severity"),
  exploitType: text("exploit_type"),
  pocCode: text("poc_code"),
  pocUrl: text("poc_url"),
  stepsToReproduce: text("steps_to_reproduce"),
  impact: text("impact"),
  mitigation: text("mitigation"),
  references: text("references"),
  status: text("status").default("pending"),
  reviewedBy: varchar("reviewed_by"),
  reviewNotes: text("review_notes"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("exploit_sub_email_idx").on(table.submitterEmail),
  index("exploit_sub_status_idx").on(table.status),
  index("exploit_sub_cve_idx").on(table.cveId),
]);

export const insertExploitSubmissionSchema = createInsertSchema(exploitSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedBy: true,
  reviewNotes: true,
  isPublic: true,
  status: true,
});

export type InsertExploitSubmission = z.infer<typeof insertExploitSubmissionSchema>;
export type ExploitSubmission = typeof exploitSubmissions.$inferSelect;

export const contentViews = pgTable("content_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: text("content_type").notNull(),
  contentId: text("content_id").notNull(),
  viewCount: real("view_count").default(1),
  lastViewedAt: timestamp("last_viewed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("views_content_idx").on(table.contentType, table.contentId),
  index("views_count_idx").on(table.viewCount),
]);

export type ContentView = typeof contentViews.$inferSelect;

export const siteVisitors = pgTable("site_visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorHash: text("visitor_hash").notNull().unique(),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
}, (table) => [
  index("visitors_hash_idx").on(table.visitorHash),
  index("visitors_first_seen_idx").on(table.firstSeen),
]);

export const dailyVisitorCounts = pgTable("daily_visitor_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  uniqueCount: real("unique_count").default(0),
  totalHits: real("total_hits").default(0),
});

export type SiteVisitor = typeof siteVisitors.$inferSelect;
export type DailyVisitorCount = typeof dailyVisitorCounts.$inferSelect;
