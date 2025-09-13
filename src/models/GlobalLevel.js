const mongoose = require('mongoose');

const globalLevelSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  totalMessages: { type: Number, default: 0 },
  totalVoiceTime: { type: Number, default: 0 },
}, {
  timestamps: true
});

globalLevelSchema.index({ totalXP: -1 });

module.exports = mongoose.model('GlobalLevel', globalLevelSchema);
