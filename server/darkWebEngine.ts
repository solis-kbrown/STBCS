import { storage } from "./storage";
import { sendEmail } from "./email";
import { createLogger } from "./logger";
import type { DarkWebMonitor, User } from "@shared/schema";

const log = createLogger("DarkWebEngine");
let isRunning = false;
let scanInterval: NodeJS.Timeout | null = null;

interface DarkWebResult {
  source: string;
  findingType: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  rawData?: string;
  breachDate?: Date;
}

// ===== SOURCE 1: Internal Breach Database =====
async function checkInternalBreachDB(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  try {
    const breaches = await storage.searchBreaches(target, 100);
    for (const breach of breaches) {
      const domainMatch = targetType === "domain" && breach.domain?.toLowerCase().includes(target.toLowerCase());
      const nameMatch = breach.name?.toLowerCase().includes(target.toLowerCase());
      const descMatch = breach.description?.toLowerCase().includes(target.toLowerCase());

      if (domainMatch || nameMatch || descMatch) {
        const dataClasses = breach.dataClasses ? JSON.parse(breach.dataClasses).join(", ") : "Unknown data types";
        results.push({
          source: "STBCS Breach Database",
          findingType: "data_breach",
          title: `Data breach: ${breach.name}`,
          description: `${breach.name} was breached${breach.breachDate ? ` on ${new Date(breach.breachDate).toLocaleDateString()}` : ''}. ${breach.pwnCount ? `${Number(breach.pwnCount).toLocaleString()} accounts affected.` : ''} Exposed data: ${dataClasses}.${breach.description ? ` ${breach.description.slice(0, 200)}` : ''}`,
          severity: breach.isSensitive ? "critical" : (Number(breach.pwnCount || 0) > 1000000 ? "high" : "medium"),
          rawData: JSON.stringify({ breachName: breach.name, pwnCount: breach.pwnCount, dataClasses, verified: breach.isVerified }),
          breachDate: breach.breachDate ? new Date(breach.breachDate) : undefined,
        });
      }
    }
  } catch (err: any) {
    log.debug(`Internal breach DB check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 2: Ransomware Leak Site Monitoring =====
async function checkRansomwareLeaks(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  try {
    const incidents = await storage.searchRansomware(target, 50);
    for (const incident of incidents) {
      const victimMatch = incident.victim?.toLowerCase().includes(target.toLowerCase());
      const websiteMatch = incident.website?.toLowerCase().includes(target.toLowerCase());
      const descMatch = incident.description?.toLowerCase().includes(target.toLowerCase());

      if (victimMatch || websiteMatch || descMatch) {
        results.push({
          source: "Ransomware Leak Sites",
          findingType: "ransomware_leak",
          title: `Ransomware leak: ${incident.victim} by ${incident.groupName}`,
          description: `${incident.groupName} claimed ${incident.victim} as a victim${incident.discoveredAt ? ` on ${new Date(incident.discoveredAt).toLocaleDateString()}` : ''}. ${incident.dataSize ? `Data size: ${incident.dataSize}.` : ''} ${incident.sector ? `Sector: ${incident.sector}.` : ''} ${incident.status === 'published' ? 'Data has been published on leak site.' : `Status: ${incident.status}.`}`,
          severity: incident.status === "published" ? "critical" : "high",
          rawData: JSON.stringify({ group: incident.groupName, victim: incident.victim, sector: incident.sector, status: incident.status }),
          breachDate: incident.discoveredAt ? new Date(incident.discoveredAt) : undefined,
        });
      }
    }
  } catch (err: any) {
    log.debug(`Ransomware leak check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 3: URLhaus Malware Distribution =====
async function checkUrlhausMalware(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "domain" && targetType !== "url") return results;
  try {
    const response = await fetch("https://urlhaus-api.abuse.ch/v1/host/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `host=${encodeURIComponent(target)}`,
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.query_status === "no_results") return results;
      const urlCount = data.urls?.length || 0;
      if (urlCount > 0) {
        const recentUrls = (data.urls || []).slice(0, 5);
        const threats = recentUrls.map((u: any) => u.threat || "malware").join(", ");
        results.push({
          source: "URLhaus (abuse.ch)",
          findingType: "malware_distribution",
          title: `Malware distribution detected on ${target}`,
          description: `${urlCount} malicious URL(s) hosted on ${target}. Threat types: ${threats}. ${data.urls_online ? `${data.urls_online} currently online.` : 'Currently offline.'} First seen: ${data.firstseen || 'Unknown'}.`,
          severity: data.urls_online > 0 ? "critical" : "high",
          rawData: JSON.stringify({ urlCount, urlsOnline: data.urls_online, threats, firstSeen: data.firstseen }),
        });
      }
    }
  } catch (err: any) {
    log.debug(`URLhaus check error for ${target}: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 4: Shodan InternetDB Exposure =====
async function checkShodanExposure(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "ip" && targetType !== "domain") return results;

  let ipToCheck = target;
  if (targetType === "domain") {
    try {
      const dns = await import("dns");
      const { promisify } = await import("util");
      const resolve4 = promisify(dns.resolve4);
      const ips = await resolve4(target);
      if (ips.length > 0) ipToCheck = ips[0];
      else return results;
    } catch { return results; }
  }

  try {
    const response = await fetch(`https://internetdb.shodan.io/${ipToCheck}`, { signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const data = await response.json();
      const openPorts = data.ports || [];
      const vulns = data.vulns || [];
      const cpes = data.cpes || [];

      if (vulns.length > 0) {
        results.push({
          source: "Shodan InternetDB",
          findingType: "vulnerability_exposure",
          title: `${vulns.length} known vulnerabilities exposed on ${target}`,
          description: `IP ${ipToCheck} has ${vulns.length} known CVEs: ${vulns.slice(0, 10).join(', ')}${vulns.length > 10 ? ` and ${vulns.length - 10} more` : ''}. Open ports: ${openPorts.join(', ')}. Services: ${cpes.slice(0, 5).join(', ') || 'Unknown'}.`,
          severity: vulns.length > 5 ? "critical" : "high",
          rawData: JSON.stringify({ ip: ipToCheck, ports: openPorts, vulns, cpes }),
        });
      }

      if (openPorts.length > 0) {
        const dangerousPorts = openPorts.filter((p: number) => [21, 23, 25, 445, 1433, 3306, 3389, 5432, 5900, 6379, 8080, 9200, 27017].includes(p));
        if (dangerousPorts.length > 0) {
          results.push({
            source: "Shodan InternetDB",
            findingType: "exposed_services",
            title: `Sensitive services exposed on ${target}`,
            description: `Potentially dangerous ports open on ${ipToCheck}: ${dangerousPorts.join(', ')}. These services should not be publicly accessible. Total open ports: ${openPorts.length}.`,
            severity: dangerousPorts.some((p: number) => [3389, 5900, 445, 23].includes(p)) ? "critical" : "high",
            rawData: JSON.stringify({ ip: ipToCheck, dangerousPorts, allPorts: openPorts }),
          });
        }
      }
    }
  } catch (err: any) {
    log.debug(`Shodan check error for ${target}: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 5: Feodo Tracker (C&C Servers) =====
async function checkFeodoTracker(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "ip" && targetType !== "domain") return results;
  try {
    const maliciousIps = await storage.getMaliciousIpsByAddress(target);
    const feodoMatches = maliciousIps.filter(ip =>
      ip.source?.toLowerCase().includes("feodo") ||
      ip.source?.toLowerCase().includes("c2") ||
      ip.threatType?.toLowerCase().includes("botnet") ||
      ip.threatType?.toLowerCase().includes("c&c")
    );
    for (const match of feodoMatches) {
      results.push({
        source: "Feodo Tracker (abuse.ch)",
        findingType: "command_control",
        title: `C&C/Botnet server detected: ${target}`,
        description: `${target} is flagged as a command & control server. Threat: ${match.threatType || 'Botnet C&C'}. Source: ${match.source || 'Feodo Tracker'}. ${match.lastSeen ? `Last seen: ${new Date(match.lastSeen).toLocaleDateString()}.` : ''}`,
        severity: "critical",
        rawData: JSON.stringify({ ip: target, threatType: match.threatType, source: match.source }),
      });
    }
  } catch (err: any) {
    log.debug(`Feodo check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 6: SSL Blacklist (abuse.ch) =====
async function checkSslBlacklist(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "ip" && targetType !== "domain") return results;
  try {
    const maliciousIps = await storage.getMaliciousIpsByAddress(target);
    const sslMatches = maliciousIps.filter(ip =>
      ip.source?.toLowerCase().includes("ssl") ||
      ip.source?.toLowerCase().includes("sslbl") ||
      ip.threatType?.toLowerCase().includes("ssl")
    );
    for (const match of sslMatches) {
      results.push({
        source: "SSLBL (abuse.ch)",
        findingType: "malicious_ssl",
        title: `Malicious SSL certificate associated with ${target}`,
        description: `${target} uses SSL certificates associated with malware or botnet activity. Threat: ${match.threatType || 'Malicious SSL'}. ${match.lastSeen ? `Last seen: ${new Date(match.lastSeen).toLocaleDateString()}.` : ''}`,
        severity: "critical",
        rawData: JSON.stringify({ ip: target, threatType: match.threatType }),
      });
    }
  } catch (err: any) {
    log.debug(`SSL blacklist check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 7: OpenPhish / Phishing Detection =====
async function checkPhishingFeeds(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "domain" && targetType !== "url") return results;
  try {
    const malUrls = await storage.getMaliciousUrls(500, 0, undefined, undefined);
    const phishMatches = malUrls.filter(u =>
      u.url?.toLowerCase().includes(target.toLowerCase()) &&
      (u.source?.toLowerCase().includes("phish") || u.threatType?.toLowerCase().includes("phish"))
    );
    for (const match of phishMatches.slice(0, 10)) {
      results.push({
        source: "Phishing Feeds (OpenPhish/PhishTank)",
        findingType: "phishing",
        title: `Phishing page detected targeting ${target}`,
        description: `A phishing page impersonating or hosted on ${target} was detected. URL: ${match.url}. Source: ${match.source || 'OpenPhish'}. ${match.reportedAt ? `Reported: ${new Date(match.reportedAt).toLocaleDateString()}.` : ''}`,
        severity: "high",
        rawData: JSON.stringify({ url: match.url, source: match.source }),
      });
    }
  } catch (err: any) {
    log.debug(`Phishing feed check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 8: Tor Exit Node Association =====
async function checkTorExitNodes(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "ip") return results;
  try {
    const maliciousIps = await storage.getMaliciousIpsByAddress(target);
    const torMatches = maliciousIps.filter(ip =>
      ip.source?.toLowerCase().includes("tor") ||
      ip.threatType?.toLowerCase().includes("tor")
    );
    for (const match of torMatches) {
      results.push({
        source: "Tor Exit Node List",
        findingType: "tor_exit_node",
        title: `IP ${target} is a Tor exit node`,
        description: `${target} is identified as a Tor network exit node. Traffic from this IP may be anonymized and could be used for malicious purposes. Source: ${match.source || 'Tor Project'}.`,
        severity: "medium",
        rawData: JSON.stringify({ ip: target, source: match.source }),
      });
    }
  } catch (err: any) {
    log.debug(`Tor check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 9: CISA KEV (Known Exploited Vulnerabilities tied to domain tech) =====
async function checkCisaKevExposure(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "domain" && targetType !== "keyword") return results;
  try {
    const kevs = await storage.getCisaKev(200, 0);
    const matches = kevs.filter(k =>
      k.vendorProject?.toLowerCase().includes(target.toLowerCase()) ||
      k.product?.toLowerCase().includes(target.toLowerCase()) ||
      k.shortDescription?.toLowerCase().includes(target.toLowerCase())
    );
    for (const kev of matches.slice(0, 10)) {
      results.push({
        source: "CISA KEV",
        findingType: "known_exploited_vuln",
        title: `Known exploited vulnerability: ${kev.cveId}`,
        description: `${kev.cveId} (${kev.vendorProject} ${kev.product}) is being actively exploited in the wild. ${kev.shortDescription || ''} Required action by: ${kev.dueDate ? new Date(kev.dueDate).toLocaleDateString() : 'Unknown'}.`,
        severity: "critical",
        rawData: JSON.stringify({ cveId: kev.cveId, vendor: kev.vendorProject, product: kev.product }),
        breachDate: kev.dateAdded ? new Date(kev.dateAdded) : undefined,
      });
    }
  } catch (err: any) {
    log.debug(`CISA KEV check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 10: DNS/Domain Reputation via External APIs =====
async function checkDomainReputation(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "domain") return results;
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(target)}&type=A`, {
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.Status !== 0) {
        results.push({
          source: "DNS Resolution Check",
          findingType: "dns_issue",
          title: `DNS resolution issue for ${target}`,
          description: `${target} has DNS resolution issues (RCODE: ${data.Status}). This could indicate domain expiry, misconfiguration, or hijacking. ${data.Comment || ''}`,
          severity: "medium",
          rawData: JSON.stringify({ rcode: data.Status, comment: data.Comment }),
        });
      }

      if (data.Answer) {
        const ips = data.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data);
        for (const ip of ips.slice(0, 3)) {
          const malIps = await storage.getMaliciousIpsByAddress(ip);
          if (malIps.length > 0) {
            results.push({
              source: "DNS + Threat Intel Correlation",
              findingType: "malicious_ip_resolution",
              title: `${target} resolves to known malicious IP`,
              description: `${target} resolves to ${ip}, which is flagged in ${malIps.length} threat intelligence source(s): ${malIps.map(m => m.source).join(', ')}. This may indicate compromise or DNS hijacking.`,
              severity: "critical",
              rawData: JSON.stringify({ domain: target, ip, sources: malIps.map(m => ({ source: m.source, threat: m.threatType })) }),
            });
          }
        }
      }
    }
  } catch (err: any) {
    log.debug(`Domain reputation check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 11: Credential Leak Check via dehashed-style public APIs =====
async function checkCredentialLeaks(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  if (targetType !== "email" && targetType !== "domain") return results;

  try {
    const searchTerm = targetType === "email" ? target : `@${target}`;
    const breaches = await storage.searchBreaches(searchTerm, 50);

    const emailBreaches = breaches.filter(b => {
      if (!b.dataClasses) return false;
      try {
        const classes = JSON.parse(b.dataClasses);
        return classes.some((c: string) =>
          c.toLowerCase().includes("email") ||
          c.toLowerCase().includes("password") ||
          c.toLowerCase().includes("credential") ||
          c.toLowerCase().includes("username")
        );
      } catch { return false; }
    });

    for (const breach of emailBreaches.slice(0, 15)) {
      let classes: string[] = [];
      try { classes = JSON.parse(breach.dataClasses || "[]"); } catch {}
      const hasPasswords = classes.some((c: string) => c.toLowerCase().includes("password"));
      const hasEmails = classes.some((c: string) => c.toLowerCase().includes("email"));

      results.push({
        source: "Credential Leak Database",
        findingType: "credential_exposure",
        title: `Credentials exposed in ${breach.name} breach`,
        description: `${hasPasswords ? 'Passwords' : 'Credentials'} associated with ${target} were exposed in the ${breach.name} data breach${breach.breachDate ? ` (${new Date(breach.breachDate).toLocaleDateString()})` : ''}. ${breach.pwnCount ? `${Number(breach.pwnCount).toLocaleString()} total accounts affected.` : ''} Exposed data types: ${classes.join(', ')}.${hasPasswords ? ' IMMEDIATE ACTION: Change all passwords associated with this account.' : ''}`,
        severity: hasPasswords ? "critical" : (hasEmails ? "high" : "medium"),
        rawData: JSON.stringify({ breach: breach.name, dataClasses: classes, pwnCount: breach.pwnCount }),
        breachDate: breach.breachDate ? new Date(breach.breachDate) : undefined,
      });
    }
  } catch (err: any) {
    log.debug(`Credential leak check error: ${err.message}`);
  }
  return results;
}

// ===== SOURCE 12: Threat Actor Association =====
async function checkThreatActorAssociation(target: string, targetType: string): Promise<DarkWebResult[]> {
  const results: DarkWebResult[] = [];
  try {
    const actors = await storage.getThreatActors(200);
    for (const actor of actors) {
      const targetLower = target.toLowerCase();
      const nameMatch = actor.name?.toLowerCase().includes(targetLower);
      const descMatch = actor.description?.toLowerCase().includes(targetLower);
      const targetsMatch = actor.targetSectors?.toLowerCase().includes(targetLower) || actor.targetCountries?.toLowerCase().includes(targetLower);

      if (nameMatch || descMatch || targetsMatch) {
        results.push({
          source: "STBCS Threat Actor Intelligence",
          findingType: "threat_actor_targeting",
          title: `Threat actor ${actor.name} linked to ${target}`,
          description: `The threat group "${actor.name}" has been associated with ${target}. ${actor.description ? actor.description.slice(0, 200) : ''} ${actor.targetSectors ? `Target sectors: ${actor.targetSectors}.` : ''} ${actor.ttps ? `TTPs: ${actor.ttps.slice(0, 100)}.` : ''}`,
          severity: "high",
          rawData: JSON.stringify({ actorName: actor.name, type: actor.type, targetSectors: actor.targetSectors }),
        });
      }
    }
  } catch (err: any) {
    log.debug(`Threat actor check error: ${err.message}`);
  }
  return results;
}

const TIER_SOURCE_MAP: Record<string, string[]> = {
  pro: [
    "internal_breach_db",
    "ransomware_leaks",
    "credential_leaks",
    "phishing_feeds",
    "cisa_kev",
  ],
  business: [
    "internal_breach_db",
    "ransomware_leaks",
    "credential_leaks",
    "phishing_feeds",
    "cisa_kev",
    "urlhaus_malware",
    "shodan_exposure",
    "feodo_tracker",
    "ssl_blacklist",
    "tor_exit_nodes",
    "domain_reputation",
    "threat_actor_association",
  ],
  enterprise: [
    "internal_breach_db",
    "ransomware_leaks",
    "credential_leaks",
    "phishing_feeds",
    "cisa_kev",
    "urlhaus_malware",
    "shodan_exposure",
    "feodo_tracker",
    "ssl_blacklist",
    "tor_exit_nodes",
    "domain_reputation",
    "threat_actor_association",
  ],
};

async function runSourceCheck(sourceKey: string, target: string, targetType: string): Promise<DarkWebResult[]> {
  switch (sourceKey) {
    case "internal_breach_db": return checkInternalBreachDB(target, targetType);
    case "ransomware_leaks": return checkRansomwareLeaks(target, targetType);
    case "credential_leaks": return checkCredentialLeaks(target, targetType);
    case "phishing_feeds": return checkPhishingFeeds(target, targetType);
    case "cisa_kev": return checkCisaKevExposure(target, targetType);
    case "urlhaus_malware": return checkUrlhausMalware(target, targetType);
    case "shodan_exposure": return checkShodanExposure(target, targetType);
    case "feodo_tracker": return checkFeodoTracker(target, targetType);
    case "ssl_blacklist": return checkSslBlacklist(target, targetType);
    case "tor_exit_nodes": return checkTorExitNodes(target, targetType);
    case "domain_reputation": return checkDomainReputation(target, targetType);
    case "threat_actor_association": return checkThreatActorAssociation(target, targetType);
    default: return [];
  }
}

async function processMonitor(monitor: DarkWebMonitor): Promise<number> {
  let newFindings = 0;
  try {
    const user = await storage.getUser(monitor.userId);
    const tier = user?.tier || "pro";
    const allowedSources = TIER_SOURCE_MAP[tier] || TIER_SOURCE_MAP.pro;

    log.info(`Scanning ${monitor.targetType}:${monitor.targetValue} for user ${monitor.userId} (${tier} tier, ${allowedSources.length} sources)`);

    const allResults: DarkWebResult[] = [];
    for (const sourceKey of allowedSources) {
      try {
        const sourceResults = await runSourceCheck(sourceKey, monitor.targetValue, monitor.targetType);
        allResults.push(...sourceResults);
      } catch (err: any) {
        log.debug(`Source ${sourceKey} failed for ${monitor.targetValue}: ${err.message}`);
      }
    }

    for (const result of allResults) {
      const alreadyRecorded = await storage.hasDarkWebFindingBeenRecorded(
        monitor.id, result.source, result.title
      );
      if (alreadyRecorded) continue;

      await storage.createDarkWebFinding({
        monitorId: monitor.id,
        userId: monitor.userId,
        source: result.source,
        findingType: result.findingType,
        title: result.title,
        description: result.description,
        severity: result.severity,
        rawData: result.rawData,
        breachDate: result.breachDate,
      });
      newFindings++;
    }

    if (newFindings > 0) {
      await storage.updateDarkWebMonitorState(monitor.id, {
        totalFindings: (monitor.totalFindings || 0) + newFindings,
      });

      if (monitor.emailAlert && user?.email) {
        await sendDarkWebAlert(user, monitor, allResults.filter(r => !allResults.some(ar => ar === r)), newFindings, allResults);
      }
    }

    const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000);
    await storage.updateDarkWebMonitorState(monitor.id, {
      lastScanAt: new Date(),
      nextScanAt: sixHoursFromNow,
    });

  } catch (err: any) {
    log.error(`Error processing dark web monitor ${monitor.id}: ${err.message}`);
  }
  return newFindings;
}

async function sendDarkWebAlert(user: User, monitor: DarkWebMonitor, _: DarkWebResult[], newCount: number, allResults: DarkWebResult[]): Promise<void> {
  if (!user.email) return;
  try {
    const criticalCount = allResults.filter(r => r.severity === "critical").length;
    const highCount = allResults.filter(r => r.severity === "high").length;

    const findingsHtml = allResults.slice(0, 10).map(r => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #333;">
          <span style="color: ${r.severity === 'critical' ? '#ef4444' : r.severity === 'high' ? '#f97316' : '#fbbf24'}; font-weight: bold;">${r.severity.toUpperCase()}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #333; color: white;">${r.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #333; color: #a1a1aa; font-size: 12px;">${r.source}</td>
      </tr>
    `).join("");

    await sendEmail({
      to: user.email,
      subject: `[DARK WEB ALERT] ${newCount} new finding(s) for ${monitor.targetValue} - STB Cybersecurity`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #e4e4e7; padding: 24px; border-radius: 8px;">
          <div style="background: #7c3aed; color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0;">Dark Web Monitor Alert</h2>
            <p style="margin: 4px 0 0; opacity: 0.9;">${newCount} new finding(s) detected</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 8px; color: #a1a1aa;">Target</td><td style="padding: 8px; color: #f97316; font-weight: bold;">${monitor.targetValue}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Type</td><td style="padding: 8px;">${monitor.targetType}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">Critical Findings</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">${criticalCount}</td></tr>
            <tr><td style="padding: 8px; color: #a1a1aa;">High Findings</td><td style="padding: 8px; color: #f97316;">${highCount}</td></tr>
          </table>
          <h3 style="color: white; margin-top: 16px;">Findings</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #27272a;">
              <th style="padding: 8px; text-align: left; color: #a1a1aa; font-size: 12px;">SEVERITY</th>
              <th style="padding: 8px; text-align: left; color: #a1a1aa; font-size: 12px;">FINDING</th>
              <th style="padding: 8px; text-align: left; color: #a1a1aa; font-size: 12px;">SOURCE</th>
            </tr>
            ${findingsHtml}
          </table>
          ${allResults.length > 10 ? `<p style="color: #71717a; font-size: 12px; margin-top: 8px;">And ${allResults.length - 10} more findings. Log in to view all.</p>` : ''}
          <p style="margin-top: 16px; font-size: 12px; color: #71717a;">STB Cybersecurity Dark Web Monitor</p>
        </div>
      `,
    });
    log.info(`Dark web alert sent to ${user.email} for ${monitor.targetValue}`);
  } catch (err: any) {
    log.error(`Failed to send dark web alert: ${err.message}`);
  }
}

export async function runDarkWebEngine(): Promise<{ scanned: number; findings: number; errors: number }> {
  if (isRunning) {
    log.debug("Dark web engine already running, skipping");
    return { scanned: 0, findings: 0, errors: 0 };
  }

  isRunning = true;
  let scanned = 0;
  let totalFindings = 0;
  let errors = 0;

  try {
    const dueMonitors = await storage.getDarkWebMonitorsDue();
    if (dueMonitors.length === 0) return { scanned: 0, findings: 0, errors: 0 };

    log.info(`Processing ${dueMonitors.length} due dark web monitors`);

    for (const monitor of dueMonitors) {
      try {
        const findings = await processMonitor(monitor);
        totalFindings += findings;
        scanned++;
      } catch (err: any) {
        errors++;
        log.error(`Dark web monitor ${monitor.id} failed: ${err.message}`);
      }
    }

    log.info(`Dark web scan complete: ${scanned} scanned, ${totalFindings} new findings, ${errors} errors`);
  } catch (err: any) {
    const msg = err?.message || "";
    const isTransient = msg.includes("timeout exceeded") || msg.includes("Connection terminated") ||
      msg.includes("connection timeout") || msg.includes("too many clients") || msg.includes("ETIMEDOUT");
    if (isTransient) {
      log.debug(`Dark web engine skipped (transient): ${msg.split("\n")[0]}`);
    } else {
      log.error(`Dark web engine error: ${msg}`);
    }
  } finally {
    isRunning = false;
  }

  return { scanned, findings: totalFindings, errors };
}

export function startDarkWebScheduler(intervalMinutes = 60): void {
  log.info(`Starting dark web monitor scheduler (check due monitors every ${intervalMinutes}m)`);

  setTimeout(() => {
    runDarkWebEngine().catch(err => log.error(`Initial dark web run failed: ${err.message}`));
  }, 30000);

  scanInterval = setInterval(() => {
    runDarkWebEngine().catch(err => {
      const msg = err?.message || "";
      const isTransient = msg.includes("timeout exceeded") || msg.includes("Connection terminated") ||
        msg.includes("connection timeout") || msg.includes("too many clients") || msg.includes("ETIMEDOUT");
      if (isTransient) {
        log.debug(`Dark web scheduler skipped (transient): ${msg.split("\n")[0]}`);
      } else {
        log.error(`Dark web run failed: ${msg}`);
      }
    });
  }, intervalMinutes * 60 * 1000);
}

export function stopDarkWebScheduler(): void {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
}

export const DARK_WEB_TIER_LIMITS = {
  pro: { maxMonitors: 5, sources: 5, scanInterval: "6 hours" },
  business: { maxMonitors: 25, sources: 12, scanInterval: "6 hours" },
  enterprise: { maxMonitors: 100, sources: 12, scanInterval: "6 hours" },
};
