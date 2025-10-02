#!/bin/bash

echo "⚠️  This will DELETE all data and reset to initial state!"
echo "Continue? (yes/no)"
read -r response

if [ "$response" != "yes" ] ; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo ""
echo "🧹 Resetting databases..."

# Reset SQLite
echo "📊 Resetting SQLite..."
cd database/sqlite
chmod +x setup.sh
./setup.sh
cd ../..

# Reset MongoDB
echo "🍃 Resetting MongoDB..."
mongosh wallboard --eval "db.dropDatabase()" --quiet
cd database/mongodb
node sample_data.js
cd ../..

echo ""
echo "✅ Databases reset completed!"
echo ""
echo "🔍 Verify:"
echo "   SQLite: sqlite3 database/sqlite/wallboard.db 'SELECT COUNT(*) FROM agents;'"
echo "   MongoDB: mongosh wallboard --eval 'db.messages.countDocuments()'"
