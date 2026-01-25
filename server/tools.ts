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
