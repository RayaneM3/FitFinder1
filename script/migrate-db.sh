#!/usr/bin/env bash
# ============================================================
# migrate-db.sh — Dump a local Postgres DB and restore it to
# a remote (e.g. Railway) Postgres instance.
#
# Usage:
#   ./script/migrate-db.sh <SOURCE_URL> <TARGET_URL>
#
# Example:
#   ./script/migrate-db.sh \
#     "postgresql://user:pass@localhost:5432/fitfinder" \
#     "postgresql://user:pass@railway-host:5432/railway"
#
# Requires: pg_dump, psql (from postgresql client tools)
# ============================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -lt 2 ]; then
  echo -e "${RED}Usage: $0 <SOURCE_DATABASE_URL> <TARGET_DATABASE_URL>${NC}"
  exit 1
fi

SOURCE_URL="$1"
TARGET_URL="$2"
DUMP_FILE="fitfinder_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${YELLOW}▸ Step 1/4 — Dumping source database...${NC}"
pg_dump --no-owner --no-acl --clean --if-exists "$SOURCE_URL" > "$DUMP_FILE"
echo -e "${GREEN}  ✓ Dump written to ${DUMP_FILE} ($(du -h "$DUMP_FILE" | cut -f1))${NC}"

echo -e "${YELLOW}▸ Step 2/4 — Restoring to target database...${NC}"
psql "$TARGET_URL" < "$DUMP_FILE"
echo -e "${GREEN}  ✓ Restore complete${NC}"

echo -e "${YELLOW}▸ Step 3/4 — Verifying core tables...${NC}"
TABLES=("users" "profiles" "trainer_profiles" "client_profiles" "conversations" "messages" "orders" "plans" "favorites" "reviews" "reports" "blocked_users")
ALL_OK=true
for TABLE in "${TABLES[@]}"; do
  COUNT=$(psql "$TARGET_URL" -t -A -c "SELECT count(*) FROM \"$TABLE\";" 2>/dev/null || echo "MISSING")
  if [ "$COUNT" = "MISSING" ]; then
    echo -e "  ${RED}✗ $TABLE — table not found${NC}"
    ALL_OK=false
  else
    echo -e "  ${GREEN}✓ $TABLE — $COUNT rows${NC}"
  fi
done

echo -e "${YELLOW}▸ Step 4/4 — Pushing latest schema with Drizzle...${NC}"
DATABASE_URL="$TARGET_URL" npx drizzle-kit push
echo -e "${GREEN}  ✓ Schema up to date${NC}"

if $ALL_OK; then
  echo -e "\n${GREEN}══════════════════════════════════════${NC}"
  echo -e "${GREEN}  Migration completed successfully!${NC}"
  echo -e "${GREEN}══════════════════════════════════════${NC}"
else
  echo -e "\n${YELLOW}══════════════════════════════════════${NC}"
  echo -e "${YELLOW}  Migration done with warnings — check missing tables above.${NC}"
  echo -e "${YELLOW}══════════════════════════════════════${NC}"
fi

echo -e "\n${YELLOW}Tip: Remove the dump file when you're done:${NC}"
echo "  rm $DUMP_FILE"
