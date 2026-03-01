import { z } from "zod";

export const emailHeadersSchema = z.object({
  headers: z.string().min(10, "Headers must be at least 10 characters").max(500000, "Headers too large"),
});

export interface ReceivedHop {
  from: string;
  by: string;
  with?: string;
  timestamp?: string;
  delay?: number;
  ip?: string;
}

export interface AuthResults {
  spf?: string;
  dkim?: string;
  dmarc?: string;
}

export interface EmailHeaderAnalysis {
  metadata: {
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    messageId?: string;
    xMailer?: string;
    contentType?: string;
    replyTo?: string;
    returnPath?: string;
    mimeVersion?: string;
  };
  hops: ReceivedHop[];
  authResults: AuthResults;
  totalDelay?: number;
  warnings: string[];
}

function unfoldHeaders(raw: string): string[] {
  const unfolded: string[] = [];
  const lines = raw.split(/\r?\n/);
  let current = "";

  for (const line of lines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      current += " " + line.trim();
    } else {
      if (current) unfolded.push(current);
      current = line;
    }
  }
  if (current) unfolded.push(current);
  return unfolded;
}

function parseTimestamp(str: string): Date | null {
  const dateMatch = str.match(/;\s*(.+)$/);
  if (dateMatch) {
    const d = new Date(dateMatch[1].trim());
    if (!isNaN(d.getTime())) return d;
  }
  const directDate = new Date(str.trim());
  if (!isNaN(directDate.getTime())) return directDate;
  return null;
}

function extractIp(value: string): string | undefined {
  const ipv4 = value.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
  if (ipv4) return ipv4[1];
  const ipv6 = value.match(/\[IPv6:([^\]]+)\]/i);
  if (ipv6) return ipv6[1];
  return undefined;
}

function parseReceivedHeader(value: string): ReceivedHop {
  const fromMatch = value.match(/from\s+(\S+)/i);
  const byMatch = value.match(/by\s+(\S+)/i);
  const withMatch = value.match(/with\s+(\S+)/i);
  const ts = parseTimestamp(value);
  const ip = extractIp(value);

  return {
    from: fromMatch?.[1] || "unknown",
    by: byMatch?.[1] || "unknown",
    with: withMatch?.[1],
    timestamp: ts?.toISOString(),
    ip,
  };
}

export function analyzeEmailHeadersFull(raw: string): EmailHeaderAnalysis {
  const result: EmailHeaderAnalysis = {
    metadata: {},
    hops: [],
    authResults: {},
    warnings: [],
  };

  const headerLines = unfoldHeaders(raw);

  for (const line of headerLines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const name = line.substring(0, colonIndex).toLowerCase().trim();
    const value = line.substring(colonIndex + 1).trim();

    switch (name) {
      case "from":
        if (!result.metadata.from) result.metadata.from = value;
        break;
      case "to":
        if (!result.metadata.to) result.metadata.to = value;
        break;
      case "subject":
        if (!result.metadata.subject) result.metadata.subject = value;
        break;
      case "date":
        if (!result.metadata.date) result.metadata.date = value;
        break;
      case "message-id":
        if (!result.metadata.messageId) result.metadata.messageId = value;
        break;
      case "x-mailer":
        result.metadata.xMailer = value;
        break;
      case "content-type":
        if (!result.metadata.contentType) result.metadata.contentType = value;
        break;
      case "reply-to":
        result.metadata.replyTo = value;
        break;
      case "return-path":
        result.metadata.returnPath = value;
        break;
      case "mime-version":
        result.metadata.mimeVersion = value;
        break;
      case "received":
        result.hops.push(parseReceivedHeader(value));
        break;
      case "received-spf":
        if (!result.authResults.spf) {
          const spfMatch = value.match(/^(\w+)/i);
          result.authResults.spf = spfMatch?.[1] || value;
        }
        break;
      case "authentication-results":
        if (value.toLowerCase().includes("spf=")) {
          const m = value.match(/spf=(\w+)/i);
          if (m && !result.authResults.spf) result.authResults.spf = m[1];
        }
        if (value.toLowerCase().includes("dkim=")) {
          const m = value.match(/dkim=(\w+)/i);
          if (m && !result.authResults.dkim) result.authResults.dkim = m[1];
        }
        if (value.toLowerCase().includes("dmarc=")) {
          const m = value.match(/dmarc=(\w+)/i);
          if (m && !result.authResults.dmarc) result.authResults.dmarc = m[1];
        }
        break;
      case "dkim-signature":
        if (!result.authResults.dkim) result.authResults.dkim = "present";
        break;
    }
  }

  result.hops.reverse();

  for (let i = 1; i < result.hops.length; i++) {
    const prev = result.hops[i - 1];
    const curr = result.hops[i];
    if (prev.timestamp && curr.timestamp) {
      const prevTime = new Date(prev.timestamp).getTime();
      const currTime = new Date(curr.timestamp).getTime();
      if (!isNaN(prevTime) && !isNaN(currTime)) {
        curr.delay = Math.max(0, Math.round((currTime - prevTime) / 1000));
      }
    }
  }

  const hopsWithTimestamps = result.hops.filter((h) => h.timestamp);
  if (hopsWithTimestamps.length >= 2) {
    const first = new Date(hopsWithTimestamps[0].timestamp!).getTime();
    const last = new Date(hopsWithTimestamps[hopsWithTimestamps.length - 1].timestamp!).getTime();
    if (!isNaN(first) && !isNaN(last)) {
      result.totalDelay = Math.max(0, Math.round((last - first) / 1000));
    }
  }

  if (result.hops.length > 10) {
    result.warnings.push("Unusually long delivery chain — may indicate relay issues or open relays");
  }

  if (result.authResults.spf && !result.authResults.spf.toLowerCase().includes("pass")) {
    result.warnings.push("SPF check did not pass — possible email spoofing");
  }

  if (result.authResults.dkim && !["pass", "present"].includes(result.authResults.dkim.toLowerCase())) {
    result.warnings.push("DKIM signature invalid — message content may have been altered");
  }

  if (result.authResults.dmarc && !result.authResults.dmarc.toLowerCase().includes("pass")) {
    result.warnings.push("DMARC check did not pass — sender domain alignment failed");
  }

  if (!result.authResults.spf && !result.authResults.dkim && !result.authResults.dmarc) {
    result.warnings.push("No email authentication results found (SPF/DKIM/DMARC)");
  }

  for (const hop of result.hops) {
    if (hop.delay !== undefined && hop.delay > 300) {
      result.warnings.push(
        `Significant delay of ${hop.delay}s detected at hop ${hop.by}`
      );
    }
  }

  if (result.metadata.returnPath && result.metadata.from) {
    const returnEmail = result.metadata.returnPath.match(/<([^>]+)>/)?.[1] || result.metadata.returnPath;
    const fromEmail = result.metadata.from.match(/<([^>]+)>/)?.[1] || result.metadata.from;
    const returnDomain = returnEmail.split("@")[1]?.toLowerCase();
    const fromDomain = fromEmail.split("@")[1]?.toLowerCase();
    if (returnDomain && fromDomain && returnDomain !== fromDomain) {
      result.warnings.push(
        `Return-Path domain (${returnDomain}) differs from From domain (${fromDomain})`
      );
    }
  }

  return result;
}
