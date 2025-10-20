/**
 * Data Transformers
 * แปลง database format (snake_case) <-> API format (camelCase) แบบยืดหยุ่น
 * รองรับทั้งคอลัมน์ snake_case และ camelCase (หรือ alias จาก SQL)
 */

/** แปลงค่าเป็น boolean จาก 0/1, true/false, "0"/"1" */
function toBool(v, fallback = false) {
  if (v === 1 || v === '1' || v === true) return true;
  if (v === 0 || v === '0' || v === false) return false;
  return fallback;
}

/** พาร์สวันที่แบบปลอดภัย */
function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Transform single agent object from database to API format
 * @param {Object} agent - Agent row from DB (อาจเป็น snake_case หรือ camelCase)
 * @returns {Object|null}
 */
function transformAgent(agent) {
  if (!agent) {
    console.warn('transformAgent: received null/undefined agent');
    return null;
  }

  try {
    const transformed = {
      // โค้ดเอเจนต์
      agentCode: agent.agent_code ?? agent.agentCode ?? null,

      // ชื่อ (รองรับ agent_name / agentName / fullName)
      agentName: agent.agent_name ?? agent.agentName ?? agent.fullName ?? null,

      // teamId (number หรือ null)
      teamId: agent.team_id ?? agent.teamId ?? null,

      // teamName/Code รองรับทั้ง alias snake_case และ camelCase จริง
      teamName: agent.team_name ?? agent.teamName ?? null,
      teamCode: agent.team_code ?? agent.teamCode ?? null,

      role: agent.role ?? null,
      email: agent.email ?? null,
      phone: agent.phone ?? null,

      hireDate: agent.hire_date ?? agent.hireDate ?? null,

      // is_active อาจเป็น 0/1, true/false หรือไม่มีมาเลย
      isActive: toBool(agent.is_active ?? agent.isActive, true),

      // ค่า default สำหรับ UI
      currentStatus: agent.currentStatus ?? 'Offline',
      isOnline: toBool(agent.isOnline, false),
      lastUpdate: toDate(agent.lastUpdate) ?? new Date(),
      lastSeen: toDate(agent.lastSeen) ?? new Date(),
    };

    // debug เบาๆ
    if (transformed.agentCode) {
      console.log(`Transformed agent: ${transformed.agentCode}`);
    }

    return transformed;
  } catch (error) {
    console.error('Error transforming agent:', error);
    return null;
  }
}

/**
 * Transform array of agents
 * @param {Array} agents
 * @returns {Array}
 */
function transformAgents(agents) {
  if (!Array.isArray(agents)) {
    console.warn('transformAgents: received non-array input');
    return [];
  }

  return agents.map(transformAgent).filter(Boolean);
}

module.exports = {
  transformAgent,
  transformAgents,
};
