import { storage } from "./storage";
import { Resend } from "resend";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let connectionSettings: any = null;

async function getResendCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Resend credentials not available');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings?.api_key) {
    throw new Error('Resend not connected');
  }
  
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email || 'noreply@stoptbcs.com'
  };
}

async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  const { apiKey, fromEmail } = await getResendCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const result = await client.emails.send({
      from: `STB Cybersecurity <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
    
    if (result.error) {
      console.error("[Email] Resend error:", result.error);
      return false;
    }
    
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

export function generateAlertEmail(params: {
  type: "ransomware" | "cve" | "breach" | "watchlist";
  title: string;
  description: string;
  severity?: string;
  link?: string;
  matchedItem?: string;
}): { subject: string; html: string; text: string } {
  const severityColor = params.severity === "CRITICAL" ? "#dc2626" : 
                        params.severity === "HIGH" ? "#ea580c" : 
                        params.severity === "MEDIUM" ? "#ca8a04" : "#22c55e";
  
  const typeLabel = {
    ransomware: "Ransomware Alert",
    cve: "Vulnerability Alert",
    breach: "Breach Alert",
    watchlist: "Watchlist Match"
  }[params.type];

  const subject = `[STBCS Alert] ${typeLabel}: ${params.title}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #333;">
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #333;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: bold;">
                      <span style="color: #3b82f6;">STB</span> Cybersecurity
                    </h1>
                    <p style="margin: 5px 0 0; color: #888; font-size: 12px;">Stop The Bleed - Threat Intelligence</p>
                  </td>
                  <td align="right">
                    <span style="background-color: ${severityColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      ${params.severity || typeLabel.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #fff; font-size: 20px;">${params.title}</h2>
              ${params.matchedItem ? `<p style="margin: 0 0 15px; color: #3b82f6; font-size: 14px;">Matched watchlist item: <strong>${params.matchedItem}</strong></p>` : ''}
              <p style="margin: 0 0 20px; color: #ccc; font-size: 14px; line-height: 1.6;">${params.description}</p>
              ${params.link ? `<a href="${params.link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Details</a>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #333; background-color: #111;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                You're receiving this because you have alerts enabled on STBCS.
                <a href="https://stoptbcs.com/settings" style="color: #3b82f6;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${typeLabel}: ${params.title}\n\n${params.description}\n\n${params.link || 'Visit stoptbcs.com for details'}`;

  return { subject, html, text };
}

export function generateWeeklyDigestEmail(params: {
  subscriberName?: string;
  ransomwareCount: number;
  cveCount: number;
  criticalCves: Array<{ id: string; description: string; score: number }>;
  topRansomwareGroups: Array<{ name: string; count: number }>;
  recentBreaches: Array<{ name: string; date: string }>;
  newsHighlights: Array<{ title: string; summary: string }>;
  weekStart: string;
  weekEnd: string;
  unsubscribeToken: string;
}): { subject: string; html: string; text: string } {
  const subject = `[STBCS] Weekly Security Digest: ${params.weekStart} - ${params.weekEnd}`;
  
  const criticalCvesHtml = params.criticalCves.slice(0, 5).map(cve => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #333;">
        <strong style="color: #dc2626;">${cve.id}</strong>
        <span style="background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">CVSS ${cve.score}</span>
        <p style="margin: 5px 0 0; color: #999; font-size: 13px;">${cve.description.substring(0, 150)}...</p>
      </td>
    </tr>
  `).join('');

  const ransomwareGroupsHtml = params.topRansomwareGroups.slice(0, 5).map(group => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #fff;">${group.name}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #f59e0b; text-align: right;">${group.count} victims</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; border: 1px solid #333;">
          <tr>
            <td style="padding: 30px 40px; border-bottom: 1px solid #333; background: linear-gradient(135deg, #1a1a1a 0%, #0f172a 100%);">
              <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: bold;">
                <span style="color: #3b82f6;">STB</span> Cybersecurity
              </h1>
              <p style="margin: 5px 0 0; color: #888; font-size: 12px;">Weekly Security Digest</p>
              <p style="margin: 15px 0 0; color: #666; font-size: 14px;">${params.weekStart} - ${params.weekEnd}</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 40px;">
              ${params.subscriberName ? `<p style="margin: 0 0 20px; color: #ccc;">Hi ${params.subscriberName},</p>` : ''}
              <p style="margin: 0 0 20px; color: #ccc;">Here's your weekly threat intelligence summary from STBCS:</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #dc2626; padding: 20px; border-radius: 8px 0 0 8px; text-align: center; width: 50%;">
                    <p style="margin: 0; color: #fff; font-size: 28px; font-weight: bold;">${params.ransomwareCount}</p>
                    <p style="margin: 5px 0 0; color: #fca5a5; font-size: 12px;">Ransomware Incidents</p>
                  </td>
                  <td style="background-color: #ea580c; padding: 20px; border-radius: 0 8px 8px 0; text-align: center; width: 50%;">
                    <p style="margin: 0; color: #fff; font-size: 28px; font-weight: bold;">${params.cveCount}</p>
                    <p style="margin: 5px 0 0; color: #fed7aa; font-size: 12px;">New CVEs</p>
                  </td>
                </tr>
              </table>

              ${params.criticalCves.length > 0 ? `
              <h3 style="margin: 0 0 15px; color: #fff; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                Critical Vulnerabilities
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                ${criticalCvesHtml}
              </table>
              ` : ''}

              ${params.topRansomwareGroups.length > 0 ? `
              <h3 style="margin: 0 0 15px; color: #fff; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                Most Active Ransomware Groups
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                ${ransomwareGroupsHtml}
              </table>
              ` : ''}

              <a href="https://stoptbcs.com" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Dashboard</a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #333; background-color: #111;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                You subscribed to the STBCS Weekly Security Digest.
                <a href="https://stoptbcs.com/unsubscribe?token=${params.unsubscribeToken}" style="color: #3b82f6;">Unsubscribe</a> |
                <a href="https://stoptbcs.com/preferences" style="color: #3b82f6;">Manage preferences</a>
              </p>
              <p style="margin: 10px 0 0; color: #444; font-size: 11px;">
                STB Cybersecurity | stoptbcs.com | @stoptbcs
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `STBCS Weekly Security Digest: ${params.weekStart} - ${params.weekEnd}

${params.subscriberName ? `Hi ${params.subscriberName},` : ''}

This week's threat intelligence summary:

RANSOMWARE INCIDENTS: ${params.ransomwareCount}
NEW CVEs: ${params.cveCount}

${params.criticalCves.length > 0 ? `CRITICAL VULNERABILITIES:\n${params.criticalCves.slice(0, 5).map(cve => `- ${cve.id} (CVSS ${cve.score})`).join('\n')}\n` : ''}

${params.topRansomwareGroups.length > 0 ? `MOST ACTIVE RANSOMWARE GROUPS:\n${params.topRansomwareGroups.slice(0, 5).map(g => `- ${g.name}: ${g.count} victims`).join('\n')}\n` : ''}

View the full dashboard: https://stoptbcs.com

---
Unsubscribe: https://stoptbcs.com/unsubscribe?token=${params.unsubscribeToken}
STB Cybersecurity | stoptbcs.com`;

  return { subject, html, text };
}

export async function sendAlertNotification(
  userId: string,
  alertType: "ransomware" | "cve" | "breach" | "watchlist",
  title: string,
  description: string,
  options?: {
    severity?: string;
    link?: string;
    matchedItem?: string;
  }
): Promise<void> {
  const user = await storage.getUser(userId);
  if (!user?.email) return;

  const email = generateAlertEmail({
    type: alertType,
    title,
    description,
    severity: options?.severity,
    link: options?.link,
    matchedItem: options?.matchedItem
  });

  await sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.html,
    text: email.text
  });
}

export async function processWatchlistAlerts(userId: string): Promise<void> {
  console.log(`[Alerts] Processing watchlist alerts for user ${userId}...`);
  
  const watchlistItems = await storage.getWatchlistItems(userId);
  if (watchlistItems.length === 0) return;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  for (const item of watchlistItems) {
    if (!item.alertOnMatch) continue;
    
    try {
      switch (item.itemType) {
        case "company":
          const ransomware = await storage.searchRansomware(item.itemValue, 10);
          const recentRansomware = ransomware.filter((r: { discoveredAt: Date | null }) => 
            r.discoveredAt && new Date(r.discoveredAt) > oneHourAgo
          );
          for (const incident of recentRansomware) {
            await createWatchlistNotification(item.userId, item, "ransomware", incident.victim, incident.description || "");
          }
          break;
          
        case "cve":
          const cve = await storage.getCveByCveId(item.itemValue);
          if (cve && cve.createdAt && new Date(cve.createdAt) > oneHourAgo) {
            await createWatchlistNotification(item.userId, item, "cve", cve.cveId, cve.description || "");
          }
          break;
          
        case "sector":
          const sectorIncidents = await storage.getRansomwareIncidents(100, 0, undefined, item.itemValue);
          const recentSectorIncidents = sectorIncidents.filter((r: { discoveredAt: Date | null }) =>
            r.discoveredAt && new Date(r.discoveredAt) > oneHourAgo
          );
          for (const incident of recentSectorIncidents) {
            await createWatchlistNotification(item.userId, item, "sector", incident.victim, `${incident.groupName}: ${incident.description || ""}`);
          }
          break;
      }
    } catch (error) {
      console.error(`[Alerts] Error processing watchlist item ${item.id}:`, error);
    }
  }
}

async function createWatchlistNotification(
  userId: string,
  watchlistItem: { itemType: string; itemValue: string },
  matchType: string,
  title: string,
  description: string
): Promise<void> {
  await storage.createNotification({
    userId,
    type: "watchlist_match",
    title: `Watchlist Match: ${title}`,
    message: description.substring(0, 500),
    severity: "high",
    relatedType: watchlistItem.itemType,
    relatedId: `${matchType}:${watchlistItem.itemValue}`
  });

  console.log(`[Alerts] Created notification for user ${userId}: ${title}`);
}
