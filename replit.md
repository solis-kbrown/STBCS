# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence. The platform aggregates data from over 40 free public threat intelligence feeds to track ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. The company offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services for small to medium-sized businesses.

**Domain**: www.stbcybersecurity.com
**Brand**: STB Cybersecurity (STBCS)
**Emergency Hotline**: (855) STB-1987
**Contact Email**: info@stbcybersecurity.com, support@stbcybersecurity.com

**Key capabilities:**
- Aggregates and displays real-time threat intelligence data.
- Professional services for incident response and recovery.
- Provides insights into ransomware, vulnerabilities, and threat actors.

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
- **Build Tool**: Vite.
- **Internationalization**: Supports 10 languages with browser auto-detection and localStorage persistence.

### Backend
- **Runtime**: Node.js with Express 5.
- **Language**: TypeScript with ESM modules.
- **API Design**: RESTful JSON API (`/api/*`) with Zod validation.
- **Security**: `express-rate-limit` for rate limiting, input validation.
- **Data Scraping**: Server-side scrapers collect data from external threat intelligence sources.
- **Caching**: In-memory response cache (`server/cache.ts`) with TTL-based expiration. Cache auto-clears after every 15-minute scraper refresh. Cache-Control headers for browser/CDN caching. X-Cache header indicates HIT/MISS.
  - Stats: 2min, CVEs/Ransomware/IPs/URLs/News: 3min, KEV/Feeds/Actors/Trends: 5min, Search: 1min, Sale: 10min
  - Client-side React Query uses staleTime (2-5min) and refetchInterval (5-15min) aligned with server cache TTLs.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts`.
- **Key Tables**: `users`, `cves`, `ransomwareIncidents`, `threatActors`, `newsArticles`, `maliciousIps`, `maliciousUrls`, `cisaKev`, `threatFeeds`, `subscriptions`, `newsletterSubscriptions`, `smsMessages`.
- **Migrations**: Managed with `drizzle-kit push`.

### Key Design Patterns
- **Shared Types**: `shared/` directory for common definitions.
- **Storage Abstraction**: `server/storage.ts` for database operations.
- **API Hooks**: `client/src/lib/api.ts` for React Query integrations.
- **Path Aliases**: `@/` for client, `@shared/` for shared code.

### Features
- **Threat Intelligence**: Aggregates NVD, CISA KEV, URLhaus, OpenPhish, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, and many more. Refreshes every 15 minutes.
- **Security Tools**: IP WHOIS Lookup, Domain WHOIS Lookup, Port Scanner, Threat Database Check, Shodan InternetDB Integration, Password Strength Checker, Subnet/CIDR Calculator, Base64/URL Encoder-Decoder, Email Header Analyzer, SSL Certificate Checker, Hash Analyzer, Advanced Nmap Port Scanner (Pro/Business), Email Security Check (MXToolbox-style: MX, SPF, DMARC analysis with scoring/grading - DKIM requires manual selector), ThreatFox IOC Lookup (malware IOCs), Malware Bazaar Hash Lookup, SSL Labs Security Grade, URLScan.io Domain Search, PhishTank URL Check, Enhanced IP Geolocation.
- **Newsletter System**: Subscription management with customizable frequency and content preferences.
- **Quo Phone System Integration**: Emergency hotline (855) STB-1987, SMS notifications, and incident alerts.
- **Email Notifications**: Automated daily/weekly security digests and alert notifications (ransomware, CVE, breach).
- **Global Search**: Unified search across all threat data.

### Pro Tier Features (10 Features)
1. **User Authentication**: Secure signup/login with bcrypt password hashing (12 salt rounds), session management via httpOnly cookies (30-day expiration).
2. **Subscription Management**: Stripe-integrated tier system (Supporter, Pro, Business) with automatic tier assignment.
3. **Watchlist System**: Track CVEs, IPs, domains, ransomware groups, keywords, sectors, and countries. CRUD operations with real-time updates. Toggle email alerts (Pro+) and SMS alerts (Business only) per item.
4. **Real-time Alerts**: Notification system for watchlist matches with severity levels and read/unread tracking. Email notifications when `emailOnMatch` is enabled. SMS alerts for Business users when `smsOnMatch` is enabled.
5. **Two-Way SMS Messaging** (Business Exclusive): Messages page for Business subscribers with conversation threading, send/receive SMS via (855) STB-1987, read/unread tracking, and OpenPhone webhook integration for incoming messages.
6. **Breach Database**: Searchable breach intelligence with verified status, data classes, and affected account counts.
7. **API Rate Limiting**: Tiered rate limits (free: 10/min, pro: 60/min) with middleware enforcement.
8. **Export Capabilities**: CSV/JSON export for CVEs, ransomware, IPs, URLs, KEV data (up to 5000 records).
9. **Advanced Search**: Multi-filter search across all threat data with date ranges, severity, and type filters.
10. **Advanced Nmap Port Scanner**: Nmap-style port scanner with service detection, banner grabbing, custom port ranges (up to 500 ports). Includes abuse prevention: 30-second cooldown, 20 scans/hour, daily limits (Pro: 30, Business: 100). Internal/private IP scanning blocked.
11. **Instant Critical Alerts** (Business Exclusive): Automatic email and SMS notifications for critical CVEs (CVSS 9.0+) and new ransomware incidents. Business users with phone numbers and SMS enabled receive real-time alerts via OpenPhone integration.

### Authentication System
- **Backend**: `server/auth.ts` - Password hashing, session tokens, verification
- **Routes**: POST `/api/auth/signup`, POST `/api/auth/login`, POST `/api/auth/logout`, GET `/api/auth/me`
- **Frontend**: `AuthProvider` context in `client/src/lib/auth.tsx`, `AuthModal` component
- **Middleware**: `requireAuth` and `requirePro` for protected routes
- **Sessions**: Stored in database with 30-day expiration, automatic cleanup

### Maintenance & Monitoring
- **Backend**: `server/maintenance.ts` - Scheduled cleanup, error reporting, sale management
- **Admin Email**: kbpc.inc@gmail.com - Receives critical errors, daily health checks, maintenance alerts
- **Cleanup**: Expired sessions cleaned every 5 minutes, old data (365 days) cleaned weekly on Sundays at 3am UTC
- **Error Reporting**: Critical server errors (500+) automatically emailed to admin with stack traces
- **Health Checks**: Daily at 8am UTC with platform statistics
- **Grand Opening Sale**: Automatically expires 30 days after deployment, admin notified when it ends
- **API**: GET `/api/sale-status` - Returns sale active status, end date, and days remaining

### Deployment
- **Development**: `npm run dev` (Express + Vite HMR).
- **Production**: `npm run build` (esbuild for server, Vite for client). Serves client from `dist/public`.

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

### Database
- PostgreSQL (via `DATABASE_URL` environment variable).
- `connect-pg-simple` for session storage.

### Key NPM Packages
- `drizzle-orm`, `drizzle-zod`
- `@tanstack/react-query`
- `recharts`
- `express-rate-limit`
- `zod`
- `date-fns`
- `stripe`, `stripe-replit-sync`

## Stripe Payment Integration

### Overview
All payments are processed through Stripe-hosted checkout pages (checkout.stripe.com). No payment data or sensitive PII is stored on our servers.

### Membership Tiers
- **STBCS Supporter**: $9.99/month (or $99.90/year) - Basic support tier
- **STBCS Pro**: $29.99/month (or $299.90/year) - Full access to Pro features
- **STBCS Business**: $99.99/month (or $999.90/year) - Enterprise-grade features

### Donations
One-time contributions: $5, $10, $25, $50, $100, or custom amounts

### API Endpoints
- `GET /api/stripe/products` - Lists products with prices synced from Stripe
- `POST /api/stripe/checkout` - Creates subscription checkout session
- `POST /api/stripe/donate` - Creates one-time donation checkout
- `POST /api/stripe/webhook` - Handles Stripe webhook events (auto-managed)

### Key Files
- `server/stripeClient.ts` - Stripe client and credential management
- `server/stripeService.ts` - Stripe API operations
- `server/webhookHandlers.ts` - Webhook processing
- `server/seed-stripe-products.ts` - Product creation script

### Security
- Payments processed on Stripe's secure checkout pages
- No card data touches our servers
- Webhook signatures validated for authenticity
- Customer portal for self-service subscription management

## Threat Intelligence Feeds Reference (40+ Sources)

### Currently Implemented (No API Key Required) - 25 Feeds
| Feed | Data Type | Status |
|------|-----------|--------|
| NVD API | CVEs/Vulnerabilities | Active |
| CISA KEV | Known Exploited Vulnerabilities | Active |
| CIRCL CVE-Search | Enhanced CVE Data | Active |
| OpenPhish | Phishing URLs | Active |
| Feodo Tracker | Banking Trojan C2s | Active |
| SANS DShield | Top Attacking IPs | Active |
| Tor Exit Nodes | Anonymization IPs | Active |
| IPsum | Aggregated Malicious IPs | Active |
| Blocklist.de | Attack IPs | Active |
| CINS Army | Bruteforce IPs | Active |
| GreenSnow | Attacker IPs | Active |
| EmergingThreats | Compromised IPs | Active |
| Spamhaus DROP | Hijacked Netblocks | Active |
| FireHOL Level1 | High-Confidence Malicious IPs | Active |
| C2 Tracker | Command & Control IPs | Active |
| RansomLook | Ransomware Incidents | Active |
| Ransomware.live | Ransomware Victims & Groups | Active |
| CleanTalk | HTTP Spammers | Active |
| C2IntelFeeds | C2 Infrastructure | Active |
| Dataplane SSH | SSH Bruteforce IPs | Active |
| BinaryDefense | Threat Intel IPs | Active |
| Turris Sentinel | Router Attack Detection | Active |
| Ransomwhere | Bitcoin Ransomware Payments | Active |
| Cisco Talos | Enterprise IP Blocklist | Active |
| ThreatFeeds.io | Aggregated Intelligence | Active |

### Premium APIs (FREE Accounts Required) - 9 Feeds
| Feed | Data Type | Free Tier | Env Variable | Get Account At |
|------|-----------|-----------|--------------|----------------|
| AlienVault OTX | IoCs, Malware, IPs | 10K req/hour | OTX_API_KEY | https://otx.alienvault.com |
| VirusTotal | File/URL Scanning | 500/day | VIRUSTOTAL_API_KEY | https://www.virustotal.com |
| Hybrid Analysis | Malware Sandbox | Unlimited* | HYBRID_ANALYSIS_API_KEY | https://hybrid-analysis.com |
| GreyNoise | Internet Scanners | 50/day | GREYNOISE_API_KEY | https://www.greynoise.io |
| CrowdSec | Malicious IPs | 50/day | CROWDSEC_API_KEY | https://www.crowdsec.net |
| Shodan | Internet Scanning | 100/month | SHODAN_API_KEY | https://account.shodan.io |
| Pulsedive | Community Intel | 100/day | PULSEDIVE_API_KEY | https://pulsedive.com |
| HoneyDB | Honeypot Attacker IPs | 1,500/month | HONEYDB_API_ID, HONEYDB_API_KEY | https://honeydb.io |
| AbuseIPDB | IP Abuse Reports | 1,000/day | ABUSEIPDB_API_KEY | https://abuseipdb.com |

*Hybrid Analysis requires account vetting for full API access

### Future Expansion Options
| Feed | Data Type | Notes |
|------|-----------|-------|
| URLScan.io | URL Analysis | 5K/day free tier |
| Vulners | CVE-to-Exploit Mapping | Free tier available |
| Shadowserver | Botnet Data | Free for non-commercial |