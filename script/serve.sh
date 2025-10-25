#!/usr/bin/env bash

set -euo pipefail

# Start Astro (built server) and Rails together.
# Defaults are dev-friendly; override via env vars as needed.

ASTRO_PORT="${ASTRO_PORT:-4321}"
RAILS_PORT="${RAILS_PORT:-3000}"
export RAILS_ENV="${RAILS_ENV:-development}"
export NODE_ENV="${NODE_ENV:-production}"
export BIND_ADDR="${BIND_ADDR:-0.0.0.0}"
export RAILS_URL="${RAILS_URL:-http://localhost:${RAILS_PORT}}"

# Clear stale server PID if present
rm -f tmp/pids/server.pid || true

echo "[serve] Building Astro (NODE_ENV=${NODE_ENV})..."
bun run build

echo "[serve] Starting Astro server on ${ASTRO_PORT} (RAILS_URL=${RAILS_URL})..."
PORT="${ASTRO_PORT}" bun ./dist/server/entry.mjs &
ASTRO_PID=$!

cleanup() {
  echo "[serve] Stopping Astro (pid ${ASTRO_PID})..."
  kill "${ASTRO_PID}" 2>/dev/null || true
  wait "${ASTRO_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [[ "${RAILS_ENV}" == "production" ]]; then
  if [[ -z "${SECRET_KEY_BASE:-}" ]]; then
    echo "[serve] WARNING: SECRET_KEY_BASE is not set in production; generating a temporary one for this process."
    export SECRET_KEY_BASE="$(ruby -e 'require "securerandom"; print SecureRandom.hex(64)')"
  fi
fi

echo "[serve] Starting Rails via thrust on ${RAILS_PORT} (RAILS_ENV=${RAILS_ENV}, BIND_ADDR=${BIND_ADDR})..."
./bin/thrust ./bin/rails server -p "${RAILS_PORT}" -b "${BIND_ADDR}"

