#!/bin/bash

# All-In-One AI - Auto Maintenance Script
# Automatically checks and updates the application

echo "=== All-In-One AI Auto-Maintenance ==="
echo "Time: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check frontend health
echo -e "${YELLOW}[1/5] Checking Frontend Status...${NC}"
FRONTEND=$(curl -s http://localhost:3000/api/health 2>/dev/null | jq -r '.status' 2>/dev/null)
if [ "$FRONTEND" = "ok" ]; then
  echo -e "${GREEN}✓ Frontend: Running${NC}"
else
  echo -e "${RED}✗ Frontend: Down - Restarting...${NC}"
  pkill -f "next dev" || true
  sleep 2
  cd /vercel/share/v0-project/frontend/web && PORT=3000 npm run dev > /tmp/next-dev.log 2>&1 &
  sleep 5
fi

# Check backend health
echo -e "${YELLOW}[2/5] Checking Backend Status...${NC}"
BACKEND=$(curl -s http://localhost:3001/api/v1/health 2>/dev/null | jq -r '.data.status' 2>/dev/null)
if [ "$BACKEND" = "ok" ]; then
  echo -e "${GREEN}✓ Backend: Running${NC}"
else
  echo -e "${RED}✗ Backend: Down - Restarting...${NC}"
  pkill -f "npm start" || true
  sleep 2
  cd /vercel/share/v0-project/backend && npm start > /tmp/backend.log 2>&1 &
  sleep 5
fi

# Check for build errors
echo -e "${YELLOW}[3/5] Building Application...${NC}"
cd /vercel/share/v0-project/frontend/web
BUILD=$(npm run build 2>&1 | grep -c "error" || echo "0")
if [ "$BUILD" = "0" ]; then
  echo -e "${GREEN}✓ Build: Successful${NC}"
else
  echo -e "${RED}✗ Build: Failed - See logs${NC}"
  tail -20 /tmp/build.log
fi

# Check disk space
echo -e "${YELLOW}[4/5] Checking System Resources...${NC}"
DISK=$(df -h /vercel/share/v0-project | awk 'NR==2 {print $5}' | cut -d'%' -f1)
if [ "$DISK" -lt 80 ]; then
  echo -e "${GREEN}✓ Disk Usage: ${DISK}%${NC}"
else
  echo -e "${RED}✗ Disk Usage: ${DISK}% (High)${NC}"
fi

# Check dependencies
echo -e "${YELLOW}[5/5] Checking Dependencies...${NC}"
cd /vercel/share/v0-project/frontend/web
OUTDATED=$(npm outdated 2>/dev/null | wc -l)
if [ "$OUTDATED" -le 1 ]; then
  echo -e "${GREEN}✓ Dependencies: Up to date${NC}"
else
  echo -e "${YELLOW}⚠ Dependencies: $(($OUTDATED - 1)) outdated${NC}"
fi

echo ""
echo -e "${GREEN}=== Maintenance Complete ===${NC}"
echo ""

# Log
LOG_DIR="/tmp/maintenance-logs"
mkdir -p "$LOG_DIR"
echo "$(date): Frontend=$FRONTEND, Backend=$BACKEND, Build=$BUILD, Disk=$DISK%" >> "$LOG_DIR/status.log"
