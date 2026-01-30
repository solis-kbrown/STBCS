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

// ============================================
// ADVANCED NMAP-STYLE PORT SCANNER (Pro/Business)
// ============================================

// Top 100 most common ports (Nmap top ports subset)
const NMAP_TOP_100_PORTS = [
  7, 9, 13, 21, 22, 23, 25, 26, 37, 53, 79, 80, 81, 82, 88, 106, 110, 111, 113,
  119, 135, 139, 143, 144, 179, 199, 389, 427, 443, 444, 445, 465, 513, 514, 515,
  543, 544, 548, 554, 587, 631, 646, 873, 990, 993, 995, 1025, 1026, 1027, 1028,
  1029, 1110, 1433, 1720, 1723, 1755, 1900, 2000, 2001, 2049, 2121, 2717, 3000,
  3128, 3306, 3389, 3986, 4899, 5000, 5009, 5051, 5060, 5101, 5190, 5357, 5432,
  5631, 5666, 5800, 5900, 5901, 6000, 6001, 6646, 7070, 8000, 8008, 8009, 8080,
  8081, 8443, 8888, 9100, 9999, 10000, 32768, 49152, 49153, 49154, 49155
];

// Top 1000 ports for comprehensive scans
const NMAP_TOP_1000_PORTS = [
  ...NMAP_TOP_100_PORTS,
  1, 3, 4, 6, 11, 15, 17, 18, 19, 20, 24, 30, 32, 33, 37, 42, 43, 49, 57, 70,
  83, 84, 85, 89, 90, 99, 100, 102, 104, 105, 107, 109, 115, 117, 118, 120, 121,
  123, 124, 126, 127, 129, 130, 133, 138, 140, 146, 152, 153, 158, 161, 162,
  163, 164, 170, 175, 177, 178, 181, 182, 183, 185, 186, 191, 192, 194, 196,
  197, 198, 206, 209, 210, 211, 212, 213, 215, 218, 222, 223, 224, 225, 233,
  234, 235, 236, 256, 259, 264, 280, 301, 311, 340, 366, 406, 407, 416, 417,
  425, 458, 464, 481, 497, 500, 512, 516, 517, 518, 519, 520, 521, 522, 523,
  524, 525, 540, 545, 546, 547, 556, 563, 564, 593, 616, 617, 625, 626, 631,
  636, 637, 638, 648, 666, 667, 668, 683, 687, 691, 700, 705, 711, 714, 720,
  722, 726, 749, 765, 777, 783, 787, 800, 801, 808, 843, 880, 898, 900, 901,
  902, 903, 911, 912, 981, 987, 991, 992, 999, 1000, 1001, 1002, 1007, 1009,
  1010, 1011, 1021, 1022, 1023, 1024, 1030, 1031, 1032, 1033, 1034, 1035, 1036,
  1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049,
  1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062,
  1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071, 1072, 1073, 1074, 1075,
  1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1099, 1100,
  1102, 1104, 1105, 1106, 1107, 1108, 1111, 1112, 1113, 1114, 1117, 1119, 1121,
  1122, 1123, 1124, 1126, 1130, 1131, 1132, 1137, 1138, 1141, 1145, 1147, 1148,
  1149, 1151, 1152, 1154, 1163, 1164, 1165, 1166, 1169, 1174, 1175, 1183, 1185,
  1186, 1187, 1192, 1198, 1199, 1201, 1213, 1216, 1217, 1218, 1233, 1234, 1236,
  1244, 1247, 1248, 1259, 1271, 1272, 1277, 1287, 1296, 1300, 1301, 1309, 1310,
  1311, 1322, 1328, 1334, 1352, 1417, 1434, 1443, 1455, 1461, 1494, 1500, 1501,
  1503, 1521, 1524, 1533, 1556, 1580, 1583, 1594, 1600, 1641, 1658, 1666, 1687,
  1688, 1700, 1717, 1718, 1719, 1721, 1725, 1741, 1761, 1782, 1783, 1801, 1805,
  1812, 1839, 1840, 1862, 1863, 1864, 1875, 1914, 1935, 1947, 1971, 1972, 1974,
  1984, 1998, 1999, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2013,
  2020, 2021, 2022, 2030, 2033, 2034, 2035, 2038, 2040, 2041, 2042, 2045, 2046,
  2047, 2048, 2065, 2068, 2099, 2100, 2103, 2105, 2106, 2107, 2111, 2119, 2126,
  2135, 2144, 2160, 2161, 2170, 2179, 2190, 2191, 2196, 2200, 2222, 2251, 2260,
  2288, 2301, 2323, 2366, 2381, 2382, 2393, 2394, 2399, 2401, 2492, 2500, 2522,
  2525, 2557, 2601, 2602, 2604, 2605, 2607, 2608, 2638, 2701, 2702, 2710, 2718,
  2725, 2800, 2809, 2811, 2869, 2875, 2909, 2910, 2920, 2967, 2968, 2998, 3001,
  3003, 3005, 3006, 3007, 3011, 3013, 3017, 3030, 3031, 3052, 3071, 3077, 3107,
  3211, 3268, 3269, 3283, 3300, 3301, 3307, 3323, 3325, 3333, 3351, 3367, 3369,
  3370, 3371, 3372, 3389, 3390, 3404, 3476, 3493, 3517, 3527, 3546, 3551, 3580,
  3659, 3689, 3690, 3703, 3737, 3766, 3784, 3800, 3801, 3809, 3814, 3826, 3827,
  3828, 3851, 3869, 3871, 3878, 3880, 3889, 3905, 3914, 3918, 3920, 3945, 3971,
  3995, 4003, 4004, 4005, 4006, 4045, 4111, 4125, 4126, 4129, 4224, 4242, 4279,
  4321, 4343, 4443, 4444, 4445, 4446, 4449, 4550, 4567, 4662, 4848, 4900, 4998,
  5001, 5002, 5003, 5004, 5006, 5007, 5010, 5015, 5020, 5050, 5054, 5055, 5080,
  5087, 5100, 5102, 5120, 5200, 5214, 5221, 5222, 5225, 5226, 5269, 5280, 5298,
  5300, 5355, 5400, 5405, 5414, 5431, 5433, 5440, 5500, 5510, 5544, 5550, 5555,
  5560, 5566, 5601, 5602, 5604, 5607, 5633, 5679, 5703, 5713, 5730, 5801, 5802,
  5810, 5811, 5815, 5820, 5822, 5825, 5850, 5859, 5862, 5877, 5902, 5903, 5904,
  5906, 5907, 5910, 5911, 5915, 5922, 5925, 5950, 5952, 5959, 5960, 5961, 5962,
  5963, 5987, 5988, 5989, 5998, 5999, 6002, 6003, 6004, 6005, 6007, 6010, 6050,
  6059, 6100, 6101, 6106, 6112, 6123, 6129, 6156, 6346, 6389, 6502, 6510, 6543,
  6547, 6565, 6566, 6567, 6580, 6646, 6666, 6667, 6668, 6699, 6779, 6788, 6789,
  6792, 6839, 6881, 6901, 6969, 7000, 7001, 7002, 7004, 7007, 7019, 7025, 7100,
  7103, 7106, 7200, 7201, 7402, 7435, 7443, 7496, 7512, 7625, 7627, 7676, 7741,
  7777, 7778, 7800, 7911, 7920, 7921, 7937, 7938, 7999, 8001, 8002, 8003, 8007,
  8010, 8021, 8022, 8031, 8042, 8045, 8082, 8083, 8084, 8085, 8086, 8087, 8088,
  8089, 8090, 8093, 8099, 8100, 8139, 8180, 8181, 8192, 8193, 8194, 8200, 8222,
  8254, 8290, 8291, 8292, 8293, 8300, 8333, 8383, 8400, 8402, 8500, 8600, 8649,
  8651, 8652, 8654, 8701, 8800, 8873, 8880, 8899, 8994, 9000, 9001, 9002, 9003,
  9009, 9010, 9011, 9040, 9050, 9071, 9080, 9081, 9090, 9091, 9101, 9102, 9103,
  9110, 9111, 9200, 9207, 9220, 9290, 9418, 9500, 9502, 9503, 9535, 9575, 9593,
  9594, 9595, 9618, 9666, 9876, 9877, 9878, 9898, 9900, 9917, 9943, 9944, 9968,
  9998, 10001, 10002, 10003, 10004, 10009, 10010, 10012, 10024, 10025, 10082,
  10180, 10215, 10243, 10566, 10616, 10617, 10621, 10626, 10628, 10629
];

// Extended service detection with banners
const EXTENDED_SERVICE_MAP: { [key: number]: { name: string; probe?: string } } = {
  7: { name: 'Echo', probe: 'test\r\n' },
  21: { name: 'FTP', probe: '' },
  22: { name: 'SSH', probe: '' },
  23: { name: 'Telnet', probe: '' },
  25: { name: 'SMTP', probe: 'EHLO test\r\n' },
  53: { name: 'DNS' },
  80: { name: 'HTTP', probe: 'GET / HTTP/1.1\r\nHost: localhost\r\n\r\n' },
  110: { name: 'POP3', probe: '' },
  111: { name: 'RPC' },
  135: { name: 'MSRPC' },
  139: { name: 'NetBIOS-SSN' },
  143: { name: 'IMAP', probe: '' },
  443: { name: 'HTTPS' },
  445: { name: 'SMB' },
  465: { name: 'SMTPS' },
  587: { name: 'Submission' },
  993: { name: 'IMAPS' },
  995: { name: 'POP3S' },
  1433: { name: 'MSSQL' },
  1521: { name: 'Oracle' },
  1723: { name: 'PPTP' },
  3306: { name: 'MySQL', probe: '' },
  3389: { name: 'RDP' },
  5432: { name: 'PostgreSQL' },
  5900: { name: 'VNC', probe: '' },
  5901: { name: 'VNC-1' },
  6379: { name: 'Redis', probe: 'PING\r\n' },
  8080: { name: 'HTTP-Proxy', probe: 'GET / HTTP/1.1\r\nHost: localhost\r\n\r\n' },
  8443: { name: 'HTTPS-Alt' },
  9200: { name: 'Elasticsearch' },
  27017: { name: 'MongoDB' },
};

// Blocked IP ranges (internal, localhost, private)
const BLOCKED_IP_PATTERNS = [
  /^127\./,                    // Localhost
  /^10\./,                     // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private Class B
  /^192\.168\./,               // Private Class C
  /^169\.254\./,               // Link-local
  /^0\./,                      // Invalid
  /^224\./,                    // Multicast
  /^255\./,                    // Broadcast
  /^::1$/,                     // IPv6 localhost
  /^fe80:/i,                   // IPv6 link-local
  /^fc00:/i,                   // IPv6 private
  /^fd00:/i,                   // IPv6 private
];

export interface AdvancedScanResult {
  ip: string;
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version?: string;
  banner?: string;
  responseTime: number;
}

export interface NmapScanResult {
  target: string;
  scanType: 'quick' | 'standard' | 'comprehensive';
  startTime: string;
  endTime: string;
  duration: number;
  portsScanned: number;
  openPorts: number;
  closedPorts: number;
  filteredPorts: number;
  results: AdvancedScanResult[];
  hostUp: boolean;
}

// Check if IP is blocked (internal/private)
export function isBlockedIP(ip: string): boolean {
  return BLOCKED_IP_PATTERNS.some(pattern => pattern.test(ip));
}

// Advanced port check with banner grabbing
async function advancedPortCheck(
  ip: string,
  port: number,
  timeout: number = 2000,
  grabBanner: boolean = true
): Promise<AdvancedScanResult> {
  const startTime = Date.now();
  const serviceInfo = EXTENDED_SERVICE_MAP[port] || { name: COMMON_PORTS[port] || 'Unknown' };

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';
    let resolved = false;

    const finish = (state: 'open' | 'closed' | 'filtered', bannerData?: string) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve({
        ip,
        port,
        state,
        service: serviceInfo.name,
        banner: bannerData?.substring(0, 256).replace(/[\x00-\x1F\x7F]/g, '.'),
        responseTime: Date.now() - startTime,
      });
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      if (grabBanner && serviceInfo.probe !== undefined) {
        if (serviceInfo.probe) {
          socket.write(serviceInfo.probe);
        }
        socket.once('data', (data) => {
          banner = data.toString('utf8');
          finish('open', banner);
        });
        setTimeout(() => finish('open', banner), 500);
      } else {
        finish('open');
      }
    });

    socket.on('timeout', () => finish('filtered'));
    socket.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNREFUSED') {
        finish('closed');
      } else {
        finish('filtered');
      }
    });

    socket.connect(port, ip);
  });
}

// Parse custom port specification (e.g., "22,80,443" or "1-1000" or "22,80,100-200")
export function parsePortSpec(portSpec: string): number[] {
  const ports: Set<number> = new Set();
  const parts = portSpec.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= 65535 && start <= end) {
        for (let p = start; p <= end; p++) {
          ports.add(p);
        }
      }
    } else {
      const port = parseInt(part, 10);
      if (!isNaN(port) && port > 0 && port <= 65535) {
        ports.add(port);
      }
    }
  }

  return Array.from(ports).sort((a, b) => a - b);
}

// Main Nmap-style scanner
export async function nmapScan(
  target: string,
  options: {
    scanType: 'quick' | 'standard' | 'comprehensive';
    customPorts?: string;
    grabBanners?: boolean;
    timeout?: number;
    maxConcurrent?: number;
  }
): Promise<NmapScanResult> {
  const startTime = new Date();

  // Determine ports to scan
  let portsToScan: number[];

  if (options.customPorts) {
    portsToScan = parsePortSpec(options.customPorts);
  } else {
    switch (options.scanType) {
      case 'quick':
        portsToScan = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080];
        break;
      case 'standard':
        portsToScan = [...NMAP_TOP_100_PORTS];
        break;
      case 'comprehensive':
        portsToScan = Array.from(new Set(NMAP_TOP_1000_PORTS)).slice(0, 500); // Cap at 500 for performance
        break;
      default:
        portsToScan = NMAP_TOP_100_PORTS;
    }
  }

  // Limit max ports per scan for abuse prevention
  const MAX_PORTS_PER_SCAN = 500;
  if (portsToScan.length > MAX_PORTS_PER_SCAN) {
    portsToScan = portsToScan.slice(0, MAX_PORTS_PER_SCAN);
  }

  const timeout = options.timeout || 2000;
  const grabBanners = options.grabBanners !== false;
  const maxConcurrent = Math.min(options.maxConcurrent || 50, 100); // Cap concurrency

  // Scan ports in batches to prevent resource exhaustion
  const results: AdvancedScanResult[] = [];

  for (let i = 0; i < portsToScan.length; i += maxConcurrent) {
    const batch = portsToScan.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(port => advancedPortCheck(target, port, timeout, grabBanners))
    );
    results.push(...batchResults);
  }

  const endTime = new Date();
  const openPorts = results.filter(r => r.state === 'open').length;
  const closedPorts = results.filter(r => r.state === 'closed').length;
  const filteredPorts = results.filter(r => r.state === 'filtered').length;

  return {
    target,
    scanType: options.scanType,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: endTime.getTime() - startTime.getTime(),
    portsScanned: portsToScan.length,
    openPorts,
    closedPorts,
    filteredPorts,
    results: results.filter(r => r.state === 'open'), // Only return open ports in results
    hostUp: openPorts > 0 || closedPorts > 0,
  };
}
