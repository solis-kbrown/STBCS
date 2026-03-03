import { storage } from "./storage";
import { toSlug } from "@shared/schema";
import { createLogger } from "./logger";

const log = createLogger("OGImage");

const WIDTH = 1200;
const HEIGHT = 630;
const DOMAIN = "stbcybersecurity.com";

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (lines.length >= maxLines) break;
    if (current.length + word.length + 1 > maxCharsPerLine) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.length > 0) {
    const last = lines[maxLines - 1];
    if (last.length > maxCharsPerLine - 1) {
      lines[maxLines - 1] = last.slice(0, maxCharsPerLine - 1) + "…";
    }
  }
  return lines;
}

function severityColor(severity: string | null): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "#ef4444";
    case "HIGH": return "#f97316";
    case "MEDIUM": return "#eab308";
    case "LOW": return "#22c55e";
    default: return "#a1a1aa";
  }
}

function buildSvg(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="8" height="${HEIGHT}" fill="url(#accent)"/>
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#accent)" opacity="0.6"/>
  ${content}
  <text x="${WIDTH - 40}" y="${HEIGHT - 24}" text-anchor="end" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500">${DOMAIN}</text>
  <text x="40" y="${HEIGHT - 24}" fill="#71717a" font-family="system-ui, -apple-system, sans-serif" font-size="14">STB Cybersecurity — Threat Intelligence Platform</text>
</svg>`;
}

export async function generateKbOgImage(slug: string): Promise<Buffer | null> {
  try {
    const posts = await storage.getKbPosts();
    const post = posts.find(p => toSlug(p.title) === slug);
    if (!post) return null;

    const titleLines = wrapText(escapeXml(post.title), 40, 3);
    const titleSvg = titleLines.map((line, i) =>
      `<text x="40" y="${160 + i * 56}" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700">${line}</text>`
    ).join("\n  ");

    const authorName = escapeXml(post.authorName || "Anonymous");
    const initial = (post.authorName || "A").charAt(0).toUpperCase();
    const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1500));
    const votes = post.votes || 0;
    const typeBadge = post.type === "threat_intel" ? "THREAT INTEL" : post.type === "bug_report" ? "BUG REPORT" : post.type === "official_kb" ? "OFFICIAL KB" : "COMMUNITY";

    const metaY = 160 + titleLines.length * 56 + 40;

    const svg = buildSvg(`
  <rect x="40" y="40" width="140" height="32" rx="6" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-opacity="0.3" stroke-width="1"/>
  <text x="110" y="62" text-anchor="middle" fill="#f97316" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" letter-spacing="1">${typeBadge}</text>
  ${titleSvg}
  <circle cx="60" cy="${metaY}" r="20" fill="#f97316" fill-opacity="0.2" stroke="#f97316" stroke-width="1.5"/>
  <text x="60" y="${metaY + 6}" text-anchor="middle" fill="#f97316" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700">${initial}</text>
  <text x="90" y="${metaY + 6}" fill="#d4d4d8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500">${authorName}</text>
  <text x="40" y="${metaY + 50}" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="18">📖 ${readTime} min read  ·  ▲ ${votes} votes  ·  💬 ${post.commentCount || 0} comments</text>
`);

    return await svgToPng(svg);
  } catch (err) {
    log.error("Failed to generate KB OG image:", err);
    return null;
  }
}

export async function generateCveOgImage(cveId: string): Promise<Buffer | null> {
  try {
    const cves = await storage.getCves(1000, 0);
    const cve = cves.find(c => c.cveId === cveId);
    if (!cve) return null;

    const score = cve.score ?? 0;
    const severity = cve.severity || "UNKNOWN";
    const sColor = severityColor(severity);
    const platform = escapeXml(truncate(cve.platform || cve.vendor || "Multiple Platforms", 50));
    const descLines = wrapText(escapeXml(cve.description || "No description available"), 65, 3);
    const descSvg = descLines.map((line, i) =>
      `<text x="40" y="${340 + i * 28}" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20">${line}</text>`
    ).join("\n  ");

    const epssText = cve.epssScore ? `${(cve.epssScore * 100).toFixed(1)}% exploit probability` : "";
    const kevBadge = cve.inCisaKev ? `<rect x="420" y="70" width="160" height="32" rx="6" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-opacity="0.4" stroke-width="1"/><text x="500" y="92" text-anchor="middle" fill="#ef4444" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">⚠ CISA KEV</text>` : "";

    const svg = buildSvg(`
  <text x="40" y="80" fill="#f97316" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" letter-spacing="2">VULNERABILITY REPORT</text>
  ${kevBadge}
  <text x="40" y="160" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="800">${escapeXml(cveId)}</text>
  <rect x="40" y="190" width="200" height="56" rx="12" fill="${sColor}" fill-opacity="0.15" stroke="${sColor}" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="140" y="226" text-anchor="middle" fill="${sColor}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700">CVSS ${score.toFixed(1)} ${severity}</text>
  ${epssText ? `<text x="260" y="226" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="18">EPSS: ${epssText}</text>` : ""}
  <text x="40" y="300" fill="#d4d4d8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500">${platform}</text>
  ${descSvg}
`);

    return await svgToPng(svg);
  } catch (err) {
    log.error("Failed to generate CVE OG image:", err);
    return null;
  }
}

export async function generateGroupOgImage(slug: string): Promise<Buffer | null> {
  try {
    const actors = await storage.getThreatActors();
    let actor = actors.find(a => toSlug(a.name) === slug);
    if (!actor) {
      const groups = await storage.getActiveGroups();
      const group = groups.find(g => toSlug(g.name) === slug);
      if (!group) return null;
      actor = { name: group.name, status: "active", type: "Cybercrime" } as any;
    }

    const name = escapeXml(truncate(actor.name, 30));
    const status = (actor as any).status || "active";
    const statusColor = status === "active" ? "#22c55e" : status === "seized" ? "#ef4444" : "#71717a";
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const incidents = await storage.getRansomwareIncidents(5000, 0);
    const groupIncidents = incidents.filter(i => i.groupName.toLowerCase() === actor!.name.toLowerCase());
    const victimCount = groupIncidents.length;
    const countries = new Set(groupIncidents.map(i => i.country).filter(Boolean));
    const sectors = new Set(groupIncidents.map(i => i.sector).filter(Boolean));

    const svg = buildSvg(`
  <text x="40" y="80" fill="#f97316" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" letter-spacing="2">THREAT ACTOR PROFILE</text>
  <text x="40" y="180" fill="#fafafa" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800">${name}</text>
  <circle cx="56" cy="230" r="8" fill="${statusColor}"/>
  <text x="74" y="236" fill="${statusColor}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600">${statusLabel}</text>
  <text x="40" y="320" fill="#d4d4d8" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="600">${victimCount} Known Victims</text>
  <text x="40" y="370" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="20">${countries.size} Countries Targeted  ·  ${sectors.size} Sectors Affected</text>
  <text x="40" y="430" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="18">${(actor as any).type || "Cybercrime"}</text>
`);

    return await svgToPng(svg);
  } catch (err) {
    log.error("Failed to generate group OG image:", err);
    return null;
  }
}

async function svgToPng(svg: string): Promise<Buffer> {
  try {
    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: WIDTH },
    });
    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
  } catch (err) {
    log.error("resvg render failed, returning SVG as fallback:", err);
    return Buffer.from(svg, "utf-8");
  }
}
