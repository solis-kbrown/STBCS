#!/bin/bash
set -euo pipefail

# ============================================================
# STB Cybersecurity — Update Script
# ============================================================
# Run this as the 'stbcs' user to pull the latest code,
# rebuild, and restart the application.
#
# Usage:
#   cd /opt/stb-cybersecurity
#   ./deploy/update.sh
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
header() { echo -e "\n${CYAN}${BOLD}  $1${NC}\n"; }

cd "$APP_DIR"
set -a; source .env; set +a

header "STB Cybersecurity — Update"

# Pull latest code (if git repo)
if [ -d .git ]; then
  header "Pulling latest code..."
  git pull origin main
  log "Code updated from GitHub."
else
  warn "Not a git repository — skipping git pull."
  warn "If you downloaded a new zip, extract it first, then run this script."
fi

header "Installing dependencies..."
npm ci
log "Dependencies installed."

header "Building production bundle..."
npm run build
log "Build complete."

header "Pushing database schema..."
npx drizzle-kit push --force
log "Schema synced."

header "Restarting application..."
pm2 restart stbcs
log "Application restarted."

sleep 3
HEALTH=$(curl -sf http://localhost:5000/health 2>/dev/null || echo "FAIL")
if echo "$HEALTH" | grep -q '"ok"'; then
  echo ""
  echo -e "${GREEN}${BOLD}  Update complete — STBCS is running!${NC}"
  echo ""
else
  warn "Health check pending — app may still be starting up."
  warn "Check: pm2 logs stbcs"
fi
