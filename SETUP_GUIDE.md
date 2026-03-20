# STB Cybersecurity — Installation & Setup Guide

**Version:** 1.0  
**Last Updated:** March 2026  
**Classification:** Confidential — STB Cybersecurity Internal

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Quick Start](#2-quick-start)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Build & Run](#5-build--run)
6. [Reverse Proxy & TLS](#6-reverse-proxy--tls)
7. [Process Management](#7-process-management)
8. [Stripe Webhook Configuration](#8-stripe-webhook-configuration)
9. [Backups](#9-backups)
10. [Updating the Application](#10-updating-the-application)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS |
| Node.js | 20.x | 22.x LTS |
| PostgreSQL | 15 | 16+ |
| RAM | 2 GB | 4 GB |
| Disk | 10 GB | 20 GB SSD |
| CPU | 1 vCPU | 2 vCPU |

---

## 2. Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/stb-cybersecurity.git
cd stb-cybersecurity

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
nano .env

# 4. Push the database schema
npx drizzle-kit push

# 5. Build the application
npm run build

# 6. Start the application
npm run start
```

The application will be available at `http://localhost:5000`.

---

## 3. Environment Variables

Create a `.env` file in the project root. Below are all supported variables.

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/stbcs` |
| `SESSION_SECRET` | Random string for session signing (32+ chars) | `a1b2c3d4...` (use `openssl rand -hex 32`) |
| `CUSTOM_DOMAIN` | Your production domain (no protocol) | `stbcybersecurity.com` |

### Payments (Stripe)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |

### Email (Resend)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | Sender address (default: `noreply@stbcybersecurity.com`) |

### Threat Intelligence API Keys (Optional — enhances data coverage)

| Variable | Description |
|----------|-------------|
| `OTX_API_KEY` | AlienVault OTX |
| `VIRUSTOTAL_API_KEY` | VirusTotal |
| `HYBRID_ANALYSIS_API_KEY` | Hybrid Analysis |
| `GREYNOISE_API_KEY` | GreyNoise |
| `CROWDSEC_API_KEY` | CrowdSec |
| `SHODAN_API_KEY` | Shodan |
| `PULSEDIVE_API_KEY` | Pulsedive |
| `HONEYDB_API_ID` | HoneyDB API ID |
| `HONEYDB_API_KEY` | HoneyDB API Key |
| `ABUSEIPDB_API_KEY` | AbuseIPDB |
| `VULNCHECK_API_KEY` | VulnCheck |

### Phone System (Optional)

| Variable | Description |
|----------|-------------|
| `QUO_API_KEY` | Quo phone system API key |
| `QUO_WEBHOOK_SECRET` | Quo webhook signing secret |

### Application Settings (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP listen port |
| `NODE_ENV` | `development` | Set to `production` for production |
| `BASE_URL` | — | Full URL with protocol (alternative to `CUSTOM_DOMAIN`) |
| `ADMIN_EMAIL` | — | Admin notification email address |
| `ADMIN_STATS_KEY` | — | API key for admin stats endpoints |
| `INTERNAL_API_KEY` | — | Key for internal API endpoints |
| `LOG_LEVEL` | `info` | Logging level (`debug`, `info`, `warn`, `error`) |

---

## 4. Database Setup

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE USER stbcs WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE stbcs OWNER stbcs;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stbcs TO stbcs;"

# Your DATABASE_URL will be:
# postgresql://stbcs:your_secure_password@localhost:5432/stbcs
```

### Option B: Managed PostgreSQL

Use any managed PostgreSQL provider (DigitalOcean, AWS RDS, Supabase, Neon, etc.) and use the connection string they provide as your `DATABASE_URL`.

### Push Schema

After setting `DATABASE_URL` in your `.env`:

```bash
npx drizzle-kit push
```

This creates all required tables automatically.

---

## 5. Build & Run

### Development Mode

```bash
npm run dev
```

Runs with hot-reload at `http://localhost:5000`.

### Production Build

```bash
# Build both client and server
npm run build

# Start production server
NODE_ENV=production npm run start
```

The build outputs to `dist/` — the server bundle and all static assets.

### Type Checking

```bash
npm run check
```

---

## 6. Reverse Proxy & TLS

In production, place a reverse proxy in front of the Node.js server for HTTPS termination.

### Recommended: Caddy (Automatic HTTPS)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Create `/etc/caddy/Caddyfile`:

```
stbcybersecurity.com {
    reverse_proxy localhost:5000
}
```

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

Caddy automatically obtains and renews TLS certificates from Let's Encrypt.

### Alternative: Nginx

```nginx
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

Use Certbot for TLS certificates with Nginx:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d stbcybersecurity.com
```

---

## 7. Process Management

Use PM2 to keep the application running and auto-restart on crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.cjs --name stbcs --env production

# Enable startup on boot
pm2 startup
pm2 save

# Useful commands
pm2 status          # Check status
pm2 logs stbcs      # View logs
pm2 restart stbcs   # Restart
pm2 monit           # Live monitoring dashboard
```

### PM2 Ecosystem File (Optional)

Create `ecosystem.config.cjs` for more control:

```javascript
module.exports = {
  apps: [{
    name: 'stbcs',
    script: 'dist/index.cjs',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    instances: 1,
    autorestart: true,
    watch: false,
  }]
};
```

```bash
pm2 start ecosystem.config.cjs
```

---

## 8. Stripe Webhook Configuration

Since webhooks are now managed directly through Stripe (not auto-provisioned), you need to set them up manually:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set URL to: `https://stbcybersecurity.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in your `.env`

---

## 9. Backups

### Automated Database Backups

Create `/opt/stbcs/backup.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/stbcs/backups"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/stbcs_$TIMESTAMP.sql.gz"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /opt/stbcs/backup.sh

# Run daily at 2 AM
echo "0 2 * * * /opt/stbcs/backup.sh" | crontab -
```

### Off-Site Backups (Recommended)

For disaster recovery, sync backups to cloud storage:

```bash
# Using rclone with any S3-compatible provider (Backblaze B2, AWS S3, etc.)
rclone sync /opt/stbcs/backups remote:stbcs-backups
```

---

## 10. Updating the Application

```bash
cd /path/to/stb-cybersecurity

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Push any database schema changes
npx drizzle-kit push

# Rebuild
npm run build

# Restart
pm2 restart stbcs
```

---

## 11. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| App won't start | Missing `DATABASE_URL` | Check `.env` file |
| No emails sending | Missing `RESEND_API_KEY` | Add key to `.env` |
| Stripe payments fail | Missing Stripe keys | Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` |
| Webhook errors | Wrong signing secret | Regenerate `STRIPE_WEBHOOK_SECRET` in Stripe Dashboard |
| OG images wrong URL | Missing `CUSTOM_DOMAIN` | Set `CUSTOM_DOMAIN` in `.env` |
| Port already in use | Another process on port 5000 | Change `PORT` or stop conflicting process |
| Database connection fails | Wrong `DATABASE_URL` or DB not running | Verify connection string and PostgreSQL status |

### Checking Logs

```bash
# Application logs (PM2)
pm2 logs stbcs

# Reverse proxy logs (Caddy)
journalctl -u caddy -f

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Health Check

The application exposes a health endpoint:

```bash
curl http://localhost:5000/health
```

---

## Security Checklist for Production

- [ ] All environment variables set in `.env` (not committed to git)
- [ ] `.env` file has restrictive permissions (`chmod 600 .env`)
- [ ] TLS/HTTPS configured via reverse proxy
- [ ] PostgreSQL only accepts local connections or uses SSL
- [ ] Firewall allows only ports 22 (SSH), 80, 443
- [ ] Automatic database backups configured
- [ ] PM2 configured for auto-restart on boot
- [ ] `NODE_ENV=production` is set
- [ ] Stripe webhook endpoint verified and active
- [ ] DNS A record points to server IP

---

**STB Cybersecurity** — Frontline Threat Intelligence & Security Services  
Copyright 2026. All rights reserved.
