# STBCS v2.0 — Definitive Release Notes

**Release Date:** March 20, 2026
**Platform:** stbcybersecurity.com
**Repository:** github.com/solis-kbrown/STBCS

---

## Executive Summary

The STBCS Definitive Release (v2.0) is a comprehensive platform overhaul that expands threat intelligence coverage from 134 to 161 feeds, establishes permanent professional pricing, adds a public product roadmap, and updates all SEO and structured data across the entire site.

---

## Changes Summary

### 1. Threat Intelligence Feed Expansion (134 → 161 feeds)

**27 new feeds added across 7 categories:**

#### Government & National CERTs (8 feeds)
- JPCERT/CC — Japan CERT Coordination Center
- ACSC Australia — Australian Cyber Security Centre
- CCCS Canada — Canadian Centre for Cyber Security
- ENISA — EU Agency for Cybersecurity
- BSI Germany — German Federal Office for Information Security
- CERT-FR — French national CERT
- CERT-In India — Indian Computer Emergency Response Team
- SingCERT — Singapore Cyber Security Agency

#### Supply Chain & Open Source Security (3 feeds)
- OSV.dev — Google OSV covering npm, PyPI, Go, crates.io
- Snyk Vuln DB — Open source vulnerability database with fix guidance
- RustSec Advisory — Rust ecosystem security advisories

#### Ransomware & Dark Web Enrichment (2 feeds)
- No More Ransom — Europol decryption tools and prevention
- ID Ransomware — Ransomware variant identification service

#### Network & BGP Intelligence (3 feeds)
- BGP Ranking — ASN reputation ranking
- InQuest Labs IOC — Aggregated IOC database
- InQuest Labs DFI — Deep file inspection results

#### DNS & Domain Intelligence (2 feeds)
- DNStwist Phishing — Domain typosquatting detection
- CertStream — Real-time certificate transparency log monitoring

#### Threat Research Blogs (7 feeds)
- Securelist (Kaspersky GReAT)
- Elastic Security Labs
- Qualys ThreatPROTECT
- Rapid7 Blog
- Fortinet FortiGuard Labs
- ZDI Advisories (Zero Day Initiative)
- SANS ISC Diary

#### Additional Feeds (2 feeds)
- Wordfence Blog — WordPress security research
- CISA ICS-CERT — Industrial control systems advisories

### 2. Pricing Overhaul — Permanent Professional Tiers

**Removed all promotional language:**
- Grand Opening Sale banner removed from pricing page
- Grand Opening Sale banner removed from support page
- 50% OFF discount badges removed from all tier cards
- Strikethrough "original" prices removed
- FAQ item about "50% off Grand Opening Sale" replaced with volume/team discount FAQ
- Stripe checkout no longer auto-applies GRANDOPENING50 coupon
- /api/sale-status endpoint now returns `active: false` permanently

**New permanent pricing:**
| Tier | Monthly | Annual |
|------|---------|--------|
| Free | $0 | $0 |
| Supporter | $14.99 | $149.90 |
| Pro | $49.99 | $499.90 |
| Business | $199.99 | $1,999.90 |
| Unlimited | $499.99 | $4,999.90 |

### 3. Public Product Roadmap

New roadmap section added to the About page featuring:
- **AI Threat Scoring** (In Development) — ML models prioritizing threats by industry relevance
- **Managed Detection & Response** (Q3 2026) — 24/7 MDR with human analysts
- **Security Awareness Training** (Q4 2026) — Phishing simulations and compliance reporting
- **Industry-Specific Intel Packs** (2027) — Vertical-specific feeds for healthcare, finance, legal, manufacturing, retail

### 4. SEO & Structured Data Updates

**Updated across all pages and structured data:**
- All "105+" and "130+" feed count references updated to "160+"
- Meta description, og:description, twitter:description updated
- Schema.org FAQPage updated with correct pricing and feed counts
- Schema.org WebApplication offers updated with permanent prices
- Schema.org Dataset description updated
- featureList updated to "160+ feeds"

**Files updated for feed count:**
- `client/index.html` (meta tags, structured data, FAQ schema)
- `client/src/pages/dashboard.tsx`
- `client/src/pages/about.tsx`
- `client/src/pages/pricing.tsx`
- `client/src/pages/support.tsx`
- `client/src/pages/intel.tsx`
- `client/src/pages/exploits.tsx`
- `client/src/pages/search.tsx`
- `client/src/pages/ioc-search.tsx`
- `client/src/pages/ioc-search-tab.tsx`
- `client/src/pages/alerts.tsx`
- `client/src/pages/alerts-tab.tsx`
- `client/src/pages/threat-feeds.tsx`
- `client/src/pages/threat-feeds-tab.tsx`
- `client/src/pages/api-docs.tsx`
- `client/src/pages/hero-gallery.tsx`
- `client/src/pages/stb-sync.tsx`

### 5. Server-Side Changes

- `server/stripeService.ts` — Removed auto-application of GRANDOPENING50 coupon from checkout sessions
- `server/routes.ts` — /api/sale-status now returns permanently inactive
- `server/scrapers.ts` — 27 new feed entries in initializeThreatFeeds() registry

### 6. Git Tags for Design Preservation

- `v1.0-grand-opening` — Original launch design (50% sale, 134 feeds)
- `v1.1-pre-definitive` — Snapshot immediately before v2.0 changes
- Either tag can be checked out and deployed independently

---

## Deployment Instructions

The application is deployed on Replit and accessible at stbcybersecurity.com.

**To deploy from any tag:**
```bash
git checkout v1.0-grand-opening  # Original Grand Opening design
# OR
git checkout v1.1-pre-definitive  # Pre-overhaul snapshot
# OR
git checkout main  # Latest Definitive Release
```

**To push to GitHub:**
```bash
git remote add origin https://github.com/solis-kbrown/STBCS.git
git push origin main --tags
```

---

## Technical Stack
- React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Express.js + Node.js 20
- PostgreSQL 16 + Drizzle ORM (52 tables)
- Stripe (subscriptions + donations)
- Resend (transactional email)
- 161 threat intelligence feeds
- 18+ free security tools
- 24/7 incident response hotline: (855) STB-1987

---

## Documents Available
- **Technical Report:** https://stbcybersecurity.com/report/download?token=06ec7d70dfa25e409b3a4d074829899418f0aee620ff482e8b5adf74eb917fc0
- **Vision Roadmap:** https://stbcybersecurity.com/report/download?token=9184e1cb0b14509a0bf24bd5513174534e6979b350ee5a4f812d1cc228402713

---

*STB Cybersecurity — Real-Time Threat Intelligence for SMBs*
*info@stbcybersecurity.com | (855) STB-1987*
