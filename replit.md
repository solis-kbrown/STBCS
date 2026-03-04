# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview
STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from over 105 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses, aiming to be a comprehensive hub for cybersecurity insights and professional services.

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
- **Caching**: In-memory response cache with TTL and session auth caching.
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
- **Service Status Dashboard**: Monitors 37+ services across various categories using Statuspage.io APIs.
- **Threat Feed Deduplication**: In-memory and database-level deduplication for threat feeds.

## External Dependencies

### Data Sources (Free Public Feeds)
- NVD API, CISA KEV, URLhaus, OpenPhish, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, Shodan InternetDB, Phishing Database, CriticalPath Security, C2IntelFeeds, ThreatFox, MalwareBazaar, AlienVault Reputation, StopForumSpam, Team Cymru Bogons, CESNET NERD, FireHOL, NormShield, NixSpam, Bruteforce Blocker, Cybercrime IPs, CERT.PL, Malware Filter, Inversion DNSBL, Hagezi TIF, Prigent Malware, AdGuard DNS, Red Flag Domains, Maltrail, TweetFeed, APT Notes, Targeted Threats, Sophos/ESET/Talos IOC repos, FIRST.org EPSS API.
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
- Stripe (subscriptions and donations).

### SEO
- Server-Side Meta Injection, Dynamic Routes, Hreflang tags for 10 languages, Structured Data (7 JSON-LD blocks), Dynamic XML sitemap, `robots.txt` configuration.

### Accessibility (WCAG 2.1)
- **Non-text Contrast (SC 1.4.11)**: All interactive element borders meet 3:1+ contrast ratio. CSS custom properties `--border`, `--input`, `--sidebar-border` set to `220 10% 42%`. Hardcoded Tailwind borders on interactive elements use `border-zinc-500` (minimum). Slider thumb uses `border-2 border-primary`.
- **Button Accessible Names**: All icon-only buttons have `aria-label` attributes across the platform (25+ buttons in 15+ files).
- **Focus Indicators**: `--ring` uses full-opacity primary red for 3:1+ focus ring contrast.

### Security & US Compliance
- Security Headers (CSP, HSTS, etc.), bcrypt for authentication, strong password policies, account lockout, time-limited cryptographic session tokens, tiered rate limiting, consent flows, legal pages, SMS compliance.