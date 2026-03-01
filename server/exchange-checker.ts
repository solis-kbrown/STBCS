import dns from 'dns';
import { promisify } from 'util';
import https from 'https';
import http from 'http';
import { isPrivateIp, isValidDomain } from './tools';

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolveMx = promisify(dns.resolveMx);

interface EndpointCheck {
  path: string;
  accessible: boolean;
  statusCode?: number;
  headers?: Record<string, string>;
  redirectUrl?: string;
}

interface VulnerabilityInfo {
  cve: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedVersions: string[];
  patchedDate?: string;
}

export interface ExchangeCheckResult {
  hostname: string;
  isExchange: boolean;
  exchangeOnline: boolean;
  onPremise: boolean;
  version?: string;
  buildNumber?: string;
  endpoints: EndpointCheck[];
  mxRecords: { exchange: string; priority: number; isExchangeOnline: boolean }[];
  vulnerabilities: VulnerabilityInfo[];
  serverHeaders: Record<string, string>;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  findings: { type: 'critical' | 'warning' | 'info'; message: string }[];
  scanTime: number;
}

const EXCHANGE_VULNERABILITIES: VulnerabilityInfo[] = [
  {
    cve: 'CVE-2021-26855',
    name: 'ProxyLogon',
    severity: 'critical',
    description: 'Server-Side Request Forgery (SSRF) vulnerability allowing unauthenticated attackers to send arbitrary HTTP requests and authenticate as the Exchange server.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2021-03-02',
  },
  {
    cve: 'CVE-2021-34473',
    name: 'ProxyShell (Pre-auth Path Confusion)',
    severity: 'critical',
    description: 'Pre-authentication path confusion vulnerability leading to ACL bypass and remote code execution.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2021-04-13',
  },
  {
    cve: 'CVE-2021-34523',
    name: 'ProxyShell (Elevation of Privilege)',
    severity: 'critical',
    description: 'Elevation of privilege vulnerability in Exchange PowerShell backend.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2021-04-13',
  },
  {
    cve: 'CVE-2021-31207',
    name: 'ProxyShell (Post-auth RCE)',
    severity: 'high',
    description: 'Post-authentication arbitrary file write leading to remote code execution.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2021-05-11',
  },
  {
    cve: 'CVE-2021-26857',
    name: 'ProxyLogon (Insecure Deserialization)',
    severity: 'critical',
    description: 'Insecure deserialization vulnerability in the Unified Messaging service.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2021-03-02',
  },
  {
    cve: 'CVE-2022-41040',
    name: 'ProxyNotShell (SSRF)',
    severity: 'critical',
    description: 'Server-Side Request Forgery vulnerability, similar to ProxyShell but requiring authentication.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2022-11-08',
  },
  {
    cve: 'CVE-2022-41082',
    name: 'ProxyNotShell (RCE)',
    severity: 'critical',
    description: 'Remote code execution when PowerShell is accessible to the attacker.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2022-11-08',
  },
  {
    cve: 'CVE-2023-21529',
    name: 'Exchange RCE',
    severity: 'high',
    description: 'Remote code execution vulnerability in Microsoft Exchange Server.',
    affectedVersions: ['2013', '2016', '2019'],
    patchedDate: '2023-02-14',
  },
  {
    cve: 'CVE-2023-36439',
    name: 'Exchange RCE',
    severity: 'high',
    description: 'Remote code execution vulnerability allowing authenticated attackers to execute arbitrary code.',
    affectedVersions: ['2016', '2019'],
    patchedDate: '2023-11-14',
  },
  {
    cve: 'CVE-2024-21410',
    name: 'NTLM Relay / Elevation of Privilege',
    severity: 'critical',
    description: 'NTLM credential relay attack allowing elevation of privilege against Exchange Server.',
    affectedVersions: ['2016', '2019'],
    patchedDate: '2024-02-13',
  },
];

const EXCHANGE_ENDPOINTS = [
  { path: '/autodiscover/autodiscover.xml', name: 'Autodiscover' },
  { path: '/Autodiscover/Autodiscover.xml', name: 'Autodiscover (alt)' },
  { path: '/owa', name: 'Outlook Web Access' },
  { path: '/ecp', name: 'Exchange Control Panel' },
  { path: '/EWS/Exchange.asmx', name: 'Exchange Web Services' },
  { path: '/Microsoft-Server-ActiveSync', name: 'ActiveSync' },
  { path: '/OAB', name: 'Offline Address Book' },
  { path: '/mapi/nspi', name: 'MAPI over HTTP' },
  { path: '/rpc/rpcproxy.dll', name: 'RPC over HTTP' },
  { path: '/powershell', name: 'Remote PowerShell' },
];

let _resolvedIp: string | null = null;

function httpRequest(
  hostname: string,
  path: string,
  method: string = 'GET',
  timeout: number = 8000
): Promise<{ statusCode: number; headers: Record<string, string>; redirectUrl?: string }> {
  return new Promise((resolve, reject) => {
    const options: any = {
      hostname: _resolvedIp || hostname,
      port: 443,
      path,
      method,
      timeout,
      rejectUnauthorized: false,
      servername: hostname,
      headers: {
        'Host': hostname,
        'User-Agent': 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
        'Accept': '*/*',
      },
    };

    const req = https.request(options, (res) => {
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
        redirectUrl: res.headers.location || undefined,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function resolveAndValidate(hostname: string): Promise<string[]> {
  const ips = await dnsResolve4(hostname);
  for (const ip of ips) {
    if (isPrivateIp(ip)) {
      throw new Error('Target resolves to a private IP address');
    }
  }
  return ips;
}

function detectExchangeVersion(headers: Record<string, string>): { version?: string; buildNumber?: string } {
  const result: { version?: string; buildNumber?: string } = {};

  const owaVersion = headers['x-owa-version'];
  if (owaVersion) {
    result.buildNumber = owaVersion;
    result.version = mapBuildToVersion(owaVersion);
    return result;
  }

  const feServer = headers['x-feserver'];
  if (feServer) {
    result.version = 'Exchange (on-premise detected via X-FEServer)';
  }

  const beServer = headers['x-beserver'];
  if (beServer) {
    result.version = result.version || 'Exchange (on-premise detected via X-BEServer)';
  }

  const diagInfo = headers['x-diaginfo'];
  if (diagInfo) {
    result.version = result.version || 'Exchange (detected via X-DiagInfo)';
  }

  const server = headers['server'];
  if (server && server.toLowerCase().includes('microsoft')) {
    result.version = result.version || 'Microsoft Server detected';
  }

  return result;
}

function mapBuildToVersion(build: string): string {
  const parts = build.split('.');
  if (parts.length < 2) return `Exchange (build ${build})`;

  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);

  if (major === 15) {
    if (minor >= 2) return `Exchange Server 2019 (build ${build})`;
    if (minor >= 1) return `Exchange Server 2016 (build ${build})`;
    if (minor === 0) return `Exchange Server 2013 (build ${build})`;
  }
  if (major === 14) return `Exchange Server 2010 (build ${build})`;
  if (major === 8) return `Exchange Server 2007 (build ${build})`;
  if (major === 6) {
    if (minor >= 5) return `Exchange Server 2003 (build ${build})`;
    return `Exchange 2000 (build ${build})`;
  }

  return `Exchange (build ${build})`;
}

function getApplicableVulnerabilities(version?: string): VulnerabilityInfo[] {
  if (!version) return [];

  const vulns: VulnerabilityInfo[] = [];
  for (const vuln of EXCHANGE_VULNERABILITIES) {
    for (const affected of vuln.affectedVersions) {
      if (version.includes(affected)) {
        vulns.push(vuln);
        break;
      }
    }
  }
  return vulns;
}

function determineRiskLevel(
  isExchange: boolean,
  onPremise: boolean,
  endpoints: EndpointCheck[],
  vulnerabilities: VulnerabilityInfo[]
): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  if (!isExchange) return 'info';

  const hasCriticalVulns = vulnerabilities.some(v => v.severity === 'critical');
  const exposedEndpoints = endpoints.filter(e => e.accessible).length;

  if (onPremise && hasCriticalVulns && exposedEndpoints > 3) return 'critical';
  if (onPremise && hasCriticalVulns) return 'high';
  if (onPremise && exposedEndpoints > 3) return 'high';
  if (onPremise && exposedEndpoints > 0) return 'medium';
  if (onPremise) return 'medium';
  return 'low';
}

export async function checkExchangeServer(hostname: string): Promise<ExchangeCheckResult> {
  const startTime = Date.now();

  if (!isValidDomain(hostname)) {
    throw new Error('Invalid domain name');
  }

  const resolvedIps = await resolveAndValidate(hostname);
  _resolvedIp = resolvedIps[0];

  const result: ExchangeCheckResult = {
    hostname,
    isExchange: false,
    exchangeOnline: false,
    onPremise: false,
    endpoints: [],
    mxRecords: [],
    vulnerabilities: [],
    serverHeaders: {},
    riskLevel: 'info',
    findings: [],
    scanTime: 0,
  };

  let mxRecords: { exchange: string; priority: number }[] = [];
  try {
    const mx = await dnsResolveMx(hostname);
    mxRecords = mx.map(r => ({ exchange: r.exchange, priority: r.priority }));
  } catch {}

  result.mxRecords = mxRecords.map(mx => {
    const isEOL = mx.exchange.toLowerCase().includes('.mail.protection.outlook.com') ||
                  mx.exchange.toLowerCase().includes('.eo.outlook.com');
    if (isEOL) {
      result.exchangeOnline = true;
      result.isExchange = true;
    }
    return {
      ...mx,
      isExchangeOnline: isEOL,
    };
  });

  if (result.exchangeOnline) {
    result.findings.push({
      type: 'info',
      message: 'Domain uses Exchange Online (Microsoft 365) for email delivery.',
    });
  }

  const endpointResults = await Promise.allSettled(
    EXCHANGE_ENDPOINTS.map(async (ep) => {
      try {
        const response = await httpRequest(hostname, ep.path);
        const check: EndpointCheck = {
          path: ep.path,
          accessible: response.statusCode < 500 && response.statusCode !== 404,
          statusCode: response.statusCode,
          headers: response.headers,
          redirectUrl: response.redirectUrl,
        };

        if (check.accessible) {
          Object.assign(result.serverHeaders, response.headers);
        }

        return check;
      } catch {
        return {
          path: ep.path,
          accessible: false,
        } as EndpointCheck;
      }
    })
  );

  result.endpoints = endpointResults.map(r =>
    r.status === 'fulfilled' ? r.value : { path: '', accessible: false }
  ).filter(e => e.path);

  const accessibleEndpoints = result.endpoints.filter(e => e.accessible);

  if (accessibleEndpoints.length > 0) {
    result.onPremise = true;
    result.isExchange = true;
  }

  const allHeaders: Record<string, string> = {};
  for (const ep of accessibleEndpoints) {
    if (ep.headers) {
      Object.assign(allHeaders, ep.headers);
    }
  }

  const versionInfo = detectExchangeVersion(allHeaders);
  if (versionInfo.version) {
    result.version = versionInfo.version;
    result.buildNumber = versionInfo.buildNumber;
  }

  if (result.onPremise) {
    result.findings.push({
      type: 'warning',
      message: 'On-premise Exchange Server detected with externally accessible endpoints.',
    });

    for (const ep of accessibleEndpoints) {
      const epName = EXCHANGE_ENDPOINTS.find(e => e.path === ep.path)?.name || ep.path;

      if (ep.path === '/owa' || ep.path === '/ecp') {
        result.findings.push({
          type: 'warning',
          message: `${epName} is externally accessible (HTTP ${ep.statusCode}).`,
        });
      } else if (ep.path === '/powershell') {
        result.findings.push({
          type: 'critical',
          message: 'Remote PowerShell endpoint is externally accessible — high risk.',
        });
      } else if (ep.path === '/EWS/Exchange.asmx') {
        result.findings.push({
          type: 'warning',
          message: 'Exchange Web Services (EWS) is externally accessible.',
        });
      } else if (ep.path === '/Microsoft-Server-ActiveSync') {
        result.findings.push({
          type: 'info',
          message: 'ActiveSync is enabled for mobile device connectivity.',
        });
      } else if (ep.path.includes('autodiscover')) {
        result.findings.push({
          type: 'info',
          message: `Autodiscover endpoint is accessible (HTTP ${ep.statusCode}).`,
        });
      } else {
        result.findings.push({
          type: 'info',
          message: `${epName} endpoint responded (HTTP ${ep.statusCode}).`,
        });
      }
    }
  }

  result.vulnerabilities = getApplicableVulnerabilities(result.version);

  if (result.vulnerabilities.length > 0) {
    const critCount = result.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = result.vulnerabilities.filter(v => v.severity === 'high').length;
    result.findings.push({
      type: 'critical',
      message: `Detected Exchange version may be affected by ${critCount} critical and ${highCount} high severity vulnerabilities. Verify patching status immediately.`,
    });
  }

  if (!result.isExchange) {
    result.findings.push({
      type: 'info',
      message: 'No Microsoft Exchange Server indicators detected for this domain.',
    });
  }

  result.riskLevel = determineRiskLevel(
    result.isExchange,
    result.onPremise,
    result.endpoints,
    result.vulnerabilities
  );

  result.scanTime = Date.now() - startTime;
  _resolvedIp = null;

  return result;
}
