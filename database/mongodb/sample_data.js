const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallboard';

// Schema Definitions
const messageSchema = new mongoose.Schema({
  fromCode: { type: String, required: true, uppercase: true },
  toCode: { type: String, uppercase: true },
  toTeamId: { type: Number },
  content: { type: String, required: true, trim: true, maxlength: 500 },
  type: { type: String, enum: ['direct', 'broadcast'], required: true },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  timestamp: { type: Date, default: Date.now, index: true }
}, { collection: 'messages', timestamps: true });

messageSchema.index({ toCode: 1, timestamp: -1 });
messageSchema.index({ toTeamId: 1, timestamp: -1 });
messageSchema.index({ fromCode: 1, timestamp: -1 });

const statusSchema = new mongoose.Schema({
  agentCode: { type: String, required: true, uppercase: true, index: true },
  status: { type: String, enum: ['Available', 'Busy', 'Break', 'Offline'], required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  teamId: { type: Number, index: true },
  duration: { type: Number },
  sessionId: { type: String }
}, { collection: 'agent_status', timestamps: true });

statusSchema.index({ agentCode: 1, timestamp: -1 });
statusSchema.index({ teamId: 1, timestamp: -1 });
statusSchema.index({ status: 1, timestamp: -1 });

const connectionLogSchema = new mongoose.Schema({
  agentCode: { type: String, required: true, uppercase: true, index: true },
  eventType: { type: String, enum: ['connect', 'disconnect', 'reconnect'], required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  socketId: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  connectionDuration: { type: Number },
  disconnectReason: { type: String }
}, { collection: 'connection_logs', timestamps: true });

connectionLogSchema.index({ agentCode: 1, timestamp: -1 });
connectionLogSchema.index({ eventType: 1, timestamp: -1 });

// Create Models
const Message = mongoose.model('Message', messageSchema);
const AgentStatus = mongoose.model('AgentStatus', statusSchema);
const ConnectionLog = mongoose.model('ConnectionLog', connectionLogSchema);

// Sample Data
async function insertSampleData() {
  try {
    console.log('🧹 Clearing existing data...');
    await Message.deleteMany({});
    await AgentStatus.deleteMany({});
    await ConnectionLog.deleteMany({});

    console.log('💬 Inserting sample messages...');
    const sampleMessages = [
      {
        fromCode: "SP001",
        toCode: "AG001",
        content: "Good morning! Ready for the day?",
        type: "direct",
        priority: "normal",
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
        readAt: new Date(Date.now() - 3500000)
      },
      {
        fromCode: "SP001",
        toTeamId: 1,
        content: "Team meeting at 2 PM today",
        type: "broadcast",
        priority: "high",
        timestamp: new Date(Date.now() - 1800000),
        isRead: false
      },
      {
        fromCode: "SP002",
        toCode: "AG005",
        content: "Please check the technical queue",
        type: "direct",
        priority: "normal",
        timestamp: new Date(Date.now() - 900000),
        isRead: false
      },
      {
        fromCode: "SP002",
        toCode: "AG006",
        content: "Great job on handling that complex case!",
        type: "direct",
        priority: "normal",
        timestamp: new Date(Date.now() - 5400000),
        isRead: true,
        readAt: new Date(Date.now() - 5300000)
      },
      {
        fromCode: "SP003",
        toTeamId: 3,
        content: "Great sales numbers this week!",
        type: "broadcast",
        priority: "normal",
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      },
      {
        fromCode: "SP003",
        toCode: "AG008",
        content: "Can you follow up with client ABC?",
        type: "direct",
        priority: "high",
        timestamp: new Date(Date.now() - 600000),
        isRead: false
      }
    ];
    await Message.insertMany(sampleMessages);

    console.log('📊 Inserting sample status logs...');
    const sampleStatusLogs = [
      { agentCode: "AG001", status: "Available", timestamp: new Date(Date.now() - 7200000), teamId: 1, duration: 3600, sessionId: "session_20240115_090000" },
      { agentCode: "AG001", status: "Busy", timestamp: new Date(Date.now() - 3600000), teamId: 1, duration: 1800, sessionId: "session_20240115_090000" },
      { agentCode: "AG002", status: "Available", timestamp: new Date(Date.now() - 14400000), teamId: 1, duration: 7200 },
      { agentCode: "AG002", status: "Break", timestamp: new Date(Date.now() - 7200000), teamId: 1, duration: 900 },
      { agentCode: "AG003", status: "Available", timestamp: new Date(Date.now() - 10800000), teamId: 1, duration: 5400 },
      { agentCode: "AG005", status: "Busy", timestamp: new Date(Date.now() - 1800000), teamId: 2, duration: 1500 },
      { agentCode: "AG006", status: "Available", timestamp: new Date(Date.now() - 9000000), teamId: 2, duration: 4500 },
      { agentCode: "AG008", status: "Busy", timestamp: new Date(Date.now() - 3600000), teamId: 3, duration: 2700 },
      { agentCode: "AG009", status: "Available", timestamp: new Date(Date.now() - 7200000), teamId: 3, duration: 7200 }
    ];
    await AgentStatus.insertMany(sampleStatusLogs);

    console.log('🔗 Inserting sample connection logs...');
    const sampleConnectionLogs = [
      { agentCode: "AG001", eventType: "connect", timestamp: new Date(Date.now() - 28800000), socketId: "socket_ag001_001", ipAddress: "192.168.1.100", userAgent: "Agent Desktop App v1.0" },
      { agentCode: "AG001", eventType: "disconnect", timestamp: new Date(Date.now() - 3600000), socketId: "socket_ag001_001", connectionDuration: 25200, disconnectReason: "normal_logout" },
      { agentCode: "AG002", eventType: "connect", timestamp: new Date(Date.now() - 14400000), socketId: "socket_ag002_001", ipAddress: "192.168.1.101", userAgent: "Agent Desktop App v1.0" },
      { agentCode: "AG003", eventType: "connect", timestamp: new Date(Date.now() - 10800000), socketId: "socket_ag003_001", ipAddress: "192.168.1.102", userAgent: "Agent Desktop App v1.0" },
      { agentCode: "AG005", eventType: "connect", timestamp: new Date(Date.now() - 7200000), socketId: "socket_ag005_001", ipAddress: "192.168.1.105", userAgent: "Agent Desktop App v1.0" },
      { agentCode: "AG006", eventType: "connect", timestamp: new Date(Date.now() - 9000000), socketId: "socket_ag006_001", ipAddress: "192.168.1.106", userAgent: "Agent Desktop App v1.0" },
      { agentCode: "AG006", eventType: "disconnect", timestamp: new Date(Date.now() - 4500000), socketId: "socket_ag006_001", connectionDuration: 4500, disconnectReason: "normal_logout" },
      { agentCode: "AG008", eventType: "connect", timestamp: new Date(Date.now() - 5400000), socketId: "socket_ag008_001", ipAddress: "192.168.1.108", userAgent: "Agent Desktop App v1.0" }
    ];
    await ConnectionLog.insertMany(sampleConnectionLogs);

    // Verify
    const messageCount = await Message.countDocuments();
    const statusCount = await AgentStatus.countDocuments();
    const logCount = await ConnectionLog.countDocuments();

    console.log('✅ Sample data inserted successfully!');
    console.log('📊 Summary:');
    console.log(`   - Messages: ${messageCount} records`);
    console.log(`   - Status logs: ${statusCount} records`);
    console.log(`   - Connection logs: ${logCount} records`);

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    throw error;
  }
}

// Main Setup Function with Error Handling
async function setupMongoDB() {
  let retries = 3;
  while (retries > 0) {
    try {
      console.log('🍃 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
      await insertSampleData();
      console.log('🚀 MongoDB setup completed!');
      return;
    } catch (error) {
      retries--;
      console.error(`❌ MongoDB setup failed: ${error.message}`);
      if (retries > 0) {
        console.log(`⚠️  Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('❌ All retry attempts failed');
        throw error;
      }
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupMongoDB().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { setupMongoDB, insertSampleData };
