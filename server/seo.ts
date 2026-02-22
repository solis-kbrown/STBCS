const DOMAIN = 'https://stbcybersecurity.com';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'STB Cybersecurity | Real-Time Threat Intelligence & Incident Response',
    description: 'STBCS delivers 24/7 incident response, ransomware recovery, threat hunting, and real-time threat intelligence from 45+ feeds. Trusted cybersecurity partner for SMBs worldwide. Emergency hotline: (855) STB-1987.',
  },
  '/ransomware': {
    title: 'Ransomware Tracker | STB Cybersecurity',
    description: 'Monitor active ransomware groups, victim postings, attack analytics, and negotiation statuses in real-time. Track groups like LockBit, BlackCat, Cl0p with detailed profiles, TTPs, and sector targeting data.',
  },
  '/exploits': {
    title: 'Exploits & CVE Database | STB Cybersecurity',
    description: 'Search and track CVEs, zero-day vulnerabilities, and exploits from NVD, CISA KEV, and 45+ threat intelligence feeds. CVSS scoring, EPSS predictions, vendor tracking, and real-time exploit alerts.',
  },
  '/tools': {
    title: 'Free Security Tools | STB Cybersecurity',
    description: 'Free online cybersecurity tools: IP WHOIS, Domain WHOIS, Port Scanner, SSL Checker, Password Strength Checker, Hash Analyzer, Email Header Analyzer, Subnet Calculator, and more. No account required.',
  },
  '/search': {
    title: 'Global Threat Search | STB Cybersecurity',
    description: 'Search across CVEs, ransomware incidents, malicious IPs, phishing URLs, threat actors, and security news. Unified cybersecurity threat intelligence search powered by 45+ data feeds.',
  },
  '/threat-feeds': {
    title: 'Threat Intelligence Feeds | STB Cybersecurity',
    description: 'Real-time malicious IP addresses, phishing URLs, CISA Known Exploited Vulnerabilities (KEV), and threat indicators from 45+ intelligence feeds including SANS DShield, Feodo Tracker, and more.',
  },
  '/news': {
    title: 'Cybersecurity Intel & News | STB Cybersecurity',
    description: 'Curated cybersecurity news, threat intelligence reports, policy updates, and industry analysis from trusted security sources worldwide.',
  },
  '/support': {
    title: 'Support & Membership | STB Cybersecurity',
    description: 'Subscribe to STBCS Supporter, Pro, or Business plans for advanced threat intelligence, real-time alerts, watchlists, and priority incident response. Donate to support free cybersecurity tools for the community.',
  },
  '/alerts': {
    title: 'Pro Alerts & Watchlist | STB Cybersecurity',
    description: 'Set up custom watchlists to track CVEs, IPs, domains, ransomware groups, and keywords. Get real-time email and SMS alerts when your monitored threats are detected across 45+ intelligence feeds.',
  },
  '/api-docs': {
    title: 'API Documentation | STB Cybersecurity',
    description: 'REST API documentation for accessing real-time threat intelligence data including CVEs, ransomware incidents, malicious IPs, phishing URLs, and CISA KEV entries. Free and Pro tier endpoints available.',
  },
  '/privacy': {
    title: 'Privacy Policy | STB Cybersecurity',
    description: 'Privacy policy for STB Cybersecurity. Learn how we collect, use, and protect your data across our threat intelligence platform and security services. CCPA/CPRA compliant.',
  },
  '/terms': {
    title: 'Terms of Service | STB Cybersecurity',
    description: 'Terms of Service for STB Cybersecurity threat intelligence platform, security tools, and cybersecurity consulting services.',
  },
  '/sms-terms': {
    title: 'SMS Terms & Conditions | STB Cybersecurity',
    description: 'SMS and text messaging terms and conditions for STB Cybersecurity. TCPA compliance, opt-in/opt-out, message frequency, and data rates disclosure.',
  },
  '/logos': {
    title: 'Brand Assets & Logo Gallery | STB Cybersecurity',
    description: 'Official STB Cybersecurity brand assets, logo designs, and visual identity gallery for media and partners.',
  },
  '/messages': {
    title: 'Messages | STB Cybersecurity',
    description: 'Secure two-way SMS messaging with STB Cybersecurity for Business subscribers. Direct communication for incident response and threat alerts.',
    noindex: true,
  },
  '/account': {
    title: 'My Account | STB Cybersecurity',
    description: 'Manage your STB Cybersecurity account, subscription, alerts, and security settings.',
    noindex: true,
  },
  '/checkout': {
    title: 'Secure Checkout | STB Cybersecurity',
    description: 'Complete your secure payment with Stripe embedded checkout. PCI DSS compliant.',
    noindex: true,
  },
  '/checkout/return': {
    title: 'Payment Status | STB Cybersecurity',
    description: 'Your payment confirmation and status.',
    noindex: true,
  },
  '/style-preview': {
    title: 'Style Preview | STB Cybersecurity',
    description: 'Internal style preview page.',
    noindex: true,
  },
};

export function getPageMeta(path: string): PageMeta {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  if (PAGE_META[cleanPath]) {
    return PAGE_META[cleanPath];
  }

  if (cleanPath.startsWith('/group/')) {
    const groupName = decodeURIComponent(cleanPath.replace('/group/', ''));
    return {
      title: `${groupName} Ransomware Group Profile | STB Cybersecurity`,
      description: `Detailed threat intelligence profile for ${groupName} ransomware group including TTPs, targeted sectors, victim countries, attack timeline, and MITRE ATT&CK mapping.`,
    };
  }

  return PAGE_META['/'];
}

export function injectMetaTags(html: string, path: string): string {
  const meta = getPageMeta(path);
  const canonical = `${DOMAIN}${path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/'}`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeAttr(meta.description)}"`
  );

  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonical}"`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}"`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeAttr(meta.description)}"`
  );

  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonical}"`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}"`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}"`
  );

  if (meta.noindex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*"/,
      `<meta name="robots" content="noindex, nofollow"`
    );
  }

  return html;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
