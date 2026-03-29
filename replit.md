# STB Cybersecurity (STBCS)

## Overview
Comprehensive cybersecurity threat intelligence platform for small and mid-sized businesses (SMBs). Aggregates 161 built-in threat intelligence feeds, provides 18+ security tools, real-time ransomware tracking, and professional security services with Stripe-based subscription tiers. Fully portable — deployable on any Linux VM, VPS, or cloud provider. See `SETUP.md` for deployment instructions.

## Architecture
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Express.js + TypeScript (Node.js 20)
- **Database:** PostgreSQL 16 with Drizzle ORM (52 tables)
- **Payments:** Stripe integration with 5 subscription tiers
- **Email:** Resend for transactional emails and alerts
- **Routing:** wouter (frontend), Express router (backend)

## Key Files
- `shared/schema.ts` — All 52 database table definitions with Drizzle ORM
- `server/routes.ts` — Main API routes (~7000 lines)
- `server/scrapers.ts` — 161 threat feed definitions and scraping logic
- `server/apiKeyAuth.ts` — API key authentication with tier-based rate limits
- `server/email.ts` — Resend email service (alerts, digests, lockout notifications)
- `server/stripeService.ts` — Stripe subscription management
- `server/uptimeEngine.ts` — Uptime monitoring background service
- `server/maintenance.ts` — Maintenance scheduler and admin notifications
- `client/src/App.tsx` — Frontend routing and page registration
- `client/src/pages/pricing.tsx` — Subscription tier pricing page
- `SETUP.md` — Complete deployment and setup guide for any environment

## Subscription Tiers (Permanent Professional Pricing)
- **Free:** $0 — Full threat dashboard + all 18 security tools + 160+ feeds
- **Supporter:** $14.99/mo ($149.90/yr) — Uptime monitoring (5 monitors), supporter wall
- **Pro:** $49.99/mo ($499.90/yr) — Dark web monitoring, API access, premium feeds, watchlists
- **Business:** $199.99/mo ($1,999.90/yr) — Attack surface scans, threat reports, SMS alerts, 25 monitors
- **Unlimited:** $499.99/mo ($4,999.90/yr) — Unlimited everything + priority support + white-label

## API Tier Limits (from apiKeyAuth.ts)
- **Pro:** 1 key, 60 rpm, 1K daily, 50 live lookups
- **Business/Enterprise:** 5 keys, 120 rpm, 10K daily, 200 live lookups
- **Unlimited:** 10 keys, 300 rpm, 100K daily, 1K live lookups

## Background Services
- Threat feed scrapers (every 15min–daily depending on feed, sequential with 1-2s stagger)
- Uptime monitoring engine (every 5 minutes, batches of 5)
- Dark web monitor scheduler (every 60 minutes)
- KB content scraper (every 4 hours)
- Weekly digest emailer
- Maintenance scheduler (every 15 minutes)
- Pulsedive API throttled to every 6 hours (free tier: 100 queries/day)
- InTheWild feed removed (GitHub repo permanently deleted; CISA KEV covers exploited CVEs)
- DB pool: 25 max connections (prod) / 15 (dev), 30s connection + idle timeout, health monitoring

## Admin
- Admin email: kbpc.inc@gmail.com
- Domain: stbcybersecurity.com
- Phone: (855) STB-1987

## Documents
- `STBCS_Technical_Report.md` / `.pdf` — Full platform technical report (20 pages)
- `STBCS_Vision_Roadmap.md` / `.pdf` — Future plans and expansion roadmap (10 pages)
- Both accessible via secure token-protected download at `/report/download?token=<token>`
- Tech Report: `/report/download?token=06ec7d70dfa25e409b3a4d074829899418f0aee620ff482e8b5adf74eb917fc0`
- Vision Roadmap: `/report/download?token=9184e1cb0b14509a0bf24bd5513174534e6979b350ee5a4f812d1cc228402713`
- Token definitions are in `server/routes.ts` (REPORT_TOKENS constant)
- Both PDFs emailed to kbpc.inc@gmail.com on March 20, 2026 via Resend (message ID: 595d6e8a-ce2d-424a-b29a-753db2a2e382)

## SEO Enhancements (Task #11)
- **Breadcrumbs:** `client/src/components/breadcrumb-nav.tsx` — reusable breadcrumb nav rendered on every page
- **Related Resources:** `client/src/components/related-resources.tsx` — cross-linking component with CROSS_LINK_MAP covering 30+ pages
- **Structured Data:** Dynamic per-page JSON-LD in `server/seo.ts` — BreadcrumbList, SoftwareApplication (tools), HowTo (calculators), Article (group profiles)
- **Sitemap:** Expanded to 745+ URLs including /awareness, /stb-sync, /compliance, /ransomware-calculator, and dynamic KB articles
- **SSR Enrichment:** Server-rendered cross-links and feature lists for crawlers on every public page
- **Key Files:** `server/seo.ts`, `client/src/components/breadcrumb-nav.tsx`, `client/src/components/related-resources.tsx`

## Git Tags (Design Snapshots)
- `v1.0-grand-opening` — Original Grand Opening design with 50% sale pricing
- `v1.1-pre-definitive` — Pre-definitive release snapshot (134 feeds, sale pricing)
- To restore any snapshot: `git checkout v1.0-grand-opening` or deploy from tag

## Release History
- **v1.0 Grand Opening** — Initial launch with 134 feeds, 50% promotional pricing, Grand Opening Sale banners
- **v2.0 Definitive Release** — 161 feeds, permanent professional pricing, public roadmap, expanded global CERTs, supply chain security feeds, removed all promotional language, SEO updated to 160+

## Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `STRIPE_SECRET_KEY` — Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `RESEND_API_KEY` — Resend email API key
- `SESSION_SECRET` — Session cookie signing secret
- `RESEND_FROM_EMAIL` — Sender email address (optional, defaults to noreply@stbcybersecurity.com)
- `CUSTOM_DOMAIN` — Production domain (optional)
- `BASE_URL` — Full base URL (optional)
- Optional premium feed keys: `GREYNOISE_API_KEY`, `CROWDSEC_API_KEY`, `SHODAN_API_KEY`, `PULSEDIVE_API_KEY`, `OTX_API_KEY`, `VIRUSTOTAL_API_KEY`, `HYBRID_ANALYSIS_API_KEY`, `HONEYDB_API_ID`, `HONEYDB_API_KEY`, `ABUSEIPDB_API_KEY`

## Deployment
See `SETUP.md` for complete deployment instructions covering local development, production builds, PM2/systemd, Nginx/Caddy reverse proxy, TLS, DNS, Stripe webhooks, and GitHub CI/CD.
