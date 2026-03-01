import https from 'https';
import http from 'http';
import dns from 'dns';
import { promisify } from 'util';
import { isPrivateIp } from './tools';

const dnsResolve4 = promisify(dns.resolve4);

export interface HeaderAnalysis {
  name: string;
  value: string | null;
  present: boolean;
  status: 'pass' | 'fail' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  recommendation: string;
}

export interface HeadersScanResult {
  domain: string;
  url: string;
  statusCode: number;
  grade: string;
  score: number;
  headers: HeaderAnalysis[];
  rawHeaders: Record<string, string>;
  scannedAt: string;
  responseTime: number;
  server?: string;
}

let _resolvedIp: string | null = null;

async function resolveAndValidate(hostname: string): Promise<string> {
  const ips = await dnsResolve4(hostname);
  if (!ips || ips.length === 0) {
    throw new Error('Could not resolve domain');
  }
  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new Error('Target resolves to a private/internal IP address');
    }
  }
  _resolvedIp = ips[0];
  return ips[0];
}

function fetchHeaders(url: string, timeout = 10000, allowInsecureTls = false): Promise<{ statusCode: number; headers: Record<string, string>; responseTime: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const protocol = isHttps ? https : http;

    const options: any = {
      hostname: _resolvedIp || parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout,
      rejectUnauthorized: !allowInsecureTls,
      servername: parsedUrl.hostname,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
      },
    };

    const req = protocol.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(res.headers)) {
        if (value) {
          headers[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
        }
      }
      res.resume();
      resolve({
        statusCode: res.statusCode || 0,
        headers,
        responseTime,
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

function analyzeHSTS(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['strict-transport-security'] || null;
  if (!value) {
    return {
      name: 'Strict-Transport-Security',
      value: null,
      present: false,
      status: 'fail',
      severity: 'high',
      description: 'HSTS header is missing. Browsers will not enforce HTTPS connections.',
      recommendation: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" to enforce HTTPS.',
    };
  }

  const maxAgeMatch = value.match(/max-age=(\d+)/i);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  const hasIncludeSubDomains = /includeSubDomains/i.test(value);
  const hasPreload = /preload/i.test(value);

  if (maxAge >= 31536000 && hasIncludeSubDomains && hasPreload) {
    return {
      name: 'Strict-Transport-Security',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: 'HSTS is properly configured with long max-age, includeSubDomains, and preload.',
      recommendation: 'Well configured. Consider submitting to the HSTS preload list if not already.',
    };
  }

  const issues: string[] = [];
  if (maxAge < 31536000) issues.push(`max-age is ${maxAge}s (recommended: 31536000)`);
  if (!hasIncludeSubDomains) issues.push('missing includeSubDomains');
  if (!hasPreload) issues.push('missing preload');

  return {
    name: 'Strict-Transport-Security',
    value,
    present: true,
    status: 'warning',
    severity: 'medium',
    description: `HSTS is set but could be improved: ${issues.join(', ')}.`,
    recommendation: 'Set max-age to at least 31536000 and add includeSubDomains and preload directives.',
  };
}

function analyzeCSP(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['content-security-policy'] || null;
  if (!value) {
    return {
      name: 'Content-Security-Policy',
      value: null,
      present: false,
      status: 'fail',
      severity: 'high',
      description: 'CSP header is missing. The site is vulnerable to XSS and data injection attacks.',
      recommendation: "Add a Content-Security-Policy header. Start with a restrictive policy like \"default-src 'self'\" and relax as needed.",
    };
  }

  const hasUnsafeInline = /unsafe-inline/i.test(value);
  const hasUnsafeEval = /unsafe-eval/i.test(value);
  const hasWildcard = /\s\*[\s;]|default-src\s+\*/.test(value);

  if (hasWildcard) {
    return {
      name: 'Content-Security-Policy',
      value: value.length > 200 ? value.substring(0, 200) + '...' : value,
      present: true,
      status: 'warning',
      severity: 'high',
      description: 'CSP contains wildcard (*) sources, which weakens protection significantly.',
      recommendation: 'Replace wildcard sources with specific domains to strengthen security.',
    };
  }

  if (hasUnsafeInline || hasUnsafeEval) {
    const issues = [];
    if (hasUnsafeInline) issues.push("'unsafe-inline'");
    if (hasUnsafeEval) issues.push("'unsafe-eval'");
    return {
      name: 'Content-Security-Policy',
      value: value.length > 200 ? value.substring(0, 200) + '...' : value,
      present: true,
      status: 'warning',
      severity: 'medium',
      description: `CSP contains ${issues.join(' and ')}, which reduces XSS protection.`,
      recommendation: "Use nonce-based or hash-based CSP instead of 'unsafe-inline'. Avoid 'unsafe-eval' if possible.",
    };
  }

  return {
    name: 'Content-Security-Policy',
    value: value.length > 200 ? value.substring(0, 200) + '...' : value,
    present: true,
    status: 'pass',
    severity: 'info',
    description: 'CSP is configured with a restrictive policy.',
    recommendation: 'Good configuration. Monitor CSP violation reports to fine-tune the policy.',
  };
}

function analyzeXFrameOptions(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['x-frame-options'] || null;
  if (!value) {
    return {
      name: 'X-Frame-Options',
      value: null,
      present: false,
      status: 'fail',
      severity: 'medium',
      description: 'X-Frame-Options header is missing. The site may be vulnerable to clickjacking attacks.',
      recommendation: 'Add "X-Frame-Options: DENY" or "SAMEORIGIN" to prevent clickjacking.',
    };
  }

  const upper = value.toUpperCase();
  if (upper === 'DENY' || upper === 'SAMEORIGIN') {
    return {
      name: 'X-Frame-Options',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: `X-Frame-Options is set to ${upper}, protecting against clickjacking.`,
      recommendation: 'Well configured. Consider also using CSP frame-ancestors directive for modern browsers.',
    };
  }

  return {
    name: 'X-Frame-Options',
    value,
    present: true,
    status: 'warning',
    severity: 'medium',
    description: `X-Frame-Options value "${value}" may not provide adequate protection.`,
    recommendation: 'Use "DENY" or "SAMEORIGIN" for best protection.',
  };
}

function analyzeXContentTypeOptions(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['x-content-type-options'] || null;
  if (!value) {
    return {
      name: 'X-Content-Type-Options',
      value: null,
      present: false,
      status: 'fail',
      severity: 'medium',
      description: 'X-Content-Type-Options header is missing. Browsers may MIME-sniff content, leading to security issues.',
      recommendation: 'Add "X-Content-Type-Options: nosniff" to prevent MIME type sniffing.',
    };
  }

  if (value.toLowerCase() === 'nosniff') {
    return {
      name: 'X-Content-Type-Options',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: 'X-Content-Type-Options is set to nosniff, preventing MIME type sniffing.',
      recommendation: 'Well configured.',
    };
  }

  return {
    name: 'X-Content-Type-Options',
    value,
    present: true,
    status: 'warning',
    severity: 'medium',
    description: `Unexpected value "${value}" for X-Content-Type-Options.`,
    recommendation: 'Set the value to "nosniff".',
  };
}

function analyzeReferrerPolicy(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['referrer-policy'] || null;
  if (!value) {
    return {
      name: 'Referrer-Policy',
      value: null,
      present: false,
      status: 'warning',
      severity: 'low',
      description: 'Referrer-Policy header is missing. Full referrer URLs may be sent to external sites.',
      recommendation: 'Add "Referrer-Policy: strict-origin-when-cross-origin" or "no-referrer" to control referrer information.',
    };
  }

  const safe = ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
  if (safe.includes(value.toLowerCase())) {
    return {
      name: 'Referrer-Policy',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: `Referrer-Policy is set to "${value}", which provides good privacy protection.`,
      recommendation: 'Well configured.',
    };
  }

  if (value.toLowerCase() === 'unsafe-url') {
    return {
      name: 'Referrer-Policy',
      value,
      present: true,
      status: 'fail',
      severity: 'medium',
      description: 'Referrer-Policy is set to "unsafe-url", which leaks full URLs including query parameters.',
      recommendation: 'Change to "strict-origin-when-cross-origin" or "no-referrer".',
    };
  }

  return {
    name: 'Referrer-Policy',
    value,
    present: true,
    status: 'warning',
    severity: 'low',
    description: `Referrer-Policy is set to "${value}". Consider a more restrictive policy.`,
    recommendation: 'Use "strict-origin-when-cross-origin" or "no-referrer" for better privacy.',
  };
}

function analyzePermissionsPolicy(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['permissions-policy'] || headers['feature-policy'] || null;
  const headerName = headers['permissions-policy'] ? 'Permissions-Policy' : 'Feature-Policy';

  if (!value) {
    return {
      name: 'Permissions-Policy',
      value: null,
      present: false,
      status: 'warning',
      severity: 'low',
      description: 'Permissions-Policy header is missing. Browser features like camera, microphone, and geolocation are not restricted.',
      recommendation: 'Add a Permissions-Policy header to restrict browser feature access. Example: "camera=(), microphone=(), geolocation=()".',
    };
  }

  return {
    name: headerName,
    value: value.length > 200 ? value.substring(0, 200) + '...' : value,
    present: true,
    status: 'pass',
    severity: 'info',
    description: `${headerName} is configured, restricting browser feature access.`,
    recommendation: 'Review the policy to ensure all unnecessary features are disabled.',
  };
}

function analyzeXXSSProtection(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['x-xss-protection'] || null;
  if (!value) {
    return {
      name: 'X-XSS-Protection',
      value: null,
      present: false,
      status: 'info',
      severity: 'info',
      description: 'X-XSS-Protection header is not set. This is acceptable if CSP is properly configured, as this header is deprecated in modern browsers.',
      recommendation: 'If CSP is configured, this header is not needed. Otherwise, set "X-XSS-Protection: 0" (modern recommendation) or rely on CSP.',
    };
  }

  if (value === '0') {
    return {
      name: 'X-XSS-Protection',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: 'X-XSS-Protection is explicitly disabled (recommended for modern browsers with CSP).',
      recommendation: 'Good. Ensure CSP is configured as the primary XSS protection.',
    };
  }

  if (value.includes('1') && value.includes('mode=block')) {
    return {
      name: 'X-XSS-Protection',
      value,
      present: true,
      status: 'pass',
      severity: 'info',
      description: 'X-XSS-Protection is enabled with mode=block for legacy browser support.',
      recommendation: 'Consider setting to "0" and relying on CSP instead, as this filter can introduce vulnerabilities in some cases.',
    };
  }

  return {
    name: 'X-XSS-Protection',
    value,
    present: true,
    status: 'warning',
    severity: 'low',
    description: `X-XSS-Protection is set to "${value}".`,
    recommendation: 'Set to "0" if CSP is configured, or "1; mode=block" for legacy support.',
  };
}

function analyzeCORP(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['cross-origin-resource-policy'] || null;
  if (!value) {
    return {
      name: 'Cross-Origin-Resource-Policy',
      value: null,
      present: false,
      status: 'info',
      severity: 'info',
      description: 'Cross-Origin-Resource-Policy (CORP) is not set. Resources may be loaded by cross-origin pages.',
      recommendation: 'Add "Cross-Origin-Resource-Policy: same-origin" to prevent cross-origin resource loading.',
    };
  }

  return {
    name: 'Cross-Origin-Resource-Policy',
    value,
    present: true,
    status: 'pass',
    severity: 'info',
    description: `CORP is set to "${value}", controlling cross-origin resource access.`,
    recommendation: 'Well configured.',
  };
}

function analyzeCOEP(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['cross-origin-embedder-policy'] || null;
  if (!value) {
    return {
      name: 'Cross-Origin-Embedder-Policy',
      value: null,
      present: false,
      status: 'info',
      severity: 'info',
      description: 'Cross-Origin-Embedder-Policy (COEP) is not set.',
      recommendation: 'Add "Cross-Origin-Embedder-Policy: require-corp" for enhanced isolation (required for SharedArrayBuffer).',
    };
  }

  return {
    name: 'Cross-Origin-Embedder-Policy',
    value,
    present: true,
    status: 'pass',
    severity: 'info',
    description: `COEP is set to "${value}".`,
    recommendation: 'Well configured.',
  };
}

function analyzeCOOP(headers: Record<string, string>): HeaderAnalysis {
  const value = headers['cross-origin-opener-policy'] || null;
  if (!value) {
    return {
      name: 'Cross-Origin-Opener-Policy',
      value: null,
      present: false,
      status: 'info',
      severity: 'info',
      description: 'Cross-Origin-Opener-Policy (COOP) is not set. The page may share a browsing context with cross-origin popups.',
      recommendation: 'Add "Cross-Origin-Opener-Policy: same-origin" to isolate the browsing context.',
    };
  }

  return {
    name: 'Cross-Origin-Opener-Policy',
    value,
    present: true,
    status: 'pass',
    severity: 'info',
    description: `COOP is set to "${value}", isolating the browsing context.`,
    recommendation: 'Well configured.',
  };
}

function calculateGrade(headerResults: HeaderAnalysis[]): { grade: string; score: number } {
  let score = 100;

  for (const header of headerResults) {
    if (header.status === 'fail') {
      switch (header.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 15; break;
        case 'low': score -= 5; break;
      }
    } else if (header.status === 'warning') {
      switch (header.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 12; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
        case 'info': score -= 1; break;
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  let grade: string;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 85) grade = 'B+';
  else if (score >= 80) grade = 'B';

  return { grade, score };
}

export async function scanHeaders(hostname: string): Promise<HeadersScanResult> {
  const cleanHostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

  await resolveAndValidate(cleanHostname);

  const url = `https://${cleanHostname}`;
  let result: { statusCode: number; headers: Record<string, string>; responseTime: number };

  try {
    result = await fetchHeaders(url);
  } catch {
    try {
      result = await fetchHeaders(url, 10000, true);
    } catch {
      try {
        result = await fetchHeaders(`http://${cleanHostname}`);
      } catch {
        _resolvedIp = null;
        throw new Error('Could not connect to target domain');
      }
    }
  }

  const headerResults: HeaderAnalysis[] = [
    analyzeHSTS(result.headers),
    analyzeCSP(result.headers),
    analyzeXFrameOptions(result.headers),
    analyzeXContentTypeOptions(result.headers),
    analyzeReferrerPolicy(result.headers),
    analyzePermissionsPolicy(result.headers),
    analyzeXXSSProtection(result.headers),
    analyzeCORP(result.headers),
    analyzeCOEP(result.headers),
    analyzeCOOP(result.headers),
  ];

  const { grade, score } = calculateGrade(headerResults);

  _resolvedIp = null;

  return {
    domain: cleanHostname,
    url,
    statusCode: result.statusCode,
    grade,
    score,
    headers: headerResults,
    rawHeaders: result.headers,
    scannedAt: new Date().toISOString(),
    responseTime: result.responseTime,
    server: result.headers['server'] || undefined,
  };
}
