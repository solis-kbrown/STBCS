# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence by aggregating data from over 40 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses. The project aims to be a comprehensive hub for cybersecurity insights and professional services, focusing on becoming a leader in SMB cybersecurity.

## User Preferences

Preferred communication style: Simple, everyday language.
- Export/download features (CSV, JSON, STIX) are Pro/Business tier only — always gate behind auth check on both frontend and backend.

### Visual Theme: Stealth Mode
- **Accent Color**: Orange (#f97316 / orange-500)
- **Secondary**: Red (#ef4444)
- **Navigation Style**: Border-left-2 active state with orange accents
- **Icons**: Cyber-themed Lucide icons
- **Background**: Dark minimal (zinc-900/950)
- **Text**: Zinc-500 inactive, orange-400 active/accent

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

### Key Design Patterns
- **Shared Types**: For common definitions.
- **Storage Abstraction**: For database operations.
- **API Hooks**: For React Query integrations.
- **Path Aliases**: `@/` for client, `@shared/` for shared code.

### Features
- **Threat Intelligence**: Aggregates data from various sources with 15-minute refresh cycles.
- **Security Tools**: Offers IP/Domain WHOIS, Port Scanner, Threat Database Check, Password Strength Checker, Subnet Calculator, and more.
- **IOC Search**: Unified Indicator of Compromise search across 40+ feeds.
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
- **Pro Tier Features**: User authentication, subscription management, watchlist system, breach database, tiered API, and advanced search/scanning.
- **Security & US Compliance**: Implements robust security headers, secure cookies, API logging, rate limiting, and consent flows (CCPA/CPRA, COPPA, CAN-SPAM).
- **Authentication**: Secure signup/login with bcrypt and cryptographic session tokens.
- **Logging**: Structured logging for various operations.
- **Live Chat Widget**: Floating chat bubble for visitor interaction via SMS.
- **Maintenance & Monitoring**: Scheduled data cleanup, error reporting, and health checks.

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