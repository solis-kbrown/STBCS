import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolve6 = promisify(dns.resolve6);
const dnsResolveMx = promisify(dns.resolveMx);
const dnsResolveTxt = promisify(dns.resolveTxt);
const dnsResolveNs = promisify(dns.resolveNs);
const dnsReverseLookup = promisify(dns.reverse);

export interface IpLookupResult {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asn?: string;
  reverse?: string[];
  isProxy?: boolean;
  isHosting?: boolean;
  isMobile?: boolean;
}

export interface DomainLookupResult {
  domain: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
  dnssec?: string;
  aRecords?: string[];
  aaaaRecords?: string[];
  mxRecords?: { exchange: string; priority: number }[];
  txtRecords?: string[];
  nsRecords?: string[];
}

export interface PortCheckResult {
  ip: string;
  port: number;
  open: boolean;
  service?: string;
  responseTime?: number;
}

const COMMON_PORTS: { [key: number]: string } = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  445: 'SMB',
  993: 'IMAPS',
  995: 'POP3S',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  8080: 'HTTP-Alt',
  8443: 'HTTPS-Alt',
};

const FREE_USER_PORTS = [21, 22, 25, 53, 80, 110, 143, 443, 993, 995];
const PRO_USER_PORTS = [...FREE_USER_PORTS, 23, 445, 3306, 3389, 5432, 8080, 8443];

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function lookupIp(ip: string): Promise<IpLookupResult> {
  const result: IpLookupResult = { ip };
  
  try {
    const response = await fetchWithTimeout(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      result.city = data.city;
      result.region = data.regionName;
      result.country = data.country;
      result.countryCode = data.countryCode;
      result.lat = data.lat;
      result.lon = data.lon;
      result.timezone = data.timezone;
      result.isp = data.isp;
      result.org = data.org;
      result.as = data.as;
      result.asn = data.asname;
      result.isProxy = data.proxy;
      result.isHosting = data.hosting;
      result.isMobile = data.mobile;
    }
  } catch (error) {
    console.error('IP lookup error:', error);
  }
  
  try {
    result.reverse = await dnsReverseLookup(ip);
    if (result.reverse && result.reverse.length > 0) {
      result.hostname = result.reverse[0];
    }
  } catch {
  }
  
  return result;
}

export async function lookupDomain(domain: string): Promise<DomainLookupResult> {
  const result: DomainLookupResult = { domain };
  
  try {
    result.aRecords = await dnsResolve4(domain);
  } catch {}
  
  try {
    result.aaaaRecords = await dnsResolve6(domain);
  } catch {}
  
  try {
    const mx = await dnsResolveMx(domain);
    result.mxRecords = mx.map(r => ({ exchange: r.exchange, priority: r.priority }));
  } catch {}
  
  try {
    const txt = await dnsResolveTxt(domain);
    result.txtRecords = txt.map(r => r.join(''));
  } catch {}
  
  try {
    result.nsRecords = await dnsResolveNs(domain);
  } catch {}
  
  try {
    const rdapResponse = await fetchWithTimeout(`https://rdap.org/domain/${domain}`);
    if (rdapResponse.ok) {
      const rdapData = await rdapResponse.json();
      
      if (rdapData.entities) {
        for (const entity of rdapData.entities) {
          if (entity.roles?.includes('registrar') && entity.vcardArray) {
            const vcard = entity.vcardArray[1];
            const fnEntry = vcard?.find((v: any[]) => v[0] === 'fn');
            if (fnEntry) {
              result.registrar = fnEntry[3];
            }
          }
        }
      }
      
      if (rdapData.events) {
        for (const event of rdapData.events) {
          if (event.eventAction === 'registration') {
            result.creationDate = event.eventDate;
          } else if (event.eventAction === 'expiration') {
            result.expirationDate = event.eventDate;
          } else if (event.eventAction === 'last changed') {
            result.updatedDate = event.eventDate;
          }
        }
      }
      
      if (rdapData.nameservers) {
        result.nameServers = rdapData.nameservers.map((ns: any) => ns.ldhName || ns.unicodeName);
      }
      
      if (rdapData.status) {
        result.status = rdapData.status;
      }
      
      if (rdapData.secureDNS) {
        result.dnssec = rdapData.secureDNS.delegationSigned ? 'signed' : 'unsigned';
      }
    }
  } catch (error) {
    console.error('RDAP lookup error:', error);
  }
  
  return result;
}

export async function checkPort(ip: string, port: number, timeout = 3000): Promise<PortCheckResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        ip,
        port,
        open: true,
        service: COMMON_PORTS[port] || 'Unknown',
        responseTime,
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        ip,
        port,
        open: false,
        service: COMMON_PORTS[port] || 'Unknown',
      });
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve({
        ip,
        port,
        open: false,
        service: COMMON_PORTS[port] || 'Unknown',
      });
    });
    
    socket.connect(port, ip);
  });
}

export async function scanPorts(ip: string, isPro: boolean = false): Promise<PortCheckResult[]> {
  const portsToScan = isPro ? PRO_USER_PORTS : FREE_USER_PORTS;
  const results = await Promise.all(portsToScan.map(port => checkPort(ip, port)));
  return results;
}

export function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

export function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 0) return true;
  
  return false;
}

// Shodan InternetDB - Free API (no key needed)
// https://internetdb.shodan.io/
export interface ShodanInternetDBResult {
  ip: string;
  ports: number[];
  hostnames: string[];
  cpes: string[];
  vulns: string[];
  tags: string[];
}

export async function lookupShodanInternetDB(ip: string): Promise<ShodanInternetDBResult | null> {
  try {
    const response = await fetchWithTimeout(`https://internetdb.shodan.io/${ip}`, 15000);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Shodan InternetDB error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ip: data.ip || ip,
      ports: data.ports || [],
      hostnames: data.hostnames || [],
      cpes: data.cpes || [],
      vulns: data.vulns || [],
      tags: data.tags || [],
    };
  } catch (error) {
    console.error("[Shodan InternetDB] Error:", error);
    return null;
  }
}

export { COMMON_PORTS, FREE_USER_PORTS, PRO_USER_PORTS };

// ============================================
// NEW FREE SECURITY TOOLS
// ============================================

// Password Strength Checker
export interface PasswordStrengthResult {
  password: string;
  score: number; // 0-4 (0=very weak, 4=very strong)
  strength: string;
  crackTime: string;
  suggestions: string[];
  entropy: number;
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (hasLower && hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  
  // Common patterns (reduce score)
  const commonPatterns = [
    /^123/, /password/i, /qwerty/i, /abc123/i, /letmein/i,
    /welcome/i, /admin/i, /login/i, /(\w)\1{2,}/
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 2);
      suggestions.push('Avoid common patterns');
      break;
    }
  }
  
  // Calculate entropy
  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;
  const entropy = password.length * Math.log2(charsetSize || 1);
  
  // Suggestions
  if (password.length < 12) suggestions.push('Use at least 12 characters');
  if (!hasUpper) suggestions.push('Add uppercase letters');
  if (!hasLower) suggestions.push('Add lowercase letters');
  if (!hasNumber) suggestions.push('Add numbers');
  if (!hasSpecial) suggestions.push('Add special characters');
  
  // Normalize score
  const normalizedScore = Math.min(4, Math.max(0, Math.floor(score / 2)));
  
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const crackTimes = ['Instantly', 'Minutes', 'Hours', 'Days', 'Centuries'];
  
  return {
    password: '*'.repeat(password.length),
    score: normalizedScore,
    strength: strengthLabels[normalizedScore],
    crackTime: crackTimes[normalizedScore],
    suggestions,
    entropy: Math.round(entropy * 10) / 10,
  };
}

// Subnet/CIDR Calculator
export interface SubnetCalcResult {
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  firstUsable: string;
  lastUsable: string;
  ipClass: string;
}

export function calculateSubnet(cidr: string): SubnetCalcResult | null {
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;
  
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  
  const ipParts = ip.split('.').map(Number);
  if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  
  const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  
  const numToIp = (n: number) => [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255
  ].join('.');
  
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : totalHosts - 2;
  
  let ipClass = 'Unknown';
  if (ipParts[0] >= 1 && ipParts[0] <= 126) ipClass = 'A';
  else if (ipParts[0] >= 128 && ipParts[0] <= 191) ipClass = 'B';
  else if (ipParts[0] >= 192 && ipParts[0] <= 223) ipClass = 'C';
  else if (ipParts[0] >= 224 && ipParts[0] <= 239) ipClass = 'D (Multicast)';
  else if (ipParts[0] >= 240) ipClass = 'E (Reserved)';
  
  return {
    cidr,
    networkAddress: numToIp(network),
    broadcastAddress: numToIp(broadcast),
    subnetMask: numToIp(mask),
    wildcardMask: numToIp(~mask >>> 0),
    totalHosts,
    usableHosts,
    firstUsable: prefix >= 31 ? numToIp(network) : numToIp(network + 1),
    lastUsable: prefix >= 31 ? numToIp(broadcast) : numToIp(broadcast - 1),
    ipClass,
  };
}

// Base64 Encoder/Decoder
export interface Base64Result {
  input: string;
  output: string;
  operation: 'encode' | 'decode';
  success: boolean;
  error?: string;
}

export function base64Encode(input: string): Base64Result {
  try {
    const output = Buffer.from(input, 'utf-8').toString('base64');
    return { input, output, operation: 'encode', success: true };
  } catch (error) {
    return { input, output: '', operation: 'encode', success: false, error: 'Encoding failed' };
  }
}

export function base64Decode(input: string): Base64Result {
  try {
    const output = Buffer.from(input, 'base64').toString('utf-8');
    return { input, output, operation: 'decode', success: true };
  } catch (error) {
    return { input, output: '', operation: 'decode', success: false, error: 'Invalid Base64 string' };
  }
}

// URL Encoder/Decoder
export function urlEncode(input: string): Base64Result {
  try {
    const output = encodeURIComponent(input);
    return { input, output, operation: 'encode', success: true };
  } catch (error) {
    return { input, output: '', operation: 'encode', success: false, error: 'Encoding failed' };
  }
}

export function urlDecode(input: string): Base64Result {
  try {
    const output = decodeURIComponent(input);
    return { input, output, operation: 'decode', success: true };
  } catch (error) {
    return { input, output: '', operation: 'decode', success: false, error: 'Invalid URL encoded string' };
  }
}

// Email Header Analyzer
export interface EmailHeaderResult {
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
  receivedChain: { from: string; by: string; timestamp?: string }[];
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  messageId?: string;
  xMailer?: string;
  contentType?: string;
  warnings: string[];
}

export function analyzeEmailHeaders(headers: string): EmailHeaderResult {
  const result: EmailHeaderResult = {
    receivedChain: [],
    warnings: [],
  };
  
  const lines = headers.split(/\r?\n/);
  let currentHeader = '';
  
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      currentHeader += ' ' + line.trim();
    } else {
      processHeader(currentHeader, result);
      currentHeader = line;
    }
  }
  processHeader(currentHeader, result);
  
  // Analyze for potential issues
  if (result.receivedChain.length > 10) {
    result.warnings.push('Unusually long delivery chain - may indicate relay issues');
  }
  if (result.spfResult && !result.spfResult.toLowerCase().includes('pass')) {
    result.warnings.push('SPF check did not pass - possible spoofing');
  }
  if (result.dkimResult && !result.dkimResult.toLowerCase().includes('pass')) {
    result.warnings.push('DKIM signature invalid - message may be altered');
  }
  
  return result;
}

function processHeader(header: string, result: EmailHeaderResult) {
  if (!header) return;
  
  const colonIndex = header.indexOf(':');
  if (colonIndex === -1) return;
  
  const name = header.substring(0, colonIndex).toLowerCase().trim();
  const value = header.substring(colonIndex + 1).trim();
  
  switch (name) {
    case 'from':
      result.from = value;
      break;
    case 'to':
      result.to = value;
      break;
    case 'subject':
      result.subject = value;
      break;
    case 'date':
      result.date = value;
      break;
    case 'message-id':
      result.messageId = value;
      break;
    case 'x-mailer':
      result.xMailer = value;
      break;
    case 'content-type':
      result.contentType = value;
      break;
    case 'received':
      const fromMatch = value.match(/from\s+(\S+)/i);
      const byMatch = value.match(/by\s+(\S+)/i);
      if (fromMatch || byMatch) {
        result.receivedChain.push({
          from: fromMatch?.[1] || 'unknown',
          by: byMatch?.[1] || 'unknown',
        });
      }
      break;
    case 'received-spf':
    case 'authentication-results':
      if (value.toLowerCase().includes('spf=')) {
        const spfMatch = value.match(/spf=(\w+)/i);
        result.spfResult = spfMatch?.[1] || value;
      }
      if (value.toLowerCase().includes('dkim=')) {
        const dkimMatch = value.match(/dkim=(\w+)/i);
        result.dkimResult = dkimMatch?.[1] || value;
      }
      if (value.toLowerCase().includes('dmarc=')) {
        const dmarcMatch = value.match(/dmarc=(\w+)/i);
        result.dmarcResult = dmarcMatch?.[1] || value;
      }
      break;
  }
}

// SSL Certificate Checker
export interface SSLCertResult {
  domain: string;
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
  keySize?: number;
  serialNumber?: string;
  fingerprint?: string;
  altNames?: string[];
  error?: string;
}

export async function checkSSLCertificate(domain: string): Promise<SSLCertResult> {
  const tls = await import('tls');
  
  return new Promise((resolve) => {
    const options = {
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false,
    };
    
    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();
      
      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        resolve({
          domain,
          valid: false,
          error: 'No certificate found',
        });
        return;
      }
      
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      socket.destroy();
      
      resolve({
        domain,
        valid: now >= validFrom && now <= validTo,
        issuer: cert.issuer?.O || cert.issuer?.CN,
        subject: cert.subject?.CN,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysRemaining,
        protocol: protocol || undefined,
        cipher: cipher?.name,
        keySize: cert.bits,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint256,
        altNames: cert.subjectaltname?.split(', ').map((s: string) => s.replace('DNS:', '')),
      });
    });
    
    socket.setTimeout(10000);
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        domain,
        valid: false,
        error: 'Connection timeout',
      });
    });
    
    socket.on('error', (err) => {
      resolve({
        domain,
        valid: false,
        error: err.message,
      });
    });
  });
}

// Hash Format Detector
export interface HashAnalysisResult {
  hash: string;
  length: number;
  possibleTypes: string[];
  isValid: boolean;
}

export function analyzeHash(hash: string): HashAnalysisResult {
  const cleanHash = hash.trim().toLowerCase();
  const length = cleanHash.length;
  const isHex = /^[a-f0-9]+$/i.test(cleanHash);
  
  const possibleTypes: string[] = [];
  
  if (!isHex) {
    return { hash: cleanHash, length, possibleTypes: ['Invalid hex string'], isValid: false };
  }
  
  switch (length) {
    case 32:
      possibleTypes.push('MD5', 'NTLM');
      break;
    case 40:
      possibleTypes.push('SHA-1');
      break;
    case 56:
      possibleTypes.push('SHA-224');
      break;
    case 64:
      possibleTypes.push('SHA-256', 'RIPEMD-256');
      break;
    case 96:
      possibleTypes.push('SHA-384');
      break;
    case 128:
      possibleTypes.push('SHA-512', 'Whirlpool');
      break;
    default:
      possibleTypes.push('Unknown hash type');
  }
  
  return { hash: cleanHash, length, possibleTypes, isValid: true };
}
