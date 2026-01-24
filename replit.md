# STB Cybersecurity (STBCS) - Real-Time Threat Intelligence Platform

## Overview

STB Cybersecurity (stoptbcs.com / stbcybersecurity.com) is a real-time cybersecurity threat intelligence platform that tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. The application aggregates data from 15+ free public threat intelligence feeds and provides a comprehensive dashboard for monitoring active threats, ransomware groups, and critical security events.

## Branding

- **Primary Name**: STB Cybersecurity / STBCS
- **Domains**: stoptbcs.com (primary), stbcybersecurity.com (secondary/redirect)
- **Twitter/Social**: @stoptbcs
- **Founder**: Kevin Brown
- **Contact Emails**:
  - info@stoptbcs.com - General inquiries
  - sales@stoptbcs.com - Sales and B2B services
  - support@stoptbcs.com - Customer support
  - billing@stoptbcs.com - Billing and payments

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom dark theme optimized for cybersecurity dashboard aesthetics
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful JSON API under `/api/*` routes with Zod validation
- **Security**: Rate limiting via express-rate-limit, input validation on all endpoints
- **Data Fetching**: Server-side scrapers pull from 15+ external threat intelligence sources

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all tables
- **Key Tables**:
  - `users` - User accounts with tier-based access
  - `cves` - Vulnerability database with CVSS scores and severity
  - `ransomwareIncidents` - Tracked ransomware attacks and victims
  - `threatActors` - Known threat groups and their TTPs (15 groups)
  - `newsArticles` - Curated security news and intel
  - `maliciousIps` - Tracked malicious IP addresses from multiple sources
  - `maliciousUrls` - Tracked malicious URLs (phishing, malware, C2)
  - `cisaKev` - CISA Known Exploited Vulnerabilities catalog
  - `threatFeeds` - Registry of all threat intelligence feed sources
  - `subscriptions` - Pro tier subscription management
- **Migrations**: Managed via `drizzle-kit push` command

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory are used by both frontend and backend
- **Storage Interface**: `server/storage.ts` provides abstracted database operations
- **API Hooks**: `client/src/lib/api.ts` contains React Query hooks for all API endpoints
- **Component Aliases**: Path aliases configured (`@/` for client, `@shared/` for shared code)
- **Rate Limiting**: General limit (100/min) and strict limit (30/min) for sensitive endpoints

### Build and Deployment
- **Development**: `npm run dev` starts Express server with Vite middleware for HMR
- **Production Build**: `npm run build` uses esbuild for server and Vite for client
- **Static Serving**: Production serves built client from `dist/public`

## Recent Changes (January 2026)

### Expanded Threat Intelligence System (31+ Sources)
- **Refresh Interval**: 15 minutes (configurable)
- **Total Sources**: 31+ free public threat intelligence feeds
- **Ransomware Sources**: Dual-source ransomware tracking (ransomware.live + ransomlook.io)

#### Core Vulnerability Feeds
- **NVD** - National Vulnerability Database CVEs
- **CISA KEV** - Known Exploited Vulnerabilities catalog

#### Malicious URL Feeds
- **URLhaus** - Malicious URL database (Abuse.ch)
- **OpenPhish** - Community phishing URL feed
- **PhishTank** - Verified phishing URLs
- **Bambenek C2** - DGA-based C2 domain intelligence
- **ThreatFox** - Malware IOC sharing platform
- **Malware Bazaar** - Fresh malware samples and hashes

#### IP Blocklist Feeds - Primary
- **IPsum** - Aggregated IPs from 30+ blocklists with confidence scoring
- **Feodo Tracker** - Banking trojan C2 server IPs
- **Feodo Recommended** - Recommended botnet C2 blocklist
- **SANS DShield** - Top attacking IP addresses
- **Tor Exit Nodes** - Tor network exit node IPs
- **Dan.me.uk Tor** - Alternative Tor exit node list
- **SSL Blacklist** - Malicious SSL certificate IPs
- **SSLBL Aggressive** - Aggressive SSL blacklist

#### IP Blocklist Feeds - Extended
- **Blocklist.de** - SSH, FTP, web server attack IPs
- **CINS Army** - Bruteforce and scanning IPs
- **GreenSnow** - Bruteforce attacker IPs
- **EmergingThreats** - Compromised host IPs
- **Spamhaus DROP** - Hijacked netblocks
- **FireHOL Level1** - High-confidence malicious IPs
- **C2 Tracker** - Command & Control server IPs

#### Pro Tier Feeds (require API keys)
- AlienVault OTX, VirusTotal, Shodan, GreyNoise, CrowdSec, Pulsedive, HoneyDB

### Security Enhancements
- API rate limiting (100 requests/min general, 30/min for threat data endpoints)
- Zod validation on all query parameters
- Secure fetch wrapper with 30s timeout for external APIs
- Input sanitization and max length constraints

### API Endpoints
- `GET /api/stats` - Dashboard statistics (7 threat categories)
- `GET /api/cves?limit=&offset=&search=` - Paginated CVE list with search
- `GET /api/ransomware?limit=&offset=&group=&sector=` - Ransomware incidents with filters
- `GET /api/ransomware/groups` - Active ransomware groups with incident counts
- `GET /api/ransomware/search?q=` - Search ransomware incidents
- `GET /api/threat-actors` - Threat actor profiles
- `GET /api/news?limit=&offset=&category=` - Security news feed
- `GET /api/malicious-ips?limit=&offset=&source=&threatType=` - Malicious IP addresses
- `GET /api/malicious-urls?limit=&offset=&source=&threatType=` - Malicious URLs
- `GET /api/cisa-kev?limit=&offset=` - CISA Known Exploited Vulnerabilities
- `GET /api/threat-feeds` - All registered threat feed sources
- `POST /api/refresh` - Manual data refresh trigger

#### Pro Tier - Alerts & Notifications
- `GET /api/notifications?userId=&limit=&unreadOnly=` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read
- `POST /api/notifications/:id/dismiss` - Dismiss notification

#### Pro Tier - Watchlist
- `GET /api/watchlist?userId=&itemType=` - Get user watchlist items
- `POST /api/watchlist` - Add item to watchlist (company, sector, cve, threat_actor, country, keyword)
- `PATCH /api/watchlist/:id` - Update watchlist item settings
- `DELETE /api/watchlist/:id?userId=` - Remove watchlist item

#### Pro Tier - Breach Database
- `GET /api/breaches?limit=&offset=&search=` - Get breach incidents
- `GET /api/breaches/search?q=` - Search breach database
- `GET /api/breaches/:id` - Get single breach details

### Frontend Pages
- **Dashboard** (`/`) - Overview with 7 stat cards and threat velocity chart
- **Global Search** (`/search`) - Unified search across all threat data with debounced input and tabbed results
- **Pro Alerts** (`/alerts`) - Pro tier alerting center with notifications, watchlist management, and breach database
- **Security Tools** (`/tools`) - Professional cybersecurity utilities:
  - IP WHOIS Lookup - Geolocation, ISP, ASN, organization details
  - Domain WHOIS Lookup - Registration info, DNS records, nameservers
  - Port Scanner - Common port scanning (Free: 10 ports, Pro: 17+ ports)
  - Threat Database Check - Check if IP is in our threat intelligence database
- **Ransomware Tracker** (`/ransomware`) - Ransomware incidents and group activity
- **Exploits & CVEs** (`/exploits`) - Vulnerability database with search
- **Threat Feeds** (`/threat-feeds`) - All threat intel sources with tabs for IPs, URLs, KEV
- **Intel & News** (`/news`) - Curated security news feed

### Pro/Admin Features
- **Global Search API** (`GET /api/search?q=&limit=`) - Search across CVEs, IPs, URLs, ransomware, KEV, news
- **Admin Stats** (`GET /api/admin/stats`) - Storage statistics for all data tables
- **Data Cleanup** (`POST /api/admin/cleanup`) - Trigger data retention cleanup (365-day default)
- **Export Data** (`GET /api/export/:type`) - Export CVEs, IPs, URLs, KEV, or ransomware as JSON

### Database Schema Extensions
- `userSettings` - Pro user preferences (theme, alerts, watchlists, dashboard layout)
- `savedSearches` - Saved search queries per user
- `auditLog` - Action tracking for admin monitoring
- `systemConfig` - Global system settings

### Data Refresh
- Automatic refresh scheduler runs every 15 minutes
- 30+ threat intelligence sources fetched per cycle
- Rate limiting between feed fetches (1-2s delays)
- Graceful error handling - individual feed failures don't stop other fetches
- Some external feeds may require API keys (noted in feed registry)

## External Dependencies

### Data Sources (Free Public Feeds)
- **NVD API**: `services.nvd.nist.gov/rest/json/cves/2.0`
- **CISA KEV**: `www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
- **URLhaus**: `urlhaus-api.abuse.ch/v1/urls/recent/`
- **OpenPhish**: `openphish.com/feed.txt`
- **Feodo Tracker**: `feodotracker.abuse.ch/downloads/ipblocklist.json`
- **SANS DShield**: `isc.sans.edu/api/sources/attacks/`
- **Tor Exit Nodes**: `check.torproject.org/torbulkexitlist`
- **SSL Blacklist**: `sslbl.abuse.ch/blacklist/sslipblacklist.json`

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Uses `connect-pg-simple` for session storage

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod validation
- `@tanstack/react-query` - Data fetching and caching
- `recharts` - Dashboard charts and visualizations
- `express-rate-limit` - API rate limiting
- `zod` - Runtime type validation
- `date-fns` - Date formatting utilities
