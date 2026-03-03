# STB Cybersecurity (STBCS) - Frontline Threat Intelligence & Security Services

## Overview

STB Cybersecurity delivers professional cybersecurity services and real-time threat intelligence by aggregating data from over 73 free public threat intelligence feeds. The platform tracks ransomware incidents, CVEs/vulnerabilities, exploits, zero-days, malicious IPs/URLs, and security news. STBCS offers Cybersecurity Consulting, Incident Response, Ransomware Recovery & Restoration, and Threat Hunting services, primarily for small to medium-sized businesses. The project aims to be a comprehensive hub for cybersecurity insights and professional services, striving to become a leader in SMB cybersecurity.

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
- **Visual Theme**: "Stealth Mode / Tactical Operations Center" featuring dark minimal background, orange/red accents, cyber-themed Lucide icons, interactive cards, and various animations (e.g., `hero-scan-line`, `skeleton-shimmer`). Typography uses Orbitron, Inter, and JetBrains Mono. Accessibility includes `prefers-reduced-motion` support. Custom branded SVG icon components (`client/src/components/branded-icons.tsx`) for SSH (terminal+shield+lock), RDP (monitor+scan line), Telnet (globe+network+pulse), SFTP (folder+arrows+lock), KB (book+shield+data stream), and Profile (hexagonal user frame) with inline SVG animations.
- **Sidebar Navigation**: Organized into 7 collapsible sections using Radix Collapsible: Main (always open), Security Scanners, Monitoring & Reports (PRO), Remote Access (BIZ), Threat Intelligence, Community & Resources, Support & Info. Section open/closed state persists in localStorage (`sidebar-sections`). Active route auto-expands its parent section. Section headers show tier badges when all items share a tier.

### Backend
- **Runtime**: Node.js with Express 5, TypeScript (ESM modules).
- **API Design**: RESTful JSON API (`/api/*`) with Zod validation.
- **Security**: Rate limiting, input validation, login timing attack protection, CSRF protection.
- **Data Scraping**: Server-side scrapers for threat intelligence.
- **Caching**: In-memory response cache with TTL, startup warm-up, session auth caching.
- **Performance**: Parallelized DB queries, in-memory `index.html` caching.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM with an optimized connection pool (max 20, idle 20s, connection timeout 20s, statement timeout 60s).
- **Schema**: Defined for CVEs, ransomware, threat actors, and user data.
- **Integrity**: Unique constraints and atomic upserts (`onConflictDoUpdate`) for race-condition-free writes.
- **Transactions**: Multi-step operations use `db.transaction()` for atomicity.
- **Startup**: Two-stage ESM launcher (`dist/start.js`) opens port 5000 instantly, serves health checks immediately before loading app bundle (100ms delay before dynamic import). `/health` returns JSON `{"status":"ok"}` (application/json), `/__repl` returns plain text `ok`. Once Express is ready, launcher delegates ALL requests (including `/`) to Express — no more intercepting `/` at the launcher level. Express `/` is handled by the SPA catch-all with SEO meta tag injection. `express.static` uses `index: false`. App init retries indefinitely, never calls `process.exit(1)`. Fully non-blocking staggered service initialization: Digest (+5s), Maintenance (+8s), KB Scraper (+11s), Uptime (+14s), Dark Web (+17s), Stripe (+20s), Scrapers (+23s), Cache warm-up (+26s). Server bundle uses ESM format with esbuild banner for `__dirname`/`require` polyfills. PostgreSQL SSL warnings suppressed via `uselibpqcompat=true`.

### Key Design Patterns
- Shared Types, Storage Abstraction, API Hooks (for React Query), Path Aliases (`@/`, `@shared/`).

### Features
- **Threat Intelligence Aggregation**: 15-minute refresh cycles from diverse sources.
- **Security Tools**: IP/Domain WHOIS, Port Scanner, Threat Database Check, Password Strength, Subnet Calculator, Email Header Analyzer, Encoding/Decoding, File Scanner, SSL/TLS Checker, Web Server Fingerprinter, Exchange Server Checker, DNS Security Analyzer, HTTP Security Headers Scanner.
- **Pro/Business Features**: Monitoring Suite (uptime with Recharts response time area charts and 24h/7d/30d stats, SSL certificate tracking, dark web scanning), Incidents tab with type/status filtering and summary stats (total, ongoing, resolved, SSL, total downtime), Attack Surface Discovery, Threat Intelligence Reports (on-demand/scheduled), Remote Desktop, SSH Terminal, Telnet Client, SFTP Client.
- **Core Security Capabilities**: IOC Search, Cyber Risk Score Calculator, ICS-CERT Advisories, MITRE ATT&CK Mapping, STIX 2.1 Export, Groups Directory.
- **User & Subscription Management**: Authentication, subscription tiers (Supporter, Pro, Business, Unlimited Everything), API Key System, Monitor Alert Engine. Dedicated `/pricing` page with full feature comparison matrix (9 categories, 70+ features), monthly/annual toggle, collapsible sections, FAQ accordion, and Stripe billing portal integration for upgrades/downgrades. All upgrade links across the app route to `/pricing`.
- **Communication & Support**: Newsletter, Quo Phone System integration, email notifications, Contact Page, About Page, Live Chat Widget, Knowledge Base & Community Hub (with RBAC, content scraping, moderation, gamification ranks, post sorting [newest/popular/discussed/trending/views], comment sorting [oldest/newest/best], popular tag cloud sidebar, bookmarks for paid users, view count tracking, related posts, contributor badges [Top Contributor/Rising Star]).
- **User Profiles**: Public profile pages at `/user/:username` with avatar, display name, bio, location, website, company, tier badge, KB reputation rank/progress bar, post/comment stats, recent posts. Profile editing on account page with privacy toggles (profilePublic, showEmail). Author names linked to profiles throughout KB listing and post pages.
- **Admin KB Reporting**: Daily health check and weekly admin report include KB activity stats (new posts, comments, votes, views, top posts, top contributors, pending moderation).
- **Feedback & Bug Reports**: Public feedback system at `/feedback` — any user (even unauthenticated) can report bugs, site issues, feature requests, recommendations, or security concerns. Rate-limited. Admin dashboard for review/status tracking.
- **Security & Compliance**: Robust security headers, secure cookies, API logging, rate limiting, consent flows (CCPA/CPRA, COPPA, CAN-SPAM), legal pages. KB anti-cheat: self-vote prevention, transaction-wrapped voting, SQL injection hardened (inArray), content length limits (200/50K/5K chars), tag limits (10 tags, 50 chars each), reputation cap (10,000), admin-only delete for posts/comments.
- **Brand Kit**: Comprehensive brand asset hub at `/brand-kit` with 10 categories (107 total styles) — Email Signatures (15 styles), PDF Letterheads (12 styles), Business Cards (12 styles, front+back), Invoice/Quote Templates (10 styles), Social Media Banners (12 styles across Twitter/LinkedIn/YouTube/Facebook/Instagram/Discord/Twitch), Presentation Headers (10 styles, 16:9), Meeting Backgrounds (10 styles, CSS art), Report Covers (10 styles), Pitch Deck Covers (8 styles), Certificate Templates (8 styles). All with live preview, customizable fields, copy HTML, and print/PDF support. Visual Customization section links to Logo Themes, Hero Backgrounds, and Style Preview pages.
- **Interactive Playbooks**: 5 incident response guides.
- **Service Status Dashboard**: Monitors 37+ services across 8 categories — STBCS services (Platform, API, Feeds, Monitoring, KB), cloud providers (AWS, Azure, GCP, DigitalOcean, Oracle, IBM), CDN/DNS (Cloudflare, Fastly, Akamai), security (CrowdStrike, Okta, SentinelOne, Datadog, Splunk, PagerDuty, Let's Encrypt), communication (Slack, Twilio, M365, Google Workspace, Zoom), development (GitHub, Atlassian, HashiCorp, Docker Hub, npm), hosting (Vercel, Netlify, Render), and infrastructure (Stripe, Equinix). Live status checks via Statuspage.io APIs with 60s auto-refresh. Dashboard widget shows compact infrastructure health at a glance. Embedded in monitors page as "Service Status" tab.
- **Dark Web Intelligence**: Integration with deepdarkCTI.

## External Dependencies

### Data Sources (Free Public Feeds)
- NVD API, CISA KEV, URLhaus, OpenPhish, Feodo Tracker, SANS DShield, Tor Exit Nodes, SSL Blacklist, Shodan InternetDB.
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
- `ssh2`, `xterm.js` (for SSH/SFTP)
- `node-rdpjs` (for RDP)

### Payment Gateway
- Stripe (subscriptions and donations).

### SEO
- Server-Side Meta Injection with per-page keywords (`server/seo.ts` PageMeta `keywords` field), Dynamic Routes, `noindex` for transactional/private pages only (account, checkout, messages, style-preview, monitors, remote-access tools). File Scanner and Email Analyzer are now indexed.
- Hreflang tags for 10 languages (en, es, fr, de, pt, zh, ja, ko, ar, ru) plus x-default injected on every page via `injectMetaTags`.
- Structured Data: 7 JSON-LD blocks (Organization, WebSite with SearchAction, ProfessionalService, FAQPage, ItemList with 30 navigation elements, WebApplication with 25 features and 5 pricing tiers, Dataset, BreadcrumbList).
- Dynamic XML sitemap with 35+ static pages + dynamic threat actor group pages (~500). All public tool pages included (SSL Checker, DNS Analyzer, Headers Scanner, Web Fingerprinter, Exchange Checker, File Scanner, Email Analyzer, Encoding Tools, Playbooks, Service Status).
- `robots.txt` explicitly allows all public pages, disallows private/transactional pages and /monitors.
- `useDocumentTitle` hook for client-side title updates.

### Security & US Compliance
- Security Headers (CSP, HSTS, etc.), bcrypt for authentication, strong password policies, account lockout, time-limited cryptographic session tokens, tiered rate limiting, consent flows, legal pages, SMS compliance.