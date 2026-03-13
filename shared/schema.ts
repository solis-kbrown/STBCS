import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, index, uniqueIndex, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

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
  isAdmin: boolean("is_admin").default(false),
  isTrusted: boolean("is_trusted").default(false),
  kbReputation: integer("kb_reputation").default(0),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  website: text("website"),
  company: text("company"),
  profilePublic: boolean("profile_public").default(true),
  showEmail: boolean("show_email").default(false),
  digestOptIn: boolean("digest_opt_in").default(false),
  badges: text("badges").array(),
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
  pocAvailable: boolean("poc_available").default(false),
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
  uniqueIndex("ransom_victim_group_uniq").on(table.victim, table.groupName),
  index("ransom_group_idx").on(table.groupName),
  index("ransom_sector_idx").on(table.sector),
  index("ransom_status_idx").on(table.status),
  index("ransom_victim_idx").on(table.victim),
  index("ransom_country_idx").on(table.country),
  index("ransom_discovered_idx").on(table.discoveredAt),
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
  uniqueIndex("news_source_url_uniq").on(table.sourceUrl),
  index("news_category_idx").on(table.category),
  index("news_published_idx").on(table.publishedAt),
  index("news_title_idx").on(table.title),
  index("news_created_idx").on(table.createdAt),
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
  uniqueIndex("ip_address_source_uniq").on(table.ipAddress, table.source),
  index("ip_address_idx").on(table.ipAddress),
  index("ip_source_idx").on(table.source),
  index("ip_threat_idx").on(table.threatType),
  index("ip_abuse_score_idx").on(table.abuseConfidenceScore),
  index("ip_last_seen_idx").on(table.lastSeen),
  index("ip_created_idx").on(table.createdAt),
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
  uniqueIndex("url_url_source_uniq").on(table.url, table.source),
  index("url_source_idx").on(table.source),
  index("url_threat_idx").on(table.threatType),
  index("url_status_idx").on(table.status),
  index("url_reported_idx").on(table.reportedAt),
  index("url_created_idx").on(table.createdAt),
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

// CISA ICS-CERT Advisories for Industrial Control Systems
export const cisaIcsAdvisories = pgTable("cisa_ics_advisories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advisoryId: text("advisory_id").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  vendor: text("vendor"),
  product: text("product"),
  cvssScore: real("cvss_score"),
  cveIds: text("cve_ids"),
  affectedSystems: text("affected_systems"),
  mitigations: text("mitigations"),
  publishedDate: timestamp("published_date"),
  lastUpdated: timestamp("last_updated"),
  severity: text("severity"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ics_advisory_id_idx").on(table.advisoryId),
  index("ics_vendor_idx").on(table.vendor),
  index("ics_severity_idx").on(table.severity),
  index("ics_published_idx").on(table.publishedDate),
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

export const insertIcsAdvisorySchema = createInsertSchema(cisaIcsAdvisories).omit({
  id: true,
  createdAt: true,
});

export type InsertIcsAdvisory = z.infer<typeof insertIcsAdvisorySchema>;
export type IcsAdvisory = typeof cisaIcsAdvisories.$inferSelect;

export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
  subscribedAt: true,
});

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export type SystemConfig = typeof systemConfig.$inferSelect;

// SMS Messages — currently unused/reserved for future use
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

// Live Chat Sessions — currently unused/reserved for future use
export const liveChatSessions = pgTable("live_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").notNull().unique(),
  visitorPhone: text("visitor_phone").notNull(),
  visitorName: text("visitor_name"),
  tcpaConsent: boolean("tcpa_consent").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
}, (table) => [
  index("chat_session_token_idx").on(table.sessionToken),
  index("chat_session_phone_idx").on(table.visitorPhone),
  index("chat_session_status_idx").on(table.status),
]);

export const insertLiveChatSessionSchema = createInsertSchema(liveChatSessions).omit({
  id: true,
  createdAt: true,
  lastActivityAt: true,
});

export type InsertLiveChatSession = z.infer<typeof insertLiveChatSessionSchema>;
export type LiveChatSession = typeof liveChatSessions.$inferSelect;

export const logoVotes = pgTable("logo_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  logoVariant: text("logo_variant").notNull(),
  voterHash: text("voter_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("logo_votes_variant_idx").on(table.logoVariant),
  index("logo_votes_voter_idx").on(table.voterHash),
]);

export type LogoVote = typeof logoVotes.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("contact_messages_status_idx").on(table.status),
  index("contact_messages_category_idx").on(table.category),
]);

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// ===== API Key System for Pro/Business Users =====
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  prefix: text("prefix").notNull(),
  tier: text("tier").notNull().default("pro"),
  status: text("status").notNull().default("active"),
  rateLimitPerMin: real("rate_limit_per_min").default(60),
  dailyQuota: real("daily_quota").default(1000),
  liveLookupDailyLimit: real("live_lookup_daily_limit").default(50),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("api_keys_user_idx").on(table.userId),
  index("api_keys_prefix_idx").on(table.prefix),
  index("api_keys_status_idx").on(table.status),
]);

export const apiKeyUsage = pgTable("api_key_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id").notNull(),
  date: text("date").notNull(),
  requestCount: real("request_count").default(0),
  liveLookupCount: real("live_lookup_count").default(0),
  lastRequestAt: timestamp("last_request_at"),
}, (table) => [
  index("api_usage_key_idx").on(table.apiKeyId),
  index("api_usage_date_idx").on(table.date),
]);

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  lastUsedAt: true,
  revokedAt: true,
  createdAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;

// Add-On System — currently unused/reserved for future use
export const addOns = pgTable("add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  type: text("type").notNull().default("one_time"),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  price: real("price"),
  entitlementType: text("entitlement_type"),
  entitlementValue: text("entitlement_value"),
  requiredTier: text("required_tier"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("addons_slug_idx").on(table.slug),
  index("addons_active_idx").on(table.isActive),
]);

// User Add-Ons — currently unused/reserved for future use
export const userAddOns = pgTable("user_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  addOnId: varchar("add_on_id").notNull(),
  status: text("status").notNull().default("active"),
  quantity: real("quantity").default(1),
  stripePaymentId: text("stripe_payment_id"),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("user_addons_user_idx").on(table.userId),
  index("user_addons_addon_idx").on(table.addOnId),
  index("user_addons_status_idx").on(table.status),
]);

export const insertAddOnSchema = createInsertSchema(addOns).omit({
  id: true,
  createdAt: true,
});

export const insertUserAddOnSchema = createInsertSchema(userAddOns).omit({
  id: true,
  createdAt: true,
});

export type InsertAddOn = z.infer<typeof insertAddOnSchema>;
export type AddOn = typeof addOns.$inferSelect;
export type InsertUserAddOn = z.infer<typeof insertUserAddOnSchema>;
export type UserAddOn = typeof userAddOns.$inferSelect;

// ===== Monitor Alert Log (deduplication) =====
export const monitorAlertLog = pgTable("monitor_alert_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  watchlistItemId: varchar("watchlist_item_id").notNull(),
  matchedDataType: text("matched_data_type").notNull(),
  matchedDataId: text("matched_data_id").notNull(),
  deliveryChannel: text("delivery_channel").notNull(),
  deliveryStatus: text("delivery_status").default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("monitor_alert_watchlist_idx").on(table.watchlistItemId),
  index("monitor_alert_match_idx").on(table.matchedDataType, table.matchedDataId),
]);

export type MonitorAlertLog = typeof monitorAlertLog.$inferSelect;

// ===== Uptime Monitors =====
export const uptimeMonitors = pgTable("uptime_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  protocol: text("protocol").notNull().default("https"),
  checkInterval: integer("check_interval").default(300),
  timeout: integer("timeout").default(30),
  expectedStatusCode: integer("expected_status_code").default(200),
  alertOnDown: boolean("alert_on_down").default(true),
  alertOnSslExpiry: boolean("alert_on_ssl_expiry").default(true),
  sslExpiryThresholdDays: integer("ssl_expiry_threshold_days").default(14),
  emailAlert: boolean("email_alert").default(true),
  smsAlert: boolean("sms_alert").default(false),
  status: text("status").notNull().default("active"),
  currentState: text("current_state").default("unknown"),
  lastCheckAt: timestamp("last_check_at"),
  nextCheckAt: timestamp("next_check_at"),
  uptimePercent: real("uptime_percent").default(100),
  avgResponseTime: real("avg_response_time"),
  totalChecks: integer("total_checks").default(0),
  totalDowntime: integer("total_downtime").default(0),
  consecutiveFailures: integer("consecutive_failures").default(0),
  sslExpiresAt: timestamp("ssl_expires_at"),
  sslIssuer: text("ssl_issuer"),
  httpVersion: text("http_version"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("uptime_mon_user_idx").on(table.userId),
  index("uptime_mon_status_idx").on(table.status),
  index("uptime_mon_next_check_idx").on(table.nextCheckAt),
  index("uptime_mon_state_idx").on(table.currentState),
]);

export const uptimeChecks = pgTable("uptime_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  monitorId: varchar("monitor_id").notNull(),
  status: text("status").notNull(),
  statusCode: integer("status_code"),
  responseTime: real("response_time"),
  errorMessage: text("error_message"),
  sslValid: boolean("ssl_valid"),
  sslDaysRemaining: integer("ssl_days_remaining"),
  checkedAt: timestamp("checked_at").defaultNow(),
}, (table) => [
  index("uptime_check_mon_idx").on(table.monitorId),
  index("uptime_check_time_idx").on(table.checkedAt),
]);

export const uptimeIncidents = pgTable("uptime_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  monitorId: varchar("monitor_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("ongoing"),
  startedAt: timestamp("started_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  duration: integer("duration"),
  alertsSent: boolean("alerts_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("uptime_inc_mon_idx").on(table.monitorId),
  index("uptime_inc_user_idx").on(table.userId),
  index("uptime_inc_status_idx").on(table.status),
]);

export const insertUptimeMonitorSchema = createInsertSchema(uptimeMonitors).omit({
  id: true,
  currentState: true,
  lastCheckAt: true,
  nextCheckAt: true,
  uptimePercent: true,
  avgResponseTime: true,
  totalChecks: true,
  totalDowntime: true,
  consecutiveFailures: true,
  sslExpiresAt: true,
  sslIssuer: true,
  httpVersion: true,
  createdAt: true,
});

export type InsertUptimeMonitor = z.infer<typeof insertUptimeMonitorSchema>;
export type UptimeMonitor = typeof uptimeMonitors.$inferSelect;
export type UptimeCheck = typeof uptimeChecks.$inferSelect;
export type UptimeIncident = typeof uptimeIncidents.$inferSelect;

// ===== Dark Web Monitoring =====
export const darkWebMonitors = pgTable("dark_web_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetValue: text("target_value").notNull(),
  label: text("label"),
  emailAlert: boolean("email_alert").default(true),
  smsAlert: boolean("sms_alert").default(false),
  status: text("status").notNull().default("active"),
  lastScanAt: timestamp("last_scan_at"),
  nextScanAt: timestamp("next_scan_at"),
  totalFindings: integer("total_findings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("dwm_user_idx").on(table.userId),
  index("dwm_status_idx").on(table.status),
  index("dwm_next_scan_idx").on(table.nextScanAt),
]);

export const darkWebFindings = pgTable("dark_web_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  monitorId: varchar("monitor_id").notNull(),
  userId: varchar("user_id").notNull(),
  source: text("source").notNull(),
  findingType: text("finding_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").default("medium"),
  rawData: text("raw_data"),
  breachDate: timestamp("breach_date"),
  isRead: boolean("is_read").default(false),
  alertSent: boolean("alert_sent").default(false),
  discoveredAt: timestamp("discovered_at").defaultNow(),
}, (table) => [
  index("dwf_mon_idx").on(table.monitorId),
  index("dwf_user_idx").on(table.userId),
  index("dwf_severity_idx").on(table.severity),
]);

export const insertDarkWebMonitorSchema = createInsertSchema(darkWebMonitors).omit({
  id: true,
  lastScanAt: true,
  nextScanAt: true,
  totalFindings: true,
  createdAt: true,
});

export type InsertDarkWebMonitor = z.infer<typeof insertDarkWebMonitorSchema>;
export type DarkWebMonitor = typeof darkWebMonitors.$inferSelect;
export type DarkWebFinding = typeof darkWebFindings.$inferSelect;

export const dailyThreatStats = pgTable("daily_threat_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  totalCves: integer("total_cves").default(0),
  newCvesToday: integer("new_cves_today").default(0),
  criticalCves: integer("critical_cves").default(0),
  totalRansomwareIncidents: integer("total_ransomware_incidents").default(0),
  newRansomwareToday: integer("new_ransomware_today").default(0),
  activeRansomwareGroups: integer("active_ransomware_groups").default(0),
  totalRansomwareGroups: integer("total_ransomware_groups").default(0),
  totalMaliciousIps: integer("total_malicious_ips").default(0),
  newMaliciousIpsToday: integer("new_malicious_ips_today").default(0),
  totalMaliciousUrls: integer("total_malicious_urls").default(0),
  newMaliciousUrlsToday: integer("new_malicious_urls_today").default(0),
  totalThreatActors: integer("total_threat_actors").default(0),
  totalBreaches: integer("total_breaches").default(0),
  totalCisaKev: integer("total_cisa_kev").default(0),
  totalIcsAdvisories: integer("total_ics_advisories").default(0),
  totalThreatFeeds: integer("total_threat_feeds").default(0),
  activeFeedSources: integer("active_feed_sources").default(0),
  topGroupName: text("top_group_name"),
  topGroupVictims: integer("top_group_victims").default(0),
  topSector: text("top_sector"),
  topCountry: text("top_country"),
  registeredUsers: integer("registered_users").default(0),
  proSubscribers: integer("pro_subscribers").default(0),
  businessSubscribers: integer("business_subscribers").default(0),
  apiKeysActive: integer("api_keys_active").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("dts_date_idx").on(table.date),
]);

export type DailyThreatStats = typeof dailyThreatStats.$inferSelect;
export type InsertDailyThreatStats = typeof dailyThreatStats.$inferInsert;

// ===== Attack Surface Scans =====
export const attackSurfaceScans = pgTable("attack_surface_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  domain: text("domain").notNull(),
  status: text("status").default("queued"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  summary: text("summary"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("as_scan_user_idx").on(table.userId),
  index("as_scan_domain_idx").on(table.domain),
]);

export const attackSurfaceAssets = pgTable("attack_surface_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull(),
  assetType: text("asset_type").notNull(),
  value: text("value").notNull(),
  metadata: text("metadata"),
  severity: text("severity").default("info"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("as_asset_scan_idx").on(table.scanId),
  index("as_asset_type_idx").on(table.assetType),
]);

export const insertAttackSurfaceScanSchema = createInsertSchema(attackSurfaceScans).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  summary: true,
  lastError: true,
  createdAt: true,
});

export const insertAttackSurfaceAssetSchema = createInsertSchema(attackSurfaceAssets).omit({
  id: true,
  createdAt: true,
});

export type AttackSurfaceScan = typeof attackSurfaceScans.$inferSelect;
export type InsertAttackSurfaceScan = z.infer<typeof insertAttackSurfaceScanSchema>;
export type AttackSurfaceAsset = typeof attackSurfaceAssets.$inferSelect;
export type InsertAttackSurfaceAsset = z.infer<typeof insertAttackSurfaceAssetSchema>;

// ===== Threat Reports =====
export const threatReports = pgTable("threat_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  status: text("status").default("queued"),
  reportData: text("report_data"),
  generatedAt: timestamp("generated_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tr_user_idx").on(table.userId),
  index("tr_status_idx").on(table.status),
]);

export const reportSchedules = pgTable("report_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  cadence: text("cadence").default("weekly"),
  isActive: boolean("is_active").default(true),
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("rs_user_idx").on(table.userId),
  index("rs_next_run_idx").on(table.nextRunAt),
]);

export const insertThreatReportSchema = createInsertSchema(threatReports).omit({
  id: true,
  status: true,
  reportData: true,
  generatedAt: true,
  lastError: true,
  createdAt: true,
});

export const insertReportScheduleSchema = createInsertSchema(reportSchedules).omit({
  id: true,
  nextRunAt: true,
  lastRunAt: true,
  createdAt: true,
});

export type ThreatReport = typeof threatReports.$inferSelect;
export type InsertThreatReport = z.infer<typeof insertThreatReportSchema>;
export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = z.infer<typeof insertReportScheduleSchema>;

export const kbPosts = pgTable("kb_posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  type: text("type").notNull().default("general_idea"),
  status: text("status").notNull().default("pending_review"),
  voteCount: integer("vote_count").default(0),
  commentCount: integer("comment_count").default(0),
  viewCount: integer("view_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("kb_posts_author_idx").on(table.authorId),
  index("kb_posts_type_idx").on(table.type),
  index("kb_posts_status_idx").on(table.status),
  index("kb_posts_slug_idx").on(table.slug),
  index("kb_posts_created_idx").on(table.createdAt),
  index("kb_posts_views_idx").on(table.viewCount),
]);

export const kbComments = pgTable("kb_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  authorId: varchar("author_id").notNull(),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
}, (table) => [
  index("kb_comments_post_idx").on(table.postId),
  index("kb_comments_author_idx").on(table.authorId),
  index("kb_comments_parent_idx").on(table.parentId),
]);

export const kbVotes = pgTable("kb_votes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id"),
  commentId: integer("comment_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("kb_votes_user_post_idx").on(table.userId, table.postId),
  uniqueIndex("kb_votes_user_comment_idx").on(table.userId, table.commentId),
]);

export const kbBookmarks = pgTable("kb_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("kb_bookmarks_user_post_idx").on(table.userId, table.postId),
  index("kb_bookmarks_user_idx").on(table.userId),
]);

export const insertKbPostSchema = createInsertSchema(kbPosts).omit({
  id: true,
  voteCount: true,
  commentCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const kbReports = pgTable("kb_reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull(),
  postId: integer("post_id"),
  commentId: integer("comment_id"),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("kb_reports_reporter_idx").on(table.reporterId),
  index("kb_reports_status_idx").on(table.status),
]);

export const insertKbCommentSchema = createInsertSchema(kbComments).omit({
  id: true,
  voteCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKbVoteSchema = createInsertSchema(kbVotes).omit({
  id: true,
  createdAt: true,
});

export type KbPost = typeof kbPosts.$inferSelect;
export type InsertKbPost = z.infer<typeof insertKbPostSchema>;
export type KbComment = typeof kbComments.$inferSelect;
export type InsertKbComment = z.infer<typeof insertKbCommentSchema>;
export type KbVote = typeof kbVotes.$inferSelect;
export type InsertKbVote = z.infer<typeof insertKbVoteSchema>;
export type KbBookmark = typeof kbBookmarks.$inferSelect;

export const insertKbReportSchema = createInsertSchema(kbReports).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
});
export type KbReport = typeof kbReports.$inferSelect;
export type InsertKbReport = z.infer<typeof insertKbReportSchema>;

export const KB_RANKS = [
  { name: "Recruit", minPoints: 0, color: "text-zinc-400" },
  { name: "Analyst", minPoints: 10, color: "text-blue-400" },
  { name: "Specialist", minPoints: 50, color: "text-green-400" },
  { name: "Expert", minPoints: 150, color: "text-purple-400" },
  { name: "Elite", minPoints: 300, color: "text-orange-400" },
  { name: "Legend", minPoints: 500, color: "text-red-400" },
] as const;

export function getKbRank(points: number) {
  for (let i = KB_RANKS.length - 1; i >= 0; i--) {
    if (points >= KB_RANKS[i].minPoints) return KB_RANKS[i];
  }
  return KB_RANKS[0];
}

export const KB_POINTS = {
  POST_CREATED: 5,
  POST_APPROVED: 3,
  COMMENT_CREATED: 2,
  RECEIVED_UPVOTE: 1,
  LOST_UPVOTE: -1,
} as const;

export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  name: text("name"),
  email: text("email"),
  category: text("category").notNull().default("general_feedback"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("feedback_user_idx").on(table.userId),
  index("feedback_status_idx").on(table.status),
  index("feedback_category_idx").on(table.category),
]);

export const insertFeedbackSchema = createInsertSchema(feedbackSubmissions).omit({
  id: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// ===== STB-Sync: Dynamic Firewall Block Lists =====
export const syncTokens = pgTable("sync_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  listType: text("list_type").notNull().default("ips"),
  maxEntries: integer("max_entries").notNull().default(10000),
  includeMetadata: boolean("include_metadata").default(false),
  status: text("status").notNull().default("active"),
  lastPolledAt: timestamp("last_polled_at"),
  pollCount: integer("poll_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("sync_tokens_user_idx").on(table.userId),
  index("sync_tokens_token_idx").on(table.token),
  index("sync_tokens_status_idx").on(table.status),
]);

export const insertSyncTokenSchema = createInsertSchema(syncTokens).omit({
  id: true,
  lastPolledAt: true,
  pollCount: true,
  createdAt: true,
});

export type SyncToken = typeof syncTokens.$inferSelect;
export type InsertSyncToken = z.infer<typeof insertSyncTokenSchema>;

// ===== Phishing Awareness Bulletins =====
export const phishingBulletins = pgTable("phishing_bulletins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  period: text("period").notNull().default("daily"),
  date: timestamp("date").notNull(),
  totalThreats: integer("total_threats").notNull().default(0),
  topBrands: text("top_brands"),
  content: text("content").notNull(),
  contentHtml: text("content_html"),
  contentMarkdown: text("content_markdown"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("bulletin_period_idx").on(table.period),
  index("bulletin_date_idx").on(table.date),
  index("bulletin_created_idx").on(table.createdAt),
]);

export const insertPhishingBulletinSchema = createInsertSchema(phishingBulletins).omit({
  id: true,
  createdAt: true,
});

export type PhishingBulletin = typeof phishingBulletins.$inferSelect;
export type InsertPhishingBulletin = z.infer<typeof insertPhishingBulletinSchema>;
