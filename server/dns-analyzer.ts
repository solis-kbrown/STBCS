import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveNs = promisify(dns.resolveNs);
const resolveCaa = promisify(dns.resolveCaa);
const resolveSoa = promisify(dns.resolveSoa);

export interface DnsSecurityResult {
  domain: string;
  score: number;
  grade: string;
  aRecords: string[];
  aaaaRecords: string[];
  mxRecords: { priority: number; exchange: string; provider?: string }[];
  nsRecords: string[];
  txtRecords: string[];
  soa: {
    nsname: string;
    hostmaster: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  } | null;
  spf: {
    found: boolean;
    record: string | null;
    policy: string | null;
    mechanisms: string[];
    includes: string[];
    warnings: string[];
    valid: boolean;
  };
  dkim: {
    found: boolean;
    selectors: { selector: string; found: boolean; record: string | null; keyType: string | null; valid: boolean }[];
  };
  dmarc: {
    found: boolean;
    record: string | null;
    policy: string | null;
    subdomainPolicy: string | null;
    rua: string[];
    ruf: string[];
    percentage: number;
    warnings: string[];
    valid: boolean;
  };
  caa: { critical: number; tag: string; value: string }[];
  dnssec: {
    enabled: boolean;
    details: string;
  };
  nsAnalysis: {
    count: number;
    singlePointOfFailure: boolean;
    providers: string[];
  };
  findings: { severity: 'critical' | 'warning' | 'info' | 'pass'; category: string; message: string }[];
  timestamp: string;
}

function detectMailProvider(exchange: string): string | undefined {
  const lower = exchange.toLowerCase();
  if (lower.includes('google') || lower.includes('gmail') || lower.includes('googlemail')) return 'Google Workspace';
  if (lower.includes('outlook') || lower.includes('microsoft') || lower.includes('protection.outlook')) return 'Microsoft 365';
  if (lower.includes('protonmail') || lower.includes('proton')) return 'ProtonMail';
  if (lower.includes('zoho')) return 'Zoho Mail';
  if (lower.includes('mimecast')) return 'Mimecast';
  if (lower.includes('barracuda')) return 'Barracuda';
  if (lower.includes('messagelabs') || lower.includes('symantec')) return 'Symantec/Broadcom';
  if (lower.includes('pphosted') || lower.includes('proofpoint')) return 'Proofpoint';
  if (lower.includes('mailgun')) return 'Mailgun';
  if (lower.includes('sendgrid')) return 'SendGrid';
  if (lower.includes('amazonaws') || lower.includes('aws')) return 'Amazon SES';
  if (lower.includes('icloud') || lower.includes('apple')) return 'Apple iCloud';
  if (lower.includes('yahoo')) return 'Yahoo Mail';
  if (lower.includes('fastmail')) return 'Fastmail';
  if (lower.includes('mailchimp') || lower.includes('mandrillapp')) return 'Mailchimp/Mandrill';
  return undefined;
}

function extractNsProvider(ns: string): string {
  const lower = ns.toLowerCase();
  if (lower.includes('cloudflare')) return 'Cloudflare';
  if (lower.includes('awsdns') || lower.includes('amazonaws')) return 'AWS Route 53';
  if (lower.includes('google') || lower.includes('googledomains')) return 'Google Cloud DNS';
  if (lower.includes('azure') || lower.includes('microsoft')) return 'Azure DNS';
  if (lower.includes('domaincontrol') || lower.includes('godaddy')) return 'GoDaddy';
  if (lower.includes('namecheap') || lower.includes('registrar-servers')) return 'Namecheap';
  if (lower.includes('digitalocean')) return 'DigitalOcean';
  if (lower.includes('linode') || lower.includes('akamai')) return 'Akamai/Linode';
  if (lower.includes('dnsimple')) return 'DNSimple';
  if (lower.includes('ns1.')) return 'NS1';
  if (lower.includes('dynect') || lower.includes('dyn.')) return 'Dyn/Oracle';
  if (lower.includes('ultradns')) return 'UltraDNS';
  return ns;
}

const DKIM_SELECTORS = ['google', 'default', 'selector1', 'selector2', 'k1', 'k2', 'mandrill', 'mail', 'email', 'dkim', 's1', 's2', 'sm', 'mxvault', 'protonmail', 'protonmail2', 'protonmail3'];

export async function analyzeDnsSecurity(domain: string): Promise<DnsSecurityResult> {
  const findings: DnsSecurityResult['findings'] = [];
  const timestamp = new Date().toISOString();

  const [aResult, aaaaResult, mxResult, nsResult, txtResult, soaResult, caaResult] = await Promise.allSettled([
    resolve4(domain),
    resolve6(domain),
    resolveMx(domain),
    resolveNs(domain),
    resolveTxt(domain),
    resolveSoa(domain),
    resolveCaa(domain),
  ]);

  const aRecords = aResult.status === 'fulfilled' ? aResult.value : [];
  const aaaaRecords = aaaaResult.status === 'fulfilled' ? aaaaResult.value : [];
  const mxRaw = mxResult.status === 'fulfilled' ? mxResult.value : [];
  const nsRecords = nsResult.status === 'fulfilled' ? nsResult.value : [];
  const txtRecords = txtResult.status === 'fulfilled' ? txtResult.value.map(r => r.join('')) : [];
  const soaRecord = soaResult.status === 'fulfilled' ? soaResult.value : null;
  const caaRecords = caaResult.status === 'fulfilled' ? caaResult.value : [];

  const mxRecords = mxRaw
    .map(mx => ({ priority: mx.priority, exchange: mx.exchange, provider: detectMailProvider(mx.exchange) }))
    .sort((a, b) => a.priority - b.priority);

  const spfRecord = txtRecords.find(r => r.startsWith('v=spf1'));
  const spfMechanisms = spfRecord ? spfRecord.split(' ').filter(m => m && m !== 'v=spf1') : [];
  const spfIncludes = spfMechanisms.filter(m => m.startsWith('include:')).map(m => m.replace('include:', ''));
  const spfAll = spfMechanisms.find(m => /^[+\-~?]?all$/.test(m)) || null;
  const spfWarnings: string[] = [];

  if (!spfRecord) {
    spfWarnings.push('No SPF record found');
  } else {
    if (spfAll === '+all' || spfAll === 'all') {
      spfWarnings.push('SPF allows any server to send email (+all) — critically insecure');
    } else if (spfAll === '?all') {
      spfWarnings.push('SPF neutral policy (?all) provides no protection');
    } else if (spfAll === '~all') {
      spfWarnings.push('SPF soft fail (~all) — consider upgrading to -all for strict enforcement');
    }
    if (spfIncludes.length > 10) {
      spfWarnings.push('Excessive include lookups may exceed the 10 DNS lookup limit');
    }
  }

  const spf = {
    found: !!spfRecord,
    record: spfRecord || null,
    policy: spfAll,
    mechanisms: spfMechanisms,
    includes: spfIncludes,
    warnings: spfWarnings,
    valid: !!spfRecord && (spfAll === '-all' || spfAll === '~all'),
  };

  const dkimSelectors: DnsSecurityResult['dkim']['selectors'] = [];
  const dkimChecks = DKIM_SELECTORS.map(async (selector) => {
    try {
      const records = await resolveTxt(`${selector}._domainkey.${domain}`);
      const record = records.flat().join('');
      if (record && record.includes('v=DKIM1')) {
        const keyType = record.match(/k=(\w+)/)?.[1] || 'rsa';
        return { selector, found: true, record, keyType, valid: !!record.match(/p=[A-Za-z0-9+/=]+/) };
      }
      return { selector, found: false, record: null, keyType: null, valid: false };
    } catch {
      return { selector, found: false, record: null, keyType: null, valid: false };
    }
  });

  const dkimResults = await Promise.all(dkimChecks);
  for (const r of dkimResults) {
    if (r.found) {
      dkimSelectors.push(r);
    }
  }
  if (dkimSelectors.length === 0) {
    dkimSelectors.push({ selector: '(none found)', found: false, record: null, keyType: null, valid: false });
  }

  const dkim = {
    found: dkimSelectors.some(s => s.found),
    selectors: dkimSelectors,
  };

  let dmarcRecord: string | null = null;
  try {
    const dmarcTxt = await resolveTxt(`_dmarc.${domain}`);
    dmarcRecord = dmarcTxt.flat().find(r => r.startsWith('v=DMARC1')) || null;
  } catch {}

  const dmarcWarnings: string[] = [];
  let dmarcPolicy: string | null = null;
  let dmarcSubPolicy: string | null = null;
  let dmarcRua: string[] = [];
  let dmarcRuf: string[] = [];
  let dmarcPct = 100;

  if (!dmarcRecord) {
    dmarcWarnings.push('No DMARC record found');
  } else {
    dmarcPolicy = dmarcRecord.match(/;\s*p=(\w+)/)?.[1] || dmarcRecord.match(/p=(\w+)/)?.[1] || null;
    dmarcSubPolicy = dmarcRecord.match(/sp=(\w+)/)?.[1] || null;
    const ruaMatch = dmarcRecord.match(/rua=([^;]+)/)?.[1];
    if (ruaMatch) dmarcRua = ruaMatch.split(',').map(u => u.trim());
    const rufMatch = dmarcRecord.match(/ruf=([^;]+)/)?.[1];
    if (rufMatch) dmarcRuf = rufMatch.split(',').map(u => u.trim());
    const pctMatch = dmarcRecord.match(/pct=(\d+)/)?.[1];
    if (pctMatch) dmarcPct = parseInt(pctMatch, 10);

    if (dmarcPolicy === 'none') {
      dmarcWarnings.push('DMARC policy is "none" — monitoring only, no enforcement');
    }
    if (dmarcRua.length === 0) {
      dmarcWarnings.push('No aggregate report URI (rua) configured');
    }
    if (dmarcPct < 100) {
      dmarcWarnings.push(`DMARC only applies to ${dmarcPct}% of messages`);
    }
  }

  const dmarc = {
    found: !!dmarcRecord,
    record: dmarcRecord,
    policy: dmarcPolicy,
    subdomainPolicy: dmarcSubPolicy,
    rua: dmarcRua,
    ruf: dmarcRuf,
    percentage: dmarcPct,
    warnings: dmarcWarnings,
    valid: dmarcPolicy === 'quarantine' || dmarcPolicy === 'reject',
  };

  let dnssecEnabled = false;
  let dnssecDetails = 'Unable to determine DNSSEC status';
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8']);
    const resolveDnskey = promisify(resolver.resolve.bind(resolver));
    const dnskeyRecords = await resolveDnskey(domain, 'DNSKEY' as any);
    if (dnskeyRecords && (dnskeyRecords as any[]).length > 0) {
      dnssecEnabled = true;
      dnssecDetails = 'DNSSEC is enabled (DNSKEY records found)';
    } else {
      dnssecDetails = 'No DNSKEY records found — DNSSEC not enabled';
    }
  } catch {
    dnssecDetails = 'DNSSEC check inconclusive — DNSKEY query failed';
  }

  const nsProviders = [...new Set(nsRecords.map(extractNsProvider))];
  const nsAnalysis = {
    count: nsRecords.length,
    singlePointOfFailure: nsRecords.length <= 1,
    providers: nsProviders,
  };

  if (aRecords.length === 0 && aaaaRecords.length === 0) {
    findings.push({ severity: 'critical', category: 'DNS', message: 'No A or AAAA records found for this domain' });
  } else {
    findings.push({ severity: 'pass', category: 'DNS', message: `${aRecords.length} A record(s) and ${aaaaRecords.length} AAAA record(s) found` });
  }

  if (mxRecords.length === 0) {
    findings.push({ severity: 'warning', category: 'MX', message: 'No MX records found — domain cannot receive email' });
  } else {
    findings.push({ severity: 'pass', category: 'MX', message: `${mxRecords.length} MX record(s) configured` });
  }

  if (nsAnalysis.singlePointOfFailure) {
    findings.push({ severity: 'warning', category: 'NS', message: 'Only one nameserver — single point of failure' });
  } else if (nsRecords.length >= 2) {
    findings.push({ severity: 'pass', category: 'NS', message: `${nsRecords.length} nameservers configured with redundancy` });
  }

  if (nsProviders.length === 1 && nsRecords.length > 1) {
    findings.push({ severity: 'info', category: 'NS', message: 'All nameservers from same provider — consider diversifying' });
  }

  if (!spf.found) {
    findings.push({ severity: 'critical', category: 'SPF', message: 'No SPF record found — email spoofing is possible' });
  } else if (spf.policy === '+all' || spf.policy === 'all') {
    findings.push({ severity: 'critical', category: 'SPF', message: 'SPF allows any server to send email (+all)' });
  } else if (spf.policy === '?all') {
    findings.push({ severity: 'warning', category: 'SPF', message: 'SPF neutral policy (?all) provides no enforcement' });
  } else if (spf.policy === '~all') {
    findings.push({ severity: 'info', category: 'SPF', message: 'SPF soft fail (~all) — consider strict -all' });
  } else if (spf.policy === '-all') {
    findings.push({ severity: 'pass', category: 'SPF', message: 'SPF strictly configured with -all' });
  }

  if (!dkim.found) {
    findings.push({ severity: 'warning', category: 'DKIM', message: 'No DKIM records found for common selectors' });
  } else {
    const foundSelectors = dkimSelectors.filter(s => s.found).map(s => s.selector);
    findings.push({ severity: 'pass', category: 'DKIM', message: `DKIM configured for selector(s): ${foundSelectors.join(', ')}` });
  }

  if (!dmarc.found) {
    findings.push({ severity: 'critical', category: 'DMARC', message: 'No DMARC record found — no email authentication policy' });
  } else if (dmarc.policy === 'none') {
    findings.push({ severity: 'warning', category: 'DMARC', message: 'DMARC policy is "none" — monitoring only' });
  } else if (dmarc.policy === 'quarantine') {
    findings.push({ severity: 'info', category: 'DMARC', message: 'DMARC quarantine policy — consider upgrading to reject' });
  } else if (dmarc.policy === 'reject') {
    findings.push({ severity: 'pass', category: 'DMARC', message: 'DMARC reject policy — strongest protection' });
  }

  if (caaRecords.length === 0) {
    findings.push({ severity: 'warning', category: 'CAA', message: 'No CAA records — any CA can issue certificates for this domain' });
  } else {
    findings.push({ severity: 'pass', category: 'CAA', message: `CAA records restrict certificate issuance to: ${caaRecords.map(r => r.value).join(', ')}` });
  }

  if (dnssecEnabled) {
    findings.push({ severity: 'pass', category: 'DNSSEC', message: 'DNSSEC is enabled' });
  } else {
    findings.push({ severity: 'warning', category: 'DNSSEC', message: 'DNSSEC is not enabled — DNS responses are not cryptographically signed' });
  }

  if (aaaaRecords.length > 0) {
    findings.push({ severity: 'pass', category: 'IPv6', message: 'IPv6 (AAAA) records present' });
  } else {
    findings.push({ severity: 'info', category: 'IPv6', message: 'No IPv6 (AAAA) records — consider adding for modern connectivity' });
  }

  let score = 0;

  if (aRecords.length > 0 || aaaaRecords.length > 0) score += 5;
  if (mxRecords.length > 0) score += 5;
  if (!nsAnalysis.singlePointOfFailure) score += 10;
  else if (nsRecords.length === 1) score += 3;

  if (spf.found) {
    score += 5;
    if (spf.policy === '-all') score += 15;
    else if (spf.policy === '~all') score += 10;
    else if (spf.policy === '?all') score += 2;
  }

  if (dkim.found) score += 15;

  if (dmarc.found) {
    score += 5;
    if (dmarc.policy === 'reject') score += 15;
    else if (dmarc.policy === 'quarantine') score += 10;
    else if (dmarc.policy === 'none') score += 2;
    if (dmarc.rua.length > 0) score += 5;
  }

  if (caaRecords.length > 0) score += 10;
  if (dnssecEnabled) score += 10;

  score = Math.min(100, score);

  let grade: string;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  return {
    domain,
    score,
    grade,
    aRecords,
    aaaaRecords,
    mxRecords,
    nsRecords,
    txtRecords,
    soa: soaRecord ? {
      nsname: soaRecord.nsname,
      hostmaster: soaRecord.hostmaster,
      serial: soaRecord.serial,
      refresh: soaRecord.refresh,
      retry: soaRecord.retry,
      expire: soaRecord.expire,
      minttl: soaRecord.minttl,
    } : null,
    spf,
    dkim,
    dmarc,
    caa: caaRecords.map(r => ({ critical: r.critical, tag: (r as any).tag || (r as any).issue ? 'issue' : 'unknown', value: r.value })),
    dnssec: { enabled: dnssecEnabled, details: dnssecDetails },
    nsAnalysis,
    findings,
    timestamp,
  };
}
