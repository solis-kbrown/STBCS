import { storage } from "./storage";
import { sendEmail } from "./email";
import { getQuoService, isQuoConfigured } from "./quoService";
import type { WatchlistItem, Cve, RansomwareIncident, MaliciousIp, MaliciousUrl, CisaKev } from "@shared/schema";

const BATCH_SIZE = 100;
let isRunning = false;
let lastRunTimestamp = 0;

interface MatchResult {
  watchlistItem: WatchlistItem;
  matchedDataType: string;
  matchedDataId: string;
  matchSummary: string;
  severity: string;
}

export async function runMonitorEngine(): Promise<{ processed: number; alerts: number; errors: number }> {
  if (isRunning) {
    console.log("[Monitor] Engine already running, skipping");
    return { processed: 0, alerts: 0, errors: 0 };
  }

  isRunning = true;
  const startTime = Date.now();
  let processed = 0;
  let alertsSent = 0;
  let errors = 0;

  try {
    const watchlistItems = await storage.getAllActiveWatchlistItems();
    if (watchlistItems.length === 0) {
      return { processed: 0, alerts: 0, errors: 0 };
    }

    const since = lastRunTimestamp > 0 ? new Date(lastRunTimestamp) : new Date(Date.now() - 20 * 60 * 1000);

    const recentCves = await storage.getCves(BATCH_SIZE, 0);
    const recentRansomware = await storage.getRansomwareIncidents(BATCH_SIZE, 0);
    const recentIps = await storage.getMaliciousIps(BATCH_SIZE, 0);
    const recentUrls = await storage.getMaliciousUrls(BATCH_SIZE, 0);

    const matches: MatchResult[] = [];

    for (const item of watchlistItems) {
      try {
        const itemMatches = await findMatches(item, recentCves, recentRansomware, recentIps, recentUrls);
        
        for (const match of itemMatches) {
          const alreadySent = await storage.hasAlertBeenSent(
            item.id, match.matchedDataType, match.matchedDataId
          );
          if (!alreadySent) {
            matches.push(match);
          }
        }
        processed++;
      } catch (error) {
        errors++;
        console.error(`[Monitor] Error processing watchlist item ${item.id}:`, error);
      }
    }

    const userMatches = new Map<string, MatchResult[]>();
    for (const match of matches) {
      const userId = match.watchlistItem.userId;
      if (!userMatches.has(userId)) userMatches.set(userId, []);
      userMatches.get(userId)!.push(match);
    }

    const userIds = Array.from(userMatches.keys());
    for (const userId of userIds) {
      const userMatchList = userMatches.get(userId)!;
      try {
        const user = await storage.getUser(userId);
        if (!user) continue;

        const emailMatches = userMatchList.filter(m => m.watchlistItem.emailOnMatch);
        if (emailMatches.length > 0 && user.email) {
          await sendAlertEmail(user.email, user.username, emailMatches);
          for (const m of emailMatches) {
            await storage.logMonitorAlert({
              watchlistItemId: m.watchlistItem.id,
              matchedDataType: m.matchedDataType,
              matchedDataId: m.matchedDataId,
              deliveryChannel: "email",
              deliveryStatus: "sent",
            });
          }
          alertsSent += emailMatches.length;
        }

        const smsMatches = userMatchList.filter(m => m.watchlistItem.smsOnMatch);
        if (smsMatches.length > 0 && user.phone && isQuoConfigured()) {
          try {
            const quo = getQuoService();
            const topMatch = smsMatches[0];
            const msg = `[STBCS Alert] ${smsMatches.length} threat match(es) detected. Highest severity: ${topMatch.severity}. ${topMatch.matchSummary}. View details at stbcybersecurity.com/account`;
            await quo.sendSMS(user.phone, msg);
            for (const m of smsMatches) {
              await storage.logMonitorAlert({
                watchlistItemId: m.watchlistItem.id,
                matchedDataType: m.matchedDataType,
                matchedDataId: m.matchedDataId,
                deliveryChannel: "sms",
                deliveryStatus: "sent",
              });
            }
            alertsSent += smsMatches.length;
          } catch (smsErr) {
            console.error(`[Monitor] SMS alert failed for user ${userId}:`, smsErr);
          }
        }

        for (const m of userMatchList) {
          try {
            await storage.createNotification({
              userId,
              title: `Threat Match: ${m.matchedDataType}`,
              message: m.matchSummary,
              type: "alert",
              severity: m.severity === "critical" ? "high" : "medium",
            });
          } catch {}
        }
      } catch (error) {
        errors++;
        console.error(`[Monitor] Alert delivery failed for user ${userId}:`, error);
      }
    }

    lastRunTimestamp = startTime;
    const elapsed = Date.now() - startTime;
    if (matches.length > 0) {
      console.log(`[Monitor] Engine completed: ${processed} items processed, ${alertsSent} alerts sent, ${errors} errors, ${elapsed}ms`);
    }

    return { processed, alerts: alertsSent, errors };
  } catch (error: any) {
    const msg = error?.message || "";
    const isTransient = msg.includes("timeout exceeded") || msg.includes("Connection terminated") ||
      msg.includes("connection timeout") || msg.includes("too many clients") || msg.includes("ETIMEDOUT");
    if (isTransient) {
      console.debug("[Monitor] Engine skipped (transient):", msg.split("\n")[0]);
    } else {
      console.error("[Monitor] Engine critical error:", error);
    }
    return { processed, alerts: alertsSent, errors: errors + 1 };
  } finally {
    isRunning = false;
  }
}

function findMatches(
  item: WatchlistItem,
  cves: Cve[],
  ransomware: RansomwareIncident[],
  ips: MaliciousIp[],
  urls: MaliciousUrl[]
): MatchResult[] {
  const results: MatchResult[] = [];
  const value = item.itemValue.toLowerCase().trim();
  const type = item.itemType;

  if (type === "cve") {
    for (const cve of cves) {
      if (cve.cveId?.toLowerCase() === value) {
        results.push({
          watchlistItem: item,
          matchedDataType: "cve",
          matchedDataId: cve.id,
          matchSummary: `CVE ${cve.cveId} detected - Score: ${cve.score || 'N/A'}, Severity: ${cve.severity || 'N/A'}`,
          severity: (cve.score || 0) >= 9 ? "critical" : (cve.score || 0) >= 7 ? "high" : "medium",
        });
      }
    }
  }

  if (type === "ransomware_group" || type === "keyword") {
    for (const incident of ransomware) {
      const groupMatch = incident.groupName?.toLowerCase().includes(value);
      const victimMatch = incident.victim?.toLowerCase().includes(value);
      const sectorMatch = incident.sector?.toLowerCase().includes(value);
      if (groupMatch || victimMatch || sectorMatch) {
        results.push({
          watchlistItem: item,
          matchedDataType: "ransomware",
          matchedDataId: incident.id,
          matchSummary: `Ransomware activity: ${incident.groupName} targeted ${incident.victim || 'unknown'} in ${incident.sector || 'unknown'} sector`,
          severity: "high",
        });
      }
    }
  }

  if (type === "ip") {
    for (const ip of ips) {
      if (ip.ipAddress?.toLowerCase() === value) {
        results.push({
          watchlistItem: item,
          matchedDataType: "malicious_ip",
          matchedDataId: ip.id,
          matchSummary: `Malicious IP ${ip.ipAddress} detected via ${ip.source || 'threat feeds'} - Type: ${ip.threatType || 'unknown'}`,
          severity: "high",
        });
      }
    }
  }

  if (type === "domain") {
    for (const url of urls) {
      if (url.url?.toLowerCase().includes(value)) {
        results.push({
          watchlistItem: item,
          matchedDataType: "malicious_url",
          matchedDataId: url.id,
          matchSummary: `Malicious URL matched domain ${value}: ${url.url} via ${url.source || 'threat feeds'}`,
          severity: "high",
        });
      }
    }
  }

  if (type === "sector") {
    for (const incident of ransomware) {
      if (incident.sector?.toLowerCase().includes(value)) {
        results.push({
          watchlistItem: item,
          matchedDataType: "ransomware",
          matchedDataId: incident.id,
          matchSummary: `Ransomware attack in ${incident.sector} sector: ${incident.groupName} targeted ${incident.victim || 'unknown'}`,
          severity: "medium",
        });
      }
    }
  }

  if (type === "country") {
    for (const incident of ransomware) {
      if (incident.country?.toLowerCase().includes(value)) {
        results.push({
          watchlistItem: item,
          matchedDataType: "ransomware",
          matchedDataId: incident.id,
          matchSummary: `Ransomware attack in ${incident.country}: ${incident.groupName} targeted ${incident.victim || 'unknown'}`,
          severity: "medium",
        });
      }
    }
  }

  if (type === "company") {
    for (const incident of ransomware) {
      if (incident.victim?.toLowerCase().includes(value)) {
        results.push({
          watchlistItem: item,
          matchedDataType: "ransomware",
          matchedDataId: incident.id,
          matchSummary: `Company "${incident.victim}" appeared in ransomware data: attacked by ${incident.groupName}`,
          severity: "critical",
        });
      }
    }
  }

  if (type === "keyword") {
    for (const cve of cves) {
      if (cve.description?.toLowerCase().includes(value) || cve.platform?.toLowerCase().includes(value)) {
        results.push({
          watchlistItem: item,
          matchedDataType: "cve",
          matchedDataId: cve.id,
          matchSummary: `Keyword "${item.itemValue}" found in CVE ${cve.cveId}: ${cve.description?.substring(0, 100)}...`,
          severity: (cve.score || 0) >= 9 ? "critical" : (cve.score || 0) >= 7 ? "high" : "medium",
        });
      }
    }
  }

  return results.slice(0, 10);
}

async function sendAlertEmail(email: string, username: string, matches: MatchResult[]): Promise<void> {
  const matchRows = matches.map(m => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: #e4e4e7;">${m.matchedDataType.toUpperCase()}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #333;">
        <span style="background: ${m.severity === 'critical' ? '#dc2626' : m.severity === 'high' ? '#ea580c' : '#ca8a04'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${m.severity.toUpperCase()}</span>
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: #a1a1aa;">${m.matchSummary}</td>
    </tr>
  `).join("");

  const html = `
    <div style="background: #18181b; padding: 32px; font-family: sans-serif; color: #e4e4e7;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f97316; margin: 0;">🔒 STBCS Threat Alert</h1>
          <p style="color: #71717a; margin-top: 4px;">STB Cybersecurity - Frontline Threat Intelligence</p>
        </div>
        <p style="color: #e4e4e7;">Hi ${username},</p>
        <p style="color: #a1a1aa;">Your watchlist monitors detected <strong style="color: #f97316;">${matches.length} new threat match${matches.length > 1 ? 'es' : ''}</strong>:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #27272a; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #333;">
              <th style="padding: 8px 12px; text-align: left; color: #f97316; font-size: 12px;">TYPE</th>
              <th style="padding: 8px 12px; text-align: left; color: #f97316; font-size: 12px;">SEVERITY</th>
              <th style="padding: 8px 12px; text-align: left; color: #f97316; font-size: 12px;">DETAILS</th>
            </tr>
          </thead>
          <tbody>${matchRows}</tbody>
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://stbcybersecurity.com/account" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Details</a>
        </div>
        <p style="color: #52525b; font-size: 12px; margin-top: 24px; text-align: center;">
          You're receiving this because you enabled email alerts on your STBCS watchlist.
          Manage your alerts at stbcybersecurity.com/account
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `[STBCS] ${matches.length} Threat Alert${matches.length > 1 ? 's' : ''} - ${matches[0].severity.toUpperCase()} severity`,
    html,
  });
}

export function getMonitorStatus() {
  return {
    isRunning,
    lastRunTimestamp,
    lastRunTime: lastRunTimestamp > 0 ? new Date(lastRunTimestamp).toISOString() : null,
  };
}
