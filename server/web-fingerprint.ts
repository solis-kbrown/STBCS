import http from 'http';
import https from 'https';
import dns from 'dns';
import { promisify } from 'util';
import { URL } from 'url';

const dnsResolve4 = promisify(dns.resolve4);

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^fd/,
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some(r => r.test(ip));
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  server?: string;
}

export interface WebFingerprintResult {
  hostname: string;
  serverHeader?: string;
  poweredBy?: string;
  aspNetVersion?: string;
  aspNetMvcVersion?: string;
  technologies: string[];
  cms?: string;
  cmsConfidence?: string;
  allowedMethods?: string[];
  cookies: { name: string; flags: string[]; possibleTech?: string }[];
  redirectChain: RedirectHop[];
  httpsRedirect: boolean;
  responseHeaders: Record<string, string>;
  latencyMs: number;
  ipAddress?: string;
  observations: string[];
  error?: string;
}

const TECH_HEADERS: Record<string, { header: string; pattern: RegExp; tech: string }[]> = {
  server: [
    { header: 'server', pattern: /apache/i, tech: 'Apache' },
    { header: 'server', pattern: /nginx/i, tech: 'Nginx' },
    { header: 'server', pattern: /iis/i, tech: 'Microsoft IIS' },
    { header: 'server', pattern: /litespeed/i, tech: 'LiteSpeed' },
    { header: 'server', pattern: /cloudflare/i, tech: 'Cloudflare' },
    { header: 'server', pattern: /openresty/i, tech: 'OpenResty' },
    { header: 'server', pattern: /gunicorn/i, tech: 'Gunicorn (Python)' },
    { header: 'server', pattern: /tornado/i, tech: 'Tornado (Python)' },
    { header: 'server', pattern: /caddy/i, tech: 'Caddy' },
    { header: 'server', pattern: /envoy/i, tech: 'Envoy' },
  ],
  poweredBy: [
    { header: 'x-powered-by', pattern: /php/i, tech: 'PHP' },
    { header: 'x-powered-by', pattern: /asp\.net/i, tech: 'ASP.NET' },
    { header: 'x-powered-by', pattern: /express/i, tech: 'Express (Node.js)' },
    { header: 'x-powered-by', pattern: /next\.?js/i, tech: 'Next.js' },
    { header: 'x-powered-by', pattern: /servlet/i, tech: 'Java Servlet' },
    { header: 'x-powered-by', pattern: /jsp/i, tech: 'JSP (Java)' },
    { header: 'x-powered-by', pattern: /flask/i, tech: 'Flask (Python)' },
    { header: 'x-powered-by', pattern: /django/i, tech: 'Django (Python)' },
    { header: 'x-powered-by', pattern: /ruby/i, tech: 'Ruby' },
    { header: 'x-powered-by', pattern: /phusion/i, tech: 'Passenger (Ruby)' },
  ],
  misc: [
    { header: 'x-generator', pattern: /wordpress/i, tech: 'WordPress' },
    { header: 'x-generator', pattern: /drupal/i, tech: 'Drupal' },
    { header: 'x-generator', pattern: /joomla/i, tech: 'Joomla' },
    { header: 'x-drupal-cache', pattern: /./, tech: 'Drupal' },
    { header: 'x-drupal-dynamic-cache', pattern: /./, tech: 'Drupal' },
    { header: 'x-varnish', pattern: /./, tech: 'Varnish Cache' },
    { header: 'x-cache', pattern: /cloudfront/i, tech: 'Amazon CloudFront' },
    { header: 'x-amz-cf-id', pattern: /./, tech: 'Amazon CloudFront' },
    { header: 'x-azure-ref', pattern: /./, tech: 'Microsoft Azure' },
    { header: 'x-vercel-id', pattern: /./, tech: 'Vercel' },
    { header: 'x-netlify-request-id', pattern: /./, tech: 'Netlify' },
    { header: 'cf-ray', pattern: /./, tech: 'Cloudflare' },
    { header: 'fly-request-id', pattern: /./, tech: 'Fly.io' },
    { header: 'x-render-origin-server', pattern: /./, tech: 'Render' },
  ],
};

const SESSION_COOKIES: Record<string, string> = {
  'phpsessid': 'PHP',
  'jsessionid': 'Java',
  'asp.net_sessionid': 'ASP.NET',
  'aspsessionid': 'Classic ASP',
  'connect.sid': 'Node.js (Express)',
  'ci_session': 'CodeIgniter (PHP)',
  'laravel_session': 'Laravel (PHP)',
  'symfony': 'Symfony (PHP)',
  'rack.session': 'Ruby (Rack)',
  '_rails_session': 'Ruby on Rails',
  'django_session': 'Django (Python)',
  'flask_session': 'Flask (Python)',
  'csrftoken': 'Django (Python)',
  'wp-settings': 'WordPress',
  '_gh_sess': 'GitHub',
};

const CMS_PROBES: { path: string; cms: string; match?: RegExp }[] = [
  { path: '/wp-login.php', cms: 'WordPress', match: /wordpress|wp-/i },
  { path: '/wp-admin/', cms: 'WordPress' },
  { path: '/wp-includes/', cms: 'WordPress' },
  { path: '/administrator/', cms: 'Joomla' },
  { path: '/user/login', cms: 'Drupal', match: /drupal/i },
  { path: '/misc/drupal.js', cms: 'Drupal' },
  { path: '/sites/default/', cms: 'Drupal' },
  { path: '/ghost/api/', cms: 'Ghost' },
  { path: '/admin/config.yml', cms: 'Netlify CMS' },
];

let _resolvedIp: string | null = null;

function setResolvedIp(ip: string) { _resolvedIp = ip; }
function clearResolvedIp() { _resolvedIp = null; }

function makeRequest(
  urlString: string,
  method: string = 'GET',
  timeout: number = 10000,
): Promise<{ statusCode: number; headers: Record<string, string | string[] | undefined>; body: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options: any = {
      hostname: _resolvedIp || parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      timeout,
      rejectUnauthorized: false,
      servername: parsedUrl.hostname,
      headers: {
        'Host': parsedUrl.hostname,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (body.length < 50000) body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function getHeader(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const val = headers[name.toLowerCase()];
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

function parseCookies(headers: Record<string, string | string[] | undefined>): { name: string; flags: string[]; possibleTech?: string }[] {
  const setCookieHeaders = headers['set-cookie'];
  if (!setCookieHeaders) return [];

  const cookieStrings = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  const results: { name: string; flags: string[]; possibleTech?: string }[] = [];

  for (const cookieStr of cookieStrings) {
    if (!cookieStr) continue;
    const parts = cookieStr.split(';').map(s => s.trim());
    const nameValue = parts[0];
    const eqIdx = nameValue.indexOf('=');
    const name = eqIdx > 0 ? nameValue.substring(0, eqIdx).trim() : nameValue;

    const flags: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      if (part === 'secure') flags.push('Secure');
      if (part === 'httponly') flags.push('HttpOnly');
      if (part.startsWith('samesite')) flags.push(parts[i]);
      if (part.startsWith('path')) flags.push(parts[i]);
      if (part.startsWith('domain')) flags.push(parts[i]);
    }

    let possibleTech: string | undefined;
    for (const [cookieName, tech] of Object.entries(SESSION_COOKIES)) {
      if (name.toLowerCase().includes(cookieName.toLowerCase())) {
        possibleTech = tech;
        break;
      }
    }

    results.push({ name, flags, possibleTech });
  }

  return results;
}

async function followRedirects(
  startUrl: string,
  maxRedirects: number = 10,
): Promise<{
  finalResponse: { statusCode: number; headers: Record<string, string | string[] | undefined>; body: string };
  chain: RedirectHop[];
}> {
  const chain: RedirectHop[] = [];
  let currentUrl = startUrl;

  for (let i = 0; i < maxRedirects; i++) {
    const response = await makeRequest(currentUrl, 'GET', 10000);

    chain.push({
      url: currentUrl,
      statusCode: response.statusCode,
      server: getHeader(response.headers, 'server'),
    });

    if (response.statusCode >= 300 && response.statusCode < 400) {
      const location = getHeader(response.headers, 'location');
      if (!location) break;

      if (location.startsWith('http://') || location.startsWith('https://')) {
        currentUrl = location;
      } else {
        const base = new URL(currentUrl);
        currentUrl = new URL(location, base).toString();
      }
    } else {
      return { finalResponse: response, chain };
    }
  }

  const finalResponse = await makeRequest(currentUrl, 'GET', 10000);
  return { finalResponse, chain };
}

async function probeEndpoint(hostname: string, path: string): Promise<{ exists: boolean; statusCode: number; body?: string }> {
  try {
    const response = await makeRequest(`https://${hostname}${path}`, 'HEAD', 5000);
    if (response.statusCode === 405 || response.statusCode === 200) {
      const getResponse = await makeRequest(`https://${hostname}${path}`, 'GET', 5000);
      return { exists: getResponse.statusCode === 200, statusCode: getResponse.statusCode, body: getResponse.body };
    }
    return { exists: response.statusCode === 200, statusCode: response.statusCode };
  } catch {
    try {
      const response = await makeRequest(`http://${hostname}${path}`, 'HEAD', 5000);
      return { exists: response.statusCode === 200, statusCode: response.statusCode };
    } catch {
      return { exists: false, statusCode: 0 };
    }
  }
}

async function checkAllowedMethods(hostname: string): Promise<string[]> {
  try {
    const response = await makeRequest(`https://${hostname}/`, 'OPTIONS', 5000);
    const allow = getHeader(response.headers, 'allow');
    if (allow) {
      return allow.split(',').map(m => m.trim().toUpperCase());
    }
  } catch {}

  try {
    const response = await makeRequest(`http://${hostname}/`, 'OPTIONS', 5000);
    const allow = getHeader(response.headers, 'allow');
    if (allow) {
      return allow.split(',').map(m => m.trim().toUpperCase());
    }
  } catch {}

  return [];
}

export async function performWebFingerprint(hostname: string): Promise<WebFingerprintResult> {
  const result: WebFingerprintResult = {
    hostname,
    technologies: [],
    cookies: [],
    redirectChain: [],
    httpsRedirect: false,
    responseHeaders: {},
    latencyMs: 0,
    observations: [],
  };

  const ips = await dnsResolve4(hostname);
  if (!ips || ips.length === 0) {
    result.error = 'Could not resolve hostname';
    return result;
  }

  for (const ip of ips) {
    if (isPrivateIP(ip)) {
      result.error = 'Target resolves to a private IP address';
      return result;
    }
  }

  result.ipAddress = ips[0];
  setResolvedIp(ips[0]);

  const startTime = Date.now();

  let httpsRedirect = false;
  try {
    const httpResponse = await makeRequest(`http://${hostname}/`, 'GET', 8000);
    if (httpResponse.statusCode >= 300 && httpResponse.statusCode < 400) {
      const location = getHeader(httpResponse.headers, 'location');
      if (location && location.toLowerCase().startsWith('https://')) {
        httpsRedirect = true;
      }
    }
  } catch {}
  result.httpsRedirect = httpsRedirect;

  try {
    const { finalResponse, chain } = await followRedirects(`https://${hostname}/`, 10);
    result.redirectChain = chain;
    result.latencyMs = Date.now() - startTime;

    const headers = finalResponse.headers;
    const body = finalResponse.body;

    const serverHeader = getHeader(headers, 'server');
    if (serverHeader) {
      result.serverHeader = serverHeader;
    }

    const poweredBy = getHeader(headers, 'x-powered-by');
    if (poweredBy) {
      result.poweredBy = poweredBy;
    }

    const aspNetVersion = getHeader(headers, 'x-aspnet-version');
    if (aspNetVersion) {
      result.aspNetVersion = aspNetVersion;
      if (!result.technologies.includes('ASP.NET')) {
        result.technologies.push('ASP.NET');
      }
    }

    const aspNetMvcVersion = getHeader(headers, 'x-aspnetmvc-version');
    if (aspNetMvcVersion) {
      result.aspNetMvcVersion = aspNetMvcVersion;
      if (!result.technologies.includes('ASP.NET MVC')) {
        result.technologies.push('ASP.NET MVC');
      }
    }

    const importantHeaders = [
      'server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version',
      'x-frame-options', 'x-content-type-options', 'x-xss-protection',
      'content-security-policy', 'strict-transport-security',
      'x-generator', 'x-drupal-cache', 'x-varnish', 'x-cache',
      'cf-ray', 'x-amz-cf-id', 'x-vercel-id', 'x-azure-ref',
      'x-netlify-request-id', 'via', 'x-cdn', 'x-served-by',
      'referrer-policy', 'permissions-policy', 'content-type',
      'x-request-id', 'x-runtime', 'fly-request-id',
    ];

    for (const headerName of importantHeaders) {
      const val = getHeader(headers, headerName);
      if (val) {
        result.responseHeaders[headerName] = val;
      }
    }

    for (const group of Object.values(TECH_HEADERS)) {
      for (const rule of group) {
        const val = getHeader(headers, rule.header);
        if (val && rule.pattern.test(val)) {
          if (!result.technologies.includes(rule.tech)) {
            result.technologies.push(rule.tech);
          }
        }
      }
    }

    result.cookies = parseCookies(headers);
    for (const cookie of result.cookies) {
      if (cookie.possibleTech && !result.technologies.includes(cookie.possibleTech)) {
        result.technologies.push(cookie.possibleTech);
      }
    }

    if (body) {
      if (/wp-content|wp-includes|wordpress/i.test(body)) {
        if (!result.technologies.includes('WordPress')) result.technologies.push('WordPress');
        result.cms = 'WordPress';
        result.cmsConfidence = 'high';
      }
      if (/drupal\.settings|drupal\.js|sites\/default/i.test(body)) {
        if (!result.technologies.includes('Drupal')) result.technologies.push('Drupal');
        result.cms = 'Drupal';
        result.cmsConfidence = 'high';
      }
      if (/\/media\/jui\/|com_content|joomla/i.test(body)) {
        if (!result.technologies.includes('Joomla')) result.technologies.push('Joomla');
        result.cms = 'Joomla';
        result.cmsConfidence = 'high';
      }
      if (/shopify\.com|cdn\.shopify/i.test(body)) {
        if (!result.technologies.includes('Shopify')) result.technologies.push('Shopify');
        result.cms = 'Shopify';
        result.cmsConfidence = 'high';
      }
      if (/squarespace\.com|squarespace-cdn/i.test(body)) {
        if (!result.technologies.includes('Squarespace')) result.technologies.push('Squarespace');
        result.cms = 'Squarespace';
        result.cmsConfidence = 'high';
      }
      if (/wix\.com|parastorage\.com/i.test(body)) {
        if (!result.technologies.includes('Wix')) result.technologies.push('Wix');
        result.cms = 'Wix';
        result.cmsConfidence = 'high';
      }

      if (/react/i.test(body) && /__next/i.test(body)) {
        if (!result.technologies.includes('Next.js')) result.technologies.push('Next.js');
      } else if (/react/i.test(body) || /data-reactroot|data-reactid/i.test(body)) {
        if (!result.technologies.includes('React')) result.technologies.push('React');
      }
      if (/vue\.js|vue@|__vue/i.test(body)) {
        if (!result.technologies.includes('Vue.js')) result.technologies.push('Vue.js');
      }
      if (/angular|ng-app|ng-controller/i.test(body)) {
        if (!result.technologies.includes('Angular')) result.technologies.push('Angular');
      }
      if (/jquery/i.test(body)) {
        if (!result.technologies.includes('jQuery')) result.technologies.push('jQuery');
      }
      if (/bootstrap/i.test(body)) {
        if (!result.technologies.includes('Bootstrap')) result.technologies.push('Bootstrap');
      }
      if (/tailwindcss|tailwind/i.test(body)) {
        if (!result.technologies.includes('Tailwind CSS')) result.technologies.push('Tailwind CSS');
      }
      if (/google-analytics|gtag|googletagmanager/i.test(body)) {
        if (!result.technologies.includes('Google Analytics')) result.technologies.push('Google Analytics');
      }
      if (/google.*tag.*manager|gtm\.js/i.test(body)) {
        if (!result.technologies.includes('Google Tag Manager')) result.technologies.push('Google Tag Manager');
      }

      const generatorMatch = body.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
      if (generatorMatch) {
        const gen = generatorMatch[1];
        if (!result.technologies.includes(gen)) result.technologies.push(gen);
        if (/wordpress/i.test(gen)) {
          result.cms = 'WordPress';
          result.cmsConfidence = 'high';
        } else if (/drupal/i.test(gen)) {
          result.cms = 'Drupal';
          result.cmsConfidence = 'high';
        } else if (/joomla/i.test(gen)) {
          result.cms = 'Joomla';
          result.cmsConfidence = 'high';
        }
      }
    }

    if (!result.cms) {
      const cmsProbePromises = CMS_PROBES.slice(0, 4).map(async (probe) => {
        try {
          const probeResult = await probeEndpoint(hostname, probe.path);
          if (probeResult.exists) {
            if (probe.match && probeResult.body && !probe.match.test(probeResult.body)) {
              return null;
            }
            return probe.cms;
          }
        } catch {}
        return null;
      });

      const cmsResults = await Promise.all(cmsProbePromises);
      for (const cms of cmsResults) {
        if (cms) {
          result.cms = cms;
          result.cmsConfidence = 'medium';
          if (!result.technologies.includes(cms)) result.technologies.push(cms);
          break;
        }
      }
    }

    const methods = await checkAllowedMethods(hostname);
    if (methods.length > 0) {
      result.allowedMethods = methods;
    }

    if (result.serverHeader) {
      result.observations.push(`Server identifies as: ${result.serverHeader}`);
    }
    if (result.poweredBy) {
      result.observations.push(`X-Powered-By header is exposed: ${result.poweredBy} — consider removing it to reduce information disclosure`);
    }
    if (result.aspNetVersion) {
      result.observations.push(`ASP.NET version exposed: ${result.aspNetVersion} — remove X-AspNet-Version header`);
    }
    if (result.aspNetMvcVersion) {
      result.observations.push(`ASP.NET MVC version exposed: ${result.aspNetMvcVersion} — remove X-AspNetMvc-Version header`);
    }
    if (!httpsRedirect) {
      result.observations.push('HTTP does not redirect to HTTPS — consider enforcing HTTPS');
    } else {
      result.observations.push('HTTP properly redirects to HTTPS');
    }
    if (result.allowedMethods && result.allowedMethods.length > 0) {
      const riskyMethods = result.allowedMethods.filter(m => ['PUT', 'DELETE', 'TRACE', 'CONNECT'].includes(m));
      if (riskyMethods.length > 0) {
        result.observations.push(`Potentially risky HTTP methods enabled: ${riskyMethods.join(', ')}`);
      }
    }
    if (!getHeader(headers, 'strict-transport-security')) {
      result.observations.push('Missing HSTS header (Strict-Transport-Security)');
    }
    if (!getHeader(headers, 'content-security-policy')) {
      result.observations.push('Missing Content-Security-Policy header');
    }
    if (!getHeader(headers, 'x-frame-options')) {
      result.observations.push('Missing X-Frame-Options header — site may be vulnerable to clickjacking');
    }
    if (!getHeader(headers, 'x-content-type-options')) {
      result.observations.push('Missing X-Content-Type-Options header');
    }

    for (const cookie of result.cookies) {
      if (!cookie.flags.includes('Secure')) {
        result.observations.push(`Cookie "${cookie.name}" is missing the Secure flag`);
      }
      if (!cookie.flags.includes('HttpOnly')) {
        result.observations.push(`Cookie "${cookie.name}" is missing the HttpOnly flag`);
      }
    }

    if (result.cms) {
      result.observations.push(`CMS detected: ${result.cms} (confidence: ${result.cmsConfidence})`);
    }

  } catch (err: any) {
    try {
      const { finalResponse, chain } = await followRedirects(`http://${hostname}/`, 10);
      result.redirectChain = chain;
      result.latencyMs = Date.now() - startTime;

      const serverHeader = getHeader(finalResponse.headers, 'server');
      if (serverHeader) result.serverHeader = serverHeader;

      const poweredBy = getHeader(finalResponse.headers, 'x-powered-by');
      if (poweredBy) result.poweredBy = poweredBy;

      result.cookies = parseCookies(finalResponse.headers);

      result.observations.push('HTTPS connection failed — site may not support HTTPS');
    } catch (httpErr: any) {
      result.error = `Connection failed: ${err.message}`;
    }
  }

  clearResolvedIp();
  return result;
}
