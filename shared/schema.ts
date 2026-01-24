import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  tier: text("tier").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("cve_severity_idx").on(table.severity),
  index("cve_score_idx").on(table.score),
  index("cve_published_idx").on(table.publishedDate),
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
}, (table) => [
  index("ransom_group_idx").on(table.groupName),
  index("ransom_sector_idx").on(table.sector),
  index("ransom_status_idx").on(table.status),
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
});

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
  source: text("source").notNull(), // DShield, Tor, Feodo, etc.
  threatType: text("threat_type"), // scanner, botnet, tor_exit, c2, etc.
  riskScore: real("risk_score"),
  country: text("country"),
  asn: text("asn"),
  lastSeen: timestamp("last_seen"),
  firstSeen: timestamp("first_seen"),
  reportCount: real("report_count"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ip_address_idx").on(table.ipAddress),
  index("ip_source_idx").on(table.source),
  index("ip_threat_idx").on(table.threatType),
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
