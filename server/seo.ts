const DOMAIN = 'https://stbcybersecurity.com';

const SUPPORTED_LANGS = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'ru'];

interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'STBCS | Threat Intelligence & Incident Response',
    description: 'STBCS delivers 24/7 incident response, ransomware recovery, and real-time threat intelligence from 105+ feeds. Trusted cybersecurity partner for SMBs.',
    keywords: 'cybersecurity, threat intelligence, incident response, ransomware recovery, threat hunting, SMB cybersecurity, real-time monitoring, STBCS, STB Cybersecurity, security operations center, managed security',
  },
  '/ransomware': {
    title: 'Ransomware Tracker | STB Cybersecurity',
    description: 'Monitor active ransomware groups, victim postings, and attack analytics in real-time. Track LockBit, BlackCat, Cl0p with profiles, TTPs, and targeting data.',
    keywords: 'ransomware tracker, ransomware groups, LockBit, BlackCat, ALPHV, Cl0p, ransomware attacks, ransomware monitoring, ransomware incidents, ransomware victims, ransomware analytics',
  },
  '/groups': {
    title: 'Threat Actors | STB Cybersecurity',
    description: 'Browse all tracked threat actor groups with victim counts, activity status, TTPs, MITRE ATT&CK mapping, and detailed threat intelligence dossiers.',
    keywords: 'threat actors, APT groups, cybercrime groups, MITRE ATT&CK, threat actor profiles, nation-state hackers, ransomware gangs, threat intelligence dossiers, cyber espionage',
  },
  '/exploits': {
    title: 'Exploits & CVE Database | STB Cybersecurity',
    description: 'Search and track CVEs, zero-days, and exploits from NVD, CISA KEV, and 105+ feeds. CVSS scoring, EPSS predictions, and real-time exploit alerts.',
    keywords: 'CVE database, vulnerabilities, exploits, zero-day, CISA KEV, vulnerability scanner, security advisories, CVE tracker, CVSS scoring, EPSS, NVD, exploit alerts',
  },
  '/tools': {
    title: 'Free Security Tools | STB Cybersecurity',
    description: 'Free cybersecurity tools: IP/Domain WHOIS, Port Scanner, SSL Checker, Password Checker, Hash Analyzer, Email Header Analyzer, and more. No account needed.',
    keywords: 'free security tools, IP lookup, WHOIS, port scanner, threat check, domain lookup, cybersecurity tools, network scanner, hash analyzer, password checker, online security tools',
  },
  '/search': {
    title: 'Threat Search & IOC Lookup | STB Cybersecurity',
    description: 'Search CVEs, ransomware incidents, malicious IPs, phishing URLs, and threat actors. IOC lookup across 105+ threat intelligence feeds.',
    keywords: 'IOC search, indicator of compromise, threat search, IP reputation, domain reputation, malware check, CVE search, threat intelligence lookup, malicious IP check',
  },
  '/intel': {
    title: 'Intel & Threat Feeds | STB Cybersecurity',
    description: 'Curated cybersecurity news, real-time malicious IPs, phishing URLs, CISA KEV, and threat indicators from 105+ feeds including SANS DShield and Feodo Tracker.',
    keywords: 'threat feeds, threat intelligence feeds, malicious IPs, phishing URLs, malware URLs, security news, cyber threat feeds, SANS DShield, Feodo Tracker, CISA KEV',
  },
  '/support': {
    title: 'Support & Membership | STB Cybersecurity',
    description: 'Subscribe to STBCS Supporter, Pro, Business, or Unlimited Everything plans for advanced threat intelligence, real-time alerts, watchlists, and priority incident response.',
    keywords: 'support cybersecurity, donate, cybersecurity membership, support security, cybersecurity subscription, threat intelligence plans',
  },
  '/api-docs': {
    title: 'API Documentation | STB Cybersecurity',
    description: 'REST API docs for real-time threat intelligence: CVEs, ransomware incidents, malicious IPs, phishing URLs, and CISA KEV. Free and Pro tiers available.',
    keywords: 'cybersecurity API, threat intelligence API, CVE API, ransomware API, REST API documentation, security data API',
  },
  '/about': {
    title: 'About Us — Incident Response & Threat Intelligence | STB Cybersecurity',
    description: 'Meet STB Cybersecurity: incident responders, recovery engineers, and threat hunters protecting SMBs. 105+ live threat feeds, 24/7 IR, ransomware recovery, and security consulting.',
    keywords: 'about STB Cybersecurity, cybersecurity company, incident response team, security consulting, ransomware recovery team, threat hunting experts, SMB security',
  },
  '/contact': {
    title: 'Contact Us | STB Cybersecurity',
    description: 'Get in touch with STB Cybersecurity for incident response, security consulting, vulnerability reporting, or general inquiries. 24/7 emergency hotline: (855) STB-1987.',
    keywords: 'contact cybersecurity, cybersecurity consulting, incident response contact, security services, emergency hotline, vulnerability reporting',
  },
  '/privacy': {
    title: 'Privacy Policy | STB Cybersecurity',
    description: 'Learn how STBCS collects, uses, and protects your data across our threat intelligence platform and security services. CCPA/CPRA compliant.',
    keywords: 'privacy policy, CCPA, CPRA, data protection, cybersecurity privacy, user data policy',
  },
  '/terms': {
    title: 'Terms of Service | STB Cybersecurity',
    description: 'Terms of Service for STB Cybersecurity threat intelligence platform, security tools, and cybersecurity consulting services.',
    keywords: 'terms of service, cybersecurity terms, platform terms, service agreement',
  },
  '/sms-terms': {
    title: 'SMS Terms & Conditions | STB Cybersecurity',
    description: 'SMS and text messaging terms and conditions for STB Cybersecurity. TCPA compliance, opt-in/opt-out, message frequency, and data rates disclosure.',
    keywords: 'SMS terms, text messaging terms, TCPA compliance, SMS opt-in, messaging policy',
  },
  '/logos': {
    title: 'Brand Assets & Logo Gallery | STB Cybersecurity',
    description: 'Official STB Cybersecurity brand assets, logo designs, and visual identity gallery for media and partners.',
    keywords: 'brand assets, logo gallery, cybersecurity brand, visual identity, media assets',
  },
  '/risk-score': {
    title: 'Cyber Risk Score Calculator | STB Cybersecurity',
    description: 'Free cybersecurity risk assessment for small and medium businesses. Answer 12 questions to get your security grade, category scores, and actionable recommendations.',
    keywords: 'cyber risk score, risk assessment, cybersecurity risk calculator, SMB risk assessment, security posture, security grade, risk analysis, free risk assessment',
  },
  '/ics-advisories': {
    title: 'ICS-CERT Advisories | STB Cybersecurity',
    description: 'CISA ICS-CERT industrial control system advisories. Track critical infrastructure vulnerabilities, SCADA/ICS threats, and operational technology security alerts.',
    keywords: 'ICS advisories, ICS-CERT, industrial control systems, SCADA security, OT security, critical infrastructure, operational technology, CISA ICS advisories',
  },
  '/breaches': {
    title: 'Data Breach Database | STB Cybersecurity',
    description: 'Search the breach database for compromised credentials and data exposures. Check if your email or domain has been involved in known data breaches.',
    keywords: 'data breach database, breach tracker, data leaks, credential leaks, breach monitoring, compromised credentials, data exposure check, breach search',
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
    keywords: 'attack surface discovery, attack surface management, external attack surface, digital footprint, subdomain discovery, open ports, vulnerability discovery',
  },
  '/reports': {
    title: 'Threat Intelligence Reports | STB Cybersecurity',
    description: 'Generate branded threat intelligence reports with executive summaries, ransomware landscape analysis, critical CVEs, attack surface findings, and actionable recommendations.',
    keywords: 'threat intelligence reports, security reports, cyber threat reports, threat analysis, executive security briefing, ransomware reports',
  },
  '/playbooks': {
    title: 'Incident Response Playbooks | STB Cybersecurity',
    description: 'Step-by-step incident response playbooks for ransomware, phishing, data breaches, and more. Actionable IR procedures aligned with NIST and SANS frameworks.',
    keywords: 'incident response playbooks, IR guides, cybersecurity playbooks, incident handling, security incident response, NIST framework, SANS incident response, ransomware playbook',
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
    title: 'File Scanner & Malware Analyzer | STB Cybersecurity',
    description: 'Upload files for security analysis: MD5, SHA-1, SHA-256, SHA-512 hash computation, MIME type detection, entropy analysis, and string extraction. Files auto-deleted after scan.',
    keywords: 'file scanner, malware analyzer, file hash checker, MD5 SHA-256 hash, MIME type detection, entropy analysis, malware detection, file security analysis',
  },
  '/email-analyzer': {
    title: 'Email Header Analyzer | STB Cybersecurity',
    description: 'Analyze raw email headers to trace routing hops, verify SPF/DKIM/DMARC authentication, detect spoofing, and identify delivery delays. Free online tool.',
    keywords: 'email header analyzer, email security, email spoofing detection, SPF check, DKIM check, DMARC check, email authentication, email header parser, email routing analysis',
  },
  '/encoding-tools': {
    title: 'Encoding & Decoding Tools | STB Cybersecurity',
    description: 'Free online encoding and decoding tools for cybersecurity analysts. Base64, URL encoding, Hex, and ROT13 conversion. All operations run client-side for privacy.',
    keywords: 'base64 encoder, URL encoder, hex encoder, ROT13, encoding decoding tools, data encoding, base64 decoder, online encoding tool, cybersecurity encoding',
  },
  '/sftp-client': {
    title: 'SFTP File Manager | STB Cybersecurity',
    description: 'Secure, browser-based SFTP client for remote file management. Browse directories, upload/download files, manage permissions over encrypted SSH connections. Business feature.',
    noindex: true,
  },
  '/ssl-checker': {
    title: 'SSL/TLS Certificate Checker | STB Cybersecurity',
    description: 'Comprehensive SSL/TLS analysis: certificate chain validation, protocol support (TLS 1.0-1.3), cipher suite audit, HTTP security headers, OCSP stapling, and security grading (A+ to F).',
    keywords: 'SSL checker, TLS checker, certificate checker, SSL validation, HTTPS checker, certificate expiration, SSL certificate test, TLS security analysis, cipher suite audit',
  },
  '/web-fingerprint': {
    title: 'Web Server Fingerprinter | STB Cybersecurity',
    description: 'Identify web server software, CMS platforms, technology stacks, and security misconfigurations. Detect IIS, Apache, Nginx, WordPress, and more from HTTP response analysis.',
    keywords: 'web server fingerprint, server detection, CMS detection, technology stack detection, web server analysis, WordPress detection, server identification, web technology scanner',
  },
  '/exchange-checker': {
    title: 'Exchange Server Security Checker | STB Cybersecurity',
    description: 'Detect exposed Microsoft Exchange servers, OWA/ECP endpoints, ActiveSync, and map known vulnerabilities like ProxyLogon and ProxyShell by detected version.',
    keywords: 'Exchange server checker, Microsoft Exchange vulnerabilities, Exchange security, ProxyLogon, ProxyShell, OWA security, Exchange server scanner, Exchange CVE check',
  },
  '/dns-analyzer': {
    title: 'DNS Security Analyzer | STB Cybersecurity',
    description: 'Comprehensive DNS security analysis: SPF, DKIM, DMARC validation, DNSSEC status, MX records, CAA, nameserver redundancy, and overall DNS security scoring.',
    keywords: 'DNS security analyzer, DNS checker, DNSSEC check, SPF record check, DKIM validation, DMARC check, MX records, DNS security audit, domain DNS analysis, CAA records',
  },
  '/headers-scanner': {
    title: 'HTTP Security Headers Scanner | STB Cybersecurity',
    description: 'Free HTTP security headers analysis. Check HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, and CORS headers with remediation guidance and A+ to F grading.',
    keywords: 'HTTP security headers, security headers scanner, HSTS check, CSP check, content security policy, X-Frame-Options, Referrer-Policy, security headers analysis, header grading',
  },
  '/service-status': {
    title: 'Service Status Dashboard | STB Cybersecurity',
    description: 'Real-time operational status of STB Cybersecurity platform services, threat feeds, APIs, and monitoring systems. Current uptime and incident history.',
    keywords: 'service status, infrastructure status, system status, uptime monitoring, platform status, service health, operational status',
  },
  '/knowledge-base': {
    title: 'Knowledge Base & Community Hub | STB Cybersecurity',
    description: 'Community-driven cybersecurity knowledge base with threat intel articles, bug reports, feature requests, and expert contributions. Auto-sourced from 12+ RSS feeds.',
    keywords: 'cybersecurity knowledge base, security community, cybersecurity articles, security resources, threat intelligence articles, cybersecurity forum, security community hub',
  },
  '/feedback': {
    title: 'Feedback & Bug Reports | STB Cybersecurity',
    description: 'Report bugs, request features, submit feedback, or flag security concerns. Help improve the STBCS platform. No account required.',
    keywords: 'feedback, bug reports, feature requests, security concerns, platform feedback, report issue',
  },
  '/pricing': {
    title: 'Plans & Pricing | STB Cybersecurity',
    description: 'Compare STBCS subscription tiers — Supporter, Pro, Business, and Unlimited Everything. 105+ features, real-time threat intel, monitoring, and 24/7 incident response for SMBs.',
    keywords: 'cybersecurity plans, threat intelligence pricing, security monitoring plans, cybersecurity subscription, STBCS pricing, pro plan, business plan, security service pricing',
  },
  '/brand-kit': {
    title: 'Brand Kit & Asset Hub | STB Cybersecurity',
    description: 'Professional brand assets for STB Cybersecurity — email signatures, letterheads, business cards, invoices, social media banners, presentations, and more. 107 styles across 10 categories.',
    keywords: 'brand kit, brand assets, cybersecurity branding, logo templates, business card templates, email signature templates, professional branding',
  },
  '/compliance': {
    title: 'Compliance Mapper | STB Cybersecurity',
    description: 'Map your security posture to NIST CSF 2.0, CIS Controls v8, and ISO 27001. See which compliance controls you address with STBCS tools and get actionable gap analysis.',
    keywords: 'compliance mapping, NIST CSF, CIS Controls, ISO 27001, cybersecurity compliance, security framework, compliance gap analysis, audit preparation, SMB compliance',
  },
  '/ransomware-calculator': {
    title: 'Ransomware Cost Estimator | STB Cybersecurity',
    description: 'Estimate the potential financial impact of a ransomware attack on your business. See ransom demands, downtime costs, and which groups target your industry.',
    keywords: 'ransomware cost calculator, ransomware impact estimator, ransomware risk assessment, cyber attack cost, ransomware financial impact, business risk calculator',
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

  if (cleanPath.startsWith('/knowledge-base/') && cleanPath !== '/knowledge-base/new' && cleanPath !== '/knowledge-base/admin' && !cleanPath.endsWith('/edit')) {
    const slug = decodeURIComponent(cleanPath.replace('/knowledge-base/', ''));
    const displayTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `${displayTitle} | Knowledge Base | STBCS`,
      description: `Read "${displayTitle}" on the STB Cybersecurity Knowledge Base — community-driven cybersecurity insights, threat intel, and expert guidance.`,
      keywords: `${displayTitle}, cybersecurity, knowledge base, threat intel, security article`,
      ogImage: `${DOMAIN}/api/og/kb/${slug}`,
    };
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
    return {
      title,
      description,
      keywords: `${displayName}, ransomware group, threat actor, cyber attacks, threat profile, APT, ransomware, ${displayName} victims, ${displayName} TTPs`,
      ogImage: `${DOMAIN}/api/og/group/${slug}`,
    };
  }

  return PAGE_META['/'];
}

export function injectMetaTags(html: string, path: string): string {
  const meta = getPageMeta(path);
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const canonical = meta.canonical || `${DOMAIN}${cleanPath}`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeAttr(meta.description)}"`
  );

  if (meta.keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${escapeAttr(meta.keywords)}"`
    );
  }

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

  if (meta.ogImage) {
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${escapeAttr(meta.ogImage)}"`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${escapeAttr(meta.ogImage)}"`
    );
    html = html.replace(
      /<meta name="twitter:card" content="[^"]*"/,
      `<meta name="twitter:card" content="summary_large_image"`
    );
  }

  if (meta.noindex) {
    html = html.replace(
      /<meta name="robots" content="[^"]*"/,
      `<meta name="robots" content="noindex, nofollow"`
    );
  }

  const hreflangTags = SUPPORTED_LANGS.map(lang =>
    `<link rel="alternate" hreflang="${lang}" href="${DOMAIN}${cleanPath}" />`
  ).join('\n    ');
  const xDefaultTag = `<link rel="alternate" hreflang="x-default" href="${DOMAIN}${cleanPath}" />`;
  html = html.replace(
    '</head>',
    `    ${hreflangTags}\n    ${xDefaultTag}\n  </head>`
  );

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
    '/ssl-checker': 'SSL/TLS Certificate Checker',
    '/dns-analyzer': 'DNS Security Analyzer',
    '/headers-scanner': 'HTTP Security Headers Scanner',
    '/web-fingerprint': 'Web Server Fingerprinter',
    '/exchange-checker': 'Exchange Server Security Checker',
    '/email-analyzer': 'Email Header Analyzer',
    '/file-scanner': 'File Scanner & Malware Analyzer',
    '/encoding-tools': 'Encoding & Decoding Tools',
    '/attack-surface': 'Attack Surface Discovery',
    '/reports': 'Threat Intelligence Reports',
    '/knowledge-base': 'Knowledge Base & Community Hub',
    '/pricing': 'Plans & Pricing',
    '/brand-kit': 'Brand Kit & Asset Hub',
    '/feedback': 'Feedback & Bug Reports',
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
    `<li><a href="/ssl-checker">SSL/TLS Checker</a></li>` +
    `<li><a href="/dns-analyzer">DNS Analyzer</a></li>` +
    `<li><a href="/headers-scanner">Headers Scanner</a></li>` +
    `<li><a href="/web-fingerprint">Web Fingerprinter</a></li>` +
    `<li><a href="/exchange-checker">Exchange Checker</a></li>` +
    `<li><a href="/email-analyzer">Email Analyzer</a></li>` +
    `<li><a href="/file-scanner">File Scanner</a></li>` +
    `<li><a href="/encoding-tools">Encoding Tools</a></li>` +
    `<li><a href="/risk-score">Cyber Risk Score</a></li>` +
    `<li><a href="/breaches">Breach Database</a></li>` +
    `<li><a href="/ics-advisories">ICS Advisories</a></li>` +
    `<li><a href="/intel">Intel & Feeds</a></li>` +
    `<li><a href="/search">Search & IOC Lookup</a></li>` +
    `<li><a href="/playbooks">IR Playbooks</a></li>` +
    `<li><a href="/knowledge-base">Knowledge Base</a></li>` +
    `<li><a href="/pricing">Plans & Pricing</a></li>` +
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
    `<li><a href="/service-status">Service Status</a></li>` +
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
