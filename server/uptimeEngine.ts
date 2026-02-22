import { storage } from "./storage";
import { sendEmail } from "./email";
import { createLogger } from "./logger";
import * as https from "https";
import * as http from "http";
import * as tls from "tls";
import * as net from "net";
import type { UptimeMonitor } from "@shared/schema";

const log = createLogger("UptimeEngine");
let isRunning = false;
let checkInterval: NodeJS.Timeout | null = null;

interface CheckResult {
  status: "up" | "down" | "degraded";
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  sslValid?: boolean;
  sslDaysRemaining?: number;
  sslExpiresAt?: Date;
  sslIssuer?: string;
  httpVersion?: string;
}

async function checkEndpoint(monitor: UptimeMonitor): Promise<CheckResult> {
  const startTime = Date.now();
  const timeoutMs = (monitor.timeout || 30) * 1000;
  const url = monitor.url.startsWith("http") ? monitor.url : `${monitor.protocol || "https"}://${monitor.url}`;

  return new Promise<CheckResult>((resolve) => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === "https:";
      const transport = isHttps ? https : http;

      const options: any = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "GET",
        timeout: timeoutMs,
        headers: {
          "User-Agent": "STBCS-UptimeMonitor/1.0",
          "Accept": "text/html,application/json,*/*",
        },
        rejectUnauthorized: false,
      };

      const req = transport.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode || 0;
        const httpVersion = `HTTP/${res.httpVersion}`;

        let sslInfo: { sslValid?: boolean; sslDaysRemaining?: number; sslExpiresAt?: Date; sslIssuer?: string } = {};

        if (isHttps && (res as any).socket) {
          try {
            const socket = (res as any).socket as tls.TLSSocket;
            if (socket.getPeerCertificate) {
              const cert = socket.getPeerCertificate();
              if (cert && cert.valid_to) {
                const expiresAt = new Date(cert.valid_to);
                const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                sslInfo = {
                  sslValid: socket.authorized !== false && daysRemaining > 0,
                  sslDaysRemaining: daysRemaining,
                  sslExpiresAt: expiresAt,
                  sslIssuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
                };
              }
            }
          } catch {}
        }

        res.resume();

        const expectedStatus = monitor.expectedStatusCode || 200;
        const isExpectedStatus = statusCode >= 200 && statusCode < 400;
        const isDegraded = responseTime > 5000;

        resolve({
          status: isExpectedStatus ? (isDegraded ? "degraded" : "up") : "down",
          statusCode,
          responseTime,
          httpVersion,
          ...sslInfo,
        });
      });

      req.on("error", (err) => {
        resolve({
          status: "down",
          responseTime: Date.now() - startTime,
          errorMessage: err.message,
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          status: "down",
          responseTime: Date.now() - startTime,
          errorMessage: "Request timed out",
        });
      });

      req.end();
    } catch (err: any) {
      resolve({
        status: "down",
        responseTime: Date.now() - startTime,
        errorMessage: err.message || "Invalid URL",
      });
    }
  });
}

async function checkSslCertificate(hostname: string, port = 443): Promise<{ valid: boolean; daysRemaining: number; expiresAt: Date | null; issuer: string; subject: string; protocol: string; serialNumber: string; fingerprint: string } | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({ host: hostname, port, servername: hostname, rejectUnauthorized: false, timeout: 10000 }, () => {
        try {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            socket.destroy();
            resolve(null);
            return;
          }
          const expiresAt = new Date(cert.valid_to);
          const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          resolve({
            valid: socket.authorized && daysRemaining > 0,
            daysRemaining,
            expiresAt,
            issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
            subject: cert.subject?.CN || hostname,
            protocol: (socket as any).getProtocol?.() || "TLS",
            serialNumber: cert.serialNumber || "",
            fingerprint: cert.fingerprint256 || cert.fingerprint || "",
          });
          socket.destroy();
        } catch {
          socket.destroy();
          resolve(null);
        }
      });
      socket.on("error", () => { resolve(null); });
      socket.on("timeout", () => { socket.destroy(); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

async function processMonitor(monitor: UptimeMonitor): Promise<void> {
  try {
    const result = await checkEndpoint(monitor);

    await storage.recordUptimeCheck({
      monitorId: monitor.id,
      status: result.status,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
      sslValid: result.sslValid,
      sslDaysRemaining: result.sslDaysRemaining,
    });

    const previousState = monitor.currentState;
    const totalChecks = (monitor.totalChecks || 0) + 1;
    const consecutiveFailures = result.status === "down" ? (monitor.consecutiveFailures || 0) + 1 : 0;

    const avgResponseTime = monitor.avgResponseTime
      ? Math.round((monitor.avgResponseTime * (totalChecks - 1) + result.responseTime) / totalChecks)
      : result.responseTime;

    const totalDowntime = result.status === "down"
      ? (monitor.totalDowntime || 0) + (monitor.checkInterval || 300)
      : (monitor.totalDowntime || 0);

    const uptimePercent = totalChecks > 0
      ? Math.round(((totalChecks - (totalDowntime / (monitor.checkInterval || 300))) / totalChecks) * 10000) / 100
      : 100;

    const intervalMs = (monitor.checkInterval || 300) * 1000;
    const nextCheck = new Date(Date.now() + intervalMs);

    const stateUpdate: Partial<UptimeMonitor> = {
      currentState: result.status,
      lastCheckAt: new Date(),
      nextCheckAt: nextCheck,
      totalChecks,
      consecutiveFailures,
      avgResponseTime,
      totalDowntime,
      uptimePercent: Math.min(100, Math.max(0, uptimePercent)),
    };

    if (result.sslExpiresAt) stateUpdate.sslExpiresAt = result.sslExpiresAt;
    if (result.sslIssuer) stateUpdate.sslIssuer = result.sslIssuer;
    if (result.httpVersion) stateUpdate.httpVersion = result.httpVersion;

    await storage.updateMonitorState(monitor.id, stateUpdate);

    if (result.status === "down" && previousState !== "down" && monitor.alertOnDown) {
      const existing = await storage.getActiveIncident(monitor.id);
      if (!existing) {
        await storage.createUptimeIncident({
          monitorId: monitor.id,
          userId: monitor.userId,
          type: "downtime",
          title: `${monitor.name} is DOWN`,
          description: result.errorMessage
            ? `${monitor.url} - ${result.errorMessage}`
            : `${monitor.url} returned HTTP ${result.statusCode}`,
        });
      }
      await sendDownAlert(monitor, result);
    }

    if (result.status === "up" && previousState === "down") {
      await storage.resolveUptimeIncident(monitor.id);
      await sendRecoveryAlert(monitor, result);
    }

    if (result.sslDaysRemaining !== undefined && result.sslDaysRemaining <= (monitor.sslExpiryThresholdDays || 14) && monitor.alertOnSslExpiry) {
      const sslIncident = await storage.getActiveIncident(monitor.id);
      if (!sslIncident || sslIncident.type !== "ssl_expiry") {
        if (result.sslDaysRemaining <= 0) {
          await storage.createUptimeIncident({
            monitorId: monitor.id,
            userId: monitor.userId,
            type: "ssl_expiry",
            title: `SSL Certificate EXPIRED for ${monitor.name}`,
            description: `The SSL certificate for ${monitor.url} has expired. Issued by ${result.sslIssuer || "Unknown"}.`,
          });
        } else {
          await storage.createUptimeIncident({
            monitorId: monitor.id,
            userId: monitor.userId,
            type: "ssl_expiry",
            title: `SSL Certificate expiring soon for ${monitor.name}`,
            description: `The SSL certificate for ${monitor.url} expires in ${result.sslDaysRemaining} days. Issued by ${result.sslIssuer || "Unknown"}.`,
          });
        }
        await sendSslAlert(monitor, result);
      }
    }

    if (result.sslDaysRemaining !== undefined && result.sslDaysRemaining > (monitor.sslExpiryThresholdDays || 14)) {
      const sslIncident = await storage.getActiveIncident(monitor.id);
      if (sslIncident && sslIncident.type === "ssl_expiry") {
        await storage.resolveUptimeIncident(monitor.id);
      }
    }

  } catch (err: any) {
    log.error(`Error processing monitor ${monitor.id}: ${err.message}`);
  }
}

async function sendDownAlert(monitor: UptimeMonitor, result: CheckResult): Promise<void> {
  try {
    const user = await storage.getUser(monitor.userId);
    if (!user?.email || !monitor.emailAlert) return;

    await sendEmail({
      to: user.email,
      subject: `[ALERT] ${monitor.name} is DOWN - STB Cybersecurity`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #e4e4e7; padding: 24px; border-radius: 8px;">
          <div style="background: #dc2626; color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0;">Monitor Alert: DOWN</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #a1a1aa;">Monitor</td><td style="padding: 8px; color: white; font-weight: bold;">${monitor.name}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">URL</td><td style="padding: 8px; color: #f97316;">${monitor.url}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Status</td><td style="padding: 8px; color: #ef4444;">DOWN${result.statusCode ? ` (HTTP ${result.statusCode})` : ''}</td></tr>
            ${result.errorMessage ? `<tr><td style="padding: 8px; color: #a1a1aa;">Error</td><td style="padding: 8px; color: #fbbf24;">${result.errorMessage}</td></tr>` : ''}
            <tr><td style="padding: 8px; color: #a1a1aa;">Response Time</td><td style="padding: 8px;">${result.responseTime}ms</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Detected</td><td style="padding: 8px;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 12px; color: #71717a;">STB Cybersecurity Uptime Monitor</p>
        </div>
      `,
    });
    log.info(`Down alert sent to ${user.email} for ${monitor.name}`);
  } catch (err: any) {
    log.error(`Failed to send down alert for ${monitor.name}: ${err.message}`);
  }
}

async function sendRecoveryAlert(monitor: UptimeMonitor, result: CheckResult): Promise<void> {
  try {
    const user = await storage.getUser(monitor.userId);
    if (!user?.email || !monitor.emailAlert) return;

    await sendEmail({
      to: user.email,
      subject: `[RECOVERED] ${monitor.name} is back UP - STB Cybersecurity`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #e4e4e7; padding: 24px; border-radius: 8px;">
          <div style="background: #16a34a; color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0;">Monitor Recovered: UP</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #a1a1aa;">Monitor</td><td style="padding: 8px; color: white; font-weight: bold;">${monitor.name}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">URL</td><td style="padding: 8px; color: #f97316;">${monitor.url}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Status</td><td style="padding: 8px; color: #22c55e;">UP (HTTP ${result.statusCode})</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Response Time</td><td style="padding: 8px;">${result.responseTime}ms</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Recovered At</td><td style="padding: 8px;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 12px; color: #71717a;">STB Cybersecurity Uptime Monitor</p>
        </div>
      `,
    });
    log.info(`Recovery alert sent to ${user.email} for ${monitor.name}`);
  } catch (err: any) {
    log.error(`Failed to send recovery alert for ${monitor.name}: ${err.message}`);
  }
}

async function sendSslAlert(monitor: UptimeMonitor, result: CheckResult): Promise<void> {
  try {
    const user = await storage.getUser(monitor.userId);
    if (!user?.email || !monitor.emailAlert) return;

    const expired = (result.sslDaysRemaining || 0) <= 0;
    await sendEmail({
      to: user.email,
      subject: `[SSL ${expired ? 'EXPIRED' : 'WARNING'}] ${monitor.name} - STB Cybersecurity`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #e4e4e7; padding: 24px; border-radius: 8px;">
          <div style="background: ${expired ? '#dc2626' : '#f59e0b'}; color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0;">SSL Certificate ${expired ? 'EXPIRED' : 'Expiring Soon'}</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #a1a1aa;">Monitor</td><td style="padding: 8px; color: white; font-weight: bold;">${monitor.name}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Domain</td><td style="padding: 8px; color: #f97316;">${monitor.url}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Days Remaining</td><td style="padding: 8px; color: ${expired ? '#ef4444' : '#fbbf24'}; font-weight: bold;">${result.sslDaysRemaining} days</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Issuer</td><td style="padding: 8px;">${result.sslIssuer || 'Unknown'}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Expires</td><td style="padding: 8px;">${result.sslExpiresAt?.toLocaleDateString() || 'Unknown'}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 12px; color: #71717a;">STB Cybersecurity SSL Monitor</p>
        </div>
      `,
    });
    log.info(`SSL alert sent to ${user.email} for ${monitor.name}`);
  } catch (err: any) {
    log.error(`Failed to send SSL alert for ${monitor.name}: ${err.message}`);
  }
}

export async function runUptimeEngine(): Promise<{ checked: number; alerts: number; errors: number }> {
  if (isRunning) {
    log.debug("Uptime engine already running, skipping");
    return { checked: 0, alerts: 0, errors: 0 };
  }

  isRunning = true;
  let checked = 0;
  let errors = 0;

  try {
    const dueMonitors = await storage.getUptimeMonitorsDue();
    if (dueMonitors.length === 0) return { checked: 0, alerts: 0, errors: 0 };

    log.info(`Processing ${dueMonitors.length} due uptime monitors`);

    const batchSize = 10;
    for (let i = 0; i < dueMonitors.length; i += batchSize) {
      const batch = dueMonitors.slice(i, i + batchSize);
      const results = await Promise.allSettled(batch.map(m => processMonitor(m)));
      for (const r of results) {
        if (r.status === "fulfilled") checked++;
        else errors++;
      }
    }

    log.info(`Uptime check complete: ${checked} checked, ${errors} errors`);
  } catch (err: any) {
    log.error(`Uptime engine error: ${err.message}`);
  } finally {
    isRunning = false;
  }

  return { checked, alerts: 0, errors };
}

export function startUptimeScheduler(intervalSeconds = 60): void {
  log.info(`Starting uptime monitor scheduler (every ${intervalSeconds}s)`);

  runUptimeEngine().catch(err => log.error(`Initial uptime run failed: ${err.message}`));

  checkInterval = setInterval(() => {
    runUptimeEngine().catch(err => log.error(`Uptime run failed: ${err.message}`));
  }, intervalSeconds * 1000);
}

export function stopUptimeScheduler(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

export { checkSslCertificate };
