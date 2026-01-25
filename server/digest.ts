import { storage } from "./storage";
import { sendEmail, generateWeeklyDigestEmail } from "./email";
import { subDays, format } from "date-fns";

export interface DigestData {
  ransomwareCount: number;
  cveCount: number;
  criticalCves: Array<{ id: string; description: string; score: number }>;
  topRansomwareGroups: Array<{ name: string; count: number }>;
  recentBreaches: Array<{ name: string; date: string }>;
  newsHighlights: Array<{ title: string; summary: string }>;
}

export async function generateDigestData(): Promise<DigestData> {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  const [cves, ransomware, groups, news] = await Promise.all([
    storage.getCves(100, 0),
    storage.getRansomwareIncidents(100, 0),
    storage.getActiveGroups(),
    storage.getNews(10, 0)
  ]);
  
  const recentCves = cves.filter(cve => 
    cve.createdAt && new Date(cve.createdAt) >= sevenDaysAgo
  );
  
  const criticalCves = recentCves
    .filter(cve => cve.severity === "CRITICAL" || (cve.score && cve.score >= 9.0))
    .slice(0, 5)
    .map(cve => ({
      id: cve.cveId,
      description: cve.description || "",
      score: cve.score || 0
    }));
  
  const recentRansomware = ransomware.filter(incident =>
    incident.createdAt && new Date(incident.createdAt) >= sevenDaysAgo
  );
  
  const topGroups = groups.slice(0, 5).map(g => ({
    name: g.name,
    count: g.count
  }));
  
  const newsHighlights = news.slice(0, 3).map(article => ({
    title: article.title,
    summary: article.content?.substring(0, 200) || ""
  }));

  return {
    ransomwareCount: recentRansomware.length,
    cveCount: recentCves.length,
    criticalCves,
    topRansomwareGroups: topGroups,
    recentBreaches: [],
    newsHighlights
  };
}

export async function sendWeeklyDigests(): Promise<number> {
  console.log("[Digest] Starting weekly digest distribution...");
  
  const subscribers = await storage.getActiveNewsletterSubscribers("weekly");
  console.log(`[Digest] Found ${subscribers.length} weekly subscribers`);
  
  if (subscribers.length === 0) return 0;
  
  const digestData = await generateDigestData();
  const weekEnd = new Date();
  const weekStart = subDays(weekEnd, 7);
  
  let sent = 0;
  
  for (const subscriber of subscribers) {
    try {
      const email = generateWeeklyDigestEmail({
        subscriberName: subscriber.name || undefined,
        ...digestData,
        weekStart: format(weekStart, "MMM d"),
        weekEnd: format(weekEnd, "MMM d, yyyy"),
        unsubscribeToken: subscriber.unsubscribeToken || ""
      });
      
      const success = await sendEmail({
        to: subscriber.email,
        subject: email.subject,
        html: email.html,
        text: email.text
      });
      
      if (success) sent++;
    } catch (error) {
      console.error(`[Digest] Failed to send to ${subscriber.email}:`, error);
    }
  }
  
  console.log(`[Digest] Sent ${sent}/${subscribers.length} weekly digests`);
  return sent;
}

export async function sendDailyDigests(): Promise<number> {
  console.log("[Digest] Starting daily digest distribution...");
  
  const subscribers = await storage.getActiveNewsletterSubscribers("daily");
  console.log(`[Digest] Found ${subscribers.length} daily subscribers`);
  
  if (subscribers.length === 0) return 0;
  
  const digestData = await generateDigestData();
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  let sent = 0;
  
  for (const subscriber of subscribers) {
    try {
      const email = generateWeeklyDigestEmail({
        subscriberName: subscriber.name || undefined,
        ...digestData,
        weekStart: format(yesterday, "MMM d"),
        weekEnd: format(today, "MMM d, yyyy"),
        unsubscribeToken: subscriber.unsubscribeToken || ""
      });
      
      const subject = `[STBCS] Daily Security Digest: ${format(today, "MMM d, yyyy")}`;
      const html = email.html.replace("Weekly Security Digest", "Daily Security Digest");
      const text = email.text.replace("Weekly", "Daily");
      
      const success = await sendEmail({
        to: subscriber.email,
        subject,
        html,
        text
      });
      
      if (success) sent++;
    } catch (error) {
      console.error(`[Digest] Failed to send to ${subscriber.email}:`, error);
    }
  }
  
  console.log(`[Digest] Sent ${sent}/${subscribers.length} daily digests`);
  return sent;
}

let digestSchedulerInterval: NodeJS.Timeout | null = null;

export function startDigestScheduler(): void {
  if (digestSchedulerInterval) {
    clearInterval(digestSchedulerInterval);
  }
  
  console.log("[Digest] Starting digest scheduler (checks every hour)");
  
  digestSchedulerInterval = setInterval(async () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    
    if (hour === 8) {
      await sendDailyDigests();
    }
    
    if (hour === 9 && day === 1) {
      await sendWeeklyDigests();
    }
  }, 60 * 60 * 1000);
}

export function stopDigestScheduler(): void {
  if (digestSchedulerInterval) {
    clearInterval(digestSchedulerInterval);
    digestSchedulerInterval = null;
    console.log("[Digest] Digest scheduler stopped");
  }
}
