// services/userService.js
const userRepository = require('../repositories/userRepository');

const ALLOWED_ROLES = new Set(['Agent', 'Supervisor', 'Admin']);

function normalizeUserData(input = {}) {
    const out = { ...input };
    if (typeof out.username === 'string') out.username = out.username.trim();
    if (typeof out.fullName === 'string') out.fullName = out.fullName.trim();
    if (typeof out.role === 'string') out.role = out.role.trim();
    if (typeof out.status === 'string') out.status = out.status.trim();

    // teamId: ต้องเป็นตัวเลขหรือ null (ปล่อย undefined ถ้าไม่ได้ส่งมา)
    if (out.teamId !== undefined) {
        if (out.teamId === null || out.teamId === '') {
            out.teamId = null;
        } else {
            const n = Number(out.teamId);
            if (!Number.isInteger(n) || n < 0) {
                throw new Error('Invalid teamId');
            }
            out.teamId = n;
        }
    }
    return out;
}

function validateUsername(username) {
    const regex = /^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
    return regex.test(username);
}

function getRoleFromUsername(username) {
    if (username.startsWith('AG')) return 'Agent';
    if (username.startsWith('SP')) return 'Supervisor';
    if (username.startsWith('AD')) return 'Admin';
    return null;
}

function ensureRoleTeamConsistency(role, teamId) {
    if (!ALLOWED_ROLES.has(role)) {
        throw new Error(`Invalid role "${role}". Allowed: Agent, Supervisor, Admin`);
    }
    // Agent/Supervisor ต้องมี teamId (number)
    if ((role === 'Agent' || role === 'Supervisor')) {
        if (teamId === undefined || teamId === null) {
            throw new Error('Team ID is required for Agent and Supervisor roles');
        }
    }
    // Admin ต้องไม่มี team (หรือเป็น null)
    if (role === 'Admin' && teamId !== undefined && teamId !== null) {
        throw new Error('Admin should not have a teamId');
    }
}

/**
 * User Service - Business Logic Layer
 */
const userService = {
    /**
     * Get all users with optional filtering
     */
    async getAllUsers(filters = {}) {
        try {
            return await userRepository.findAll(filters);
        } catch (error) {
            console.error('Error in getAllUsers service:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) throw new Error('User not found');
            return user;
        } catch (error) {
            console.error('Error in getUserById service:', error);
            throw error;
        }
    },

    /**
     * Create new user
     */
    async createUser(userData) {
        try {
            const data = normalizeUserData(userData);

            // 1) Validate username format
            if (!validateUsername(data.username)) {
                throw new Error('Invalid username format. Use AGxxx, SPxxx, or ADxxx (001-999)');
            }

            // 2) Username uniqueness
            const exists = await userRepository.usernameExists(data.username);
            if (exists) throw new Error(`Username "${data.username}" already exists`);

            // 3) Validate role-specific rules
            // - ถ้าไม่ส่ง role มา ให้เดาจาก prefix ของ username
            if (!data.role) {
                const inferred = getRoleFromUsername(data.username);
                if (!inferred) throw new Error('Cannot infer role from username');
                data.role = inferred;
            }
            ensureRoleTeamConsistency(data.role, data.teamId);

            // 4) Create
            return await userRepository.create(data);
        } catch (error) {
            console.error('Error in createUser service:', error);

            // map ข้อผิดพลาด sqlite ให้เป็น message ที่เข้าใจง่าย
            if (error.code === 'SQLITE_CONSTRAINT') {
                if (String(error.message).includes('UNIQUE')) {
                    throw new Error(`Username "${userData.username}" already exists`);
                }
                if (String(error.message).includes('FOREIGN KEY')) {
                    throw new Error(`Team ID ${userData.teamId} does not exist`);
                }
            }
            throw error;
        }
    },

    /**
     * Update existing user (dynamic fields)
     */
    async updateUser(userId, userData) {
        try {
            const existing = await userRepository.findById(userId);
            if (!existing) throw new Error('User not found');

            const data = normalizeUserData(userData);

            // ไม่อนุญาตเปลี่ยน username
            if (data.username && data.username !== existing.username) {
                throw new Error('Username cannot be changed');
            }

            // คำนวณ role/teamId ที่จะมีผลหลังอัปเดต
            const effectiveRole = data.role !== undefined ? data.role : existing.role;
            const effectiveTeamId = data.teamId !== undefined ? data.teamId : existing.teamId;

            // ถ้ามีการเปลี่ยน role/teamId (หรือส่งมาอย่างใดอย่างหนึ่ง) ให้ตรวจ consistency
            if (data.role !== undefined || data.teamId !== undefined) {
                ensureRoleTeamConsistency(effectiveRole, effectiveTeamId);
            }

            // อัปเดต
            const updated = await userRepository.update(userId, data);
            // ส่งข้อมูลใหม่ (merge เดิม + ใหม่แบบบางส่วน)
            return {
                ...existing,
                ...data,
                id: userId,
                role: effectiveRole,
                teamId: effectiveTeamId,
            };
        } catch (error) {
            console.error('Error in updateUser service:', error);
            if (error.code === 'SQLITE_CONSTRAINT' && String(error.message).includes('FOREIGN KEY')) {
                throw new Error(`Team ID ${userData.teamId} does not exist`);
            }
            throw error;
        }
    },

    /**
     * Delete user (soft delete)
     */
    async deleteUser(userId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) throw new Error('User not found');

            await userRepository.softDelete(userId);
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            console.error('Error in deleteUser service:', error);
            throw error;
        }
    },

    /**
     * Validate username format
     */
    validateUsername,

    /**
     * Get role from username prefix
     */
    getRoleFromUsername,
};

module.exports = userService;
