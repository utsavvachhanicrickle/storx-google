#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and set production values first."
  exit 1
fi

echo "Installing dependencies..."
npm ci

echo "Building production bundle..."
npm run build

if command -v pm2 >/dev/null 2>&1; then
  pm2 delete cyberls-google 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
  echo "Started with PM2 on port 3000"
else
  echo "PM2 not found. Run manually: npm run start"
fi
