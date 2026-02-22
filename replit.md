# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from over 40 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses. The project aims to be a comprehensive hub for cybersecurity insights and professional services.

## User Preferences

Preferred communication style: Simple, everyday language.

### Visual Theme: Stealth Mode
- **Accent Color**: Orange (#f97316 / orange-500)
- **Navigation Style**: Border-left-2 active state with orange accents
- **Icons**: Cyber-themed Lucide icons (GalleryVerticalEnd, Scan, Wrench, Activity, ShieldOff, Bug, Satellite, TrendingUp, Heart)
- **Background**: Dark minimal (zinc-900/950)
- **Text**: Zinc-500 inactive, orange-400 active/accent

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
- **Communication Systems**: Newsletter system, Quo Phone System integration for emergency hotline and SMS, and email notifications for alerts and digests.
- **Pro Tier Features**: User authentication, subscription management (Stripe integration), watchlist system with real-time alerts (email/SMS), two-way SMS messaging (Business exclusive), breach database, tiered API rate limiting, data export, and advanced search/scanning capabilities.
- **Security & US Compliance**: Implements robust security headers, httpOnly/secure cookies, API logging controls, strict rate limiting, and comprehensive consent flows/legal pages (CCPA/CPRA, COPPA, CAN-SPAM).
- **Authentication**: Secure signup/login with bcrypt, cryptographic session tokens, and database-backed sessions.
- **Logging**: Structured logging with configurable levels, specialized for scraper, maintenance, and routine operations.
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
- **Security Headers**: CSP, HSTS (preload), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. X-Powered-By disabled.
- **Cookies**: All cookies httpOnly, secure, sameSite=lax. Session tokens never in API JSON responses.
- **Rate Limiting**: Auth: 10/15min. General API: 100/min. Tools: 10/min (free), 60/min (pro).
- **Consent Flows**: Signup (Terms+Privacy+age 18+), Subscriptions (Terms+Privacy+recurring billing), Donations (Terms+Privacy+non-refundable), Newsletter (Privacy consent checkbox), SMS alerts (TCPA consent with SMS Terms+Privacy), Two-way SMS messaging (consent checkbox before first message).
- **Legal Pages**: Privacy Policy (CCPA/CPRA, COPPA, CAN-SPAM, SMS/TCPA, data breach 72hr, Do Not Track). Terms of Service (DMCA, SMS/TCPA, governing law, AAA arbitration, export compliance). SMS Terms & Conditions (TCPA, CTIA, STOP/HELP, carrier disclaimers, data rates, message frequency).
- **SMS Compliance**: Dedicated /sms-terms page. TCPA express written consent required via checkbox before enabling SMS alerts or sending SMS. STOP/HELP keywords documented. Carrier liability disclaimers. "Consent not required to purchase" disclosure.