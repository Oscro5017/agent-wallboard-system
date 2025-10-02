# 6.6.4 Database & Sample Data — Agent Wallboard System

Hybrid Database Architecture: **SQLite** for master data and **MongoDB** for real‑time data. Includes schemas, sample data, setup scripts, and verification steps.

## Quick Start

```bash
# Linux/macOS
cd database/sqlite && chmod +x setup.sh && ./setup.sh && cd ../mongodb && chmod +x setup.sh && ./setup.sh
```

**Windows (PowerShell):**
```powershell
cd database\sqlite
sqlite3 wallboard.db < init.sql
sqlite3 wallboard.db < sample_data.sql
cd ..\mongodb
npm install mongoose
node sample_data.js
```

## .env
Copy `.env.example` to `.env` and adjust if needed:
```
SQLITE_DB_PATH=./database/sqlite/wallboard.db
MONGODB_URI=mongodb://localhost:27017/wallboard
```

## Verification (SQLite)

```bash
sqlite3 database/sqlite/wallboard.db "SELECT COUNT(*) FROM agents;"   # expect 13
sqlite3 database/sqlite/wallboard.db "SELECT COUNT(*) FROM teams;"    # expect 3
sqlite3 database/sqlite/wallboard.db "SELECT COUNT(*) FROM system_config;"  # expect 8
```

## Verification (MongoDB)

```bash
mongosh wallboard --eval "show collections"
mongosh wallboard --eval "db.messages.countDocuments()"
mongosh wallboard --eval "db.agent_status.countDocuments()"
mongosh wallboard --eval "db.connection_logs.countDocuments()"
```

## Maintenance

- Reset everything:
  ```bash
  chmod +x database/reset_all.sh && ./database/reset_all.sh
  ```
- Backup:
  ```bash
  chmod +x database/backup.sh && ./database/backup.sh
  ```
```

