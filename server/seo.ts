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
    description: 'STBCS delivers 24/7 incident response, ransomware recovery, and real-time threat intelligence from 70+ feeds. Trusted cybersecurity partner for SMBs.',
  },
  '/ransomware': {
    title: 'Ransomware Tracker | STB Cybersecurity',
    description: 'Monitor active ransomware groups, victim postings, and attack analytics in real-time. Track LockBit, BlackCat, Cl0p with profiles, TTPs, and targeting data.',
  },
  '/groups': {
    title: 'Threat Actors | STB Cybersecurity',
    description: 'Browse all tracked threat actor groups with victim counts, activity status, TTPs, MITRE ATT&CK mapping, and detailed threat intelligence dossiers.',
  },
  '/exploits': {
    title: 'Exploits & CVE Database | STB Cybersecurity',
    description: 'Search and track CVEs, zero-days, and exploits from NVD, CISA KEV, and 70+ feeds. CVSS scoring, EPSS predictions, and real-time exploit alerts.',
  },
  '/tools': {
    title: 'Free Security Tools | STB Cybersecurity',
    description: 'Free cybersecurity tools: IP/Domain WHOIS, Port Scanner, SSL Checker, Password Checker, Hash Analyzer, Email Header Analyzer, and more. No account needed.',
  },
  '/search': {
    title: 'Threat Search & IOC Lookup | STB Cybersecurity',
    description: 'Search CVEs, ransomware incidents, malicious IPs, phishing URLs, and threat actors. IOC lookup across 70+ threat intelligence feeds.',
  },
  '/intel': {
    title: 'Intel & Threat Feeds | STB Cybersecurity',
    description: 'Curated cybersecurity news, real-time malicious IPs, phishing URLs, CISA KEV, and threat indicators from 70+ feeds including SANS DShield and Feodo Tracker.',
  },
  '/support': {
    title: 'Support & Membership | STB Cybersecurity',
    description: 'Subscribe to STBCS Supporter, Pro, Business, or Unlimited Everything plans for advanced threat intelligence, real-time alerts, watchlists, and priority incident response.',
  },
  '/api-docs': {
    title: 'API Documentation | STB Cybersecurity',
    description: 'REST API docs for real-time threat intelligence: CVEs, ransomware incidents, malicious IPs, phishing URLs, and CISA KEV. Free and Pro tiers available.',
  },
  '/about': {
    title: 'About Us — Incident Response & Threat Intelligence | STB Cybersecurity',
    description: 'Meet STB Cybersecurity: incident responders, recovery engineers, and threat hunters protecting SMBs. 70+ live threat feeds, 24/7 IR, ransomware recovery, and security consulting.',
  },
  '/contact': {
    title: 'Contact Us | STB Cybersecurity',
    description: 'Get in touch with STB Cybersecurity for incident response, security consulting, vulnerability reporting, or general inquiries. 24/7 emergency hotline: (855) STB-1987.',
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
  '/risk-score': {
    title: 'Cyber Risk Score Calculator | STB Cybersecurity',
    description: 'Free cybersecurity risk assessment for small and medium businesses. Answer 12 questions to get your security grade, category scores, and actionable recommendations.',
  },
  '/ics-advisories': {
    title: 'ICS-CERT Advisories | STB Cybersecurity',
    description: 'CISA ICS-CERT industrial control system advisories. Track critical infrastructure vulnerabilities, SCADA/ICS threats, and operational technology security alerts.',
  },
  '/breaches': {
    title: 'Data Breach Database | STB Cybersecurity',
    description: 'Search the breach database for compromised credentials and data exposures. Check if your email or domain has been involved in known data breaches.',
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
  '/monitors': {
    title: 'Monitoring & Alerts | STB Cybersecurity',
    description: 'Real-time uptime monitoring, SSL certificate tracking, dark web scanning, watchlists, and threat alerts for Pro and Business subscribers.',
    noindex: true,
  },
  '/attack-surface': {
    title: 'Attack Surface Discovery | STB Cybersecurity',
    description: 'Map your organization\'s external attack surface. Discover subdomains, open ports, email security gaps, SSL issues, exposed services, and known vulnerabilities. Pro feature.',
  },
  '/reports': {
    title: 'Threat Intelligence Reports | STB Cybersecurity',
    description: 'Generate branded threat intelligence reports with executive summaries, ransomware landscape analysis, critical CVEs, attack surface findings, and actionable recommendations.',
  },
  '/playbooks': {
    title: 'Incident Response Playbooks | STB Cybersecurity',
    description: 'Step-by-step incident response playbooks for ransomware, phishing, data breaches, and more. Actionable IR procedures aligned with NIST and SANS frameworks.',
  },
  '/remote-desktop': {
    title: 'Remote Desktop Client | STB Cybersecurity',
    description: 'Secure, browser-based RDP client for remote server management. Encrypted WebSocket tunnels with zero credential storage. Business and Enterprise feature.',
    noindex: true,
  },
  '/ssh-terminal': {
    title: 'SSH Terminal | STB Cybersecurity',
    description: 'Secure, browser-based SSH terminal for remote server management. Supports password and private key authentication with zero credential storage. Business and Enterprise feature.',
    noindex: true,
  },
  '/telnet-client': {
    title: 'Telnet Client | STB Cybersecurity',
    description: 'Browser-based Telnet client for SMTP testing, banner grabbing, and network diagnostics. Quick-connect ports for common services. Pro feature.',
    noindex: true,
  },
  '/file-scanner': {
    title: 'File Scanner & Analyzer | STB Cybersecurity',
    description: 'Upload files for security analysis: MD5, SHA-1, SHA-256, SHA-512 hash computation, MIME type detection, entropy analysis, and string extraction. Files auto-deleted after scan.',
    noindex: true,
  },
  '/email-analyzer': {
    title: 'Email Header Analyzer | STB Cybersecurity',
    description: 'Analyze raw email headers to trace routing hops, verify SPF/DKIM/DMARC authentication, detect spoofing, and identify delivery delays. Pro feature.',
    noindex: true,
  },
  '/encoding-tools': {
    title: 'Encoding & Decoding Tools | STB Cybersecurity',
    description: 'Free online encoding and decoding tools for cybersecurity analysts. Base64, URL encoding, Hex, and ROT13 conversion. All operations run client-side for privacy.',
  },
  '/sftp-client': {
    title: 'SFTP File Manager | STB Cybersecurity',
    description: 'Secure, browser-based SFTP client for remote file management. Browse directories, upload/download files, manage permissions over encrypted SSH connections. Business feature.',
    noindex: true,
  },
  '/ssl-checker': {
    title: 'SSL/TLS Checker | STB Cybersecurity',
    description: 'Comprehensive SSL/TLS analysis: certificate chain validation, protocol support (TLS 1.0-1.3), cipher suite audit, HTTP security headers, OCSP stapling, and security grading (A+ to F).',
  },
  '/web-fingerprint': {
    title: 'Web Server Fingerprinter | STB Cybersecurity',
    description: 'Identify web server software, CMS platforms, technology stacks, and security misconfigurations. Detect IIS, Apache, Nginx, WordPress, and more from HTTP response analysis.',
  },
  '/exchange-checker': {
    title: 'Exchange Server Checker | STB Cybersecurity',
    description: 'Detect exposed Microsoft Exchange servers, OWA/ECP endpoints, ActiveSync, and map known vulnerabilities like ProxyLogon and ProxyShell by detected version.',
  },
  '/dns-analyzer': {
    title: 'DNS Security Analyzer | STB Cybersecurity',
    description: 'Comprehensive DNS security analysis: SPF, DKIM, DMARC validation, DNSSEC status, MX records, CAA, nameserver redundancy, and overall DNS security scoring.',
  },
  '/headers-scanner': {
    title: 'HTTP Security Headers Scanner | STB Cybersecurity',
    description: 'Free HTTP security headers analysis. Check HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, and CORS headers with remediation guidance and A+ to F grading.',
  },
  '/service-status': {
    title: 'Service Status Dashboard | STB Cybersecurity',
    description: 'Real-time operational status of STB Cybersecurity platform services, threat feeds, APIs, and monitoring systems. Current uptime and incident history.',
  },
  '/knowledge-base': {
    title: 'Knowledge Base & Community Hub | STB Cybersecurity',
    description: 'Community-driven cybersecurity knowledge base with threat intel articles, bug reports, feature requests, and expert contributions. Auto-sourced from 12+ RSS feeds.',
  },
  '/feedback': {
    title: 'Feedback & Bug Reports | STB Cybersecurity',
    description: 'Report bugs, request features, submit feedback, or flag security concerns. Help improve the STBCS platform. No account required.',
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
    const slug = decodeURIComponent(cleanPath.replace('/group/', ''));
    const displayName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const title = truncateGroupTitle(displayName);
    const descPrefix = `Threat profile for ${displayName} ransomware group: `;
    const descBody = 'TTPs, targeted sectors, victim countries, attack timeline, and MITRE ATT&CK mapping.';
    let description = descPrefix + descBody;
    if (description.length > 160) {
      description = `Threat profile for ${displayName}: TTPs, targeted sectors, attack timeline, and MITRE ATT&CK mapping.`;
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
  const canonical = meta.canonical || `${DOMAIN}${path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/'}`;

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

  const ssrContent = generateSSRContent(path, meta);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${ssrContent}</div>`
  );

  return html;
}

function getH1Text(path: string, meta: PageMeta): string {
  const titleMap: Record<string, string> = {
    '/': 'Real-Time Threat Intelligence & Incident Response',
    '/ransomware': 'Ransomware Tracker',
    '/groups': 'Threat Actors',
    '/exploits': 'Exploits & CVE Database',
    '/tools': 'Free Security Tools',
    '/search': 'Threat Search & IOC Lookup',
    '/intel': 'Intel & Threat Feeds',
    '/support': 'Support & Membership',
    '/api-docs': 'API Documentation',
    '/about': 'About STB Cybersecurity',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
    '/sms-terms': 'SMS Terms & Conditions',
    '/logos': 'Brand Assets & Logo Gallery',
    '/risk-score': 'Cyber Risk Score Calculator',
    '/ics-advisories': 'ICS-CERT Advisories',
    '/breaches': 'Data Breach Database',
    '/monitors': 'Monitoring & Alerts',
    '/playbooks': 'Incident Response Playbooks',
    '/service-status': 'Service Status Dashboard',
  };
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  if (titleMap[cleanPath]) return titleMap[cleanPath];
  if (cleanPath.startsWith('/group/')) {
    const slug = decodeURIComponent(cleanPath.replace('/group/', ''));
    const displayName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `${displayName} Ransomware Group Profile`;
  }
  return meta.title.split('|')[0].trim();
}

function generateSSRContent(path: string, meta: PageMeta): string {
  const h1 = escapeHtml(getH1Text(path, meta));
  const desc = escapeHtml(meta.description);

  const nav = `<nav aria-label="Main navigation"><ul>` +
    `<li><a href="/">Dashboard</a></li>` +
    `<li><a href="/ransomware">Ransomware Tracker</a></li>` +
    `<li><a href="/groups">Threat Actors</a></li>` +
    `<li><a href="/exploits">Exploits & CVEs</a></li>` +
    `<li><a href="/tools">Security Tools</a></li>` +
    `<li><a href="/risk-score">Cyber Risk Score</a></li>` +
    `<li><a href="/breaches">Breach Database</a></li>` +
    `<li><a href="/ics-advisories">ICS Advisories</a></li>` +
    `<li><a href="/intel">Intel & Feeds</a></li>` +
    `<li><a href="/search">Search & IOC Lookup</a></li>` +
    `<li><a href="/monitors">Monitoring & Alerts</a></li>` +
    `<li><a href="/support">Support</a></li>` +
    `<li><a href="/about">About</a></li>` +
    `<li><a href="/contact">Contact</a></li>` +
    `</ul></nav>`;

  const footer = `<footer><nav aria-label="Legal"><ul>` +
    `<li><a href="/about">About</a></li>` +
    `<li><a href="/contact">Contact</a></li>` +
    `<li><a href="/privacy">Privacy Policy</a></li>` +
    `<li><a href="/terms">Terms of Service</a></li>` +
    `<li><a href="/sms-terms">SMS Terms</a></li>` +
    `<li><a href="/api-docs">API Documentation</a></li>` +
    `</ul></nav>` +
    `<p>&copy; ${new Date().getFullYear()} STB Cybersecurity. All rights reserved.</p>` +
    `<p>Emergency Hotline: <a href="tel:+18557821987">(855) STB-1987</a></p>` +
    `<p>Email: <a href="mailto:info@stbcybersecurity.com">info@stbcybersecurity.com</a></p>` +
    `</footer>`;

  return `<a href="#main-content" class="sr-only">Skip to main content</a>` +
    nav +
    `<main id="main-content">` +
    `<h1>${h1}</h1>` +
    `<p>${desc}</p>` +
    `</main>` +
    footer;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
