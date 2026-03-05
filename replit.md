# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview
STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from over 130 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses, aiming to be a comprehensive hub for cybersecurity insights and professional services.

## User Preferences
Preferred communication style: Simple, everyday language.
- Export/download features (CSV, JSON, STIX) are Pro/Business tier only — always gate behind auth check on both frontend and backend.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **UI Components**: shadcn/ui built on Radix UI, styled with Tailwind CSS v4.
- **Internationalization**: Supports 10 languages with browser auto-detection.
- **Visual Theme**: "Stealth Mode / Tactical Operations Center" with dark minimal background, orange/red accents, cyber-themed Lucide icons, and interactive elements. Typography uses Orbitron, Inter, and JetBrains Mono. Custom branded SVG icon components for various security-related services.
- **Sidebar Navigation**: Organized into 7 collapsible sections using Radix Collapsible with state persistence in localStorage.

### Backend
- **Runtime**: Node.js with Express 5, TypeScript (ESM modules).
- **API Design**: RESTful JSON API (`/api/*`) with Zod validation.
- **Security**: Rate limiting, input validation, CSRF protection.
- **Data Scraping**: Server-side scrapers for threat intelligence.
- **Caching**: In-memory response cache with TTL and session auth caching. Note: Session cache (`server/auth.ts`) only stores core auth fields. `/api/auth/me` fetches full user from DB including profile fields (displayName, avatarUrl, bio, etc.) for frontend display. `/api/account` also fetches fresh from DB.
- **Performance**: Parallelized DB queries, in-memory `index.html` caching.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM with an optimized connection pool.
- **Schema**: Defined for CVEs, ransomware, threat actors, and user data.
- **Integrity**: Unique constraints and atomic upserts.
- **Transactions**: Multi-step operations use `db.transaction()` for atomicity.

### Key Design Patterns
- Shared Types, Storage Abstraction, API Hooks (for React Query), Path Aliases.

### Features
- **Threat Intelligence Aggregation**: 15-minute refresh cycles from diverse sources.
- **Security Tools**: Comprehensive suite including WHOIS, Port Scanner, Threat Database Check, Password Strength, Subnet Calculator, Email Header Analyzer, Encoding/Decoding, File Scanner, SSL/TLS Checker, Web Server Fingerprinter, DNS Security Analyzer, HTTP Security Headers Scanner.
- **Pro/Business Features**: Monitoring Suite (uptime, SSL certificate tracking, dark web scanning), Incidents tab, Attack Surface Discovery, Threat Intelligence Reports, Remote Desktop, SSH Terminal, Telnet Client, SFTP Client.
- **Core Security Capabilities**: IOC Search, Cyber Risk Score Calculator, ICS-CERT Advisories, MITRE ATT&CK Mapping, STIX 2.1 Export, Groups Directory, Compliance Mapper (NIST CSF 2.0, CIS Controls v8, ISO 27001), Ransomware Cost Estimator, EPSS Exploit Prediction Scoring.
- **User & Subscription Management**: Authentication, subscription tiers, API Key System, Monitor Alert Engine, dedicated `/pricing` page with Stripe integration. Free users can create accounts, manage profiles (avatar, bio, etc.), post in the Knowledge Base, comment, vote, bookmark, earn reputation, and achieve trusted status at 50+ rep.
- **Communication & Support**: Newsletter, Quo Phone System integration, email notifications, Live Chat Widget, Knowledge Base & Community Hub with RBAC, content moderation, gamification, and advanced markdown rendering.
- **Platform-Wide Social Sharing**: All content shareable with options like "Share as Image" for CVEs and ransomware.
- **Dynamic OG Images**: Server-side SVG→PNG generation for social media preview cards.
- **Live Threat Ticker**: Real-time scrolling ticker on dashboard.
- **EPSS Scoring**: Integration of Exploit Prediction Scoring System for CVEs.
- **CVE Exploit Maturity Timeline**: Visual 4-stage lifecycle tracker per CVE.
- **Badges & Achievements**: System for KB contributors.
- **Contributor of the Week**: Auto-calculated weekly spotlight.
- **Security Posture Widget**: Dashboard checklist with progress ring.
- **Threat Heatmap**: Global SVG world map on ransomware page.
- **Avatar System**: Full avatar management with defaults and upload options.
- **User Profiles**: Public profiles with stats and privacy toggles.
- **Admin KB Reporting**: Daily health checks and weekly reports.
- **Feedback & Bug Reports**: Public system for issues and feature requests.
- **Security & Compliance**: Robust security headers, secure cookies, API logging, rate limiting, consent flows, legal pages.
- **Brand Kit**: Comprehensive brand asset hub at `/brand-kit` with customizable templates.
- **Interactive Playbooks**: 5 incident response guides.
- **STB-Sync Block Lists**: BIZ-tier feature generating authenticated EDL URLs for enterprise firewalls (Palo Alto, pfSense, Fortinet, SonicWall). Serves top 10K malicious IPs/domains as plain-text lists from 130+ threat feeds. Token-based URL auth (firewalls can't send headers), 5-min server cache, 30 req/hr rate limit per token. Schema: `sync_tokens` table. Routes: `POST/GET/DELETE /api/sync/tokens`, `GET /api/sync/:token/{ips|domains|combined}.txt`. Frontend: `/stb-sync` management page.
- **Do Not Click — Awareness Feeds**: Automated phishing awareness bulletin system. Engine (`server/phishing-bulletin.ts`) analyzes malicious_urls with phishing/verified_phishing threat types, detects 40+ impersonated brands via keyword matching against URL hostnames, classifies attack types (credential harvest, payment scam, delivery scam, etc.), and generates formatted bulletins in 3 formats (plain text, HTML email, Markdown). Schema: `phishing_bulletins` table. Scheduler: daily at 07:00 UTC, weekly on Mondays. Routes: `GET /api/awareness/latest` (public), `GET /api/awareness/bulletins` (PRO archive), `GET /api/awareness/bulletins/:id`, `GET /api/awareness/bulletins/:id/format/:format`, `POST /api/awareness/generate` (admin), `GET /api/awareness/stats`. Frontend: `/awareness` page with copy-paste toolbar, brand badges, threat level bar, and PRO-gated archive. 1-hour in-memory cache on latest bulletin.
- **Service Status Dashboard**: Monitors 37+ services across various categories using Statuspage.io APIs.
- **Threat Feed Deduplication**: In-memory and database-level deduplication for threat feeds.

## External Dependencies

### Data Sources (130+ Free Public Feeds)
- **Core Vulnerability**: NVD API, CISA KEV, CIRCL CVE, GitHub GHSA, FIRST.org EPSS API.
- **Exploit & Zero-Day Intelligence**: Exploit-DB CSV, InTheWild.io, trickest/cve PoC, Nuclei Templates CVE, VulnCheck KEV, Metasploit Modules.
- **IP Blocklists**: IPsum, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, Blocklist.de (all/apache/ssh/mail), CINS, GreenSnow, EmergingThreats, Spamhaus DROP/EDROP, FireHOL (L1/L2/Abusers), C2Tracker, CleanTalk, C2IntelFeeds, Dataplane (SSH/VNC/DNS/SIP), BinaryDefense, Turris Sentinel, AlienVault Reputation, StopForumSpam, Team Cymru Bogons, CESNET NERD, CriticalPath (Cobalt Strike/abuse.ch), NormShield, NixSpam, Bruteforce Blocker, Cybercrime IPs, CyberCure, Botvrij.eu, Rutgers SSH, DigitalSide Threat-Intel, SecRecon C2.
- **URL/Domain Threat Feeds**: URLhaus (CSV), OpenPhish, PhishTank, C2IntelFeeds Domains, CERT.PL, Malware Filter (Phishing/URLhaus), Inversion DNSBL, Hagezi TIF, Prigent Malware, AdGuard DNS, Red Flag Domains, Maltrail (Suspicious/Malware), Disconnect Malvertising, Phishing Database (IPs/Domains/URLs), Stamparm Blackbook, Bambenek C2.
- **Malware & C2 Infrastructure**: ThreatFox (API/CSV), MalwareBazaar (Recent/Tags), YARAify Recent, Malpedia Families, SSLBL Certs.
- **Ransomware Intelligence**: ransomware.live, RansomLook.io, RansomWatch (standard/extended), Ransomwhere, CISA #StopRansomware, DarkFeed.io, Ransomware IOC Repos, Feodo Ransomware Loaders.
- **Threat Actor & APT**: MITRE ATT&CK Groups, MISP Threat Actor Galaxy, TweetFeed, APT Notes, Targeted Threats, Sophos/ESET/Talos IOC repos.
- **News & Research RSS**: Google Project Zero, Google Security Blog, MSRC, NCSC UK, CERT-EU, Packet Storm, Sophos News, Schneier on Security, WeLiveSecurity, Cisco Talos Blog, SentinelOne, Microsoft Security, US-CERT, Check Point Research, Mandiant, Recorded Future, Unit 42, Google Cloud Threat Intel, Microsoft Threat Intel, CrowdStrike Blog.
- API Key-based integrations: AlienVault OTX, VirusTotal, Hybrid Analysis, GreyNoise, CrowdSec, Shodan, Pulsedive, HoneyDB, AbuseIPDB.

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
- `ssh2`, `xterm.js`
- `node-rdpjs`
- `qrcode`
- `highlight.js`
- `@resvg/resvg-js`
- `satori`

### Payment Gateway
- Stripe (subscriptions and donations). 4 products: STBCS Supporter, STBCS Pro, STBCS Business, STBCS Unlimited Everything. Products endpoint has Stripe API fallback when stripe-replit-sync doesn't have all products. getProduct/getPrice also fall back to Stripe API with livemode enforcement.

### SEO
- Server-Side Meta Injection, Dynamic Routes, Hreflang tags for 10 languages, Structured Data (7 JSON-LD blocks), Dynamic XML sitemap, `robots.txt` configuration.

### Accessibility (WCAG 2.1)
- **Non-text Contrast (SC 1.4.11)**: All interactive element borders meet 3:1+ contrast ratio. CSS custom properties `--border`, `--input`, `--sidebar-border` set to `220 10% 42%`. Hardcoded Tailwind borders on interactive elements use `border-zinc-500` (minimum). Slider thumb uses `border-2 border-primary`.
- **Button Accessible Names**: All icon-only buttons have `aria-label` attributes across the platform (25+ buttons in 15+ files).
- **Focus Indicators**: `--ring` uses full-opacity primary red for 3:1+ focus ring contrast.

### Security & US Compliance
- Security Headers (CSP, HSTS, etc.), bcrypt for authentication, strong password policies, account lockout, time-limited cryptographic session tokens, tiered rate limiting, consent flows, legal pages, SMS compliance.