# STB Cybersecurity (STBCS)

## Overview
Comprehensive cybersecurity threat intelligence platform for small and mid-sized businesses (SMBs). Aggregates 134 built-in threat intelligence feeds, provides 18+ security tools, real-time ransomware tracking, and professional security services with Stripe-based subscription tiers.

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
- `server/scrapers.ts` — 134 threat feed definitions and scraping logic
- `server/apiKeyAuth.ts` — API key authentication with tier-based rate limits
- `server/email.ts` — Resend email service (alerts, digests, lockout notifications)
- `server/stripeService.ts` — Stripe subscription management
- `server/uptimeEngine.ts` — Uptime monitoring background service
- `server/maintenance.ts` — Maintenance scheduler and admin notifications
- `client/src/App.tsx` — Frontend routing and page registration
- `client/src/pages/pricing.tsx` — Subscription tier pricing page

## Subscription Tiers (50% introductory pricing)
- **Free:** $0 — Full threat dashboard + all 18 security tools
- **Supporter:** $7.49/mo ($74.95/yr) — Uptime monitoring (3 monitors)
- **Pro:** $24.99/mo ($249.95/yr) — Dark web monitoring, API access, 9 premium feeds
- **Business:** $99.99/mo ($999.95/yr) — Attack surface scans, threat reports, SMS alerts
- **Unlimited:** $249.99/mo ($2,499.95/yr) — Unlimited everything + priority support

## API Tier Limits (from apiKeyAuth.ts)
- **Pro:** 1 key, 60 rpm, 1K daily, 50 live lookups
- **Business/Enterprise:** 5 keys, 120 rpm, 10K daily, 200 live lookups
- **Unlimited:** 10 keys, 300 rpm, 100K daily, 1K live lookups

## Background Services
- Threat feed scrapers (every 15min–daily depending on feed)
- Uptime monitoring engine (every 5 minutes)
- Dark web monitor scheduler
- KB content scraper (every 4 hours)
- Weekly digest emailer
- Maintenance scheduler

## Admin
- Admin email: kbpc.inc@gmail.com
- Domain: stbcybersecurity.com
- Phone: (855) STB-1987

## Documents
- `STBCS_Technical_Report.md` / `.pdf` — Full platform technical report
- `STBCS_Vision_Roadmap.md` / `.pdf` — Future plans and expansion roadmap
- Both accessible via secure token-protected download at `/report/download?token=<token>`

## Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `STRIPE_SECRET_KEY` — Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `RESEND_API_KEY` — Resend email API key
- `RESEND_FROM_EMAIL` — Sender email address
- Optional: `GREYNOISE_API_KEY`, `CROWDSEC_API_KEY`, `SHODAN_API_KEY`, `PULSEDIVE_API_KEY`, `OTX_API_KEY`, `VIRUSTOTAL_API_KEY`, `HYBRID_ANALYSIS_API_KEY`, `HONEYDB_API_ID`, `HONEYDB_API_KEY`, `ABUSEIPDB_API_KEY`
