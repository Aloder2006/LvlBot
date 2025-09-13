const mongoose = require('mongoose');

const serverLevelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  textXP: { type: Number, default: 0 },
  voiceXP: { type: Number, default: 0 },
  textLevel: { type: Number, default: 1 },
  voiceLevel: { type: Number, default: 1 },
  lastMessage: { type: Date, default: Date.now },
  voiceTime: { type: Number, default: 0 }, // in milliseconds
}, {
  timestamps: true
});

serverLevelSchema.index({ userId: 1, guildId: 1 }, { unique: true });
serverLevelSchema.index({ guildId: 1, textXP: -1 });
serverLevelSchema.index({ guildId: 1, voiceXP: -1 });

module.exports = mongoose.model('ServerLevel', serverLevelSchema);
