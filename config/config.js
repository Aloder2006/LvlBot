module.exports = {
  // Bot Configuration
  BOT_TOKEN: process.env.BOT_TOKEN || 'ODE4MDQ3MDk5Mjk1NDk4MjUx.G_ePu1.X_8GxNa4kWPsKQSx5CCkFIx1gzlB5ZqrVhPu_Q',
  CLIENT_ID: process.env.CLIENT_ID || '818047099295498251',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://sloybot:sloybot@cluster0.0aauq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  
  // XP Configuration
  XP: {
    TEXT_MIN: 15,
    TEXT_MAX: 25,
    VOICE_PER_MINUTE: 1,
    COOLDOWN: 0, // 1 minute cooldown for text XP
    LEVEL_MULTIPLIER: 100, // XP needed = level * 100
  },
  
  // Colors
  COLORS: {
    PRIMARY: '#5865F2',
    SUCCESS: '#57F287',
    ERROR: '#ED4245',
    WARNING: '#FEE75C',
    INFO: '#5865F2'
  },
  
  // Emojis
  EMOJIS: {
    LEVEL_UP: '🎉',
    TROPHY: '🏆',
    STAR: '⭐',
    MICROPHONE: '🎤',
    KEYBOARD: '⌨️',
    CROWN: '👑'
  }
};