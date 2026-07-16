#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# start.sh — Local dev launcher for AI SaaS
#
# Starts both the Express server (nodemon + HMR-ready) and the Vite client
# (built-in HMR) in parallel. Killing this script (Ctrl+C) stops both.
# ──────────────────────────────────────────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"

# ANSI colours
CYAN="\033[0;36m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RESET="\033[0m"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║        AI SaaS — Dev Launcher        ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${RESET}"

# ── Dependency checks ────────────────────────────────────────────────────────

check_deps() {
  local dir="$1"
  local label="$2"
  if [ ! -d "$dir/node_modules" ]; then
    echo -e "${YELLOW}[warn]${RESET} node_modules missing in $label — running npm install…"
    (cd "$dir" && npm install)
  fi
}

check_deps "$CLIENT_DIR" "client"
check_deps "$SERVER_DIR" "server"

# ── Launch servers ───────────────────────────────────────────────────────────

echo -e "${GREEN}[server]${RESET} Starting Express + nodemon (HMR)…"
(cd "$SERVER_DIR" && npm run dev) &
SERVER_PID=$!

echo -e "${GREEN}[client]${RESET} Starting Vite dev server (HMR)…"
(cd "$CLIENT_DIR" && npm run dev) &
CLIENT_PID=$!

echo ""
echo -e "  ${CYAN}Server PID : ${SERVER_PID}${RESET}"
echo -e "  ${CYAN}Client PID : ${CLIENT_PID}${RESET}"
echo -e "  Press ${YELLOW}Ctrl+C${RESET} to stop both processes."
echo ""

# ── Graceful shutdown on Ctrl+C ──────────────────────────────────────────────

cleanup() {
  echo -e "\n${YELLOW}[shutdown]${RESET} Stopping dev servers…"
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null
  wait "$SERVER_PID" "$CLIENT_PID" 2>/dev/null
  echo -e "${GREEN}[done]${RESET} All processes stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep the script alive until both child processes exit
wait "$SERVER_PID" "$CLIENT_PID"
