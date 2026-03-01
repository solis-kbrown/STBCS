# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from 73+ free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses. The project aims to be a comprehensive hub for cybersecurity insights and professional services, focusing on becoming a leader in SMB cybersecurity.

## User Preferences

Preferred communication style: Simple, everyday language.
- Export/download features (CSV, JSON, STIX) are Pro/Business tier only — always gate behind auth check on both frontend and backend.

### Visual Theme: Stealth Mode / Tactical Operations Center (Premium)
- **Accent Color**: Orange (#f97316 / orange-500)
- **Secondary**: Red (#ef4444)
- **Navigation Style**: Active pill indicator with animated glow bar (`.sidebar-active-bar`), grouped nav sections with shimmer dividers (`.sidebar-divider`), floating logo (`.sidebar-logo`), scroll fade mask (`.sidebar-scroll-fade`)
- **Icons**: Cyber-themed Lucide icons with stat-icon-bg gradient overlays, `.icon-bounce` hover effect
- **Background**: Dark minimal (zinc-900/950) with ambient gradient mesh + noise texture overlay
- **Text**: Zinc-500 inactive, orange-400 active/accent; `::selection` in brand red; headings have `text-shadow` glow
- **Cards**: `card-interactive` with glass gradient, hover glow, top-edge light line; `card-3d` for perspective tilt; `glass-panel` for premium glassmorphism with inner light + saturate
- **Animations**: `hero-scan-line`, `skeleton-shimmer` (directional), `upgrade-banner-border` (conic gradient with cyan accent), `text-shimmer`, `badge-shimmer`, `animated-border` (rotating gradient border), `sidebar-active-bar`, `sidebar-divider`, `.tier-badge-pro/.tier-badge-biz` shimmer, `.bell-bounce/.bell-hover`, `.emergency-scan-line/.emergency-border-pulse`, `.verify-pulse` (trust badges), `.glow-ring`; all respect `prefers-reduced-motion`
- **Reveal Animations**: Blur-to-sharp reveals on all `.anim-fade-*` classes with scale + filter blur transitions; increased stagger (80ms intervals)
- **Utilities**: `.section-divider`, `.hover-elevate`, `.active-elevate-2`, `.stat-icon-bg.icon-{color}`, `.chart-card`, `.link-underline` (draw-from-left), `.btn-press` (elastic scale + hover glow), `.ambient-grid`, `.scroll-progress`, `.input-focus-expand`
- **Interactive Components**: `HeroParticles` (Canvas2D constellation particle system with mouse interaction), `AmbientGrid` (tactical grid with flowing light pulses), `ToolPageHeader` (shared header with ambient grid, breadcrumbs, tier badges, animated icon), `TypingText` (typewriter effect), `QuickActionsBar` (floating quick-access tool buttons), `ConfettiParticles` (newsletter success), `AnimatedCheckmark` (trust badge verification)
- **Typography**: Orbitron display with text-shadow glow, Inter body (1.7 line-height), JetBrains Mono code; h1 0.08em tracking, h2 0.05em tracking; responsive scaling at 640px
- **Focus**: Custom `:focus-visible` ring (primary/50%, 2px offset) with outer glow shadow
- **Accessibility**: All animations, canvas effects, and JS-driven animations (TypingText, useCountUp) respect `prefers-reduced-motion`

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **UI Components**: shadcn/ui built on Radix UI, styled with Tailwind CSS v4.
- **Internationalization**: Supports 10 languages with browser auto-detection.

### Backend
- **Runtime**: Node.js with Express 5, TypeScript (ESM modules).
- **API Design**: RESTful JSON API (`/api/*`) with Zod validation.
- **Security**: Rate limiting via `express-rate-limit`, input validation, login timing attack protection (dummy bcrypt on unknown users).
- **Data Scraping**: Server-side scrapers collect threat intelligence data.
- **Caching**: In-memory response cache with TTL-based expiration, startup cache warm-up, session auth caching (60s TTL) to reduce DB load.
- **Performance**: Parallelized DB queries (Promise.all) for all list+count endpoints, in-memory index.html caching.
- **CSRF Protection**: Origin/Referer validation for state-changing requests in production; blocks requests with no Origin and no Referer.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM with optimized connection pool (max 20 connections, 30s idle timeout, 5s connect timeout, 30s statement timeout).
- **Schema**: Defined for CVEs, ransomware, threat actors, and user data.
- **Unique Constraints**: Composite unique indexes on `malicious_ips(ip_address, source)`, `malicious_urls(url, source)`, `ransomware_incidents(victim, group_name)` for atomic upserts.
- **Atomic Upserts**: All upsert operations use `onConflictDoUpdate`/`onConflictDoNothing` for race-condition-free writes.
- **Transaction Wrapping**: Multi-step operations (cleanup, ransomware enrichment, signup) use `db.transaction()` for atomicity.

### Key Design Patterns
- **Shared Types**: For common definitions.
- **Storage Abstraction**: For database operations.
- **API Hooks**: For React Query integrations.
- **Path Aliases**: `@/` for client, `@shared/` for shared code.

### Features
- **Threat Intelligence**: Aggregates data from various sources with 15-minute refresh cycles.
- **Security Tools**: Offers IP/Domain WHOIS, Port Scanner, Threat Database Check, Password Strength Checker, Subnet Calculator, Email Header Analyzer, and more.
- **IOC Search**: Unified Indicator of Compromise search across 73+ feeds.
- **Cyber Risk Score Calculator**: Free 12-question SMB security assessment.
- **Monitoring Suite**: Pro/Business feature for uptime, SSL certificate, and dark web monitoring with email/SMS alerting.
- **Attack Surface Discovery**: Pro feature — domain scanning for subdomains (crt.sh), open ports (Shodan InternetDB), DNS records, email security (SPF/DKIM/DMARC), SSL certificates, technology detection, and security headers with risk scoring.
- **Threat Intelligence Reports**: Pro feature — on-demand branded reports with executive summary, ransomware landscape, critical CVEs, attack surface findings, and recommendations. Business tier gets scheduled weekly/monthly auto-generation.
- **ICS-CERT Advisories**: Displays CISA ICS-CERT advisories.
- **MITRE ATT&CK Mapping**: Threat actor profiles include mapped ATT&CK techniques.
- **STIX 2.1 Export**: Export threat data as STIX 2.1 bundles.
- **Groups Directory**: Unified ransomware groups & threat actors page.
- **Data Export**: CSV and JSON export functionality.
- **Contact Page**: Professional contact form with various categories.
- **About Page**: Enhanced with stats grid, mission, and services.
- **Communication Systems**: Newsletter, Quo Phone System integration, and email notifications.
- **Public API v1**: RESTful endpoints with authentication, rate limiting, and daily quotas.
- **API Key System**: Manages API keys with tiered rate limits and quotas.
- **Monitor Alert Engine**: Processes watchlist items and sends alerts.
- **Subscription Tiers**: Supporter, Pro, Business, and Unlimited Everything — with monthly and annual billing. Unlimited Everything provides full unrestricted platform access, white-label reports, Slack/Teams integration, and priority incident response.
- **Pro Tier Features**: User authentication, subscription management, watchlist system, breach database, tiered API, and advanced search/scanning.
- **Security & US Compliance**: Implements robust security headers, secure cookies, API logging, rate limiting, and consent flows (CCPA/CPRA, COPPA, CAN-SPAM).
- **Authentication**: Secure signup/login with bcrypt and cryptographic session tokens.
- **Logging**: Structured logging for various operations.
- **Live Chat Widget**: Floating chat bubble for visitor interaction via SMS.
- **Maintenance & Monitoring**: Scheduled data cleanup, error reporting, and health checks.
- **Incident Response Playbooks**: 5 interactive step-by-step IR guides (Ransomware, Phishing, Data Breach, Malware, Account Compromise) with phase-based checklists.
- **Service Status Dashboard**: Real-time status monitoring for 8 major cloud services (GitHub, Cloudflare, AWS, Azure, Google Cloud, Slack, Datadog, Vercel).
- **Dark Web Intelligence**: deepdarkCTI integration for dark web sourced IPs, domains, and URLs.
- **Remote Desktop**: Browser-based RDP client (Business+ tier) with WebSocket-to-TCP bridging, canvas-based rendering, keyboard/mouse forwarding, fullscreen mode, session management (max 2 per user, 30-min timeout), rate limiting, private IP blocking, and zero credential storage.
- **SSH Terminal**: Browser-based SSH client (Business+ tier) using ssh2 + xterm.js with password and private key (RSA/Ed25519/ECDSA) authentication, xterm-256color terminal emulation, WebSocket-to-SSH bridging, session management (max 3 per user, 30-min max / 15-min idle timeout), rate limiting, private IP blocking, and zero credential storage.
- **Telnet Client**: Browser-based Telnet client (Pro+ tier) using raw TCP socket bridging + xterm.js, with quick-select ports for SMTP/HTTP/IMAP/POP3 testing, command input bar, SMTP quick reference sidebar, session management (max 3 per user, 15-min max / 10-min idle timeout), DNS-based SSRF protection, and plaintext warning.
- **File Scanner**: Upload-based file analysis tool (Pro+ tier) computing MD5/SHA1/SHA256/SHA512 hashes, MIME type detection via magic bytes, Shannon entropy calculation, printable string extraction. Files auto-deleted after analysis. Max 50MB upload.
- **Email Header Analyzer**: Email header parsing tool (Pro+ tier) that traces routing hops, extracts SPF/DKIM/DMARC authentication results, detects delivery delays between hops, identifies Return-Path/From domain mismatches, and warns about missing authentication.
- **Encoding/Decoding Tools**: Client-side Base64, URL, Hex, and ROT13 encode/decode utility (Free tier). All operations run in-browser with no server calls.
- **SFTP Client**: Browser-based SFTP file manager (Business+ tier) using ssh2 SFTP subsystem. File browser with directory navigation, upload/download, delete/rename/mkdir. Tabbed multi-session support (max 3). DNS-based SSRF protection.
- **SSL/TLS Checker**: Comprehensive SSL analysis tool (Pro+ tier) using Node.js tls module. Certificate chain validation, TLS 1.0-1.3 protocol testing, cipher suite audit, HTTP security headers (HSTS/CSP/X-Frame-Options), OCSP stapling, CAA DNS records, security grading (A+ to F).
- **Tabbed Sessions**: All remote access tools (SSH, Telnet, RDP, SFTP) support multiple concurrent sessions via tabbed UI with status indicators (connecting/connected/error), close buttons, and "+" to add sessions.
- **Web Server Fingerprinter**: HTTP fingerprinting tool (Pro+ tier) detecting server software (IIS/Apache/Nginx), CMS platforms (WordPress/Joomla/Drupal), technology stacks, HTTP methods, cookies, redirect chains, and security observations. SSRF-protected.
- **Exchange Server Checker**: Microsoft Exchange detection tool (Pro+ tier) probing Autodiscover, OWA/ECP, EWS, ActiveSync endpoints. Version fingerprinting with CVE mapping (ProxyLogon, ProxyShell, ProxyNotShell). MX record analysis for Exchange Online vs on-premise.
- **DNS Security Analyzer**: Comprehensive DNS security analysis (Pro+ tier) checking SPF/DKIM/DMARC records, DNSSEC status, CAA records, MX records with provider detection, NS redundancy. Overall DNS security scoring (A+ to F).
- **HTTP Security Headers Scanner**: Free-tier security headers analysis checking HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CORS headers. A+ to F grading with remediation recommendations. Rate-limited (10 req/min).

## External Dependencies

### Data Sources (Free Public Feeds)
- NVD API
- CISA KEV
- URLhaus
- OpenPhish
- Feodo Tracker
- SANS DShield
- Tor Exit Nodes
- SSL Blacklist
- Shodan InternetDB
- AlienVault OTX (via API key)
- VirusTotal (via API key)
- Hybrid Analysis (via API key)
- GreyNoise (via API key)
- CrowdSec (via API key)
- Shodan (via API key)
- Pulsedive (via API key)
- HoneyDB (via API key)
- AbuseIPDB (via API key)

### Database
- PostgreSQL (via `DATABASE_URL`)
- `connect-pg-simple`

### Key NPM Packages
- `drizzle-orm`, `drizzle-zod`
- `@tanstack/react-query`
- `recharts`
- `express-rate-limit`
- `zod`
- `date-fns`
- `stripe`, `stripe-replit-sync`

### Payment Gateway
- Stripe (subscriptions and donations via embedded checkout).

### SEO
- **Server-Side Meta Injection**: For title, description, OG tags, Twitter cards.
- **Dynamic Routes**: For specific meta tags.
- **noindex**: For transactional/private pages.
- **Structured Data**: Various schema types.
- **useDocumentTitle hook**: Client-side meta tag updates.
- **Sitemap**: Dynamic XML sitemap.
- **robots.txt**: Manages crawler access.

### Security & US Compliance
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy.
- **Authentication**: bcrypt, strong password policies, account lockout.
- **Sessions**: Time-limited, cryptographic tokens, httpOnly/secure cookies.
- **Rate Limiting**: Tiered limits for authentication, general API, tools, live chat, and API v1.
- **Admin/Internal APIs**: Header-only authentication with dedicated keys.
- **Error Handling**: Generic messages for 500-level errors, server-side logging.
- **Consent Flows**: For signup, subscriptions, donations, newsletter, SMS alerts, two-way SMS, and live chat.
- **Legal Pages**: Privacy Policy, Terms of Service, SMS Terms & Conditions.
- **SMS Compliance**: Dedicated `/sms-terms` page, TCPA express written consent, STOP/HELP keywords.