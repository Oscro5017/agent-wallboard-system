const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to your database
const dbPath = path.resolve(__dirname, '../database/sqlite/wallboard.db');
const db = new sqlite3.Database(dbPath);

// Read SQL from file (create a file sample-data.sql with the SQL commands from tutorial)
const sqlFile = path.resolve(__dirname, '../database/sqlite/sample-data.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error initializing database:', err.message);
    } else {
        console.log('Database initialized successfully!');
    }
    db.close();
});
