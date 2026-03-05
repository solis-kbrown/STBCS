import { storage } from "./storage";
import type { MaliciousUrl, InsertPhishingBulletin } from "@shared/schema";

const BRAND_KEYWORDS: Record<string, { display: string; keywords: string[] }> = {
  microsoft: { display: "Microsoft 365", keywords: ["microsoft", "outlook", "office365", "onedrive", "sharepoint", "teams", "msft", "hotmail", "live.com", "azure"] },
  google: { display: "Google", keywords: ["google", "gmail", "gdrive", "youtube", "goog", "chrome"] },
  apple: { display: "Apple", keywords: ["apple", "icloud", "itunes", "appleid"] },
  amazon: { display: "Amazon", keywords: ["amazon", "aws", "amzn", "prime"] },
  paypal: { display: "PayPal", keywords: ["paypal", "paypa1"] },
  netflix: { display: "Netflix", keywords: ["netflix", "netfllx", "netf1ix"] },
  facebook: { display: "Facebook / Meta", keywords: ["facebook", "instagram", "whatsapp", "meta", "fb.com"] },
  linkedin: { display: "LinkedIn", keywords: ["linkedin", "lnkd"] },
  twitter: { display: "X (Twitter)", keywords: ["twitter", "x.com", "twttr"] },
  chase: { display: "Chase Bank", keywords: ["chase", "jpmorgan"] },
  wellsfargo: { display: "Wells Fargo", keywords: ["wellsfargo", "wells-fargo", "wf.com"] },
  bankofamerica: { display: "Bank of America", keywords: ["bankofamerica", "bofa", "boa.com"] },
  citibank: { display: "Citibank", keywords: ["citibank", "citi.com", "citigroup"] },
  usps: { display: "USPS", keywords: ["usps", "uspss", "uspostal"] },
  fedex: { display: "FedEx", keywords: ["fedex", "fedx"] },
  dhl: { display: "DHL", keywords: ["dhl", "dh1"] },
  ups: { display: "UPS", keywords: ["ups.com", "upstrack"] },
  dropbox: { display: "Dropbox", keywords: ["dropbox", "dropb0x"] },
  adobe: { display: "Adobe", keywords: ["adobe", "acrobat", "adobesign"] },
  zoom: { display: "Zoom", keywords: ["zoom", "zoom.us", "z00m"] },
  docusign: { display: "DocuSign", keywords: ["docusign", "d0cusign"] },
  coinbase: { display: "Coinbase", keywords: ["coinbase", "c0inbase"] },
  binance: { display: "Binance", keywords: ["binance", "b1nance"] },
  metamask: { display: "MetaMask", keywords: ["metamask", "metamas"] },
  walmart: { display: "Walmart", keywords: ["walmart", "wa1mart"] },
  att: { display: "AT&T", keywords: ["att.com", "att-", "atandt"] },
  verizon: { display: "Verizon", keywords: ["verizon", "vzw"] },
  steam: { display: "Steam", keywords: ["steam", "steampowered", "steamcommunity"] },
  discord: { display: "Discord", keywords: ["discord", "disc0rd"] },
  slack: { display: "Slack", keywords: ["slack", "s1ack"] },
  shopify: { display: "Shopify", keywords: ["shopify", "sh0pify"] },
  ebay: { display: "eBay", keywords: ["ebay", "e-bay"] },
  intuit: { display: "Intuit / QuickBooks", keywords: ["intuit", "quickbooks", "turbotax"] },
  irs: { display: "IRS", keywords: ["irs.gov", "irs-", "internal-revenue"] },
  capita1one: { display: "Capital One", keywords: ["capitalone", "capital-one", "capita1one"] },
  robinhood: { display: "Robinhood", keywords: ["robinhood", "robinhud", "r0binhood"] },
  schwab: { display: "Charles Schwab", keywords: ["schwab", "charlesschwab"] },
  fidelity: { display: "Fidelity", keywords: ["fidelity", "fide1ity"] },
  truist: { display: "Truist", keywords: ["truist", "tru1st"] },
  webmail: { display: "Webmail / Email", keywords: ["webmail", "roundcube", "horde", "squirrelmail", "cpanel"] },
};

const ATTACK_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /log\s*in|signin|sign-in|auth|sso/i, type: "Credential Harvest" },
  { pattern: /verif|confirm|validate|secure/i, type: "Account Verification Scam" },
  { pattern: /pay|invoice|billing|subscription|renew/i, type: "Payment / Billing Scam" },
  { pattern: /password|reset|recover|unlock/i, type: "Password Reset Lure" },
  { pattern: /deliver|track|ship|package|parcel/i, type: "Delivery Notification Scam" },
  { pattern: /reward|prize|gift|win|claim/i, type: "Reward / Prize Scam" },
  { pattern: /support|help|ticket|case/i, type: "Tech Support Scam" },
  { pattern: /wallet|crypto|token|seed|phrase/i, type: "Crypto Wallet Drainer" },
  { pattern: /update|upgrade|expire|suspend/i, type: "Urgent Action Required" },
];

function defangUrl(url: string): string {
  return url
    .replace(/https?:\/\//gi, "hxxps://")
    .replace(/\./g, "[.]");
}

function extractHostname(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    const match = url.match(/^(?:https?:\/\/)?([^\/\?#:]+)/i);
    return match ? match[1].toLowerCase() : url.toLowerCase();
  }
}

function identifyBrand(url: string): string | null {
  const hostname = extractHostname(url);

  for (const [, brand] of Object.entries(BRAND_KEYWORDS)) {
    for (const keyword of brand.keywords) {
      if (hostname.includes(keyword)) {
        return brand.display;
      }
    }
  }

  try {
    const parsed = new URL(url);
    const pathSegment = parsed.pathname.split("/").slice(0, 3).join("/").toLowerCase();
    for (const [, brand] of Object.entries(BRAND_KEYWORDS)) {
      for (const keyword of brand.keywords) {
        if (keyword.length >= 5 && pathSegment.includes(keyword)) {
          return brand.display;
        }
      }
    }
  } catch {}

  return null;
}

function classifyAttack(url: string): string {
  const lower = url.toLowerCase();
  for (const { pattern, type } of ATTACK_PATTERNS) {
    if (pattern.test(lower)) return type;
  }
  return "Generic Phishing";
}

export interface BulletinData {
  date: Date;
  period: "daily" | "weekly";
  totalThreats: number;
  topBrands: { name: string; count: number }[];
  attackTypes: { type: string; count: number }[];
  spoofedDomains: { domain: string; brand: string | null; defanged: string }[];
  suggestedSubject: string;
  introText: string;
  actionItems: string[];
}

function buildBulletinData(urls: MaliciousUrl[], period: "daily" | "weekly"): BulletinData {
  const now = new Date();
  const brandCounts = new Map<string, number>();
  const attackCounts = new Map<string, number>();
  const domainSet = new Map<string, { brand: string | null; count: number }>();

  for (const entry of urls) {
    const brand = identifyBrand(entry.url);
    if (brand) {
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    }

    const attackType = classifyAttack(entry.url);
    attackCounts.set(attackType, (attackCounts.get(attackType) || 0) + 1);

    const hostname = extractHostname(entry.url);
    if (hostname && hostname.length > 3) {
      const existing = domainSet.get(hostname);
      if (existing) {
        existing.count++;
      } else {
        domainSet.set(hostname, { brand, count: 1 });
      }
    }
  }

  const topBrands = [...brandCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const attackTypes = [...attackCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const spoofedDomains = [...domainSet.entries()]
    .map(([domain, { brand }]) => ({
      domain,
      brand,
      defanged: defangUrl(domain),
    }))
    .sort((a, b) => (domainSet.get(b.domain)?.count || 0) - (domainSet.get(a.domain)?.count || 0))
    .slice(0, 20);

  const periodLabel = period === "daily" ? "today" : "this week";
  const topBrand = topBrands[0]?.name || "various services";
  const suggestedSubject = topBrands.length > 0
    ? `[SECURITY ALERT] Active Phishing Campaigns Targeting ${topBrand} — Do Not Click`
    : `[SECURITY ALERT] ${urls.length} Phishing Threats Detected ${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)} — Do Not Click`;

  const introText = `Our threat intelligence systems have detected ${urls.length.toLocaleString()} active phishing URLs ${periodLabel}. `
    + (topBrands.length > 0
      ? `The most impersonated brands are ${topBrands.slice(0, 3).map(b => b.name).join(", ")}. `
      : "")
    + `Forward any suspicious emails to your IT department immediately.`;

  const actionItems = [
    "Do NOT click links in unexpected emails, texts, or messages",
    "Verify sender addresses carefully — look for misspelled domains",
    "Enable multi-factor authentication (MFA) on all accounts",
    "Report suspicious emails to your IT/security team immediately",
    "When in doubt, navigate directly to the website by typing the URL",
    "Check for HTTPS and valid certificates before entering credentials",
  ];

  return {
    date: now,
    period,
    totalThreats: urls.length,
    topBrands,
    attackTypes,
    spoofedDomains,
    suggestedSubject,
    introText,
    actionItems,
  };
}

export function formatBulletinPlainText(data: BulletinData): string {
  const dateStr = data.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const periodLabel = data.period === "daily" ? "Daily" : "Weekly";

  let text = "";
  text += "=".repeat(60) + "\n";
  text += `  DO NOT CLICK — ${periodLabel} Phishing Awareness Bulletin\n`;
  text += `  ${dateStr}\n`;
  text += `  STB Cybersecurity | stbcybersecurity.com\n`;
  text += "=".repeat(60) + "\n\n";

  text += `SUGGESTED EMAIL SUBJECT:\n`;
  text += `${data.suggestedSubject}\n\n`;

  text += "-".repeat(60) + "\n";
  text += "SUMMARY\n";
  text += "-".repeat(60) + "\n\n";
  text += `${data.introText}\n\n`;
  text += `Total phishing URLs detected: ${data.totalThreats.toLocaleString()}\n\n`;

  if (data.topBrands.length > 0) {
    text += "-".repeat(60) + "\n";
    text += "TOP TARGETED BRANDS\n";
    text += "-".repeat(60) + "\n\n";
    for (const brand of data.topBrands) {
      text += `  * ${brand.name} — ${brand.count} phishing URL${brand.count !== 1 ? "s" : ""}\n`;
    }
    text += "\n";
  }

  if (data.attackTypes.length > 0) {
    text += "-".repeat(60) + "\n";
    text += "ATTACK TYPES OBSERVED\n";
    text += "-".repeat(60) + "\n\n";
    for (const atk of data.attackTypes.slice(0, 8)) {
      text += `  * ${atk.type} — ${atk.count} instance${atk.count !== 1 ? "s" : ""}\n`;
    }
    text += "\n";
  }

  if (data.spoofedDomains.length > 0) {
    text += "-".repeat(60) + "\n";
    text += "EXAMPLE SPOOFED DOMAINS (Sanitized)\n";
    text += "-".repeat(60) + "\n\n";
    text += "  WARNING: These domains are MALICIOUS. Do NOT visit them.\n\n";
    for (const d of data.spoofedDomains.slice(0, 15)) {
      const brandTag = d.brand ? ` (impersonating ${d.brand})` : "";
      text += `  * ${d.defanged}${brandTag}\n`;
    }
    text += "\n";
  }

  text += "-".repeat(60) + "\n";
  text += "ACTION ITEMS FOR ALL EMPLOYEES\n";
  text += "-".repeat(60) + "\n\n";
  for (const item of data.actionItems) {
    text += `  [ ] ${item}\n`;
  }
  text += "\n";

  text += "=".repeat(60) + "\n";
  text += "  Powered by STB Cybersecurity Threat Intelligence\n";
  text += "  https://stbcybersecurity.com | (855) STB-1987\n";
  text += "=".repeat(60) + "\n";

  return text;
}

export function formatBulletinHtml(data: BulletinData): string {
  const dateStr = data.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const periodLabel = data.period === "daily" ? "Daily" : "Weekly";

  const brandBadges = data.topBrands.slice(0, 8).map(b =>
    `<span style="display:inline-block;background:#7c2d12;color:#fb923c;padding:3px 10px;border-radius:12px;font-size:13px;margin:2px 4px 2px 0;font-weight:600;">${b.name} (${b.count})</span>`
  ).join("");

  const attackRows = data.attackTypes.slice(0, 8).map(a =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #3f3f46;color:#e4e4e7;">${a.type}</td><td style="padding:6px 12px;border-bottom:1px solid #3f3f46;color:#fb923c;font-weight:600;text-align:right;">${a.count}</td></tr>`
  ).join("");

  const domainRows = data.spoofedDomains.slice(0, 15).map(d => {
    const brandTag = d.brand ? `<span style="color:#a1a1aa;font-size:12px;"> — impersonating ${d.brand}</span>` : "";
    return `<li style="margin-bottom:4px;"><code style="background:#27272a;padding:2px 6px;border-radius:3px;color:#f87171;font-size:13px;">${d.defanged}</code>${brandTag}</li>`;
  }).join("");

  const actionRows = data.actionItems.map(item =>
    `<li style="margin-bottom:6px;color:#e4e4e7;">${item}</li>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:20px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #3f3f46;border-radius:8px;overflow:hidden;">

<tr><td style="background:linear-gradient(135deg,#7c2d12,#dc2626);padding:24px 32px;">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">DO NOT CLICK</h1>
<p style="margin:4px 0 0;color:#fecdd3;font-size:14px;">${periodLabel} Phishing Awareness Bulletin — ${dateStr}</p>
</td></tr>

<tr><td style="padding:24px 32px;">
<p style="color:#e4e4e7;font-size:15px;line-height:1.6;margin:0 0 16px;">${data.introText}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td style="background:#27272a;border-radius:6px;padding:16px;text-align:center;">
<span style="color:#fb923c;font-size:28px;font-weight:700;">${data.totalThreats.toLocaleString()}</span>
<br><span style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phishing URLs Detected</span>
</td></tr></table>
</td></tr>

${data.topBrands.length > 0 ? `<tr><td style="padding:0 32px 24px;">
<h2 style="color:#f87171;font-size:16px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Top Targeted Brands</h2>
<div>${brandBadges}</div>
</td></tr>` : ""}

${data.attackTypes.length > 0 ? `<tr><td style="padding:0 32px 24px;">
<h2 style="color:#f87171;font-size:16px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Attack Types</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #3f3f46;border-radius:6px;overflow:hidden;">
<tr><th style="padding:8px 12px;background:#27272a;color:#a1a1aa;text-align:left;font-size:12px;text-transform:uppercase;">Type</th><th style="padding:8px 12px;background:#27272a;color:#a1a1aa;text-align:right;font-size:12px;text-transform:uppercase;">Count</th></tr>
${attackRows}</table>
</td></tr>` : ""}

${data.spoofedDomains.length > 0 ? `<tr><td style="padding:0 32px 24px;">
<h2 style="color:#f87171;font-size:16px;font-weight:600;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Spoofed Domains (Sanitized)</h2>
<p style="color:#fbbf24;font-size:12px;margin:0 0 12px;">WARNING: These domains are MALICIOUS. Do NOT visit them.</p>
<ul style="margin:0;padding:0 0 0 16px;">${domainRows}</ul>
</td></tr>` : ""}

<tr><td style="padding:0 32px 24px;">
<h2 style="color:#22c55e;font-size:16px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Action Items</h2>
<ul style="margin:0;padding:0 0 0 16px;">${actionRows}</ul>
</td></tr>

<tr><td style="background:#27272a;padding:20px 32px;text-align:center;border-top:1px solid #3f3f46;">
<p style="margin:0;color:#a1a1aa;font-size:12px;">Powered by <strong style="color:#fb923c;">STB Cybersecurity</strong> Threat Intelligence</p>
<p style="margin:4px 0 0;color:#71717a;font-size:11px;">stbcybersecurity.com | (855) STB-1987</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export function formatBulletinMarkdown(data: BulletinData): string {
  const dateStr = data.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const periodLabel = data.period === "daily" ? "Daily" : "Weekly";

  let md = "";
  md += `# DO NOT CLICK — ${periodLabel} Phishing Bulletin\n`;
  md += `**${dateStr}** | STB Cybersecurity\n\n`;
  md += `---\n\n`;

  md += `## Summary\n\n`;
  md += `${data.introText}\n\n`;
  md += `**Total phishing URLs detected:** ${data.totalThreats.toLocaleString()}\n\n`;

  if (data.topBrands.length > 0) {
    md += `## Top Targeted Brands\n\n`;
    md += `| Brand | Phishing URLs |\n|---|---|\n`;
    for (const b of data.topBrands) {
      md += `| ${b.name} | ${b.count} |\n`;
    }
    md += "\n";
  }

  if (data.attackTypes.length > 0) {
    md += `## Attack Types\n\n`;
    for (const a of data.attackTypes.slice(0, 8)) {
      md += `- **${a.type}** — ${a.count} instance${a.count !== 1 ? "s" : ""}\n`;
    }
    md += "\n";
  }

  if (data.spoofedDomains.length > 0) {
    md += `## Spoofed Domains (Sanitized)\n\n`;
    md += `> :warning: **WARNING:** These domains are MALICIOUS. Do NOT visit them.\n\n`;
    for (const d of data.spoofedDomains.slice(0, 15)) {
      const brandTag = d.brand ? ` _(impersonating ${d.brand})_` : "";
      md += `- \`${d.defanged}\`${brandTag}\n`;
    }
    md += "\n";
  }

  md += `## Action Items\n\n`;
  for (const item of data.actionItems) {
    md += `- [ ] ${item}\n`;
  }
  md += `\n---\n`;
  md += `_Powered by [STB Cybersecurity](https://stbcybersecurity.com) Threat Intelligence | (855) STB-1987_\n`;

  return md;
}

export async function generatePhishingBulletin(period: "daily" | "weekly"): Promise<BulletinData> {
  const hours = period === "daily" ? 24 : 168;
  let urls = await storage.getRecentPhishingUrls(hours);

  if (urls.length < 5) {
    urls = await storage.getRecentPhishingUrls(hours * 7);
  }
  if (urls.length < 5) {
    urls = await storage.getRecentPhishingUrls(8760);
  }

  return buildBulletinData(urls, period);
}

export async function generateAndStoreBulletin(period: "daily" | "weekly"): Promise<void> {
  try {
    const data = await generatePhishingBulletin(period);
    const plainText = formatBulletinPlainText(data);
    const html = formatBulletinHtml(data);
    const markdown = formatBulletinMarkdown(data);

    const bulletin: InsertPhishingBulletin = {
      period,
      date: data.date,
      totalThreats: data.totalThreats,
      topBrands: JSON.stringify(data.topBrands),
      content: plainText,
      contentHtml: html,
      contentMarkdown: markdown,
      metadata: JSON.stringify({
        attackTypes: data.attackTypes,
        spoofedDomainCount: data.spoofedDomains.length,
        suggestedSubject: data.suggestedSubject,
        topBrandNames: data.topBrands.map(b => b.name),
      }),
    };

    await storage.createPhishingBulletin(bulletin);
    console.log(`[Awareness] ${period} bulletin generated — ${data.totalThreats} threats, ${data.topBrands.length} brands`);
  } catch (error) {
    console.error(`[Awareness] Failed to generate ${period} bulletin:`, error);
  }
}
