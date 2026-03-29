#!/bin/bash
set -euo pipefail

# ============================================================
# STB Cybersecurity — Dedicated Server Setup Script
# ============================================================
# Run this as root on a fresh Ubuntu 24.04 LTS server.
#
# Usage:
#   chmod +x setup.sh
#   sudo ./setup.sh
#
# This script will:
#   1. Update the system and install all dependencies
#   2. Install Node.js 20 LTS
#   3. Install and configure PostgreSQL 16
#   4. Create the database and user
#   5. Install native libraries for sharp, resvg, ssh2, etc.
#   6. Configure the firewall (UFW)
#   7. Install and configure Fail2Ban
#   8. Create a dedicated 'stbcs' system user
#   9. Install PM2 globally
#  10. Install Caddy with your domain configuration
#  11. Set up automated daily database backups
#  12. Enable automatic security updates
#  13. Generate a .env template for you to fill in
#
# After this script finishes, you still need to:
#   - Edit .env with your real API keys and secrets
#   - Run: deploy/go.sh (builds & starts everything)
#   - Point your DNS A records to this server's IP
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

APP_DIR="/opt/stb-cybersecurity"
BACKUP_DIR="/opt/backups"
APP_USER="stbcs"

log()    { echo -e "${GREEN}[STBCS]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()    { echo -e "${RED}[ERROR]${NC} $1"; }
header() { echo -e "\n${CYAN}${BOLD}══════════════════════════════════════════${NC}"; echo -e "${CYAN}${BOLD}  $1${NC}"; echo -e "${CYAN}${BOLD}══════════════════════════════════════════${NC}\n"; }

if [ "$(id -u)" -ne 0 ]; then
  err "This script must be run as root. Use: sudo ./setup.sh"
  exit 1
fi

header "STB Cybersecurity — Server Setup"
echo -e "This will configure a fresh Ubuntu 24.04 server to run STBCS."
echo -e "The process takes approximately 5-10 minutes.\n"

read -p "Enter the database password you'd like to use for STBCS: " -s DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
  err "Database password cannot be empty."
  exit 1
fi

read -p "Enter your primary domain (default: stbcybersecurity.com): " DOMAIN
DOMAIN=${DOMAIN:-stbcybersecurity.com}

read -p "Enter your timezone (default: America/New_York): " TZ_INPUT
TZ_INPUT=${TZ_INPUT:-America/New_York}

# ──────────────────────────────────────────
header "Step 1/12: System Update & Essential Tools"
# ──────────────────────────────────────────
apt update && apt upgrade -y
apt install -y \
  curl wget git unzip build-essential software-properties-common \
  ca-certificates gnupg lsb-release htop

timedatectl set-timezone "$TZ_INPUT"
log "Timezone set to $TZ_INPUT"
log "System updated and essential tools installed."

# ──────────────────────────────────────────
header "Step 2/12: Install Node.js 20 LTS"
# ──────────────────────────────────────────
if command -v node &>/dev/null && node -v | grep -q "v20"; then
  log "Node.js 20 already installed: $(node -v)"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
  log "Node.js installed: $(node -v)"
fi
log "npm version: $(npm -v)"

# ──────────────────────────────────────────
header "Step 3/12: Install PostgreSQL 16"
# ──────────────────────────────────────────
if command -v psql &>/dev/null; then
  log "PostgreSQL already installed."
else
  apt install -y postgresql postgresql-contrib
fi
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL is running."

# ──────────────────────────────────────────
header "Step 4/12: Create Database & User"
# ──────────────────────────────────────────
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$APP_USER'" | grep -q 1; then
  log "Database user '$APP_USER' already exists."
else
  sudo -u postgres psql -c "CREATE USER $APP_USER WITH PASSWORD '$DB_PASSWORD';"
  log "Database user '$APP_USER' created."
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$APP_USER'" | grep -q 1; then
  log "Database '$APP_USER' already exists."
else
  sudo -u postgres psql -c "CREATE DATABASE $APP_USER OWNER $APP_USER;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $APP_USER TO $APP_USER;"
  log "Database '$APP_USER' created."
fi

# ──────────────────────────────────────────
header "Step 5/12: Install Native System Libraries"
# ──────────────────────────────────────────
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
log "Native libraries installed (sharp, resvg, satori, ssh2 support)."

# ──────────────────────────────────────────
header "Step 6/12: Configure Firewall (UFW)"
# ──────────────────────────────────────────
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP for cert renewal'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
log "Firewall enabled: SSH (22), HTTP (80), HTTPS (443) allowed."

# ──────────────────────────────────────────
header "Step 7/12: Install Fail2Ban"
# ──────────────────────────────────────────
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'JAILEOF'
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
JAILEOF

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2Ban configured: 3 failed SSH attempts = 2-hour ban."

# ──────────────────────────────────────────
header "Step 8/12: Create Application User"
# ──────────────────────────────────────────
if id "$APP_USER" &>/dev/null; then
  log "User '$APP_USER' already exists."
else
  adduser --disabled-password --gecos "STBCS Application" "$APP_USER"
  usermod -aG sudo "$APP_USER"
  log "User '$APP_USER' created with sudo access."
fi

# ──────────────────────────────────────────
header "Step 9/12: Install PM2"
# ──────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  log "PM2 already installed."
else
  npm install -g pm2
  log "PM2 installed globally."
fi

# ──────────────────────────────────────────
header "Step 10/12: Install & Configure Caddy"
# ──────────────────────────────────────────
if command -v caddy &>/dev/null; then
  log "Caddy already installed."
else
  apt install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
    gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
    tee /etc/apt/sources.list.d/caddy-stable.list
  apt update
  apt install -y caddy
  log "Caddy installed."
fi

cat > /etc/caddy/Caddyfile << CADDYEOF
$DOMAIN {
    reverse_proxy localhost:5000
    header -Server
    encode gzip zstd
}

www.$DOMAIN {
    redir https://$DOMAIN{uri} permanent
}

stoptbcs.com {
    redir https://$DOMAIN{uri} permanent
}

www.stoptbcs.com {
    redir https://$DOMAIN{uri} permanent
}
CADDYEOF

systemctl enable caddy
systemctl restart caddy
log "Caddy configured for $DOMAIN with auto-HTTPS."

# ──────────────────────────────────────────
header "Step 11/12: Set Up Automated Backups"
# ──────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

cat > "$APP_DIR/backup.sh" << 'BACKUPEOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=14
sudo -u stbcs pg_dump -U stbcs stbcs | gzip > "${BACKUP_DIR}/stbcs_${TIMESTAMP}.sql.gz"
find "${BACKUP_DIR}" -name "stbcs_*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "[$(date)] Backup completed: stbcs_${TIMESTAMP}.sql.gz"
BACKUPEOF

chmod +x "$APP_DIR/backup.sh" 2>/dev/null || true

(crontab -l 2>/dev/null | grep -v 'backup.sh'; echo "0 3 * * * $APP_DIR/backup.sh >> $BACKUP_DIR/backup.log 2>&1") | crontab -
log "Daily database backups configured at 3:00 AM (14-day retention)."

# ──────────────────────────────────────────
header "Step 12/12: Enable Automatic Security Updates"
# ──────────────────────────────────────────
apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' > /etc/apt/apt.conf.d/51auto-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades
log "Automatic security updates enabled."

# ──────────────────────────────────────────
header "Generating Configuration Files"
# ──────────────────────────────────────────

SESSION_SECRET=$(openssl rand -hex 32)

mkdir -p "$APP_DIR/logs"

if [ ! -f "$APP_DIR/.env" ]; then
cat > "$APP_DIR/.env" << ENVEOF
# ============================================================
# STB Cybersecurity — Production Environment
# Generated: $(date)
# ============================================================

# Core
NODE_ENV=production
PORT=5000

# Database (local PostgreSQL, no SSL needed)
DATABASE_URL=postgresql://$APP_USER:$DB_PASSWORD@localhost:5432/$APP_USER?sslmode=disable

# Domain
CUSTOM_DOMAIN=$DOMAIN
BASE_URL=https://$DOMAIN

# Session (auto-generated — keep this secret)
SESSION_SECRET=$SESSION_SECRET

# ============================================================
# PASTE YOUR API KEYS BELOW (copy from Replit Secrets)
# ============================================================

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email via Resend (REQUIRED for notifications)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@$DOMAIN

# ============================================================
# OPTIONAL: Premium Threat Feed API Keys
# The platform works without these. Add any you have.
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
ENVEOF

chmod 600 "$APP_DIR/.env"
log ".env template created at $APP_DIR/.env"
else
warn ".env already exists — not overwriting."
fi

cat > "$APP_DIR/ecosystem.config.cjs" << 'PM2EOF'
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
PM2EOF

log "PM2 ecosystem config created."

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$BACKUP_DIR"

# PM2 boot startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" --silent || true

# ──────────────────────────────────────────
header "Setup Complete!"
# ──────────────────────────────────────────

echo -e "${GREEN}${BOLD}Server is fully configured. Here's what to do next:${NC}\n"
echo -e "  ${CYAN}1.${NC} Edit .env with your real API keys:"
echo -e "     ${BOLD}nano $APP_DIR/.env${NC}"
echo -e "     Fill in: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY,"
echo -e "     STRIPE_WEBHOOK_SECRET, and RESEND_API_KEY\n"
echo -e "  ${CYAN}2.${NC} Build and start the application:"
echo -e "     ${BOLD}su - $APP_USER${NC}"
echo -e "     ${BOLD}cd $APP_DIR && ./deploy/go.sh${NC}\n"
echo -e "  ${CYAN}3.${NC} Point your DNS A records to this server's IP:"
echo -e "     ${BOLD}$DOMAIN     →  $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')${NC}"
echo -e "     ${BOLD}www.$DOMAIN →  $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')${NC}\n"
echo -e "  ${CYAN}4.${NC} Update Stripe webhook URL to:"
echo -e "     ${BOLD}https://$DOMAIN/api/stripe/webhook${NC}\n"
echo -e "${GREEN}${BOLD}That's it! The server will handle everything else automatically.${NC}"
echo -e "HTTPS certificates, backup rotation, security patches — all automated.\n"
