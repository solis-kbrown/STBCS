# Stop The Bleed CS - Cybersecurity Threat Intelligence Platform

## Overview

Stop The Bleed CS (stoptbcs.com) is a real-time cybersecurity threat intelligence platform that tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, and security news. The application aggregates data from sources like the NVD (National Vulnerability Database) and provides a dashboard for monitoring active threats, ransomware groups, and critical security events.

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
- **API Design**: RESTful JSON API under `/api/*` routes
- **Data Fetching**: Server-side scrapers pull from external sources (NVD API for CVEs)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all tables
- **Key Tables**:
  - `users` - User accounts with tier-based access
  - `cves` - Vulnerability database with CVSS scores and severity
  - `ransomwareIncidents` - Tracked ransomware attacks and victims
  - `threatActors` - Known threat groups and their TTPs
  - `newsArticles` - Curated security news and intel
- **Migrations**: Managed via `drizzle-kit push` command

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory are used by both frontend and backend
- **Storage Interface**: `server/storage.ts` provides abstracted database operations
- **API Hooks**: `client/src/lib/api.ts` contains React Query hooks for all API endpoints
- **Component Aliases**: Path aliases configured (`@/` for client, `@shared/` for shared code)

### Build and Deployment
- **Development**: `npm run dev` starts Express server with Vite middleware for HMR
- **Production Build**: `npm run build` uses esbuild for server and Vite for client
- **Static Serving**: Production serves built client from `dist/public`

## Recent Changes (January 2026)

### Data Harvesting Implementation
- NVD API integration fetches real CVE data from last 7 days
- Automatic data refresh scheduler runs every 30 minutes
- Simulated ransomware incidents from 10 known threat groups
- Sample cybersecurity news articles seeded

### API Endpoints
- `GET /api/stats` - Dashboard statistics (active groups, critical CVEs, exploits, total incidents)
- `GET /api/cves?limit=&offset=&search=` - Paginated CVE list with search
- `GET /api/ransomware?limit=&offset=&group=&sector=` - Ransomware incidents with filters
- `GET /api/ransomware/groups` - Active ransomware groups with incident counts
- `GET /api/threat-actors` - Threat actor profiles
- `GET /api/news?limit=&offset=&category=` - Security news feed
- `POST /api/refresh` - Manual data refresh trigger

### Frontend Integration
- React Query hooks in `client/src/lib/api.ts` for all endpoints
- Auto-refresh intervals: stats (60s), CVEs/ransomware/news (120s), groups (300s)
- Loading skeletons and empty states for better UX

## External Dependencies

### Data Sources
- **NVD API**: `services.nvd.nist.gov/rest/json/cves/2.0` for CVE data
- Planned integration with ransomware leak site monitoring and threat intelligence feeds

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Uses `connect-pg-simple` for session storage

### Third-Party Services (Configured but may need setup)
- Session management with `express-session`
- Optional integrations available: OpenAI, Google Generative AI, Stripe, Nodemailer

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod validation
- `@tanstack/react-query` - Data fetching and caching
- `recharts` - Dashboard charts and visualizations
- `date-fns` - Date formatting utilities
- `zod` - Runtime type validation