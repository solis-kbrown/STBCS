import { storage } from "./storage";
import { sendEmail } from "./email";
import { db } from "./db";
import { systemConfig } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createLogger } from "./logger";

const log = createLogger("Maintenance");
const ADMIN_EMAIL = "kbpc.inc@gmail.com";
const SALE_DURATION_DAYS = 30;

let maintenanceInterval: NodeJS.Timeout | null = null;
let errorRateWindow: { count: number; windowStart: number } = { count: 0, windowStart: Date.now() };
let saleEndNotificationSent = false;
let sessionCleanupFailures = 0;

async function getConfig(configKey: string): Promise<string | null> {
  try {
    const result = await db.select().from(systemConfig).where(eq(systemConfig.key, configKey)).limit(1);
    return result.length > 0 ? result[0].value : null;
  } catch (error) {
    log.error(`Error getting config ${configKey}:`, error);
    return null;
  }
}

async function setConfig(configKey: string, value: string): Promise<boolean> {
  try {
    const existing = await db.select().from(systemConfig).where(eq(systemConfig.key, configKey)).limit(1);
    
    if (existing.length > 0) {
      await db.update(systemConfig)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemConfig.key, configKey));
    } else {
      await db.insert(systemConfig)
        .values({ key: configKey, value, updatedAt: new Date() });
    }
    return true;
  } catch (error) {
    log.error(`Error setting config ${configKey}:`, error);
    return false;
  }
}

async function getOrInitializeSaleDate(): Promise<Date> {
  const existingEnd = await getConfig("grand_opening_end");
  
  if (existingEnd) {
    return new Date(existingEnd);
  }

  const endDate = new Date(Date.now() + SALE_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const success = await setConfig("grand_opening_end", endDate.toISOString());
  
  if (!success) {
    log.error("Failed to persist sale end date - using in-memory fallback");
  }
  
  return endDate;
}

async function getLastRun(taskName: string): Promise<number> {
  const value = await getConfig(`last_run_${taskName}`);
  return value ? parseInt(value, 10) : 0;
}

async function setLastRun(taskName: string): Promise<void> {
  await setConfig(`last_run_${taskName}`, Date.now().toString());
}

export async function sendAdminNotification(params: {
  type: "error" | "warning" | "info" | "maintenance";
  title: string;
  message: string;
  details?: string;
}): Promise<void> {
  const typeColors: Record<string, string> = {
    error: "#dc2626",
    warning: "#ea580c",
    info: "#3b82f6",
    maintenance: "#22c55e"
  };

  const typeLabels: Record<string, string> = {
    error: "CRITICAL ERROR",
    warning: "Warning",
    info: "Information",
    maintenance: "Maintenance"
  };

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
                      <span style="color: #f97316;">STBCS</span> Admin Alert
                    </h1>
                    <p style="margin: 5px 0 0; color: #888; font-size: 12px;">System Notification</p>
                  </td>
                  <td align="right">
                    <span style="background-color: ${typeColors[params.type]}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      ${typeLabels[params.type]}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 15px; color: #fff; font-size: 20px;">${params.title}</h2>
              <p style="margin: 0 0 20px; color: #ccc; font-size: 14px; line-height: 1.6;">${params.message}</p>
              ${params.details ? `
              <div style="background-color: #111; border: 1px solid #333; border-radius: 4px; padding: 15px; margin-top: 15px;">
                <pre style="margin: 0; color: #888; font-size: 12px; font-family: monospace; white-space: pre-wrap; word-break: break-word;">${params.details}</pre>
              </div>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #333; background-color: #111;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                Sent from STBCS Admin System at ${new Date().toISOString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${typeLabels[params.type]}: ${params.title}\n\n${params.message}\n\n${params.details || ''}`;

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[STBCS ${typeLabels[params.type]}] ${params.title}`,
      html,
      text
    });
    log.debug(`Admin notification sent: ${params.title}`);
  } catch (error) {
    log.error("Failed to send admin notification:", error);
  }
}

export function reportCriticalError(error: Error, context?: string): void {
  const now = Date.now();
  const WINDOW_MS = 5 * 60 * 1000;
  const MAX_ERRORS_PER_WINDOW = 10;

  if (now - errorRateWindow.windowStart > WINDOW_MS) {
    errorRateWindow = { count: 0, windowStart: now };
  }

  errorRateWindow.count++;

  if (errorRateWindow.count > MAX_ERRORS_PER_WINDOW) {
    log.debug(`Suppressing error email (${errorRateWindow.count} errors in window, max ${MAX_ERRORS_PER_WINDOW})`);
    return;
  }

  sendAdminNotification({
    type: "error",
    title: context ? `Error in ${context}` : "Critical System Error",
    message: "A critical error occurred that may require immediate attention.",
    details: `Error: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}\n\nTimestamp: ${new Date().toISOString()}\nErrors in current window: ${errorRateWindow.count}`
  }).catch(console.error);
}

async function runCleanupTasks(): Promise<void> {
  try {
    await storage.cleanupExpiredSessions();
    sessionCleanupFailures = 0;
  } catch (error) {
    sessionCleanupFailures++;
    log.error("Session cleanup failed:", error);
    if (sessionCleanupFailures >= 3) {
      reportCriticalError(error as Error, "Session Cleanup (failed 3+ times consecutively)");
      sessionCleanupFailures = 0;
    }
  }

  const now = Date.now();
  const dayOfWeek = new Date().getUTCDay();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const lastWeeklyRun = await getLastRun("weekly_cleanup");

  if (dayOfWeek === 0 && now - lastWeeklyRun > WEEK_MS - 24 * 60 * 60 * 1000) {
    try {
      const result = await storage.cleanupOldData(730); // 2 year retention
      log.info(`Weekly cleanup: ${result.ipsDeleted} IPs, ${result.urlsDeleted} URLs, ${result.newsDeleted} news removed`);
      await setLastRun("weekly_cleanup");

      await sendAdminNotification({
        type: "maintenance",
        title: "Weekly Maintenance Complete",
        message: "The weekly data cleanup has been completed successfully.",
        details: `Cleaned up:\n- IPs: ${result.ipsDeleted || 0}\n- URLs: ${result.urlsDeleted || 0}\n- News: ${result.newsDeleted || 0}`
      });
    } catch (error) {
      log.error("Weekly cleanup failed:", error);
      reportCriticalError(error as Error, "Weekly Data Cleanup");
    }
  }
}

async function checkGrandOpeningSale(): Promise<void> {
  if (saleEndNotificationSent) return;

  const now = new Date();
  const endDate = await getOrInitializeSaleDate();

  if (now >= endDate) {
    const notificationSent = await getConfig("sale_end_notification_sent");
    if (notificationSent === "true") {
      saleEndNotificationSent = true;
      return;
    }

    saleEndNotificationSent = true;
    await setConfig("sale_end_notification_sent", "true");
    log.info("Grand Opening sale period has ended");

    await sendAdminNotification({
      type: "info",
      title: "Grand Opening Sale Has Ended",
      message: `The 30-day Grand Opening sale period has concluded as of ${endDate.toISOString()}.`,
      details: `Action Required:\n1. Deactivate the GRANDOPENING50 coupon in Stripe Dashboard\n2. Update any promotional materials on the website\n3. Consider sending a final promotional email to subscribers\n\nNote: New subscriptions will no longer receive the automatic 50% discount after the coupon is deactivated in Stripe.`
    });

    log.info("Grand Opening sale end notification sent to admin");
  }
}

async function sendDailyHealthCheck(): Promise<void> {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const currentHour = new Date().getUTCHours();
  const lastHealthCheck = await getLastRun("daily_health_check");

  if (currentHour >= 8 && currentHour < 9 && now - lastHealthCheck > DAY_MS - 60 * 60 * 1000) {
    try {
      const stats = await storage.getDashboardStats();
      const endDate = await getOrInitializeSaleDate();

      await sendAdminNotification({
        type: "info",
        title: "Daily Health Check Report",
        message: "STBCS platform is operational. Here's today's summary:",
        details: `Platform Statistics:\n- Active Ransomware Groups: ${stats.activeGroups}\n- Critical CVEs: ${stats.criticalCves}\n- Active Exploits: ${stats.activeExploits}\n- Total Incidents: ${stats.totalIncidents}\n- Malicious IPs: ${stats.maliciousIps}\n- Malicious URLs: ${stats.maliciousUrls}\n- CISA KEV Count: ${stats.cisaKevCount}\n\nSystem Status: All systems operational\nErrors in current window: ${errorRateWindow.count}\n\nGrand Opening Sale Ends: ${endDate.toLocaleDateString()}`
      });

      await setLastRun("daily_health_check");
      errorRateWindow = { count: 0, windowStart: now };
    } catch (error) {
      log.error("Health check failed:", error);
      reportCriticalError(error as Error, "Daily Health Check");
    }
  }
}

export async function startMaintenanceScheduler(): Promise<void> {
  const endDate = await getOrInitializeSaleDate();
  log.info(`Maintenance scheduler started | Sale ends: ${endDate.toLocaleDateString()} | Admin: ${ADMIN_EMAIL}`);

  const notificationSent = await getConfig("sale_end_notification_sent");
  if (notificationSent === "true") {
    saleEndNotificationSent = true;
  }

  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
  }

  maintenanceInterval = setInterval(async () => {
    try {
      await runCleanupTasks();
      await checkGrandOpeningSale();
      await sendDailyHealthCheck();
    } catch (error) {
      log.error("Scheduler error:", error);
      reportCriticalError(error as Error, "Maintenance Scheduler");
    }
  }, 5 * 60 * 1000);

  setTimeout(async () => {
    try {
      const currentEndDate = await getOrInitializeSaleDate();
      await sendAdminNotification({
        type: "info",
        title: "STBCS Platform Started",
        message: "The STB Cybersecurity platform has been started successfully.",
        details: `Startup Time: ${new Date().toISOString()}\nGrand Opening Sale Active Until: ${currentEndDate.toISOString()}\nAdmin Email: ${ADMIN_EMAIL}\n\nAll systems are operational.`
      });
    } catch (error) {
      log.error("Failed to send startup notification:", error);
    }
  }, 10000);
}

export function stopMaintenanceScheduler(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
    log.info("Maintenance scheduler stopped");
  }
}

export async function getGrandOpeningEndDate(): Promise<Date> {
  return await getOrInitializeSaleDate();
}

export async function isGrandOpeningActive(): Promise<boolean> {
  const endDate = await getOrInitializeSaleDate();
  return new Date() < endDate;
}
