# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from over 40 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses. The project aims to be a comprehensive hub for cybersecurity insights and professional services.

## User Preferences

Preferred communication style: Simple, everyday language.

### Visual Theme: Stealth Mode
- **Accent Color**: Orange (#f97316 / orange-500)
- **Secondary**: Red (#ef4444) — shield glow & banner (formerly Cyan #06b6d4)
- **Navigation Style**: Border-left-2 active state with orange accents
- **Icons**: Cyber-themed Lucide icons (GalleryVerticalEnd, Scan, Wrench, Activity, ShieldOff, Bug, Satellite, TrendingUp, Heart)
- **Background**: Dark minimal (zinc-900/950)
- **Text**: Zinc-500 inactive, orange-400 active/accent

### Brand Assets (Feb 2026)
- **Logo**: Hex Lock v2.1 — silver chrome hexagonal shield with honeycomb mesh, orange binary code inside shield, padlock, red "Stop The Bleed" banner with white text, red glow, "STBCS" + "STB Cybersecurity" text
- **Logo file (full)**: `/brand/logo-main.png` (1024x1024, transparent bg) — red banner version (current)
- **Logo file (cyan archived)**: `/brand/logo-main-cyan.png` (1024x1024) — original cyan banner variant
- **Icon file (shield only)**: `/brand/icon-shield.png` (1024x1024, dark bg) — red glow version (current)
- **Icon file (cyan archived)**: `/brand/icon-shield-cyan.png` (1024x1024) — original cyan glow variant
- **Brand Gallery**: `/logos` page with all variations, sizes, copyright & trademark notices
- **Copyright**: © STB Cybersecurity. Trademarks: STBCS™, STB Cybersecurity™, STB Cyber™, Stop The Bleed™, Hex Lock™
- **Favicons**: `/brand/favicons/` (16, 32, 48, 64, 96, 128, 256px)
- **App icons**: `/brand/app-icons/` (Apple touch icons 57-180px, Android 192/384/512px, MS 70/150/310px)
- **Social media**: `/brand/social/og-image.png` (1200x630), `twitter-header.png` (1500x500), `email-header.png` (600x150), `pdf-letterhead.png` (2550x400)
- **Web manifest**: `/manifest.json` with all icon sizes
- **Usage**: Sidebar logo, mobile header icon, footer icon, checkout header, auth modal, loading screen, about page, support page, 404 page, email templates (alert, digest, lockout)
- **Generation script**: `scripts/generate-brand-assets.mjs` (uses sharp)

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **UI Components**: shadcn/ui built on Radix UI, styled with Tailwind CSS v4 (custom dark theme).
- **Internationalization**: Supports 10 languages with browser auto-detection.

### Backend
- **Runtime**: Node.js with Express 5, TypeScript (ESM modules).
- **API Design**: RESTful JSON API (`/api/*`) with Zod validation.
- **Security**: Rate limiting via `express-rate-limit`, input validation.
- **Data Scraping**: Server-side scrapers collect threat intelligence data.
- **Caching**: In-memory response cache with TTL-based expiration (1-10 minutes), auto-clears every 15-minute scraper refresh.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts` for entities like CVEs, ransomware, threat actors, and user data.

### Key Design Patterns
- **Shared Types**: `shared/` for common definitions.
- **Storage Abstraction**: `server/storage.ts` for database operations.
- **API Hooks**: `client/src/lib/api.ts` for React Query integrations.
- **Path Aliases**: `@/` for client, `@shared/` for shared code.

### Features
- **Threat Intelligence**: Aggregates NVD, CISA KEV, URLhaus, OpenPhish, and many more, with 15-minute refresh cycles.
- **Security Tools**: Includes IP/Domain WHOIS, Port Scanner, Threat Database Check, Shodan Integration, Password Strength Checker, Subnet Calculator, Encoding/Decoding, Email Header Analyzer, SSL Certificate Checker, Hash Analyzer, and advanced threat lookups.
- **IOC Search** (`/ioc-search`): Unified Indicator of Compromise search across 40+ feeds. Detects IP/domain/hash/URL/CVE types automatically, correlates results from multiple sources, and displays overall risk score.
- **Cyber Risk Score Calculator** (`/risk-score`): Free 12-question SMB security assessment. Generates letter grade (A+ to F), category breakdowns, weak area identification, prioritized recommendations, and downloadable report.
- **ICS-CERT Advisories** (`/ics-advisories`): CISA ICS-CERT industrial control system advisories with severity/vendor filtering and statistics dashboard.
- **MITRE ATT&CK Mapping**: Threat actor profiles include mapped ATT&CK techniques and tactic breakdown visualization. Static mapping in `shared/mitre-attack.ts`.
- **STIX 2.1 Export** (`/api/export/stix`): Export threat data (IPs, URLs, CVEs, CISA KEV) as STIX 2.1 bundles. Supports type filtering and download mode.
- **Data Export**: CSV and JSON export buttons on breaches and threat-actors pages via `useExportData` hook.
- **Contact Page** (`/contact`): Professional contact form with 7 category types (general, incident, consulting, sales, support, vulnerability, partnership), emergency hotline banner, response times, business hours, and contact info sidebar. Submissions stored in `contact_messages` table and forwarded via email. Rate-limited.
- **About Page** (`/about`): Enhanced with stats grid, mission, services, platform capabilities, why-us checklist, and CTA section linking to contact page. SEO-optimized title and description.
- **Communication Systems**: Newsletter system, Quo Phone System integration for emergency hotline and SMS, and email notifications for alerts and digests.
- **Public API v1** (`/api/v1/*`): 10 RESTful endpoints (CVEs, ransomware, malicious IPs/URLs, CISA KEV, threat actors, stats, IOC lookup, key usage) with pagination, filtering, and JSON responses. Authenticated via `X-API-Key` or `Authorization: Bearer` headers. Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-Daily-Quota-Remaining`) on every response. Documented at `/api-docs`.
- **API Key System** (`server/apiKeyAuth.ts`): SHA-256 hashed keys with `stbcs_pro_*` / `stbcs_biz_*` prefixes. Per-key rate limiting (60/min Pro, 120/min Business), daily quotas (1K Pro, 10K Business), live IOC lookup caps (50/day Pro, 200/day Business). Key creation/revocation UI in account page.
- **Monitor Alert Engine** (`server/monitorEngine.ts`): Runs after each scraper cycle. Processes watchlist items in batches (100), matches against recent CVEs/ransomware/IPs/URLs, sends email (Resend) and SMS (Quo) alerts. Deduplication via `monitor_alert_log` table prevents duplicate alerts.
- **Pro Tier Features**: User authentication, subscription management (Stripe integration), watchlist system with real-time alerts (email/SMS), two-way SMS messaging (Business exclusive), breach database, tiered API rate limiting, data export, and advanced search/scanning capabilities.
- **Security & US Compliance**: Implements robust security headers, httpOnly/secure cookies, API logging controls, strict rate limiting, and comprehensive consent flows/legal pages (CCPA/CPRA, COPPA, CAN-SPAM).
- **Authentication**: Secure signup/login with bcrypt, cryptographic session tokens, and database-backed sessions.
- **Logging**: Structured logging with configurable levels, specialized for scraper, maintenance, and routine operations.
- **Live Chat Widget**: Floating chat bubble on every page (except /messages) that lets website visitors chat with the STBCS team via SMS. Visitors enter phone number + TCPA consent, messages are stored in `sms_messages` with `[LIVE CHAT]` prefix for admin identification, replies from the Business Messages inbox go back to the visitor. Sessions tracked in `live_chat_sessions` table. Rate-limited at 20 req/min. Polls every 5s for new messages.
- **Maintenance & Monitoring**: Scheduled data cleanup, critical error reporting to admin, daily health checks, weekly admin reports, and automated management of promotional sales.

## External Dependencies

### Data Sources (Free Public Feeds)
- NVD API (`services.nvd.nist.gov`)
- CISA KEV (`www.cisa.gov`)
- URLhaus (`urlhaus-api.abuse.ch`)
- OpenPhish (`openphish.com`)
- Feodo Tracker (`feodotracker.abuse.ch`)
- SANS DShield (`isc.sans.edu`)
- Tor Exit Nodes (`check.torproject.org`)
- SSL Blacklist (`sslbl.abuse.ch`)
- Shodan InternetDB (`https://internetdb.shodan.io`)
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
- PostgreSQL (via `DATABASE_URL` environment variable)
- `connect-pg-simple` (for session storage)

### Key NPM Packages
- `drizzle-orm`, `drizzle-zod`
- `@tanstack/react-query`
- `recharts`
- `express-rate-limit`
- `zod`
- `date-fns`
- `stripe`, `stripe-replit-sync`

### Payment Gateway
- Stripe (subscriptions and donations via PCI-compliant embedded checkout using `@stripe/react-stripe-js`). Checkout stays on-site (/checkout), returns to /checkout/return. PII stored in sessionStorage, never in URLs. Webhooks managed via stripe-replit-sync.

### SEO
- **Server-Side Meta Injection** (`server/seo.ts`): Every route gets correct title, description, canonical URL, OG tags, and Twitter cards injected server-side before HTML reaches the browser. Works for both dev (Vite middleware intercept) and production (static.ts).
- **Dynamic Routes**: `/group/:name` gets dynamic ransomware group-specific meta tags.
- **noindex**: Transactional/private pages (checkout, account, messages, style-preview) get `noindex, nofollow` in both robots meta tag and `X-Robots-Tag` HTTP header.
- **Structured Data**: Organization, WebSite, ProfessionalService, FAQPage, WebApplication, Dataset, and SiteNavigationElement ItemList schemas.
- **useDocumentTitle hook** (`client/src/lib/use-document-title.ts`): Client-side meta tag updates for SPA navigation (title, description, OG, Twitter, canonical).
- **Sitemap**: Dynamic XML sitemap with all public pages + all ransomware group profile pages.
- **robots.txt**: Allows all public pages, disallows /api, /admin, /account, /checkout, /messages, /style-preview. Includes Googlebot and Bingbot specific rules.

### Security & US Compliance
- **Security Headers**: CSP (unsafe-eval removed in production), HSTS (preload), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy (same-origin), Cross-Origin-Resource-Policy (same-origin), frame-ancestors none. X-Powered-By disabled.
- **Authentication**: bcrypt (12 rounds), 12-char minimum passwords with uppercase+lowercase+number complexity requirement. Per-account lockout after 5 failed attempts (15-minute cooldown). Per-IP rate limiting (10 attempts/15 min). Lockout triggers email alert to user + admin notification. Admin can manually unlock via `POST /api/admin/unlock-account` (header auth).
- **Sessions**: 7-day expiry, cryptographic tokens (32 bytes), httpOnly/secure/sameSite=lax cookies. Session tokens never in API JSON responses or URLs.
- **Rate Limiting**: Auth: 10/15min. General API: 100/min. Tools: 10/min (free), 60/min (pro), 120/min (business). Live chat: 20/min. API v1: 60/min (Pro), 120/min (Business) with daily quotas (1K/10K).
- **Admin/Internal APIs**: Header-only authentication (no query string keys). Dedicated INTERNAL_API_KEY required (no fallback). ADMIN_STATS_KEY required with 16+ char minimum.
- **Error Handling**: 500-level errors return generic messages, never leak internal details. All errors logged server-side and critical errors reported to admin.
- **Consent Flows**: Signup (Terms+Privacy+age 18+), Subscriptions (Terms+Privacy+recurring billing), Donations (Terms+Privacy+non-refundable), Newsletter (Privacy consent checkbox), SMS alerts (TCPA consent with SMS Terms+Privacy), Two-way SMS messaging (consent checkbox before first message), Live Chat (TCPA consent before chat start).
- **Legal Pages**: Privacy Policy (CCPA/CPRA, COPPA, CAN-SPAM, SMS/TCPA, data breach 72hr, Do Not Track). Terms of Service (DMCA, SMS/TCPA, governing law, AAA arbitration, export compliance). SMS Terms & Conditions (TCPA, CTIA, STOP/HELP, carrier disclaimers, data rates, message frequency).
- **SMS Compliance**: Dedicated /sms-terms page. TCPA express written consent required via checkbox before enabling SMS alerts or sending SMS. STOP/HELP keywords documented. Carrier liability disclaimers. "Consent not required to purchase" disclosure.