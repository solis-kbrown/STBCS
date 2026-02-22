const DOMAIN = 'https://stbcybersecurity.com';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'STBCS | Threat Intelligence & Incident Response',
    description: 'STBCS delivers 24/7 incident response, ransomware recovery, and real-time threat intelligence from 45+ feeds. Trusted cybersecurity partner for SMBs.',
  },
  '/ransomware': {
    title: 'Ransomware Tracker | STB Cybersecurity',
    description: 'Monitor active ransomware groups, victim postings, and attack analytics in real-time. Track LockBit, BlackCat, Cl0p with profiles, TTPs, and targeting data.',
  },
  '/exploits': {
    title: 'Exploits & CVE Database | STB Cybersecurity',
    description: 'Search and track CVEs, zero-days, and exploits from NVD, CISA KEV, and 45+ feeds. CVSS scoring, EPSS predictions, and real-time exploit alerts.',
  },
  '/tools': {
    title: 'Free Security Tools | STB Cybersecurity',
    description: 'Free cybersecurity tools: IP/Domain WHOIS, Port Scanner, SSL Checker, Password Checker, Hash Analyzer, Email Header Analyzer, and more. No account needed.',
  },
  '/search': {
    title: 'Global Threat Search | STB Cybersecurity',
    description: 'Search CVEs, ransomware incidents, malicious IPs, phishing URLs, threat actors, and security news. Unified threat intelligence search across 45+ feeds.',
  },
  '/threat-feeds': {
    title: 'Threat Intelligence Feeds | STB Cybersecurity',
    description: 'Real-time malicious IPs, phishing URLs, CISA KEV, and threat indicators from 45+ feeds including SANS DShield, Feodo Tracker, and more.',
  },
  '/news': {
    title: 'Cybersecurity Intel & News | STB Cybersecurity',
    description: 'Curated cybersecurity news, threat intelligence reports, policy updates, and industry analysis from trusted security sources worldwide.',
  },
  '/support': {
    title: 'Support & Membership | STB Cybersecurity',
    description: 'Subscribe to STBCS Supporter, Pro, or Business plans for advanced threat intelligence, real-time alerts, watchlists, and priority incident response.',
  },
  '/alerts': {
    title: 'Pro Alerts & Watchlist | STB Cybersecurity',
    description: 'Set up watchlists to track CVEs, IPs, domains, ransomware groups, and keywords. Get real-time email and SMS alerts when threats are detected.',
  },
  '/api-docs': {
    title: 'API Documentation | STB Cybersecurity',
    description: 'REST API docs for real-time threat intelligence: CVEs, ransomware incidents, malicious IPs, phishing URLs, and CISA KEV. Free and Pro tiers available.',
  },
  '/about': {
    title: 'About Us | STBCS',
    description: 'About STB Cybersecurity. Professional cybersecurity services, threat intelligence, and incident response for small to medium-sized businesses.',
  },
  '/privacy': {
    title: 'Privacy Policy | STB Cybersecurity',
    description: 'Learn how STBCS collects, uses, and protects your data across our threat intelligence platform and security services. CCPA/CPRA compliant.',
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

const MAX_TITLE_LENGTH = 60;
const TITLE_SUFFIX = ' | STBCS';

function truncateGroupTitle(groupName: string): string {
  const fullSuffix = ' | STB Cybersecurity';
  const middlePart = ' Ransomware Profile';
  const fullTitle = `${groupName}${middlePart}${fullSuffix}`;

  if (fullTitle.length <= MAX_TITLE_LENGTH) {
    return fullTitle;
  }

  const shortSuffix = TITLE_SUFFIX;
  const shortTitle = `${groupName}${middlePart}${shortSuffix}`;

  if (shortTitle.length <= MAX_TITLE_LENGTH) {
    return shortTitle;
  }

  const maxNameLength = MAX_TITLE_LENGTH - middlePart.length - shortSuffix.length;
  const truncatedName = groupName.slice(0, maxNameLength - 1) + '…';
  return `${truncatedName}${middlePart}${shortSuffix}`;
}

export function getPageMeta(path: string): PageMeta {
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  if (PAGE_META[cleanPath]) {
    return PAGE_META[cleanPath];
  }

  if (cleanPath.startsWith('/group/')) {
    const groupName = decodeURIComponent(cleanPath.replace('/group/', ''));
    const title = truncateGroupTitle(groupName);
    const descPrefix = `Threat profile for ${groupName} ransomware group: `;
    const descBody = 'TTPs, targeted sectors, victim countries, attack timeline, and MITRE ATT&CK mapping.';
    let description = descPrefix + descBody;
    if (description.length > 160) {
      description = `Threat profile for ${groupName}: TTPs, targeted sectors, attack timeline, and MITRE ATT&CK mapping.`;
    }
    if (description.length > 160) {
      const maxLen = 160 - 4;
      description = description.slice(0, maxLen) + '…';
    }
    return { title, description };
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
