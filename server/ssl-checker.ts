import tls from 'tls';
import https from 'https';
import dns from 'dns';
import { promisify } from 'util';
import crypto from 'crypto';

const dnsResolveCaa = promisify(dns.resolveCaa);

export interface CertificateDetails {
  subject: string;
  issuer: string;
  issuerOrg?: string;
  serialNumber: string;
  fingerprintSHA1: string;
  fingerprintSHA256: string;
  keyType: string;
  keySize: number;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isExpired: boolean;
  isNotYetValid: boolean;
  sans: string[];
  signatureAlgorithm?: string;
}

export interface ChainCertificate {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isSelfSigned: boolean;
  serialNumber: string;
}

export interface ProtocolSupport {
  protocol: string;
  supported: boolean;
  deprecated: boolean;
}

export interface CipherInfo {
  name: string;
  version: string;
  bits: number;
  weak: boolean;
  reason?: string;
}

export interface HttpSecurityHeaders {
  hsts: {
    present: boolean;
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
    raw?: string;
  };
  contentSecurityPolicy: {
    present: boolean;
    raw?: string;
  };
  xFrameOptions: {
    present: boolean;
    value?: string;
  };
  xContentTypeOptions: {
    present: boolean;
    value?: string;
  };
  referrerPolicy: {
    present: boolean;
    value?: string;
  };
  permissionsPolicy: {
    present: boolean;
    raw?: string;
  };
}

export interface CaaRecord {
  critical: number;
  issue?: string;
  issuewild?: string;
  iodef?: string;
  tag: string;
  value: string;
}

export interface SSLCheckFullResult {
  hostname: string;
  port: number;
  grade: string;
  gradeColor: string;
  certificate: CertificateDetails;
  chain: ChainCertificate[];
  chainComplete: boolean;
  protocols: ProtocolSupport[];
  ciphers: CipherInfo[];
  ocspStapling: boolean;
  httpHeaders: HttpSecurityHeaders;
  caaRecords: CaaRecord[];
  issues: { severity: 'critical' | 'warning' | 'info'; message: string; remediation: string }[];
  scanTime: number;
  error?: string;
}

const WEAK_CIPHER_PATTERNS = [
  { pattern: /RC4/i, reason: 'RC4 is broken' },
  { pattern: /3DES|DES-CBC3/i, reason: '3DES is vulnerable to Sweet32 attack' },
  { pattern: /NULL/i, reason: 'NULL cipher provides no encryption' },
  { pattern: /EXPORT/i, reason: 'Export ciphers use weak key sizes' },
  { pattern: /anon/i, reason: 'Anonymous ciphers have no authentication' },
  { pattern: /MD5/i, reason: 'MD5 is cryptographically broken' },
];

function isWeakCipher(name: string): { weak: boolean; reason?: string } {
  for (const { pattern, reason } of WEAK_CIPHER_PATTERNS) {
    if (pattern.test(name)) return { weak: true, reason };
  }
  return { weak: false };
}

function connectTLS(hostname: string, port: number, options: tls.ConnectionOptions = {}): Promise<{
  socket: tls.TLSSocket;
  cert: any;
  cipher: tls.CipherNameAndProtocol | null;
  protocol: string | null;
  peerCertChain: any[];
}> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized: false,
      ...options,
    }, () => {
      const cert = socket.getPeerCertificate(true);
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();

      let chain: any[] = [];
      if (cert) {
        let current = cert;
        const seen = new Set<string>();
        while (current && !seen.has(current.serialNumber)) {
          seen.add(current.serialNumber);
          chain.push(current);
          if (current.issuerCertificate && current.issuerCertificate.serialNumber !== current.serialNumber) {
            current = current.issuerCertificate;
          } else {
            break;
          }
        }
      }

      resolve({ socket, cert, cipher, protocol, peerCertChain: chain });
    });

    socket.setTimeout(10000);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    socket.on('error', (err) => {
      reject(err);
    });
  });
}

async function testProtocol(hostname: string, port: number, minVersion: string, maxVersion: string): Promise<boolean> {
  try {
    const { socket } = await connectTLS(hostname, port, {
      minVersion: minVersion as any,
      maxVersion: maxVersion as any,
    });
    socket.destroy();
    return true;
  } catch {
    return false;
  }
}

async function checkOCSPStapling(hostname: string, port: number): Promise<boolean> {
  try {
    const { socket } = await connectTLS(hostname, port, {
      requestOCSP: true,
    } as any);
    const ocspResponse = (socket as any).getOCSPResponse?.();
    socket.destroy();
    return !!ocspResponse;
  } catch {
    return false;
  }
}

async function fetchHttpHeaders(hostname: string, port: number): Promise<HttpSecurityHeaders> {
  const result: HttpSecurityHeaders = {
    hsts: { present: false },
    contentSecurityPolicy: { present: false },
    xFrameOptions: { present: false },
    xContentTypeOptions: { present: false },
    referrerPolicy: { present: false },
    permissionsPolicy: { present: false },
  };

  try {
    const headers = await new Promise<Record<string, string | string[] | undefined>>((resolve, reject) => {
      const req = https.get({
        hostname,
        port,
        path: '/',
        timeout: 8000,
        rejectUnauthorized: false,
        headers: { 'User-Agent': 'STB-SSL-Checker/1.0' },
      }, (res) => {
        resolve(res.headers as any);
        res.destroy();
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('timeout'));
      });
    });

    const hstsHeader = headers['strict-transport-security'];
    if (hstsHeader) {
      const hstsVal = Array.isArray(hstsHeader) ? hstsHeader[0] : hstsHeader;
      result.hsts.present = true;
      result.hsts.raw = hstsVal;
      const maxAgeMatch = hstsVal.match(/max-age=(\d+)/i);
      if (maxAgeMatch) result.hsts.maxAge = parseInt(maxAgeMatch[1], 10);
      result.hsts.includeSubDomains = /includeSubDomains/i.test(hstsVal);
      result.hsts.preload = /preload/i.test(hstsVal);
    }

    const csp = headers['content-security-policy'];
    if (csp) {
      result.contentSecurityPolicy.present = true;
      result.contentSecurityPolicy.raw = Array.isArray(csp) ? csp[0] : csp;
    }

    const xfo = headers['x-frame-options'];
    if (xfo) {
      result.xFrameOptions.present = true;
      result.xFrameOptions.value = Array.isArray(xfo) ? xfo[0] : xfo;
    }

    const xcto = headers['x-content-type-options'];
    if (xcto) {
      result.xContentTypeOptions.present = true;
      result.xContentTypeOptions.value = Array.isArray(xcto) ? xcto[0] : xcto;
    }

    const rp = headers['referrer-policy'];
    if (rp) {
      result.referrerPolicy.present = true;
      result.referrerPolicy.value = Array.isArray(rp) ? rp[0] : rp;
    }

    const pp = headers['permissions-policy'] || headers['feature-policy'];
    if (pp) {
      result.permissionsPolicy.present = true;
      result.permissionsPolicy.raw = Array.isArray(pp) ? pp[0] : pp;
    }
  } catch {
  }

  return result;
}

async function fetchCAARecords(hostname: string): Promise<CaaRecord[]> {
  try {
    const records = await dnsResolveCaa(hostname);
    return records.map((r: any) => ({
      critical: r.critical || 0,
      tag: r.tag || (r.issue ? 'issue' : r.issuewild ? 'issuewild' : r.iodef ? 'iodef' : 'unknown'),
      value: r.value || r.issue || r.issuewild || r.iodef || '',
      issue: r.tag === 'issue' ? r.value : undefined,
      issuewild: r.tag === 'issuewild' ? r.value : undefined,
      iodef: r.tag === 'iodef' ? r.value : undefined,
    }));
  } catch {
    return [];
  }
}

function calculateGrade(result: Partial<SSLCheckFullResult>): { grade: string; color: string } {
  let score = 100;
  const issues = result.issues || [];

  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 30;
    else if (issue.severity === 'warning') score -= 10;
    else score -= 2;
  }

  if (result.certificate?.isExpired) score = 0;
  if (result.certificate?.isNotYetValid) score = Math.min(score, 10);

  const hasDeprecatedProtocol = result.protocols?.some(p => p.supported && p.deprecated);
  if (hasDeprecatedProtocol) score = Math.min(score, 70);

  const hasWeakCipher = result.ciphers?.some(c => c.weak);
  if (hasWeakCipher) score = Math.min(score, 60);

  if (!result.httpHeaders?.hsts.present) score = Math.min(score, 90);

  if (result.certificate && result.certificate.keySize < 2048) score = Math.min(score, 50);

  score = Math.max(0, Math.min(100, score));

  if (score >= 95) return { grade: 'A+', color: '#22c55e' };
  if (score >= 85) return { grade: 'A', color: '#22c55e' };
  if (score >= 75) return { grade: 'B', color: '#84cc16' };
  if (score >= 65) return { grade: 'C', color: '#eab308' };
  if (score >= 50) return { grade: 'D', color: '#f97316' };
  return { grade: 'F', color: '#ef4444' };
}

export async function performFullSSLCheck(hostname: string, port: number = 443): Promise<SSLCheckFullResult> {
  const startTime = Date.now();
  const issues: SSLCheckFullResult['issues'] = [];

  let certificate: CertificateDetails;
  let chain: ChainCertificate[] = [];
  let chainComplete = false;
  let ciphers: CipherInfo[] = [];

  try {
    const { socket, cert, cipher, protocol, peerCertChain } = await connectTLS(hostname, port);
    socket.destroy();

    if (!cert || Object.keys(cert).length === 0) {
      return {
        hostname, port, grade: 'F', gradeColor: '#ef4444',
        certificate: {} as any, chain: [], chainComplete: false,
        protocols: [], ciphers: [], ocspStapling: false,
        httpHeaders: await fetchHttpHeaders(hostname, port),
        caaRecords: [], issues: [{ severity: 'critical', message: 'No SSL certificate found', remediation: 'Install a valid SSL certificate' }],
        scanTime: Date.now() - startTime,
        error: 'No certificate found',
      };
    }

    const now = new Date();
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let keyType = 'RSA';
    if (cert.asn1Curve) keyType = `ECDSA (${cert.asn1Curve})`;
    else if (cert.nistCurve) keyType = `ECDSA (${cert.nistCurve})`;

    certificate = {
      subject: cert.subject?.CN || 'Unknown',
      issuer: cert.issuer?.CN || 'Unknown',
      issuerOrg: cert.issuer?.O,
      serialNumber: cert.serialNumber || '',
      fingerprintSHA1: cert.fingerprint || '',
      fingerprintSHA256: cert.fingerprint256 || '',
      keyType,
      keySize: cert.bits || 0,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      daysRemaining,
      isExpired: now > validTo,
      isNotYetValid: now < validFrom,
      sans: cert.subjectaltname?.split(', ').map((s: string) => s.replace('DNS:', '')) || [],
      signatureAlgorithm: cert.infoAccess ? undefined : undefined,
    };

    if (certificate.isExpired) {
      issues.push({ severity: 'critical', message: 'Certificate has expired', remediation: 'Renew the SSL certificate immediately' });
    } else if (certificate.isNotYetValid) {
      issues.push({ severity: 'critical', message: 'Certificate is not yet valid', remediation: 'Check system clock or wait for certificate validity period' });
    } else if (daysRemaining <= 7) {
      issues.push({ severity: 'critical', message: `Certificate expires in ${daysRemaining} days`, remediation: 'Renew the certificate immediately' });
    } else if (daysRemaining <= 30) {
      issues.push({ severity: 'warning', message: `Certificate expires in ${daysRemaining} days`, remediation: 'Plan certificate renewal soon' });
    }

    if (certificate.keySize > 0 && certificate.keySize < 2048 && keyType.startsWith('RSA')) {
      issues.push({ severity: 'critical', message: `Weak RSA key size: ${certificate.keySize} bits`, remediation: 'Use at least 2048-bit RSA keys (4096 recommended)' });
    }

    chain = peerCertChain.map(c => ({
      subject: c.subject?.CN || 'Unknown',
      issuer: c.issuer?.CN || 'Unknown',
      validFrom: c.valid_from,
      validTo: c.valid_to,
      isSelfSigned: c.subject?.CN === c.issuer?.CN && c.serialNumber === c.issuerCertificate?.serialNumber,
      serialNumber: c.serialNumber || '',
    }));

    chainComplete = chain.length >= 2 && chain[chain.length - 1].isSelfSigned;
    if (!chainComplete && chain.length < 2) {
      issues.push({ severity: 'warning', message: 'Certificate chain may be incomplete', remediation: 'Ensure intermediate certificates are properly configured' });
    }

    if (cipher) {
      const { weak, reason } = isWeakCipher(cipher.name);
      ciphers.push({
        name: cipher.name,
        version: cipher.version || protocol || 'unknown',
        bits: (cipher as any).bits || 0,
        weak,
        reason,
      });
      if (weak) {
        issues.push({ severity: 'critical', message: `Weak cipher in use: ${cipher.name}`, remediation: `Disable ${cipher.name} and use modern AEAD ciphers (AES-GCM, ChaCha20)` });
      }
    }
  } catch (err: any) {
    return {
      hostname, port, grade: 'F', gradeColor: '#ef4444',
      certificate: {} as any, chain: [], chainComplete: false,
      protocols: [], ciphers: [], ocspStapling: false,
      httpHeaders: { hsts: { present: false }, contentSecurityPolicy: { present: false }, xFrameOptions: { present: false }, xContentTypeOptions: { present: false }, referrerPolicy: { present: false }, permissionsPolicy: { present: false } },
      caaRecords: [], issues: [{ severity: 'critical', message: `Connection failed: ${err.message}`, remediation: 'Verify the server is running and accepting TLS connections on this port' }],
      scanTime: Date.now() - startTime,
      error: err.message,
    };
  }

  const [tls10, tls11, tls12, tls13] = await Promise.all([
    testProtocol(hostname, port, 'TLSv1', 'TLSv1'),
    testProtocol(hostname, port, 'TLSv1.1', 'TLSv1.1'),
    testProtocol(hostname, port, 'TLSv1.2', 'TLSv1.2'),
    testProtocol(hostname, port, 'TLSv1.3', 'TLSv1.3'),
  ]);

  const protocols: ProtocolSupport[] = [
    { protocol: 'TLS 1.0', supported: tls10, deprecated: true },
    { protocol: 'TLS 1.1', supported: tls11, deprecated: true },
    { protocol: 'TLS 1.2', supported: tls12, deprecated: false },
    { protocol: 'TLS 1.3', supported: tls13, deprecated: false },
  ];

  if (tls10) {
    issues.push({ severity: 'critical', message: 'TLS 1.0 is supported (deprecated)', remediation: 'Disable TLS 1.0 — it is vulnerable to BEAST and POODLE attacks' });
  }
  if (tls11) {
    issues.push({ severity: 'warning', message: 'TLS 1.1 is supported (deprecated)', remediation: 'Disable TLS 1.1 — it uses outdated cryptographic standards' });
  }
  if (!tls12 && !tls13) {
    issues.push({ severity: 'critical', message: 'No modern TLS protocol supported', remediation: 'Enable TLS 1.2 and/or TLS 1.3' });
  }
  if (!tls13) {
    issues.push({ severity: 'info', message: 'TLS 1.3 not supported', remediation: 'Enable TLS 1.3 for improved performance and security' });
  }

  const [ocspStapling, httpHeaders, caaRecords] = await Promise.all([
    checkOCSPStapling(hostname, port),
    fetchHttpHeaders(hostname, port),
    fetchCAARecords(hostname),
  ]);

  if (!ocspStapling) {
    issues.push({ severity: 'info', message: 'OCSP stapling not enabled', remediation: 'Enable OCSP stapling to improve certificate validation performance' });
  }

  if (!httpHeaders.hsts.present) {
    issues.push({ severity: 'warning', message: 'HSTS header missing', remediation: 'Add Strict-Transport-Security header with a long max-age (at least 31536000)' });
  } else if (httpHeaders.hsts.maxAge && httpHeaders.hsts.maxAge < 31536000) {
    issues.push({ severity: 'info', message: `HSTS max-age is low (${httpHeaders.hsts.maxAge}s)`, remediation: 'Set HSTS max-age to at least 31536000 (1 year)' });
  }
  if (!httpHeaders.contentSecurityPolicy.present) {
    issues.push({ severity: 'info', message: 'Content-Security-Policy header missing', remediation: 'Implement a Content-Security-Policy to prevent XSS attacks' });
  }
  if (!httpHeaders.xFrameOptions.present) {
    issues.push({ severity: 'info', message: 'X-Frame-Options header missing', remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking' });
  }
  if (!httpHeaders.xContentTypeOptions.present) {
    issues.push({ severity: 'info', message: 'X-Content-Type-Options header missing', remediation: 'Add X-Content-Type-Options: nosniff to prevent MIME-type sniffing' });
  }

  if (caaRecords.length === 0) {
    issues.push({ severity: 'info', message: 'No CAA DNS records found', remediation: 'Add CAA records to restrict which CAs can issue certificates for your domain' });
  }

  const partialResult: Partial<SSLCheckFullResult> = {
    certificate, chain, protocols, ciphers, httpHeaders, issues,
  };
  const { grade, color } = calculateGrade(partialResult);

  return {
    hostname,
    port,
    grade,
    gradeColor: color,
    certificate,
    chain,
    chainComplete,
    protocols,
    ciphers,
    ocspStapling,
    httpHeaders,
    caaRecords,
    issues,
    scanTime: Date.now() - startTime,
  };
}
