# STB Cybersecurity (STBCS)
## Technical & Executive Platform Report

**Prepared by:** STB Cybersecurity Engineering
**Domain:** [stbcybersecurity.com](https://stbcybersecurity.com)
**Contact:** (855) STB-1987 | kbpc.inc@gmail.com
**Report Date:** March 2026

---

## Executive Summary

STB Cybersecurity (STBCS) is a comprehensive, production-grade cybersecurity intelligence platform purpose-built for small and medium-sized businesses. The platform delivers enterprise-level threat visibility, security tooling, and professional services at accessible price points — eliminating the need for expensive SIEM deployments or dedicated SOC teams.

STBCS continuously aggregates data from **134 built-in threat intelligence feeds** (plus 9 optional API-key integrations) across 8 categories, processes it through automated enrichment pipelines, and presents actionable intelligence through an intuitive, real-time dashboard. The platform combines passive threat monitoring with active security tools — including network scanners, file analysis, SSL inspection, DNS security analysis, and more — giving security teams and business owners a single pane of glass for their entire threat landscape.

Beyond tooling, STBCS offers hands-on professional services: **Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting** — delivered by experienced professionals who understand the unique constraints of SMB environments.

### Key Differentiators

- **134 built-in threat feeds** refreshed every 15 minutes — no API keys required for core coverage, plus 9 optional API-key integrations for enhanced enrichment
- **18+ integrated security features** spanning threat intelligence, active scanning, compliance mapping, and community knowledge sharing
- **Professional services** bundled alongside the platform — not just data, but expert guidance when it matters most
- **SMB-first pricing** starting at $0/month for core intelligence, with paid tiers from $7.49/month
- **Always-on infrastructure** deployed as a dedicated VM with resilient database connections and automated background services
- **Built-in compliance mapping** for NIST CSF 2.0, CIS Controls v8, and ISO 27001
- **Community-driven Knowledge Base** with gamification, reputation system, and automated cybersecurity news aggregation from 12 authoritative sources

---

## Company & Mission

STB Cybersecurity exists to close the security gap for small and medium-sized businesses. While large enterprises have dedicated SOC teams, million-dollar SIEM licenses, and in-house threat analysts, SMBs are often left with consumer-grade antivirus and hope.

STBCS changes that equation. We deliver the same caliber of threat intelligence, monitoring, and incident response that Fortune 500 companies rely on — packaged for teams of 1 to 100.

### Professional Services

| Service | Description |
|---------|-------------|
| **Cybersecurity Consulting** | Security assessments, policy development, architecture review, and strategic planning tailored to SMB budgets and compliance requirements |
| **Incident Response** | Rapid-response engagement for active breaches, with containment, eradication, recovery, and post-incident analysis |
| **Ransomware Recovery & Restoration** | Specialized recovery services including negotiation support, decryption assistance, data restoration, and hardening against re-infection |
| **Threat Hunting** | Proactive threat detection using IOC correlation, behavioral analysis, and MITRE ATT&CK-mapped hunting playbooks |

---

## Platform Features

### 1. Real-Time Threat Intelligence Dashboard

The STBCS dashboard is the operational nerve center. It provides at-a-glance visibility into the current threat landscape with live-updating metrics, a scrolling threat ticker, and interactive data visualizations.

**Capabilities:**
- Live threat statistics: total CVEs, ransomware incidents, malicious IPs/URLs, active threat groups, breach count
- Daily delta tracking (new threats today vs. historical baseline)
- Security Posture Widget with progress ring showing organizational readiness
- Global threat heatmap (SVG world map) showing ransomware attack distribution by country
- Trending threat actors and most-targeted sectors
- EPSS (Exploit Prediction Scoring System) integration for CVE prioritization

### 2. Vulnerability & Exploit Intelligence

Full CVE database with enrichment from NVD, CISA KEV, FIRST.org EPSS, GitHub GHSA, and 6+ exploit sources.

**Capabilities:**
- Searchable CVE database with severity filtering (Critical/High/Medium/Low)
- CVSS scoring with EPSS exploit probability percentiles
- Exploit Maturity Timeline — visual 4-stage lifecycle tracker per CVE (Disclosed → PoC Available → Actively Exploited → Patch Available)
- CISA Known Exploited Vulnerabilities (KEV) flagging
- Proof-of-Concept availability tracking from Exploit-DB, trickest/cve, Nuclei Templates, and Metasploit
- Affected product correlation and vendor-specific filtering
- Social sharing and "Share as Image" for CVE cards

### 3. Ransomware Intelligence Center

Tracks ransomware incidents, group activity, victim claims, and attack patterns in real time.

**Capabilities:**
- Real-time victim tracking from ransomware.live, RansomLook.io, RansomWatch, Ransomwhere, DarkFeed.io, and CISA #StopRansomware
- Group profiles with detailed TTP analysis, MITRE ATT&CK mapping, known CVEs, malware families, and infrastructure details
- Sector and country targeting analysis with interactive filtering
- Ransom amount tracking, payment status, and Bitcoin wallet correlation
- Attack vector classification and victim revenue/employee count context
- Ransomware-as-a-Service (RaaS), double extortion, and data exfiltration indicators
- Groups Directory with comprehensive profiles including aliases, affiliations, law enforcement actions, and government advisories

### 4. Ransomware Cost Estimator

Interactive calculator helping businesses estimate potential ransomware impact.

**Capabilities:**
- Industry-specific risk modeling
- Revenue-based impact projection
- Recovery timeline estimation
- Insurance coverage gap analysis
- Actionable mitigation recommendations

### 5. Threat Actor & APT Tracking

Comprehensive adversary intelligence from MITRE ATT&CK, MISP Galaxy, and curated research sources.

**Capabilities:**
- Detailed actor profiles with aliases, origin, TTPs, target sectors, and target countries
- Active/inactive status tracking with first-seen and last-active timestamps
- Malware family associations and infrastructure mapping
- Linked CVEs and attack vectors
- Law enforcement action tracking and government advisory references
- Negotiation tactics and ransom collection history for ransomware operators

### 6. IOC Database & Search

Massive indicator-of-compromise database spanning malicious IPs, URLs, and domains.

**Capabilities:**
- **Malicious IP Database**: Aggregated from 50+ blocklists including IPsum, Feodo Tracker, SANS DShield, Tor Exit Nodes, Blocklist.de, FireHOL, Spamhaus DROP/EDROP, and dozens more
- **Malicious URL/Domain Database**: URLhaus, OpenPhish, PhishTank, CERT.PL, Malware Filter, Hagezi TIF, Bambenek C2, and more
- Full-text search across all IOC types with source, threat type, and risk score filtering
- IP geolocation, ASN, ISP, reverse DNS, and open port metadata
- Abuse confidence scoring and report count tracking
- STIX 2.1 export for Pro/Business users

### 7. Data Breach Database

Tracks major breach incidents with affected account counts, exposed data types, and verification status.

**Capabilities:**
- Breach timeline with discovery and modification dates
- Affected account count and exposed data class enumeration (emails, passwords, financial data, etc.)
- Verified, fabricated, sensitive, and retired breach flagging
- Domain-based search for organizational exposure assessment

### 8. ICS-CERT Advisory Tracker

Industrial Control System advisories from CISA ICS-CERT.

**Capabilities:**
- Advisory database with vendor, product, CVSS score, and severity classification
- Linked CVE cross-referencing
- Affected systems and mitigation guidance
- Published date tracking and update monitoring

### 9. Security Tools Suite

A comprehensive collection of active security assessment tools accessible directly from the browser.

| Tool | Description | Tier |
|------|-------------|------|
| **WHOIS Lookup** | Domain registration and ownership intelligence | Free |
| **Port Scanner** | TCP port scanning against common service ports | Free |
| **Threat Database Check** | Cross-reference IPs/domains against 130+ threat feeds | Free |
| **Password Strength Analyzer** | Entropy-based password evaluation with breach checking | Free |
| **Subnet Calculator** | CIDR notation calculator with network/broadcast/host details | Free |
| **Cyber Risk Score Calculator** | Organizational security posture assessment questionnaire | Free |
| **SSL/TLS Certificate Checker** | Deep SSL inspection with certificate chain validation, expiry tracking, and issuer analysis | Pro |
| **DNS Security Analyzer** | Comprehensive DNS record analysis (A, AAAA, MX, NS, TXT, SOA, CAA, DMARC, SPF, DKIM) | Pro |
| **HTTP Security Headers Scanner** | Evaluates Content-Security-Policy, HSTS, X-Frame-Options, and 10+ security headers | Pro |
| **Web Server Fingerprinting** | Technology stack detection, server identification, and framework analysis | Pro |
| **Microsoft Exchange Checker** | Exchange/OWA endpoint detection and configuration analysis | Pro |
| **Email Header Analyzer** | Full email header parsing with SPF/DKIM/DMARC validation, hop analysis, and delay detection | Pro |
| **File Scanner** | Upload-based file analysis for suspicious content detection | Pro |
| **Encoding/Decoding Tools** | Base64, URL encoding, hex, HTML entities, and hash generation (MD5, SHA-1, SHA-256, SHA-512) | Pro |
| **SSH Terminal** | Browser-based SSH client for remote server management | Business |
| **SFTP Client** | Secure file transfer directly from the browser | Business |
| **Telnet Client** | Legacy protocol access for network device management | Business |
| **Remote Desktop** | Browser-based RDP client for Windows server administration | Business |

### 10. Uptime & SSL Monitoring

Always-running monitoring engine that checks endpoints and SSL certificates on configurable intervals.

**Capabilities:**
- HTTP/HTTPS endpoint monitoring with configurable check intervals (default 5 minutes)
- Response time tracking with average calculation and degraded state detection (>5 seconds)
- SSL certificate expiry monitoring with configurable threshold alerts (default 14 days)
- SSL issuer, validity, and TLS protocol version tracking
- Automated incident creation and resolution for downtime and SSL events
- Email alerts for down, recovery, and SSL expiry events with branded HTML templates
- Uptime percentage calculation and consecutive failure tracking
- Batch processing (5 monitors per batch with 1-second inter-batch delay) to prevent network saturation

### 11. Attack Surface Discovery

Automated external attack surface mapping for business domains.

**Capabilities:**
- Domain-based reconnaissance and asset enumeration
- Asset type classification with severity rating
- Scan history and status tracking
- Exportable findings for remediation workflows

### 12. Threat Intelligence Reports

Automated and on-demand threat landscape reports.

**Capabilities:**
- Configurable report periods with scheduled generation (weekly cadence)
- Comprehensive threat data aggregation across all intelligence sources
- Report archive with status tracking
- Pro/Business tier feature

### 13. Compliance Mapper

Maps organizational security controls to major compliance frameworks.

**Capabilities:**
- **NIST Cybersecurity Framework (CSF) 2.0** control mapping
- **CIS Controls v8** implementation guidance
- **ISO 27001** Annex A alignment
- Gap analysis and remediation recommendations
- Interactive control selection with coverage visualization

### 14. STB-Sync Dynamic Firewall Block Lists

Enterprise firewall integration delivering live threat data as External Dynamic Lists (EDLs).

**Capabilities:**
- Token-authenticated EDL URLs compatible with Palo Alto Networks, pfSense, Fortinet, and SonicWall
- Top 10,000 malicious IPs and domains sourced from 130+ threat feeds
- Three list formats: IPs only, domains only, or combined
- Plain-text output format for universal firewall compatibility
- Token-based URL authentication (firewalls can't send HTTP headers)
- 5-minute server-side cache with 30 requests/hour rate limiting per token
- Business tier feature

### 15. Do Not Click — Phishing Awareness Bulletins

Automated phishing awareness system that analyzes live threat data and generates actionable bulletins for employee training.

**Capabilities:**
- Automated analysis of malicious URLs with phishing/verified phishing classifications
- Brand impersonation detection for 40+ commonly targeted brands
- Attack type classification (credential harvest, payment scam, delivery scam, etc.)
- Three output formats: plain text, HTML email, and Markdown
- Daily bulletins (07:00 UTC) and weekly summaries (Mondays)
- Copy-paste toolbar for easy distribution to teams
- Threat level bar and brand badges for visual communication
- Pro-gated bulletin archive

### 16. Knowledge Base & Community Hub

Community-driven cybersecurity knowledge sharing platform with full RBAC, content moderation, and gamification.

**Capabilities:**
- Rich markdown content with code syntax highlighting
- Auto-sourced articles from 12 cybersecurity news feeds (The Hacker News, BleepingComputer, Krebs on Security, Dark Reading, CISA, Cisco Talos, Securelist, Schneier on Security, Naked Security, SentinelOne, Recorded Future)
- Automated content tagging across 12 security categories (ransomware, malware, vulnerability, phishing, dark-web, incident-response, threat-actor, law-enforcement, critical-infrastructure, cloud, IoT, AI-security)
- Community posting, commenting (threaded), voting, and bookmarking
- Reputation system with 6 ranks: Recruit (0) → Analyst (10) → Specialist (50) → Expert (150) → Elite (300) → Legend (500)
- Trusted contributor status at 50+ reputation points
- Badges and achievements system
- Contributor of the Week auto-calculated spotlight
- Content moderation with reporting system and admin review
- 8 seed community members for social proof
- 90-day auto-cleanup of low-engagement bot-sourced articles

### 17. Interactive Incident Response Playbooks

Step-by-step guides for common security incidents.

**Capabilities:**
- 5 comprehensive incident response playbooks
- Interactive checklist format
- MITRE ATT&CK aligned procedures
- Downloadable for offline reference

### 18. Brand Kit & Professional Templates

Complete brand asset hub for creating professional security documentation and marketing materials.

**Capabilities:**
- Email signatures with customizable templates
- Letterhead templates
- Business card designs
- Invoice templates
- Social media graphics
- Presentation templates
- Desktop/mobile backgrounds
- Report cover designs
- Pitch deck templates
- Certificate templates

---

## Subscription Tiers & Pricing

STBCS uses a freemium model with four paid tiers, all currently offered at **50% off** introductory pricing. Subscriptions are managed through Stripe with both monthly and annual billing options.

| Feature | Free | Supporter | Pro | Business | Unlimited |
|---------|------|-----------|-----|----------|-----------|
| **Monthly Price** | $0 | $7.49 | $24.99 | $99.99 | $249.99 |
| **Annual Price** | $0 | $74.95 | $249.95 | $999.95 | $2,499.95 |
| Real-time threat dashboard | Yes | Yes | Yes | Yes | Yes |
| 130+ threat intelligence feeds | Yes | Yes | Yes | Yes | Yes |
| Ransomware group tracker | Yes | Yes | Yes | Yes | Yes |
| CVE & exploit database | Yes | Yes | Yes | Yes | Yes |
| Data breach database | Yes | Yes | Yes | Yes | Yes |
| ICS-CERT advisories | Yes | Yes | Yes | Yes | Yes |
| Free security tools (6) | Yes | Yes | Yes | Yes | Yes |
| Uptime monitoring | - | Yes | Yes | Yes | Yes |
| SSL certificate monitoring | - | Yes | Yes | Yes | Yes |
| Advanced security tools (8) | - | - | Yes | Yes | Yes |
| Data export (CSV/JSON/STIX) | - | - | Yes | Yes | Yes |
| API access | - | - | Yes | Yes | Yes |
| Compliance mapping | - | - | Yes | Yes | Yes |
| Attack surface discovery | - | - | - | Yes | Yes |
| Threat intelligence reports | - | - | - | Yes | Yes |
| STB-Sync firewall EDLs | - | - | - | Yes | Yes |
| SSH/SFTP/Telnet/RDP clients | - | - | - | Yes | Yes |
| Dark web monitoring | - | - | - | Yes | Yes |
| Unlimited everything | - | - | - | - | Yes |

---

## Technology Stack

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | 5.6 |
| Routing | Wouter | 3.3 |
| State Management | TanStack React Query | 5.60 |
| UI Components | shadcn/ui (Radix UI primitives) | Latest |
| Styling | Tailwind CSS | 4.1 |
| Animations | Framer Motion | 12.23 |
| Charts | Recharts | 2.15 |
| Build Tool | Vite | 7.1 |
| Icons | Lucide React | 0.545 |
| Forms | React Hook Form + Zod resolvers | 7.66 |
| Terminal Emulator | xterm.js | 6.0 |
| Payment UI | Stripe React / Stripe.js | 5.6 / 8.8 |

**Design System:** "Stealth Mode / Tactical Operations Center" — dark minimal backgrounds with orange/red accents, cyber-themed iconography. Typography uses Orbitron (display), Inter (body), and JetBrains Mono (code). Custom branded SVG icon components for security services.

**Accessibility (WCAG 2.1):**
- Non-text contrast (SC 1.4.11): All interactive element borders meet 3:1+ contrast ratio
- Button accessible names: All icon-only buttons include `aria-label` attributes (25+ buttons across 15+ files)
- Focus indicators: Full-opacity primary red focus rings for 3:1+ contrast

**Internationalization:** Supports 10 languages with browser auto-detection.

**Code Splitting:** All 65+ page components use React `lazy()` with Suspense boundaries for optimal loading performance.

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20.x |
| Framework | Express | 5.0 |
| Language | TypeScript (ESM) | 5.6 |
| ORM | Drizzle ORM | 0.39 |
| Validation | Zod | 3.25 |
| Authentication | bcryptjs + cryptographic session tokens | 3.0 |
| Email | Resend | 4.0 |
| Payments | Stripe | 20.0 |
| SSH/SFTP | ssh2 | 1.17 |
| Image Generation | Satori + @resvg/resvg-js + Sharp | Latest |
| QR Codes | qrcode | 1.5 |
| RSS Parsing | rss-parser | 3.13 |
| Build System | esbuild | 0.25 |
| Dev Runner | tsx | 4.21 |

### Database

| Component | Detail |
|-----------|--------|
| Engine | PostgreSQL 16 |
| ORM | Drizzle ORM with drizzle-zod for validation |
| Connection Pool | Max 15 (prod) / 10 (dev), Min 2/1, 15s idle timeout, 15s connection timeout, 60s statement timeout |
| Tables | 52 tables covering threat data, users, sessions, monitoring, community, billing, and analytics |
| Integrity | Unique constraints, composite indexes, atomic upserts, database transactions |
| Resilience | `withDbRetry` wrappers on all background services with transient error classification |

### Infrastructure

| Component | Detail |
|-----------|--------|
| Hosting | Linux VM / Cloud VM (platform-agnostic) |
| Domain | stbcybersecurity.com |
| TLS | Via reverse proxy (e.g., Nginx, Caddy) or cloud provider |
| Build Chain | `npm run build` → esbuild → `dist/index.cjs` (CJS wrapper) → `start.js` (launcher) → `index.js` (ESM, ~2.1MB) |
| Deployment | Standard Node.js process with `build` and `run` commands |

---

## Threat Intelligence Architecture

### Feed Categories & Coverage

STBCS aggregates data from **134 built-in threat intelligence feeds** organized into 8 categories, with 9 additional optional API-key integrations for enhanced enrichment. The number of active feeds depends on which optional API keys are configured — all 134 core feeds run without any API keys. All feeds refresh on a 15-minute cycle.

#### Category 1: Core Vulnerability Intelligence (5 feeds)
NVD API, CISA Known Exploited Vulnerabilities, CIRCL CVE, GitHub Security Advisories (GHSA), FIRST.org EPSS API

#### Category 2: Exploit & Zero-Day Intelligence (6 feeds)
Exploit-DB CSV, InTheWild.io, trickest/cve PoC repository, Nuclei Templates CVE, VulnCheck KEV, Metasploit Modules

#### Category 3: IP Blocklists & Reputation (35+ feeds)
IPsum, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, Blocklist.de (all/apache/ssh/mail), CINS Army, GreenSnow, EmergingThreats, Spamhaus DROP/EDROP, FireHOL (Level 1/Level 2/Abusers), C2Tracker, CleanTalk, C2IntelFeeds, Dataplane (SSH/VNC/DNS/SIP), BinaryDefense, Turris Sentinel, AlienVault Reputation, StopForumSpam, Team Cymru Bogons, CESNET NERD, CriticalPath (Cobalt Strike/abuse.ch), NormShield, NixSpam, Bruteforce Blocker, Cybercrime IPs, CyberCure, Botvrij.eu, Rutgers SSH Blacklist, DigitalSide Threat-Intel, SecRecon C2

#### Category 4: URL/Domain Threat Feeds (18+ feeds)
URLhaus CSV, OpenPhish, PhishTank, C2IntelFeeds Domains, CERT.PL, Malware Filter (Phishing/URLhaus), Inversion DNSBL, Hagezi TIF, Prigent Malware, AdGuard DNS, Red Flag Domains, Maltrail (Suspicious/Malware), Disconnect Malvertising, Phishing Database (IPs/Domains/URLs), Stamparm Blackbook, Bambenek C2

#### Category 5: Malware & C2 Infrastructure (6+ feeds)
ThreatFox (API/CSV), MalwareBazaar (Recent/Tags), YARAify Recent, Malpedia Families, SSLBL Certificates

#### Category 6: Ransomware Intelligence (8+ feeds)
ransomware.live, RansomLook.io, RansomWatch (standard/extended), Ransomwhere, CISA #StopRansomware, DarkFeed.io, Ransomware IOC Repositories, Feodo Ransomware Loaders

#### Category 7: Threat Actor & APT Intelligence (6+ feeds)
MITRE ATT&CK Groups, MISP Threat Actor Galaxy, TweetFeed, APT Notes, Targeted Threats, Sophos/ESET/Talos IOC repositories

#### Category 8: News & Research RSS (20+ feeds)
Google Project Zero, Google Security Blog, MSRC, NCSC UK, CERT-EU, Packet Storm, Sophos News, Schneier on Security, WeLiveSecurity, Cisco Talos Blog, SentinelOne, Microsoft Security, US-CERT, Check Point Research, Mandiant, Recorded Future, Unit 42, Google Cloud Threat Intel, Microsoft Threat Intel, CrowdStrike Blog

### Optional API-Key Integrations (9 services)
AlienVault OTX, VirusTotal, Hybrid Analysis, GreyNoise, CrowdSec, Shodan, Pulsedive, HoneyDB, AbuseIPDB

### Data Processing Pipeline

```
External Feeds (134 built-in + up to 9 API-key integrations)
    │
    ▼
Scraper Engine (15-min cycle)
    │
    ├── Deduplication (in-memory + database-level unique constraints)
    ├── Enrichment (EPSS scoring, CISA KEV cross-reference, exploit maturity)
    ├── Classification (threat type, severity, source attribution)
    │
    ▼
PostgreSQL (52 tables, indexed for fast query)
    │
    ├── REST API (/api/*) with Zod validation
    ├── In-memory response cache (TTL-based)
    ├── Rate-limited endpoints (tiered by subscription)
    │
    ▼
React Frontend (real-time dashboard, interactive tools)
```

---

## Background Services Architecture

STBCS runs four autonomous background services that operate continuously without manual intervention.

### 1. Threat Intelligence Scrapers (`scrapers.ts`)
- **Cycle:** Every 15 minutes
- **Coverage:** 134 built-in feeds across 8 categories (plus up to 9 additional API-key integrations when configured)
- **Resilience:** All database operations wrapped with `withDbRetry`; transient errors (connection timeout, pool exhaustion, connection reset) are classified by `isTransientDbError()` and retried up to 2 times with exponential backoff (2s, 4s)
- **Deduplication:** In-memory tracking + database unique constraints prevent duplicate records

### 2. Uptime Monitoring Engine (`uptimeEngine.ts`)
- **Cycle:** Configurable per monitor (default 300 seconds)
- **Processing:** Batches of 5 monitors with 1-second inter-batch delay
- **Checks:** HTTP/HTTPS endpoint availability, response time, SSL certificate inspection (validity, expiry, issuer, TLS version)
- **Alerts:** Automated email notifications for down/recovery/SSL events via Resend
- **Incidents:** Automatic incident creation on state change (up→down), automatic resolution on recovery
- **Health Endpoint:** `getUptimeEngineHealth()` exposes `lastRunEnd` and `isRunning` status

### 3. Maintenance Scheduler (`maintenance.ts`)
- **Tasks:** Session cleanup, stale data purging, daily threat stats computation, admin reporting, watchlist monitoring, awareness bulletin generation
- **Staggering:** 3-second delay between each maintenance task to reduce concurrent database pressure
- **Error Handling:** `withRetry` wrapper with transient error classification; critical errors trigger admin notifications via email
- **Reporting:** Daily health checks and weekly summary reports sent to admin

### 4. Knowledge Base Scraper (`kbScraper.ts`)
- **Cycle:** Every 4 hours
- **Sources:** 12 cybersecurity RSS feeds (The Hacker News, BleepingComputer, Krebs on Security, Dark Reading, CISA, Cisco Talos, Securelist, Schneier on Security, Naked Security, SentinelOne, Recorded Future, Threatpost)
- **Processing:** RSS parsing → HTML stripping → auto-tagging (12 categories, up to 5 tags per article) → markdown formatting → deduplication by slug
- **Limits:** Max 15 posts per run, 7-day dedup window, 5 items per feed
- **Cleanup:** Daily purge of bot-sourced articles older than 90 days with zero votes and zero comments
- **Community Seeding:** 8 demo community members with varied tiers, reputation, and trusted status

---

## API & Integrations

### Public API v1

STBCS offers a RESTful API for programmatic access to threat intelligence data. Authentication is via API key (generated in the account dashboard).

**Base URL:** `https://stbcybersecurity.com/api/v1/`

**Endpoints include:**
- CVE/vulnerability data with search and filtering
- Ransomware incidents and group intelligence
- Malicious IP/URL/domain lookups
- Threat actor profiles
- Breach database queries
- CISA KEV and ICS-CERT advisories

**Rate Limits by Tier:**

| Tier | API Keys | Requests/Minute | Daily Quota | Live Lookups/Day |
|------|----------|-----------------|-------------|-------------------|
| Free | - | 10 (web) | - | - |
| Supporter | - | 10 (web) | - | - |
| Pro | 1 | 60 | 1,000 | 50 |
| Business | 5 | 120 | 10,000 | 200 |
| Unlimited | 10 | 300 | 100,000 | 1,000 |

### Stripe Integration
- 4 subscription products: STBCS Supporter, STBCS Pro, STBCS Business, STBCS Unlimited Everything
- Managed via direct Stripe SDK integration
- Embedded checkout flow with return handling
- Webhook processing for subscription lifecycle events

### Resend Email Integration
- Transactional emails for uptime alerts (down/recovery/SSL expiry)
- Account security notifications (lockout alerts)
- Admin reports and critical error notifications
- Branded HTML email templates with dark theme styling

### STB-Sync Firewall EDL Integration
- **Compatible Firewalls:** Palo Alto Networks, pfSense, Fortinet, SonicWall
- **Endpoint Format:** `GET /api/sync/:token/{ips|domains|combined}.txt`
- **Authentication:** URL-embedded token (firewalls cannot send HTTP headers)
- **Data:** Top 10,000 malicious IPs/domains from 130+ feeds, plain-text format
- **Caching:** 5-minute server-side cache, 30 requests/hour per token

### Service Status Monitoring
- Monitors 37+ external services across multiple categories
- Integration with Statuspage.io APIs
- Real-time status dashboard at `/service-status`

---

## Security & Compliance

### Authentication & Access Control
- **Password Policy:** Minimum 12 characters, requires uppercase + lowercase + number
- **Password Storage:** bcrypt hashing with work factor 12
- **Sessions:** Cryptographic tokens with configurable expiry, server-side validation
- **Account Lockout:** Automatic lockout after repeated failed login attempts with email notification
- **RBAC:** Tiered access control (Free → Supporter → Pro → Business → Unlimited) with admin override

### Application Security
- **Security Headers:** Content-Security-Policy, Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Rate Limiting:** 6 tiers of rate limiting (general, strict, auth, free tools, pro tools, business tools) with subscription-aware middleware
- **Input Validation:** Zod schema validation on all API inputs with type-safe error responses
- **Session Security:** Cryptographic token-based sessions with secure cookie attributes (HttpOnly, SameSite)
- **API Key Security:** Keys are hashed before storage; only the prefix is stored in plaintext for identification

### Data Privacy & Legal
- Comprehensive Privacy Policy at `/privacy`
- Terms of Service at `/terms`
- SMS Terms and TCPA compliance at `/sms-terms`
- TCPA consent collection for live chat
- Cookie consent implementation
- Data minimization practices

### Compliance Framework Support
- **NIST CSF 2.0:** Control mapping and gap analysis
- **CIS Controls v8:** Implementation guidance and coverage assessment
- **ISO 27001:** Annex A alignment and evidence mapping

---

## SEO & Discoverability

- **Server-Side Meta Injection:** Dynamic OG titles, descriptions, and images per page
- **Dynamic OG Images:** Server-side SVG→PNG generation via Satori + resvg-js for social media preview cards
- **Structured Data:** 7 JSON-LD blocks for rich search results
- **Hreflang Tags:** 10 language variants for international search visibility
- **Dynamic XML Sitemap:** Auto-generated at `/sitemap.xml` including all threat group profile pages
- **robots.txt:** Configured to allow crawling of all public pages while excluding admin routes
- **Canonical URLs:** Proper canonical tag implementation across all routes

---

## Database Schema Overview

The STBCS database comprises 52 PostgreSQL tables (defined in `shared/schema.ts`) organized into functional domains:

### Threat Intelligence (9 tables)
`cves`, `ransomware_incidents`, `threat_actors`, `malicious_ips`, `malicious_urls`, `cisa_kev`, `cisa_ics_advisories`, `news_articles`, `breach_incidents`

### User & Account Management (7 tables)
`users`, `sessions`, `subscriptions`, `user_settings`, `saved_searches`, `newsletter_subscriptions`, `contact_messages`

### Monitoring & Alerting (7 tables)
`uptime_monitors`, `uptime_checks`, `uptime_incidents`, `dark_web_monitors`, `dark_web_findings`, `watchlist_items`, `monitor_alert_log`

### Community & Content (7 tables)
`kb_posts`, `kb_comments`, `kb_votes`, `kb_bookmarks`, `kb_reports`, `feedback_submissions`, `content_views`

### Security & Analytics (5 tables)
`audit_log`, `user_notifications`, `api_keys`, `api_key_usage`, `daily_threat_stats`

### Platform & Billing (5 tables)
`threat_feeds`, `site_settings`, `system_config`, `add_ons`, `user_add_ons`

### Integrations & Reports (6 tables)
`sync_tokens`, `phishing_bulletins`, `attack_surface_scans`, `attack_surface_assets`, `threat_reports`, `report_schedules`

### Visitor, Messaging & Submissions (6 tables)
`site_visitors`, `daily_visitor_counts`, `logo_votes`, `sms_messages`, `live_chat_sessions`, `exploit_submissions`

---

## Why STBCS for Your Business

### The Problem
- SMBs are disproportionately targeted by ransomware and cyber attacks
- SMBs typically lack the budget for enterprise SIEM platforms
- Most SMBs have zero dedicated security staff
- Threat intelligence is fragmented across dozens of disconnected free tools
- Compliance requirements are growing, but in-house expertise isn't

### The STBCS Solution
- **One platform** replacing 10+ point solutions
- **134 built-in threat feeds** aggregated and correlated automatically (plus 9 optional API-key integrations)
- **Professional services** available when you need expert hands, not just dashboards
- **Compliance-ready** with built-in NIST, CIS, and ISO mapping
- **Enterprise features** at SMB prices: $0/month for core intelligence, $24.99/month for full Pro access
- **No infrastructure to manage** — fully hosted, always-on, continuously updated

### Value Comparison

| Traditional Approach | With STBCS |
|---------------------|------------|
| 10+ browser tabs of free threat feeds | 1 unified dashboard |
| Manual CVE tracking in spreadsheets | Automated CVE monitoring with EPSS prioritization |
| No ransomware visibility | Real-time group tracking with victim correlation |
| Separate uptime monitoring service | Included in Supporter tier ($74.95/year) |
| Separate threat intelligence platform | Full Pro access for $249.95/year |
| External compliance consulting | Built-in NIST/CIS/ISO mapping + professional services |
| No incident response capability | Expert IR team on standby |

---

## Contact & Next Steps

**Website:** [stbcybersecurity.com](https://stbcybersecurity.com)
**Phone:** (855) STB-1987
**Email:** kbpc.inc@gmail.com

- **Start Free:** Create an account and explore the full threat intelligence dashboard at no cost
- **Try Pro:** Get 50% off your first subscription — full security tooling for $24.99/month
- **Talk to Us:** Schedule a consultation for Incident Response, Ransomware Recovery, or Cybersecurity Consulting
- **Enterprise Inquiry:** Contact us for custom Business or Unlimited tier deployments with dedicated support

---

*STB Cybersecurity — Enterprise-grade threat intelligence, built for the businesses that need it most.*
