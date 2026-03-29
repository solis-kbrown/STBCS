#!/bin/bash
# ============================================================
# STBCS Watchdog — Self-Healing Monitor
# ============================================================
# Monitors the STBCS platform and automatically recovers from
# known failure modes WITHOUT interrupting active user sessions.
#
# Services monitored:
#   - Node.js app (via PM2)
#   - PostgreSQL database
#   - Caddy reverse proxy
#   - Disk space & memory
#   - Application health endpoint
#   - PM2 log file sizes
#
# Recovery philosophy:
#   - Use PM2 reload (zero-downtime) instead of restart
#   - Only escalate to hard restart after multiple failures
#   - Cooldown periods prevent restart storms
#   - All actions logged for post-incident review
# ============================================================

set -euo pipefail

APP_DIR="/opt/stb-cybersecurity"
APP_NAME="stbcs"
APP_USER="stbcs"
HEALTH_URL="http://localhost:5000/health"
LOG_DIR="/opt/stb-cybersecurity/logs"
WATCHDOG_LOG="$LOG_DIR/watchdog.log"
PM2_ERROR_LOG="$LOG_DIR/error.log"
PM2_OUTPUT_LOG="$LOG_DIR/output.log"

CHECK_INTERVAL=30
HEALTH_TIMEOUT=10
MAX_HEALTH_FAILURES=3
MAX_LOG_SIZE_MB=100
DISK_WARN_PERCENT=85
DISK_CRITICAL_PERCENT=95
MEMORY_CRITICAL_PERCENT=90
RESTART_COOLDOWN=300
DB_CHECK_INTERVAL=60
CADDY_CHECK_INTERVAL=120

health_failures=0
last_restart=0
last_db_check=0
last_caddy_check=0
last_log_rotation=0
last_memory_check=0
consecutive_db_failures=0

mkdir -p "$LOG_DIR"

wlog() {
  local level="$1"
  shift
  local msg="$*"
  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$ts] [$level] $msg" >> "$WATCHDOG_LOG"
  if [ "$level" = "CRITICAL" ] || [ "$level" = "ERROR" ]; then
    echo "[$ts] [$level] $msg" >&2
  fi
}

now_epoch() {
  date +%s
}

can_restart() {
  local now
  now=$(now_epoch)
  local elapsed=$((now - last_restart))
  if [ "$elapsed" -ge "$RESTART_COOLDOWN" ]; then
    return 0
  else
    wlog "WARN" "Restart cooldown active (${elapsed}s/${RESTART_COOLDOWN}s elapsed). Skipping."
    return 1
  fi
}

graceful_reload() {
  wlog "INFO" "Performing zero-downtime reload (pm2 reload $APP_NAME)"
  if sudo -u "$APP_USER" bash -c "cd $APP_DIR && set -a && source .env && set +a && pm2 reload $APP_NAME --update-env" >> "$WATCHDOG_LOG" 2>&1; then
    last_restart=$(now_epoch)
    wlog "INFO" "Graceful reload completed successfully"
    return 0
  else
    wlog "ERROR" "Graceful reload failed"
    return 1
  fi
}

hard_restart() {
  wlog "WARN" "Performing hard restart (pm2 delete + start)"
  sudo -u "$APP_USER" bash -c "cd $APP_DIR && set -a && source .env && set +a && pm2 delete $APP_NAME 2>/dev/null; pm2 start ecosystem.config.cjs" >> "$WATCHDOG_LOG" 2>&1
  last_restart=$(now_epoch)
  sudo -u "$APP_USER" bash -c "pm2 save" >> "$WATCHDOG_LOG" 2>&1
  wlog "INFO" "Hard restart completed"
}

check_health() {
  local response
  local http_code

  http_code=$(curl -sf -o /dev/null -w "%{http_code}" --connect-timeout "$HEALTH_TIMEOUT" --max-time "$HEALTH_TIMEOUT" "$HEALTH_URL" 2>/dev/null) || http_code="000"

  if [ "$http_code" = "200" ]; then
    if [ "$health_failures" -gt 0 ]; then
      wlog "INFO" "Health check recovered after $health_failures failure(s)"
    fi
    health_failures=0
    return 0
  else
    health_failures=$((health_failures + 1))
    wlog "WARN" "Health check failed ($health_failures/$MAX_HEALTH_FAILURES) — HTTP $http_code"

    if [ "$health_failures" -ge "$MAX_HEALTH_FAILURES" ]; then
      wlog "ERROR" "Health check failed $MAX_HEALTH_FAILURES consecutive times"
      return 1
    fi
    return 0
  fi
}

check_pm2_process() {
  local status
  status=$(sudo -u "$APP_USER" bash -c "pm2 jlist 2>/dev/null" | python3 -c "
import sys, json
try:
    procs = json.load(sys.stdin)
    for p in procs:
        if p.get('name') == '$APP_NAME':
            print(p.get('pm2_env', {}).get('status', 'unknown'))
            sys.exit(0)
    print('not_found')
except:
    print('error')
" 2>/dev/null) || status="error"

  case "$status" in
    online)
      return 0
      ;;
    stopped|errored)
      wlog "ERROR" "PM2 process '$APP_NAME' status: $status"
      return 1
      ;;
    not_found)
      wlog "CRITICAL" "PM2 process '$APP_NAME' not found in process list"
      return 2
      ;;
    *)
      wlog "WARN" "PM2 process status unknown: $status"
      return 1
      ;;
  esac
}

check_pm2_restart_count() {
  local restarts
  restarts=$(sudo -u "$APP_USER" bash -c "pm2 jlist 2>/dev/null" | python3 -c "
import sys, json
try:
    procs = json.load(sys.stdin)
    for p in procs:
        if p.get('name') == '$APP_NAME':
            print(p.get('pm2_env', {}).get('restart_time', 0))
            sys.exit(0)
    print('0')
except:
    print('0')
" 2>/dev/null) || restarts=0

  if [ "$restarts" -gt 10 ]; then
    wlog "WARN" "PM2 has restarted $APP_NAME $restarts times — possible crash loop"
  fi
}

check_postgres() {
  local now
  now=$(now_epoch)
  if [ $((now - last_db_check)) -lt "$DB_CHECK_INTERVAL" ]; then
    return 0
  fi
  last_db_check=$now

  if systemctl is-active --quiet postgresql; then
    if sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
      if [ "$consecutive_db_failures" -gt 0 ]; then
        wlog "INFO" "PostgreSQL recovered after $consecutive_db_failures failure(s)"
      fi
      consecutive_db_failures=0
      return 0
    else
      consecutive_db_failures=$((consecutive_db_failures + 1))
      wlog "ERROR" "PostgreSQL is running but not responding to queries (failure $consecutive_db_failures)"
      if [ "$consecutive_db_failures" -ge 3 ]; then
        wlog "CRITICAL" "PostgreSQL unresponsive — attempting restart"
        systemctl restart postgresql
        sleep 5
        if sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
          wlog "INFO" "PostgreSQL restarted successfully"
          consecutive_db_failures=0
        else
          wlog "CRITICAL" "PostgreSQL restart failed — manual intervention required"
        fi
      fi
      return 1
    fi
  else
    consecutive_db_failures=$((consecutive_db_failures + 1))
    wlog "CRITICAL" "PostgreSQL service is not running (failure $consecutive_db_failures)"
    systemctl start postgresql
    sleep 5
    if systemctl is-active --quiet postgresql; then
      wlog "INFO" "PostgreSQL started successfully"
      consecutive_db_failures=0
    else
      wlog "CRITICAL" "PostgreSQL failed to start — manual intervention required"
    fi
    return 1
  fi
}

check_caddy() {
  local now
  now=$(now_epoch)
  if [ $((now - last_caddy_check)) -lt "$CADDY_CHECK_INTERVAL" ]; then
    return 0
  fi
  last_caddy_check=$now

  if ! systemctl is-active --quiet caddy; then
    wlog "ERROR" "Caddy is not running — attempting restart"
    systemctl restart caddy
    sleep 3
    if systemctl is-active --quiet caddy; then
      wlog "INFO" "Caddy restarted successfully"
    else
      wlog "CRITICAL" "Caddy failed to restart — HTTPS/proxy is down"
    fi
    return 1
  fi
  return 0
}

check_disk_space() {
  local usage
  usage=$(df -h / | awk 'NR==2 {gsub(/%/,""); print $5}')

  if [ "$usage" -ge "$DISK_CRITICAL_PERCENT" ]; then
    wlog "CRITICAL" "Disk usage at ${usage}% — critical threshold reached"
    rotate_pm2_logs
    clean_old_watchdog_logs
    return 1
  elif [ "$usage" -ge "$DISK_WARN_PERCENT" ]; then
    wlog "WARN" "Disk usage at ${usage}% — approaching capacity"
    rotate_pm2_logs
    return 0
  fi
  return 0
}

check_memory() {
  local now
  now=$(now_epoch)
  if [ $((now - last_memory_check)) -lt 120 ]; then
    return 0
  fi
  last_memory_check=$now

  local mem_total mem_available pct_used
  mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
  pct_used=$(( (mem_total - mem_available) * 100 / mem_total ))

  if [ "$pct_used" -ge "$MEMORY_CRITICAL_PERCENT" ]; then
    wlog "CRITICAL" "Memory usage at ${pct_used}% (${mem_available}kB available of ${mem_total}kB)"
    if can_restart; then
      wlog "WARN" "High memory — performing graceful reload to free memory"
      graceful_reload
    fi
    return 1
  fi
  return 0
}

rotate_pm2_logs() {
  local now
  now=$(now_epoch)
  if [ $((now - last_log_rotation)) -lt 3600 ]; then
    return 0
  fi
  last_log_rotation=$now

  for logfile in "$PM2_ERROR_LOG" "$PM2_OUTPUT_LOG"; do
    if [ -f "$logfile" ]; then
      local size_mb
      size_mb=$(du -m "$logfile" 2>/dev/null | awk '{print $1}')
      if [ "${size_mb:-0}" -ge "$MAX_LOG_SIZE_MB" ]; then
        wlog "INFO" "Rotating $logfile (${size_mb}MB > ${MAX_LOG_SIZE_MB}MB limit)"
        sudo -u "$APP_USER" bash -c "pm2 flush $APP_NAME" >> "$WATCHDOG_LOG" 2>&1
      fi
    fi
  done
}

clean_old_watchdog_logs() {
  if [ -f "$WATCHDOG_LOG" ]; then
    local size_mb
    size_mb=$(du -m "$WATCHDOG_LOG" 2>/dev/null | awk '{print $1}')
    if [ "${size_mb:-0}" -ge 50 ]; then
      wlog "INFO" "Trimming watchdog log (${size_mb}MB)"
      tail -n 5000 "$WATCHDOG_LOG" > "$WATCHDOG_LOG.tmp"
      mv "$WATCHDOG_LOG.tmp" "$WATCHDOG_LOG"
    fi
  fi
}

check_error_log_patterns() {
  if [ ! -f "$PM2_ERROR_LOG" ]; then
    return 0
  fi

  local recent_errors
  recent_errors=$(tail -n 100 "$PM2_ERROR_LOG" 2>/dev/null)

  if echo "$recent_errors" | grep -q "FATAL.*out of memory\|JavaScript heap out of memory\|ENOMEM" 2>/dev/null; then
    wlog "CRITICAL" "Out-of-memory error detected in error log"
    if can_restart; then
      graceful_reload
    fi
    return 1
  fi

  if echo "$recent_errors" | grep -c "too many clients" 2>/dev/null | grep -q "^[3-9]\|^[1-9][0-9]"; then
    wlog "ERROR" "Database pool exhaustion detected (too many clients)"
    if can_restart; then
      wlog "WARN" "Reloading app to reset database pool connections"
      graceful_reload
    fi
    return 1
  fi

  if echo "$recent_errors" | grep -q "App initialization failed after all retries" 2>/dev/null; then
    wlog "CRITICAL" "App failed to initialize — stuck in retry loop"
    if can_restart; then
      hard_restart
    fi
    return 1
  fi

  return 0
}

handle_health_failure() {
  wlog "CRITICAL" "App unresponsive — initiating recovery"

  check_postgres

  local pm2_status
  check_pm2_process
  pm2_status=$?

  if [ "$pm2_status" -eq 2 ]; then
    wlog "CRITICAL" "Process not in PM2 — performing full start"
    if can_restart; then
      hard_restart
      sleep 15
      health_failures=0
    fi
    return
  fi

  if can_restart; then
    wlog "INFO" "Attempting graceful reload first..."
    if graceful_reload; then
      sleep 15
      if check_health; then
        wlog "INFO" "Recovery successful via graceful reload"
        return
      fi
    fi

    wlog "WARN" "Graceful reload didn't fix it — escalating to hard restart"
    hard_restart
    sleep 20
    health_failures=0

    if check_health; then
      wlog "INFO" "Recovery successful via hard restart"
    else
      wlog "CRITICAL" "App still unresponsive after hard restart — manual intervention may be needed"
    fi
  fi
}

# ============================================================
# Main Loop
# ============================================================

wlog "INFO" "=========================================="
wlog "INFO" "STBCS Watchdog starting"
wlog "INFO" "  App:       $APP_NAME"
wlog "INFO" "  User:      $APP_USER"
wlog "INFO" "  Health:    $HEALTH_URL"
wlog "INFO" "  Interval:  ${CHECK_INTERVAL}s"
wlog "INFO" "  Cooldown:  ${RESTART_COOLDOWN}s"
wlog "INFO" "=========================================="

sleep 30

while true; do

  check_pm2_process
  pm2_result=$?
  if [ "$pm2_result" -ne 0 ]; then
    if can_restart; then
      if [ "$pm2_result" -eq 2 ]; then
        hard_restart
      else
        graceful_reload || hard_restart
      fi
      sleep 15
    fi
  fi

  check_health
  health_result=$?
  if [ "$health_result" -ne 0 ]; then
    handle_health_failure
  fi

  check_postgres

  check_caddy

  check_memory

  check_disk_space

  check_error_log_patterns

  check_pm2_restart_count

  rotate_pm2_logs

  sleep "$CHECK_INTERVAL"

done
