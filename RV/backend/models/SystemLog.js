const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Index for quick retrieval of logs
systemLogSchema.index({ timestamp: -1 });
systemLogSchema.index({ user: 1, timestamp: -1 });
systemLogSchema.index({ action: 1 });

module.exports = mongoose.model("SystemLog", systemLogSchema);