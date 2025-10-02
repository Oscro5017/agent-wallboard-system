#!/bin/bash

BACKUP_DIR="database/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Creating backup..."

# Backup SQLite
echo "📊 Backing up SQLite..."
cp database/sqlite/wallboard.db "$BACKUP_DIR/" || echo "ℹ️ SQLite DB not found yet, skipping."

# Backup MongoDB
echo "🍃 Backing up MongoDB..."
mongodump --db wallboard --out "$BACKUP_DIR/mongodb" --quiet || echo "ℹ️ MongoDB dump skipped (mongodump not available or DB missing)."

echo ""
echo "✅ Backup completed!"
echo "📁 Location: $BACKUP_DIR"
