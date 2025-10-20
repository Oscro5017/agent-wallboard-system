// repositories/userRepository.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ใช้ไฟล์ DB เดิม: <project-root>/database/sqlite/wallboard.db
const dbPath = path.join(__dirname, '../../database/sqlite/wallboard.db');

/**
 * User Repository - Data Access Layer
 * ✅ 100%: เพิ่ม update() แบบ dynamic + แก้ชื่อคอลัมน์ join ทีมให้ถูกต้อง
 */
class UserRepository {
    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error connecting to database:', err);
            } else {
                console.log('✅ UserRepository connected to SQLite database');
                // เปิด Foreign Key constraints ต่อ connection
                this.db.run('PRAGMA foreign_keys = ON');
            }
        });
    }

    /**
     * Find all users with optional filters
     * filters: { role?, status?, teamId? }
     */
    async findAll(filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.teamName AS teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM Users u
        LEFT JOIN Teams t ON u.teamId = t.id
        WHERE u.deletedAt IS NULL
      `;
            const params = [];

            if (filters.role) { query += ' AND u.role = ?'; params.push(filters.role); }
            if (filters.status) { query += ' AND u.status = ?'; params.push(filters.status); }
            if (filters.teamId) { query += ' AND u.teamId = ?'; params.push(filters.teamId); }

            query += ' ORDER BY u.createdAt DESC';

            this.db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Find user by ID
     */
    async findById(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.teamName AS teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM Users u
        LEFT JOIN Teams t ON u.teamId = t.id
        WHERE u.id = ? AND u.deletedAt IS NULL
      `;
            this.db.get(query, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Find user by username
     */
    async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.teamName AS teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM Users u
        LEFT JOIN Teams t ON u.teamId = t.id
        WHERE u.username = ? AND u.deletedAt IS NULL
      `;
            this.db.get(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Create new user
     */
    async create(userData) {
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO Users (username, fullName, role, teamId, status)
        VALUES (?, ?, ?, ?, ?)
      `;
            const params = [
                userData.username,
                userData.fullName,
                userData.role,
                // ใส่ null ถ้าไม่ได้ส่ง teamId มา (หลีกเลี่ยง FK ผิดพลาด)
                userData.teamId ?? null,
                userData.status ?? 'Active',
            ];
            this.db.run(query, params, function (err) {
                if (err) return reject(err);
                const newUserId = this.lastID;
                resolve({ id: newUserId, ...userData, teamId: userData.teamId ?? null, status: userData.status ?? 'Active' });
            });
        });
    }

    /**
     * Update user (dynamic fields)
     * - อัปเดตเฉพาะ fields ที่ส่งมา (undefined = ไม่อัปเดต)
     * - ปลอดภัยกับ soft-deleted users (AND deletedAt IS NULL)
     */
    async update(userId, userData) {
        return new Promise((resolve, reject) => {
            let setClause = 'updatedAt = CURRENT_TIMESTAMP';
            const params = [];

            // เพิ่มเฉพาะฟิลด์ที่ "ถูกส่งมา"
            if (userData.fullName !== undefined) {
                setClause += ', fullName = ?';
                params.push(userData.fullName);
            }
            if (userData.role !== undefined) {
                setClause += ', role = ?';
                params.push(userData.role);
            }
            if (userData.teamId !== undefined) {
                // อนุญาตให้ส่งเป็น null เพื่อลบการสังกัดทีม (เช่น admin)
                setClause += ', teamId = ?';
                params.push(userData.teamId);
            }
            if (userData.status !== undefined) {
                setClause += ', status = ?';
                params.push(userData.status);
            }

            if (params.length === 0) {
                // ไม่มีอะไรให้อัปเดต
                return reject(new Error('No fields provided to update'));
            }

            params.push(userId);

            const query = `
        UPDATE Users 
        SET ${setClause}
        WHERE id = ? AND deletedAt IS NULL
      `;

            this.db.run(query, params, function (err) {
                if (err) {
                    return reject(err);
                } else if (this.changes === 0) {
                    return reject(new Error('User not found or already deleted'));
                }
                resolve({ id: userId, ...userData });
            });
        });
    }

    /**
     * Soft delete user
     */
    async softDelete(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        UPDATE Users 
        SET status = 'Inactive', 
            deletedAt = CURRENT_TIMESTAMP,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND deletedAt IS NULL
      `;
            this.db.run(query, [userId], function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('User not found or already deleted'));
                resolve({ success: true, changes: this.changes });
            });
        });
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const query = `
        UPDATE Users 
        SET lastLoginAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND deletedAt IS NULL
      `;
            this.db.run(query, [userId], function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('User not found or already deleted'));
                resolve({ success: true });
            });
        });
    }

    /**
     * Check if username exists
     */
    async usernameExists(username) {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT COUNT(*) as count 
        FROM Users 
        WHERE username = ? AND deletedAt IS NULL
      `;
            this.db.get(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row.count > 0);
            });
        });
    }
}

module.exports = new UserRepository();
