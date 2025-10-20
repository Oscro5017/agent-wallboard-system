const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// ================= SQLite =================
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || './database/sqlite/wallboard.db';

function initSQLite() {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, '../../'); // สมมติ server.js อยู่ที่รากของ backend
    const dbPath = path.resolve(projectRoot, SQLITE_DB_PATH);

    console.log('🔍 SQLite Connection Details:');
    console.log(`   SQLITE_DB_PATH (env): ${SQLITE_DB_PATH}`);
    console.log(`   __dirname: ${__dirname}`);
    console.log(`   Project root: ${projectRoot}`);
    console.log(`   Resolved dbPath: ${dbPath}`);

    const dbDir = path.dirname(dbPath);
    console.log(`   Resolved dbDir: ${dbDir}`);

    if (!fs.existsSync(dbDir)) {
      console.log(`⚠️  Database directory does not exist: ${dbDir}`);
      console.log(`   Creating directory...`);
      try {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`✅ Directory created successfully`);
      } catch (error) {
        console.error(`❌ Failed to create directory:`, error);
        return reject(new Error(`Failed to create database directory: ${error.message}`));
      }
    }

    if (!fs.existsSync(dbPath)) {
      console.log(`⚠️  Database file does not exist: ${dbPath}`);
      console.log(`   Please run database setup script first:`);
      console.log(`   cd database/sqlite && ./setup.sh`);
      return reject(new Error(`Database file not found: ${dbPath}`));
    }

    try {
      fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
      console.log(`✅ Database file has correct permissions`);
    } catch (error) {
      console.error(`❌ Database file permission error:`, error);
      return reject(new Error(`Cannot access database file: ${error.message}`));
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite connection error:', err);
        return reject(err);
      }
      console.log('✅ Connected to SQLite database');
      console.log(`📁 Database location: ${dbPath}`);

      db.get('SELECT COUNT(*) as count FROM agents', (err2, row) => {
        if (err2) {
          console.error('❌ Database query error:', err2);
          console.log('⚠️  Database file exists but schema might be missing');
          db.close();
          return reject(new Error('Database schema error - please run setup script'));
        }
        console.log(`📊 Found ${row.count} agents in database`);
        db.close();
        return resolve();
      });
    });
  });
}

// ================= MongoDB (Mongoose) =================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wallboard';

// ต่อเฉพาะเวลาถูกเรียกใช้ ไม่ใช้ top-level await
async function connectMongoDB() {
  const maxRetries = 5;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        // ตั้งค่าที่ทันสมัยสำหรับ Mongoose 8+ (useNewUrlParser/useUnifiedTopology ถูกเพิกเฉยอยู่แล้ว)
        serverSelectionTimeoutMS: 5000,
        directConnection: true
      });
      console.log('✅ Connected to MongoDB');
      console.log(`📁 Database: ${MONGODB_URI}`);
      return;
    } catch (error) {
      currentRetry++;
      console.error(`❌ MongoDB connection attempt ${currentRetry}/${maxRetries} failed:`, error.message);

      if (currentRetry >= maxRetries) {
        console.error('❌ All MongoDB connection attempts failed');
        throw new Error(`MongoDB connection failed after ${maxRetries} attempts: ${error.message}`);
      }

      const waitTime = Math.min(1000 * Math.pow(2, currentRetry), 10000);
      console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed due to app termination');
  process.exit(0);
});

// Helpers
function getSQLitePath() {
  const projectRoot = path.resolve(__dirname, '../../');
  return path.resolve(projectRoot, SQLITE_DB_PATH);
}

module.exports = {
  initSQLite,
  connectMongoDB,
  getSQLitePath,
};
