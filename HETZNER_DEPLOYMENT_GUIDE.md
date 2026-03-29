# STB Cybersecurity — Dedicated Server Deployment Guide

**Platform:** STB Cybersecurity (STBCS)  
**Domain:** stbcybersecurity.com  
**Contact:** (855) STB-1987 | kbpc.inc@gmail.com  
**Target Server:** Hetzner Dedicated Server (or any Ubuntu 24.04 LTS host)  

---

## Fast Track (If You Want to Skip the Manual Steps)

This project includes automated scripts in the `deploy/` folder. If you're comfortable
running scripts, here's the 4-step version:

```bash
# 1. Upload or clone the project to your server
scp -r /path/to/stb-cybersecurity root@YOUR_SERVER_IP:/opt/stb-cybersecurity
# OR: git clone https://github.com/YOU/stb-cybersecurity.git /opt/stb-cybersecurity

# 2. Run the automated setup (installs everything)
cd /opt/stb-cybersecurity
chmod +x deploy/*.sh
sudo ./deploy/setup.sh

# 3. Edit .env with your real API keys
nano /opt/stb-cybersecurity/.env

# 4. Build and launch
su - stbcs
cd /opt/stb-cybersecurity
./deploy/go.sh
```

Then point your DNS and update your Stripe webhook URL. Done.

The rest of this guide explains every step in detail for reference and troubleshooting.

---

## Table of Contents

1. [What You'll Need Before Starting](#1-what-youll-need-before-starting)
2. [Install Ubuntu 24.04 via Hetzner Robot](#2-install-ubuntu-2404-via-hetzner-robot)
3. [First Login & System Update](#3-first-login--system-update)
4. [Create a Dedicated Application User](#4-create-a-dedicated-application-user)
5. [Install Node.js 20 LTS](#5-install-nodejs-20-lts)
6. [Install PostgreSQL 16](#6-install-postgresql-16)
7. [Create the Database & User](#7-create-the-database--user)
8. [Install System Libraries for Native Modules](#8-install-system-libraries-for-native-modules)
9. [Set Up the Firewall (UFW)](#9-set-up-the-firewall-ufw)
10. [Install Fail2Ban (Brute-Force Protection)](#10-install-fail2ban-brute-force-protection)
11. [Transfer the Project Files](#11-transfer-the-project-files)
12. [Configure Environment Variables](#12-configure-environment-variables)
13. [Install Dependencies & Build](#13-install-dependencies--build)
14. [Push the Database Schema](#14-push-the-database-schema)
15. [Test the Application Manually](#15-test-the-application-manually)
16. [Install PM2 & Start the Application](#16-install-pm2--start-the-application)
17. [Install Caddy (Reverse Proxy & Auto-HTTPS)](#17-install-caddy-reverse-proxy--auto-https)
18. [Update DNS Records](#18-update-dns-records)
19. [Configure Stripe Webhooks](#19-configure-stripe-webhooks)
20. [Verify Everything Is Working](#20-verify-everything-is-working)
21. [Enable Automatic Security Updates](#21-enable-automatic-security-updates)
22. [Set Up Automatic Backups](#22-set-up-automatic-backups)
23. [Day-to-Day Maintenance](#23-day-to-day-maintenance)
24. [Updating the Application](#24-updating-the-application)
25. [Monitoring & Logs](#25-monitoring--logs)
26. [Troubleshooting](#26-troubleshooting)
27. [Quick Reference Card](#27-quick-reference-card)

---

## 1. What You'll Need Before Starting

Before you begin, gather the following. You already have most of these from your current Replit setup:

| Item | Where to Find It |
|------|-------------------|
| Hetzner Robot login | robot.hetzner.com |
| Server IP address | Hetzner Robot > Server > Overview |
| Your domain registrar login | Wherever stbcybersecurity.com DNS is managed |
| `STRIPE_SECRET_KEY` | Replit Secrets (or Stripe Dashboard > API Keys) |
| `STRIPE_PUBLISHABLE_KEY` | Replit Secrets (or Stripe Dashboard > API Keys) |
| `STRIPE_WEBHOOK_SECRET` | Replit Secrets (or Stripe Dashboard > Webhooks) |
| `RESEND_API_KEY` | Replit Secrets (or Resend Dashboard > API Keys) |
| `SESSION_SECRET` | Replit Secrets (we'll generate a new one if needed) |
| Any premium feed API keys | Replit Secrets (GreyNoise, Shodan, OTX, etc. — all optional) |

**Tip:** Open your Replit project's Secrets tab and screenshot or copy every value before proceeding. You'll need them in Step 12.

---

## 2. Install Ubuntu 24.04 via Hetzner Robot

1. Log into **Hetzner Robot** at https://robot.hetzner.com
2. Select your dedicated server from the server list
3. Click **Linux** in the left sidebar
4. Select **Ubuntu 24.04 LTS minimal**
5. Choose your preferred language (English recommended)
6. Set a **strong root password** — write it down, you'll need it in the next step
7. Optionally add your SSH public key for key-based login (more secure, recommended)
8. Click **Activate Linux Installation**
9. Confirm when prompted — this **erases the server** and installs a fresh Ubuntu
10. Wait approximately 5-15 minutes for the installation to complete
11. You'll receive an email from Hetzner when it's ready

---

## 3. First Login & System Update

Open a terminal on your local computer and connect:

```bash
ssh root@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with the IP from Hetzner Robot. Accept the fingerprint prompt by typing `yes`.

Once logged in, update the system:

```bash
apt update && apt upgrade -y
```

Install essential tools:

```bash
apt install -y curl wget git unzip build-essential software-properties-common \
  ca-certificates gnupg lsb-release htop
```

Set the timezone (recommended — makes log timestamps easier to read):

```bash
timedatectl set-timezone America/New_York
```

> Replace `America/New_York` with your preferred timezone. Run `timedatectl list-timezones` to see all options.

Reboot to apply any kernel updates:

```bash
reboot
```

Wait 30 seconds, then SSH back in:

```bash
ssh root@YOUR_SERVER_IP
```

---

## 4. Create a Dedicated Application User

Never run the application as root. Create a dedicated user:

```bash
adduser stbcs
```

Follow the prompts — set a strong password, the rest can be left blank (press Enter).

Give the user sudo access (for administrative tasks only):

```bash
usermod -aG sudo stbcs
```

---

## 5. Install Node.js 20 LTS

Install Node.js 20 from the official NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify the installation:

```bash
node -v
# Should output: v20.x.x

npm -v
# Should output: 10.x.x
```

---

## 6. Install PostgreSQL 16

Install PostgreSQL:

```bash
apt install -y postgresql postgresql-contrib
```

Verify it's running:

```bash
systemctl status postgresql
```

You should see `active (exited)` — this is normal, it means PostgreSQL started successfully.

Ensure it starts automatically on boot:

```bash
systemctl enable postgresql
```

---

## 7. Create the Database & User

Switch to the PostgreSQL admin user and create the database:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt (you'll see `postgres=#`), run these commands one at a time:

```sql
CREATE USER stbcs WITH PASSWORD 'CHOOSE_A_STRONG_DB_PASSWORD';
CREATE DATABASE stbcs OWNER stbcs;
GRANT ALL PRIVILEGES ON DATABASE stbcs TO stbcs;
\q
```

**Important:** Replace `CHOOSE_A_STRONG_DB_PASSWORD` with a real, strong password. Write it down — you'll need it in Step 12.

Test the connection:

```bash
sudo -u stbcs psql -d stbcs -c "SELECT 1;"
```

You should see a table with the value `1`. If so, the database is ready.

---

## 8. Install System Libraries for Native Modules

STBCS uses several Node.js packages that require native system libraries. Install them all:

```bash
apt install -y \
  libvips-dev \
  libpng-dev \
  libjpeg-dev \
  libwebp-dev \
  libgif-dev \
  libtiff-dev \
  libfontconfig1-dev \
  libcairo2-dev \
  libpango1.0-dev \
  librsvg2-dev \
  libpixman-1-dev \
  python3
```

These are needed for:
- **sharp** — Image processing (OG images, brand assets)
- **@resvg/resvg-js** — SVG rendering for OG image generation
- **satori** — HTML-to-image conversion for dynamic social cards
- **ssh2 / bufferutil** — SSH terminal, SFTP client, and WebSocket support
- **multer** — File upload handling (SFTP uploads, file scanner)

---

## 9. Set Up the Firewall (UFW)

Enable the firewall and allow only the ports you need:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP - needed for HTTPS cert renewal'
ufw allow 443/tcp comment 'HTTPS'
ufw enable
```

Type `y` when prompted.

Verify:

```bash
ufw status verbose
```

You should see SSH (22), HTTP (80), and HTTPS (443) allowed. The application itself runs on port 5000 internally — it is **never** exposed to the internet. Caddy handles the public-facing connection and forwards to it.

---

## 10. Install Fail2Ban (Brute-Force Protection)

Fail2Ban automatically blocks IP addresses that make too many failed login attempts:

```bash
apt install -y fail2ban
```

Create a local configuration:

```bash
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 3
bantime = 7200
EOF
```

Start and enable:

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

This will ban any IP that fails 3 SSH login attempts for 2 hours.

---

## 11. Transfer the Project Files

You have two options. **Option B (GitHub) is strongly recommended** for easy future updates.

### Option A: Download Zip from Replit (Quick & Simple)

1. In your Replit project, click the **three-dot menu** in the top-left file panel
2. Select **Download as zip**
3. On your **local computer**, upload the zip to the server:

```bash
scp ~/Downloads/stb-cybersecurity.zip root@YOUR_SERVER_IP:/opt/
```

4. On the **server**, extract it:

```bash
cd /opt
unzip stb-cybersecurity.zip -d stb-cybersecurity
chown -R stbcs:stbcs /opt/stb-cybersecurity
```

### Option B: Push to GitHub First (Recommended)

1. Create a **private** repository on GitHub (e.g., `stb-cybersecurity`)
2. In your **Replit Shell**, push the code:

```bash
git remote add github https://github.com/YOUR_GITHUB_USERNAME/stb-cybersecurity.git
git push github main
```

3. On the **server**, clone it:

```bash
cd /opt
git clone https://github.com/YOUR_GITHUB_USERNAME/stb-cybersecurity.git
chown -R stbcs:stbcs /opt/stb-cybersecurity
```

> If the repo is private, you'll need a GitHub Personal Access Token. GitHub will prompt you for credentials during `git clone`.

---

## 12. Configure Environment Variables

Switch to the application user:

```bash
su - stbcs
cd /opt/stb-cybersecurity
```

Create the `.env` file:

```bash
nano .env
```

Paste the following, **replacing every placeholder** with your real values:

```env
# ============================================================
# CORE CONFIGURATION
# ============================================================
NODE_ENV=production
PORT=5000

# ============================================================
# DATABASE
# ============================================================
# CRITICAL: Use sslmode=disable for local PostgreSQL on the same server.
# The app auto-appends sslmode=require if not present, which breaks
# local connections. Including sslmode=disable prevents that.
DATABASE_URL=postgresql://stbcs:YOUR_DB_PASSWORD@localhost:5432/stbcs?sslmode=disable

# ============================================================
# DOMAIN & URL
# ============================================================
CUSTOM_DOMAIN=stbcybersecurity.com
BASE_URL=https://stbcybersecurity.com

# ============================================================
# SECURITY
# ============================================================
# Generate with: openssl rand -hex 32
SESSION_SECRET=PASTE_A_64_CHARACTER_RANDOM_STRING_HERE

# ============================================================
# STRIPE (copy exact values from Replit Secrets)
# ============================================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================
# EMAIL via Resend (copy from Replit Secrets)
# ============================================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@stbcybersecurity.com

# ============================================================
# OPTIONAL: Premium Threat Feed API Keys
# The platform works fully without these.
# Uncomment and fill in any you have.
# ============================================================
# GREYNOISE_API_KEY=
# CROWDSEC_API_KEY=
# SHODAN_API_KEY=
# PULSEDIVE_API_KEY=
# OTX_API_KEY=
# VIRUSTOTAL_API_KEY=
# HYBRID_ANALYSIS_API_KEY=
# HONEYDB_API_ID=
# HONEYDB_API_KEY=
# ABUSEIPDB_API_KEY=
# VULNCHECK_API_KEY=
```

Save the file: press `Ctrl+O`, then `Enter`, then `Ctrl+X`.

Lock down file permissions (only the stbcs user should read it):

```bash
chmod 600 .env
```

To generate a session secret, run this and paste the output into the `.env` file:

```bash
openssl rand -hex 32
```

### Why sslmode=disable?

The file `server/db.ts` contains this line:

```typescript
const connStr = dbUrl.includes('sslmode=') ? dbUrl : (dbUrl + '?sslmode=require');
```

It checks if `sslmode=` is already in the URL. If it is, it leaves it alone. If it's not, it auto-appends `sslmode=require`. Since PostgreSQL is running locally on the same machine (not over the internet), SSL is unnecessary and would cause connection failures. By explicitly including `sslmode=disable` in the URL, the app sees that `sslmode=` is already present and skips the auto-append.

---

## 13. Install Dependencies & Build

Still logged in as the `stbcs` user:

```bash
cd /opt/stb-cybersecurity

# Install all dependencies (exact versions from package-lock.json)
npm ci

# Build the production bundle
npm run build
```

The build creates a `dist/` folder containing:
- `dist/index.cjs` — The production server entry point (ESM bundle wrapped in a CJS loader)
- `dist/index.js` — The actual ESM bundle (loaded by index.cjs)
- `dist/public/` — The compiled React frontend (HTML, CSS, JS, images, brand assets)

This step may take 2-4 minutes depending on your server's CPU.

### What the build does internally

1. **Vite** compiles the React frontend (from `client/`) into optimized static files in `dist/public/`
2. **esbuild** bundles the Express server (from `server/`) into `dist/index.js` with production minification
3. A CJS wrapper (`dist/index.cjs`) is created so Node.js can load the ESM bundle

---

## 14. Push the Database Schema

Create all database tables (there are 53 tables as of the latest build):

```bash
cd /opt/stb-cybersecurity

# Load the environment variables
set -a; source .env; set +a

# Push the schema to PostgreSQL
npx drizzle-kit push
```

You should see output listing all the tables being created, ending with `Changes applied` or similar. This creates every table the platform needs — users, sessions, CVEs, ransomware incidents, ransom notes, watchlist items, threat feeds, and more.

Verify:

```bash
PGPASSWORD=YOUR_DB_PASSWORD psql -U stbcs -d stbcs -c "\dt" | head -20
```

You should see a list of tables including `users`, `sessions`, `cves`, `ransomware_incidents`, `ransom_notes`, etc.

---

## 15. Test the Application Manually

Before setting up PM2, do a quick manual test:

```bash
cd /opt/stb-cybersecurity
set -a; source .env; set +a
node dist/index.cjs
```

You should see output similar to:

```
[express] serving on port 5000
Database pool connection verified
[express] Static file serving initialized early for fast startup
[express] Routes and static serving initialized
Initializing Stripe...
Stripe connection verified
Webhook URL base: https://stbcybersecurity.com/api/stripe/webhook
Stripe initialization complete
```

Test from another terminal (or the same server in another SSH session):

```bash
curl http://localhost:5000/health
```

Expected response: `{"status":"ok"}`

Press `Ctrl+C` to stop the manual test.

---

## 16. Install PM2 & Start the Application

PM2 is a process manager that keeps your application running 24/7 and restarts it automatically if it crashes or the server reboots.

Install PM2 globally (as root):

```bash
exit  # Back to root if you're still stbcs
npm install -g pm2
```

Switch back to the application user and create a PM2 ecosystem file:

```bash
su - stbcs
cd /opt/stb-cybersecurity

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'stbcs',
    script: 'dist/index.cjs',
    cwd: '/opt/stb-cybersecurity',
    env_file: '/opt/stb-cybersecurity/.env',
    node_args: '--max-old-space-size=2048',
    max_memory_restart: '1500M',
    instances: 1,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 5000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/opt/stb-cybersecurity/logs/error.log',
    out_file: '/opt/stb-cybersecurity/logs/output.log',
    merge_logs: true,
  }]
};
EOF
```

Create the logs directory and start the application:

```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
```

Verify it's running:

```bash
pm2 status
```

You should see `stbcs` with status `online`.

Save the process list so PM2 knows what to start on boot:

```bash
pm2 save
```

Now configure PM2 to start automatically on boot. Run this **as root**:

```bash
exit  # Back to root
pm2 startup systemd -u stbcs --hp /home/stbcs
```

PM2 will output a command for you to copy and run. It looks something like:

```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u stbcs --hp /home/stbcs
```

**Run whatever command PM2 tells you.** This creates a systemd service that starts PM2 (and your app) automatically after any server reboot.

---

## 17. Install Caddy (Reverse Proxy & Auto-HTTPS)

Caddy sits in front of your application. It handles HTTPS certificates automatically (from Let's Encrypt), serves as a reverse proxy, supports WebSocket upgrades (needed for SSH, SFTP, RDP, and Telnet tools), and provides compression.

Install Caddy:

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy
```

Configure Caddy:

```bash
cat > /etc/caddy/Caddyfile << 'EOF'
# Primary domain — serves the app with auto-HTTPS
stbcybersecurity.com {
    reverse_proxy localhost:5000

    # Strip the Server header for security
    header -Server

    # Enable compression
    encode gzip zstd
}

# Redirect www to bare domain
www.stbcybersecurity.com {
    redir https://stbcybersecurity.com{uri} permanent
}

# Redirect secondary domain
stoptbcs.com {
    redir https://stbcybersecurity.com{uri} permanent
}

www.stoptbcs.com {
    redir https://stbcybersecurity.com{uri} permanent
}
EOF
```

**Important notes about Caddy:**
- Caddy **automatically handles WebSocket upgrades** — no extra config needed for SSH, SFTP, RDP, and Telnet tools
- Caddy **automatically obtains and renews** Let's Encrypt TLS certificates — zero maintenance
- The app already sets security headers (`X-Frame-Options`, `HSTS`, `CSP`, etc.) in `server/index.ts`, so Caddy doesn't need to duplicate them

Restart Caddy:

```bash
systemctl restart caddy
systemctl enable caddy
```

Caddy will automatically obtain a TLS certificate from Let's Encrypt. This happens within seconds once DNS is pointed correctly (next step).

---

## 18. Update DNS Records

Log into your **domain registrar** (wherever stbcybersecurity.com's DNS is managed) and update the records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` (root) | `YOUR_HETZNER_SERVER_IP` | 300 |
| A | `www` | `YOUR_HETZNER_SERVER_IP` | 300 |

If you also manage `stoptbcs.com`, point it the same way:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` (root) | `YOUR_HETZNER_SERVER_IP` | 300 |
| A | `www` | `YOUR_HETZNER_SERVER_IP` | 300 |

DNS changes typically take 5-60 minutes to propagate worldwide.

You can check propagation at https://dnschecker.org.

---

## 19. Configure Stripe Webhooks

Your Stripe webhook URL needs to point to the Hetzner server instead of Replit.

1. Go to the Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Find your existing webhook endpoint
3. **Update the URL** to: `https://stbcybersecurity.com/api/stripe/webhook`
4. If you create a **new** endpoint instead of editing, you'll get a new signing secret — update `STRIPE_WEBHOOK_SECRET` in your `.env` file

Events to listen for (if creating new):
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

After updating the webhook, restart the app to pick up any `.env` changes:

```bash
su - stbcs
cd /opt/stb-cybersecurity
pm2 restart stbcs
```

---

## 20. Verify Everything Is Working

Run through this checklist:

```bash
# 1. Application is running
su - stbcs
pm2 status
# Should show: stbcs | online

# 2. Health check responds
curl https://stbcybersecurity.com/health
# Should return: {"status":"ok"}

# 3. HTTPS is working (check the certificate)
curl -vI https://stbcybersecurity.com 2>&1 | grep -i "subject\|issuer\|expire"
# Should show Let's Encrypt certificate details

# 4. Homepage loads
curl -s https://stbcybersecurity.com | head -5
# Should return HTML content starting with <!DOCTYPE html>

# 5. Database is connected (check app logs)
pm2 logs stbcs --lines 10
# Should show "Database pool connection verified"

# 6. Stripe is connected
pm2 logs stbcs --lines 20 | grep -i stripe
# Should show "Stripe connection verified"

# 7. www redirect works
curl -sI https://www.stbcybersecurity.com | grep -i location
# Should show: location: https://stbcybersecurity.com/

# 8. Security headers are present
curl -sI https://stbcybersecurity.com | grep -iE "strict-transport|x-frame|x-content"
# Should show HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
```

Open a browser and visit `https://stbcybersecurity.com` — you should see the full STBCS dashboard.

Try logging in, check that the threat feeds begin loading (they start automatically ~60 seconds after boot), and verify Stripe checkout works.

---

## 21. Enable Automatic Security Updates

Keep your server patched automatically:

```bash
# As root
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

Select **Yes** when prompted. This enables automatic installation of security patches for Ubuntu.

---

## 22. Set Up Automatic Backups

### Database Backups

Create a daily backup script:

```bash
mkdir -p /opt/backups

cat > /opt/stb-cybersecurity/backup.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=14

# Dump the database
sudo -u stbcs pg_dump -U stbcs stbcs | gzip > "${BACKUP_DIR}/stbcs_${TIMESTAMP}.sql.gz"

# Remove backups older than 14 days
find "${BACKUP_DIR}" -name "stbcs_*.sql.gz" -mtime +${KEEP_DAYS} -delete

echo "[$(date)] Backup completed: stbcs_${TIMESTAMP}.sql.gz"
SCRIPT

chmod +x /opt/stb-cybersecurity/backup.sh
```

Set it to run daily at 3:00 AM:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/stb-cybersecurity/backup.sh >> /opt/backups/backup.log 2>&1") | crontab -
```

### Test the Backup

```bash
/opt/stb-cybersecurity/backup.sh
ls -lh /opt/backups/
```

You should see a `.sql.gz` file.

### Restore from Backup (if ever needed)

```bash
# Replace the filename with the backup you want to restore
gunzip < /opt/backups/stbcs_20260329_030000.sql.gz | sudo -u stbcs psql -U stbcs stbcs
```

---

## 23. Day-to-Day Maintenance

### Restarting the Application

```bash
su - stbcs
pm2 restart stbcs
```

### Stopping the Application

```bash
su - stbcs
pm2 stop stbcs
```

### Viewing Live Logs

```bash
su - stbcs
pm2 logs stbcs            # Live tail (Ctrl+C to exit)
pm2 logs stbcs --lines 100     # Last 100 lines
```

### Checking Server Resources

```bash
htop                       # CPU and memory (press q to exit)
df -h                      # Disk usage
free -h                    # Memory summary
```

### Restarting Caddy (if you change the Caddyfile)

```bash
sudo systemctl restart caddy
```

### Restarting PostgreSQL (rarely needed)

```bash
sudo systemctl restart postgresql
```

### Renewing HTTPS Certificates

Caddy handles this automatically. Certificates renew before they expire with zero downtime. No action needed.

---

## 24. Updating the Application

### If You Used GitHub (Option B — Recommended)

```bash
su - stbcs
cd /opt/stb-cybersecurity

# Pull latest code
git pull origin main

# Install any new dependencies
npm ci

# Rebuild
npm run build

# Push any schema changes (safe — only adds new tables/columns, never drops)
set -a; source .env; set +a
npx drizzle-kit push

# Restart the application
pm2 restart stbcs
```

### If You Used Zip (Option A)

1. Download the new zip from Replit
2. Upload to server: `scp stb-cybersecurity.zip root@YOUR_SERVER_IP:/opt/`
3. On the server:

```bash
su - stbcs
cd /opt

# Back up current version
cp -r stb-cybersecurity stb-cybersecurity.bak

# Extract new version (overwrite files)
unzip -o stb-cybersecurity.zip -d stb-cybersecurity

cd stb-cybersecurity
npm ci
npm run build
set -a; source .env; set +a
npx drizzle-kit push
pm2 restart stbcs
```

---

## 25. Monitoring & Logs

### Application Logs

```bash
# Live output
su - stbcs
pm2 logs stbcs

# Log files on disk
tail -f /opt/stb-cybersecurity/logs/output.log
tail -f /opt/stb-cybersecurity/logs/error.log
```

### Caddy Logs

```bash
journalctl -u caddy -f              # Live
journalctl -u caddy --since today   # Today's logs
```

### PostgreSQL Logs

```bash
tail -f /var/log/postgresql/postgresql-16-main.log
```

### System Logs

```bash
journalctl -f                 # All system logs (live)
dmesg | tail -20               # Kernel messages
```

### PM2 Monitoring Dashboard

For a real-time dashboard showing CPU, memory, and restart count:

```bash
su - stbcs
pm2 monit
```

Press `Ctrl+C` to exit.

---

## 26. Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Database pool connection" error** | Check `DATABASE_URL` in `.env`. Make sure it includes `?sslmode=disable`. Verify PostgreSQL is running: `sudo systemctl status postgresql` |
| **Application won't start** | Check logs: `pm2 logs stbcs --lines 50`. Most common cause: missing `.env` values |
| **Site shows "502 Bad Gateway"** | The app isn't running. Check: `pm2 status`. If offline: `pm2 restart stbcs` |
| **HTTPS certificate errors** | DNS isn't pointed yet. Caddy gets certs automatically once DNS resolves to this server. Check: `dig stbcybersecurity.com` |
| **"Port 5000 already in use"** | Another process is using port 5000. Run: `lsof -i :5000` to find it, then `kill -9 PID` |
| **Stripe webhooks failing** | Verify webhook URL is `https://stbcybersecurity.com/api/stripe/webhook` and the signing secret matches `STRIPE_WEBHOOK_SECRET` in `.env` |
| **Emails not sending** | Verify `RESEND_API_KEY` in `.env`. Check the Resend dashboard for delivery logs |
| **npm ci fails** | Missing system libraries. Re-run Step 8. If `sharp` fails specifically, try: `npm rebuild sharp` |
| **Schema push fails** | Verify database connection: `sudo -u stbcs psql -d stbcs -c "SELECT 1;"`. Check `.env` DATABASE_URL syntax |
| **Threat feeds not loading** | They start automatically ~60 seconds after boot. Check logs: `pm2 logs stbcs --lines 50` and look for feed/scraper messages |
| **WebSocket errors (SSH/SFTP/RDP tools)** | Caddy handles WebSocket upgrades automatically. If using Nginx instead, you must add `proxy_set_header Upgrade $http_upgrade;` and `proxy_set_header Connection "upgrade";` |
| **Out of memory** | Check with `free -h`. The `ecosystem.config.cjs` limits the app to 1.5GB. Increase `max_memory_restart` if your server has more RAM |
| **Server rebooted, app not running** | PM2 startup wasn't configured. Re-run Step 16's `pm2 startup` command as root |
| **Permission denied errors** | Files should be owned by `stbcs`. Fix: `sudo chown -R stbcs:stbcs /opt/stb-cybersecurity` |
| **Caddy won't start** | Check config syntax: `caddy validate --config /etc/caddy/Caddyfile`. Check logs: `journalctl -u caddy --lines 20` |

---

## 27. Quick Reference Card

Keep this handy for everyday operations:

```
=======================================================
  STBCS -- Quick Reference
=======================================================

  SSH into server:     ssh root@YOUR_SERVER_IP
  Switch to app user:  su - stbcs
  App directory:       /opt/stb-cybersecurity

  -- Application ------------------------------------
  Start:               pm2 start ecosystem.config.cjs
  Stop:                pm2 stop stbcs
  Restart:             pm2 restart stbcs
  Status:              pm2 status
  Logs (live):         pm2 logs stbcs
  Logs (last 100):     pm2 logs stbcs --lines 100
  Monitor:             pm2 monit

  -- Update & Deploy --------------------------------
  Pull code:           git pull origin main
  Install deps:        npm ci
  Build:               npm run build
  Schema sync:         set -a; source .env; set +a
                       npx drizzle-kit push
  Full deploy:         git pull && npm ci && npm run build && pm2 restart stbcs

  -- Database ----------------------------------------
  Connect:             sudo -u stbcs psql -d stbcs
  Backup now:          /opt/stb-cybersecurity/backup.sh
  Backups dir:         /opt/backups/

  -- Web Server (Caddy) -----------------------------
  Config file:         /etc/caddy/Caddyfile
  Restart Caddy:       sudo systemctl restart caddy
  Caddy logs:          journalctl -u caddy -f

  -- Health Check ------------------------------------
  curl https://stbcybersecurity.com/health

  -- Environment -------------------------------------
  .env file:           /opt/stb-cybersecurity/.env
  Edit .env:           nano /opt/stb-cybersecurity/.env
  After editing .env:  pm2 restart stbcs

=======================================================
```

---

## Architecture Overview

This is what runs on the server and how the pieces connect:

```
Internet
  |
  v
[Caddy] :443 (HTTPS, auto-TLS, gzip, WebSocket passthrough)
  |
  v
[Node.js / Express] :5000 (STBCS application)
  |-- Static files from dist/public/ (React SPA)
  |-- REST API routes (/api/*)
  |-- WebSocket servers (SSH, SFTP, RDP, Telnet)
  |-- Scheduled jobs (threat feed scrapers every 15min, monitors every 5min)
  |-- OG image generation (satori + resvg)
  |
  v
[PostgreSQL] :5432 (53 tables, local socket, no SSL needed)
```

| Component | Location | Managed By |
|-----------|----------|------------|
| STBCS Application | `/opt/stb-cybersecurity/dist/index.cjs` | PM2 (port 5000) |
| PostgreSQL Database | Local, port 5432 | systemd |
| Caddy Reverse Proxy | `/etc/caddy/Caddyfile` | systemd (ports 80 & 443) |
| Threat Feed Scrapers | Built into the app | Automatic (every 15min) |
| Uptime Monitors | Built into the app | Automatic (every 5min) |
| Database Backups | `/opt/backups/` | cron (daily at 3 AM) |
| HTTPS Certificates | Managed by Caddy | Automatic renewal |
| Security Patches | Ubuntu unattended-upgrades | Automatic |
| Brute-Force Protection | Fail2Ban | systemd |

---

## Important Files on the Server

| File | Purpose |
|------|---------|
| `/opt/stb-cybersecurity/.env` | All secrets and configuration (chmod 600) |
| `/opt/stb-cybersecurity/ecosystem.config.cjs` | PM2 process configuration |
| `/opt/stb-cybersecurity/backup.sh` | Database backup script |
| `/opt/stb-cybersecurity/dist/index.cjs` | Production server entry point |
| `/opt/stb-cybersecurity/dist/public/` | Compiled React frontend |
| `/opt/stb-cybersecurity/logs/output.log` | Application stdout |
| `/opt/stb-cybersecurity/logs/error.log` | Application stderr |
| `/etc/caddy/Caddyfile` | Caddy reverse proxy config |
| `/etc/fail2ban/jail.local` | Fail2Ban brute-force rules |
| `/opt/backups/` | Database backup archives |

---

**STB Cybersecurity** — Enterprise Threat Intelligence for SMBs  
stbcybersecurity.com | (855) STB-1987 | kbpc.inc@gmail.com
