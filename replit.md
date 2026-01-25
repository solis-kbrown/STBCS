# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity provides professional cybersecurity services and real-time threat intelligence. The platform aggregates data from over 31 free public threat intelligence feeds to track ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. The company offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services for small to medium-sized businesses.

**Key capabilities:**
- Aggregates and displays real-time threat intelligence data.
- Professional services for incident response and recovery.
- Provides insights into ransomware, vulnerabilities, and threat actors.

## User Preferences

Preferred communication style: Simple, everyday language.

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

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts`.
- **Key Tables**: `users`, `cves`, `ransomwareIncidents`, `threatActors`, `newsArticles`, `maliciousIps`, `maliciousUrls`, `cisaKev`, `threatFeeds`, `subscriptions`, `newsletterSubscriptions`.
- **Migrations**: Managed with `drizzle-kit push`.

### Key Design Patterns
- **Shared Types**: `shared/` directory for common definitions.
- **Storage Abstraction**: `server/storage.ts` for database operations.
- **API Hooks**: `client/src/lib/api.ts` for React Query integrations.
- **Path Aliases**: `@/` for client, `@shared/` for shared code.

### Features
- **Threat Intelligence**: Aggregates NVD, CISA KEV, URLhaus, OpenPhish, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, and many more. Refreshes every 15 minutes.
- **Security Tools**: IP WHOIS Lookup, Domain WHOIS Lookup, Port Scanner, Threat Database Check, Shodan InternetDB Integration.
- **Newsletter System**: Subscription management with customizable frequency and content preferences.
- **Quo Phone System Integration**: Emergency hotline (855) STB-1987, SMS notifications, and incident alerts.
- **Email Notifications**: Automated daily/weekly security digests and alert notifications (ransomware, CVE, breach).
- **Pro Tier Features**: Alerts, notifications, watchlist management, breach database.
- **Global Search**: Unified search across all threat data.

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