#!/bin/bash
# ============================================================
# STBCS Watchdog — One-Command Installer
# ============================================================
# Run as root on the OVH server:
#   bash /opt/stb-cybersecurity/deploy/install-watchdog.sh
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

APP_DIR="/opt/stb-cybersecurity"
WATCHDOG_SCRIPT="$APP_DIR/deploy/watchdog.sh"
SERVICE_FILE="$APP_DIR/deploy/watchdog.service"
SYSTEMD_TARGET="/etc/systemd/system/stbcs-watchdog.service"
LOG_DIR="$APP_DIR/logs"

log()    { echo -e "${GREEN}[INSTALL]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()    { echo -e "${RED}[ERROR]${NC} $1"; }
header() { echo -e "\n${CYAN}${BOLD}  $1${NC}\n"; }

if [ "$(id -u)" -ne 0 ]; then
  err "This script must be run as root."
  exit 1
fi

header "STBCS Watchdog Installer"

header "Step 1/5: Verifying files..."

if [ ! -f "$WATCHDOG_SCRIPT" ]; then
  err "Watchdog script not found at $WATCHDOG_SCRIPT"
  exit 1
fi
log "Found watchdog.sh"

if [ ! -f "$SERVICE_FILE" ]; then
  err "Service file not found at $SERVICE_FILE"
  exit 1
fi
log "Found watchdog.service"

header "Step 2/5: Setting permissions..."

chmod +x "$WATCHDOG_SCRIPT"
log "watchdog.sh marked executable"

mkdir -p "$LOG_DIR"
chown stbcs:stbcs "$LOG_DIR"
log "Log directory ready at $LOG_DIR"

header "Step 3/5: Installing systemd service..."

if systemctl is-active --quiet stbcs-watchdog 2>/dev/null; then
  log "Stopping existing watchdog service..."
  systemctl stop stbcs-watchdog
fi

cp "$SERVICE_FILE" "$SYSTEMD_TARGET"
systemctl daemon-reload
log "Service file installed and systemd reloaded"

header "Step 4/5: Enabling and starting watchdog..."

systemctl enable stbcs-watchdog
systemctl start stbcs-watchdog
log "Watchdog service enabled and started"

sleep 2

header "Step 5/5: Verifying..."

if systemctl is-active --quiet stbcs-watchdog; then
  echo ""
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo -e "${GREEN}${BOLD}  STBCS Watchdog is running!${NC}"
  echo -e "${GREEN}${BOLD}============================================${NC}"
  echo ""
  echo -e "  ${CYAN}Status:${NC}    systemctl status stbcs-watchdog"
  echo -e "  ${CYAN}Logs:${NC}      tail -f $LOG_DIR/watchdog.log"
  echo -e "  ${CYAN}Journal:${NC}   journalctl -u stbcs-watchdog -f"
  echo -e "  ${CYAN}Stop:${NC}      systemctl stop stbcs-watchdog"
  echo -e "  ${CYAN}Restart:${NC}   systemctl restart stbcs-watchdog"
  echo ""
  echo -e "  ${YELLOW}What the watchdog monitors:${NC}"
  echo -e "  - App health (every 30s)"
  echo -e "  - PM2 process state"
  echo -e "  - PostgreSQL connectivity (every 60s)"
  echo -e "  - Caddy proxy (every 120s)"
  echo -e "  - Memory usage (every 120s)"
  echo -e "  - Disk space"
  echo -e "  - Error log patterns (OOM, pool exhaustion, init failures)"
  echo -e "  - PM2 log rotation (auto-trim at 100MB)"
  echo ""
  echo -e "  ${YELLOW}Recovery actions (zero-downtime first):${NC}"
  echo -e "  - Graceful PM2 reload (no user interruption)"
  echo -e "  - Hard restart only as last resort"
  echo -e "  - Auto-restart PostgreSQL if down"
  echo -e "  - Auto-restart Caddy if down"
  echo -e "  - 5-minute cooldown between restarts"
  echo ""
else
  err "Watchdog service did not start properly."
  err "Check with: journalctl -u stbcs-watchdog -n 50"
  exit 1
fi
