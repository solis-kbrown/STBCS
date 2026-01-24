# Stop The Bleed CS - Cybersecurity Threat Intelligence Platform

## Overview

Stop The Bleed CS (stoptbcs.com) is a real-time cybersecurity threat intelligence platform that tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. The application aggregates data from 15+ free public threat intelligence feeds and provides a comprehensive dashboard for monitoring active threats, ransomware groups, and critical security events.

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

### Expanded Threat Intelligence System
- 15+ free public threat intelligence feed sources integrated:
  - **NVD** - National Vulnerability Database CVEs
  - **CISA KEV** - Known Exploited Vulnerabilities catalog
  - **URLhaus** - Malicious URL database
  - **OpenPhish** - Phishing URL feed
  - **Feodo Tracker** - Banking trojan C2 servers
  - **SANS DShield** - Top attacking IP addresses
  - **Tor Exit Nodes** - Tor network exit node IPs
  - **SSL Blacklist** - Malicious SSL certificate IPs
  - **Pro tier feeds** (placeholder): AlienVault OTX, VirusTotal, Shodan, GreyNoise, CrowdSec, Pulsedive, ThreatFox

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
- `GET /api/threat-actors` - Threat actor profiles
- `GET /api/news?limit=&offset=&category=` - Security news feed
- `GET /api/malicious-ips?limit=&offset=&source=&threatType=` - Malicious IP addresses
- `GET /api/malicious-urls?limit=&offset=&source=&threatType=` - Malicious URLs
- `GET /api/cisa-kev?limit=&offset=` - CISA Known Exploited Vulnerabilities
- `GET /api/threat-feeds` - All registered threat feed sources
- `POST /api/refresh` - Manual data refresh trigger

### Frontend Pages
- **Dashboard** (`/`) - Overview with 7 stat cards and threat velocity chart
- **Ransomware Tracker** (`/ransomware`) - Ransomware incidents and group activity
- **Exploits & CVEs** (`/exploits`) - Vulnerability database with search
- **Threat Feeds** (`/threat-feeds`) - All threat intel sources with tabs for IPs, URLs, KEV
- **Intel & News** (`/news`) - Curated security news feed

### Data Refresh
- Automatic refresh scheduler runs every 30 minutes
- Rate limiting between feed fetches (1-2s delays)
- Error handling and logging for each feed

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
