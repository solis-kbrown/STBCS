#!/bin/bash
set -euo pipefail

# ============================================================
# STB Cybersecurity — Build & Launch Script
# ============================================================
# Run this as the 'stbcs' user after setup.sh has completed
# and you've filled in your .env file.
#
# Usage:
#   cd /opt/stb-cybersecurity
#   ./deploy/go.sh
#
# This script will:
#   1. Verify your .env is configured
#   2. Install Node.js dependencies
#   3. Build the production bundle
#   4. Push the database schema (53 tables)
#   5. Start the application with PM2
#   6. Save PM2 process list for auto-restart on boot
#   7. Run a health check
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

APP_DIR="/opt/stb-cybersecurity"

log()    { echo -e "${GREEN}[STBCS]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()    { echo -e "${RED}[ERROR]${NC} $1"; }
header() { echo -e "\n${CYAN}${BOLD}  $1${NC}\n"; }

cd "$APP_DIR"

# ──────────────────────────────────────────
header "Checking .env configuration..."
# ──────────────────────────────────────────

if [ ! -f .env ]; then
  err ".env file not found at $APP_DIR/.env"
  err "Run setup.sh first, then edit .env with your API keys."
  exit 1
fi

set -a; source .env; set +a

MISSING=0

check_var() {
  local var_name=$1
  local var_value="${!var_name:-}"
  if [ -z "$var_value" ]; then
    err "Missing required variable: $var_name"
    MISSING=1
  else
    log "$var_name is set."
  fi
}

check_var "DATABASE_URL"
check_var "SESSION_SECRET"
check_var "STRIPE_SECRET_KEY"
check_var "STRIPE_PUBLISHABLE_KEY"
check_var "STRIPE_WEBHOOK_SECRET"
check_var "RESEND_API_KEY"

if [ "$MISSING" -eq 1 ]; then
  echo ""
  err "Please fill in all required variables in .env before continuing."
  err "Edit with: nano $APP_DIR/.env"
  exit 1
fi

log "All required environment variables are set."

# ──────────────────────────────────────────
header "Step 1/5: Installing dependencies..."
# ──────────────────────────────────────────
npm ci
log "Dependencies installed."

# ──────────────────────────────────────────
header "Step 2/5: Building production bundle..."
# ──────────────────────────────────────────
npm run build
log "Build complete — dist/index.cjs and dist/public/ ready."

# ──────────────────────────────────────────
header "Step 3/5: Pushing database schema..."
# ──────────────────────────────────────────
npx drizzle-kit push --force
log "Database schema pushed (all tables created)."

# ──────────────────────────────────────────
header "Step 4/5: Starting application with PM2..."
# ──────────────────────────────────────────
pm2 delete stbcs 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
log "Application started and PM2 process list saved."

# ──────────────────────────────────────────
header "Step 5/5: Health check..."
# ──────────────────────────────────────────
sleep 5

HEALTH=$(curl -sf http://localhost:5000/health 2>/dev/null || echo "FAIL")

if echo "$HEALTH" | grep -q '"ok"'; then
  echo ""
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo -e "${GREEN}${BOLD}  STBCS is running!${NC}"
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo ""
  echo -e "  Health:  ${GREEN}OK${NC}"
  echo -e "  Local:   http://localhost:5000"
  echo -e "  Public:  https://${CUSTOM_DOMAIN:-stbcybersecurity.com}"
  echo ""
  echo -e "  ${CYAN}Logs:${NC}     pm2 logs stbcs"
  echo -e "  ${CYAN}Status:${NC}   pm2 status"
  echo -e "  ${CYAN}Monitor:${NC}  pm2 monit"
  echo -e "  ${CYAN}Restart:${NC}  pm2 restart stbcs"
  echo ""
  echo -e "  ${YELLOW}Don't forget:${NC}"
  echo -e "  - Point DNS A records to this server"
  echo -e "  - Update Stripe webhook URL to:"
  echo -e "    https://${CUSTOM_DOMAIN:-stbcybersecurity.com}/api/stripe/webhook"
  echo ""
else
  warn "Health check didn't respond yet. This may be normal if"
  warn "the app is still initializing (takes ~30 seconds)."
  warn ""
  warn "Check logs with: pm2 logs stbcs"
  warn "Check status with: pm2 status"
fi
