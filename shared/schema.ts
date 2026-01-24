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
