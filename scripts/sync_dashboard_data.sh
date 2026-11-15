#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/data/processed"
DEST="$ROOT/dashboard/public/data"
mkdir -p "$DEST"
cp "$SRC/dashboard_summary.json" "$DEST/"
cp "$SRC/cleaned_funds.csv" "$DEST/"
cp "$SRC/top_30_mutual_funds.csv" "$DEST/"
echo "Synced processed artifacts → dashboard/public/data"
