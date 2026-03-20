# STB Cybersecurity — Setup & Deployment Guide

**Domain:** stbcybersecurity.com  
**Contact:** (855) STB-1987 | kbpc.inc@gmail.com

---

## Prerequisites

- **Node.js** 20.x or later
- **PostgreSQL** 16.x or later
- **npm** 9.x or later
- A domain name with DNS control (for production)
- A **Stripe** account (for subscription billing)
- A **Resend** account (for transactional email)

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/stb-cybersecurity.git
cd stb-cybersecurity
npm install
```

---

## 2. Environment Variables

Create a `.env` file in the project root. Below is every variable the platform uses:

### Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/stbcs` |
| `STRIPE_SECRET_KEY` | Stripe API secret key (starts with `sk_`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (starts with `whsec_`) |
| `RESEND_API_KEY` | Resend email API key (starts with `re_`) |
| `SESSION_SECRET` | A random string for signing session cookies (min 32 characters) |

### Optional

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CUSTOM_DOMAIN` | Your production domain, e.g. `stbcybersecurity.com` |
| `BASE_URL` | Full base URL, e.g. `https://stbcybersecurity.com` |
| `RESEND_FROM_EMAIL` | Sender email address (default: `noreply@stbcybersecurity.com`) |
| `GREYNOISE_API_KEY` | GreyNoise Community API key (premium threat feed) |
| `CROWDSEC_API_KEY` | CrowdSec API key (premium threat feed) |
| `SHODAN_API_KEY` | Shodan API key (premium threat feed) |
| `PULSEDIVE_API_KEY` | Pulsedive API key (premium threat feed) |
| `OTX_API_KEY` | AlienVault OTX API key (premium threat feed) |
| `VIRUSTOTAL_API_KEY` | VirusTotal API key (premium threat feed) |
| `HYBRID_ANALYSIS_API_KEY` | Hybrid Analysis API key (premium threat feed) |
| `HONEYDB_API_ID` | HoneyDB API ID (premium threat feed) |
| `HONEYDB_API_KEY` | HoneyDB API key (premium threat feed) |
| `ABUSEIPDB_API_KEY` | AbuseIPDB API key (premium threat feed) |

> **Note:** The 9 premium threat feed API keys are optional. The platform operates with 134 built-in feeds that require no API keys. Premium feeds add enhanced enrichment for Pro+ subscribers.

---

## 3. Database Setup

Create the PostgreSQL database and push the schema:

```bash
createdb stbcs
export DATABASE_URL="postgresql://user:pass@localhost:5432/stbcs"
npm run db:push
```

This creates all 52 tables using Drizzle ORM's schema push. No manual migrations needed.

---

## 4. Local Development

```bash
npm run dev
```

This starts the development server with Vite hot-reload on port 5000 (or your configured `PORT`). Visit `http://localhost:5000`.

---

## 5. Production Build & Run

```bash
npm run build
npm run start
```

- `npm run build` compiles TypeScript and bundles the React frontend into `dist/`
- `npm run start` runs the production server from `dist/index.cjs`

---

## 6. Production Deployment (Linux VM / VPS)

### Option A: PM2 Process Manager

```bash
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/index.cjs --name stbcs --env production
pm2 save
pm2 startup  # Follow instructions to enable auto-start on boot
```

### Option B: systemd Service

Create `/etc/systemd/system/stbcs.service`:

```ini
[Unit]
Description=STB Cybersecurity Platform
After=network.target postgresql.service

[Service]
Type=simple
User=stbcs
WorkingDirectory=/opt/stb-cybersecurity
EnvironmentFile=/opt/stb-cybersecurity/.env
ExecStart=/usr/bin/node dist/index.cjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable stbcs
sudo systemctl start stbcs
```

---

## 7. Reverse Proxy & TLS

### Caddy (recommended — automatic HTTPS)

Install Caddy, then create `/etc/caddy/Caddyfile`:

```
stbcybersecurity.com {
    reverse_proxy localhost:5000
}
```

```bash
sudo systemctl restart caddy
```

Caddy automatically obtains and renews Let's Encrypt certificates.

### Nginx + Let's Encrypt

```nginx
server {
    listen 80;
    server_name stbcybersecurity.com www.stbcybersecurity.com;
    return 301 https://stbcybersecurity.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stbcybersecurity.com;

    ssl_certificate /etc/letsencrypt/live/stbcybersecurity.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stbcybersecurity.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Obtain certificates:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d stbcybersecurity.com -d www.stbcybersecurity.com
```

---

## 8. DNS Configuration

Point your domain to your server's IP address:

| Type | Name | Value |
|---|---|---|
| A | `@` | Your server IP |
| A | `www` | Your server IP |
| CNAME | `www` | `stbcybersecurity.com` (alternative to A record) |

---

## 9. Stripe Webhook Setup

1. Go to the [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add an endpoint: `https://stbcybersecurity.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET`

---

## 10. GitHub-Based Deployment (Optional)

For automated deployments from a GitHub repository:

```yaml
# .github/workflows/deploy.yml
name: Deploy STBCS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/stb-cybersecurity
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart stbcs
```

Set `SERVER_HOST`, `SERVER_USER`, and `SSH_PRIVATE_KEY` as GitHub repository secrets.

---

## 11. Health Check

The platform exposes a health endpoint:

```bash
curl https://stbcybersecurity.com/health
# Returns: {"status":"ok"}
```

Use this for load balancer health checks, uptime monitoring, or deployment verification.

---

## 12. Troubleshooting

| Issue | Solution |
|---|---|
| `DATABASE_URL not found` | Ensure `.env` file exists and contains `DATABASE_URL` |
| Database connection refused | Verify PostgreSQL is running and accepting connections |
| Schema push fails | Run `npx drizzle-kit push` manually, check DB permissions |
| Stripe webhook errors | Verify `STRIPE_WEBHOOK_SECRET` matches your Stripe dashboard |
| Emails not sending | Check `RESEND_API_KEY` is valid; verify sender domain in Resend dashboard |
| Port already in use | Change `PORT` in `.env` or stop the conflicting process |
| Build fails | Run `npm run check` for TypeScript errors; ensure Node.js 20+ |
| CSS not loading in production | Run `npm run build` before `npm run start` |
| WebSocket errors (SSH/SFTP) | Ensure reverse proxy passes `Upgrade` and `Connection` headers |

---

## Background Services

The platform runs several automated background services:

- **Threat feed scrapers** — Refresh 134 feeds every 15 minutes to daily
- **Uptime monitoring** — Checks endpoints every 5 minutes
- **Dark web monitor** — Scheduled scans for Business/Unlimited subscribers
- **Knowledge base scraper** — Aggregates cybersecurity news every 4 hours
- **Weekly digest emailer** — Sends subscriber threat summaries
- **Maintenance scheduler** — Manages platform maintenance windows

All background services start automatically when the server starts. No separate worker processes or cron jobs are needed.

---

**STB Cybersecurity** — Enterprise cybersecurity for SMBs  
stbcybersecurity.com | (855) STB-1987 | kbpc.inc@gmail.com
