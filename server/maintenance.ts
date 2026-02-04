import { storage } from "./storage";
import { sendEmail } from "./email";

const ADMIN_EMAIL = "kbpc.inc@gmail.com";
const GRAND_OPENING_END_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

let maintenanceInterval: NodeJS.Timeout | null = null;
let errorCount = 0;
let lastErrorReportTime = 0;

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
    console.log(`[Maintenance] Admin notification sent: ${params.title}`);
  } catch (error) {
    console.error("[Maintenance] Failed to send admin notification:", error);
  }
}

export function reportCriticalError(error: Error, context?: string): void {
  errorCount++;
  const now = Date.now();
  
  if (now - lastErrorReportTime < 5 * 60 * 1000 && errorCount > 10) {
    console.log("[Maintenance] Suppressing error email (rate limit)");
    return;
  }
  
  lastErrorReportTime = now;
  
  sendAdminNotification({
    type: "error",
    title: context ? `Error in ${context}` : "Critical System Error",
    message: "A critical error occurred that may require immediate attention.",
    details: `Error: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}\n\nTimestamp: ${new Date().toISOString()}\nError count (last 5 min): ${errorCount}`
  }).catch(console.error);
}

async function runCleanupTasks(): Promise<void> {
  console.log("[Maintenance] Running scheduled cleanup tasks...");
  
  try {
    await storage.cleanupExpiredSessions();
    console.log("[Maintenance] Expired sessions cleaned up");
  } catch (error) {
    console.error("[Maintenance] Session cleanup failed:", error);
    reportCriticalError(error as Error, "Session Cleanup");
  }
  
  const dayOfWeek = new Date().getUTCDay();
  const hour = new Date().getUTCHours();
  
  if (dayOfWeek === 0 && hour === 3) {
    try {
      const result = await storage.cleanupOldData(365);
      console.log("[Maintenance] Weekly data cleanup completed:", result);
      
      await sendAdminNotification({
        type: "maintenance",
        title: "Weekly Maintenance Complete",
        message: "The weekly data cleanup has been completed successfully.",
        details: `Cleaned up:\n- IPs: ${result.ipsDeleted || 0}\n- URLs: ${result.urlsDeleted || 0}\n- News: ${result.newsDeleted || 0}`
      });
    } catch (error) {
      console.error("[Maintenance] Weekly cleanup failed:", error);
      reportCriticalError(error as Error, "Weekly Data Cleanup");
    }
  }
}

async function checkGrandOpeningSale(): Promise<void> {
  const now = new Date();
  
  if (now >= GRAND_OPENING_END_DATE) {
    console.log("[Maintenance] Grand Opening sale period has ended");
    
    await sendAdminNotification({
      type: "info",
      title: "Grand Opening Sale Has Ended",
      message: `The 30-day Grand Opening sale period has concluded as of ${GRAND_OPENING_END_DATE.toISOString()}.`,
      details: `Action Required:\n1. Deactivate the GRANDOPENING50 coupon in Stripe Dashboard\n2. Update any promotional materials on the website\n3. Consider sending a final promotional email to subscribers\n\nNote: New subscriptions will no longer receive the automatic 50% discount after the coupon is deactivated in Stripe.`
    });
    
    console.log("[Maintenance] Grand Opening sale end notification sent to admin");
  }
}

async function sendDailyHealthCheck(): Promise<void> {
  const now = new Date();
  
  if (now.getUTCHours() === 8 && now.getUTCMinutes() < 5) {
    try {
      const stats = await storage.getDashboardStats();
      
      await sendAdminNotification({
        type: "info",
        title: "Daily Health Check Report",
        message: "STBCS platform is operational. Here's today's summary:",
        details: `Platform Statistics:\n- Active Ransomware Groups: ${stats.activeGroups}\n- Critical CVEs: ${stats.criticalCves}\n- Active Exploits: ${stats.activeExploits}\n- Total Incidents: ${stats.totalIncidents}\n- Malicious IPs: ${stats.maliciousIps}\n- Malicious URLs: ${stats.maliciousUrls}\n- CISA KEV Count: ${stats.cisaKevCount}\n\nSystem Status: All systems operational\nError Count (24h): ${errorCount}\n\nGrand Opening Sale Ends: ${GRAND_OPENING_END_DATE.toLocaleDateString()}`
      });
      
      errorCount = 0;
    } catch (error) {
      console.error("[Maintenance] Health check failed:", error);
      reportCriticalError(error as Error, "Daily Health Check");
    }
  }
}

export function startMaintenanceScheduler(): void {
  console.log("[Maintenance] Starting maintenance scheduler");
  console.log(`[Maintenance] Grand Opening sale ends: ${GRAND_OPENING_END_DATE.toISOString()}`);
  console.log(`[Maintenance] Admin notifications will be sent to: ${ADMIN_EMAIL}`);
  
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
  }
  
  maintenanceInterval = setInterval(async () => {
    try {
      await runCleanupTasks();
      await checkGrandOpeningSale();
      await sendDailyHealthCheck();
    } catch (error) {
      console.error("[Maintenance] Scheduler error:", error);
      reportCriticalError(error as Error, "Maintenance Scheduler");
    }
  }, 5 * 60 * 1000);
  
  setTimeout(async () => {
    try {
      await sendAdminNotification({
        type: "info",
        title: "STBCS Platform Started",
        message: "The STB Cybersecurity platform has been started successfully.",
        details: `Startup Time: ${new Date().toISOString()}\nGrand Opening Sale Active Until: ${GRAND_OPENING_END_DATE.toISOString()}\nAdmin Email: ${ADMIN_EMAIL}\n\nAll systems are operational.`
      });
    } catch (error) {
      console.error("[Maintenance] Failed to send startup notification:", error);
    }
  }, 10000);
}

export function stopMaintenanceScheduler(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
    console.log("[Maintenance] Maintenance scheduler stopped");
  }
}

export function getGrandOpeningEndDate(): Date {
  return GRAND_OPENING_END_DATE;
}

export function isGrandOpeningActive(): boolean {
  return new Date() < GRAND_OPENING_END_DATE;
}
