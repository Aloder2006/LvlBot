const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const config = require('../config/config');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

class LevelingBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
      ]
    });
    
    this.commands = new Collection();
    this.voiceXP = new Map();
  }

  async start() {
    try {
      // Connect to MongoDB
      await mongoose.connect(config.MONGO_URI);
      console.log('✅ Connected to MongoDB');

      // Load commands and events
      await loadCommands(this);
      await loadEvents(this);

      // Login to Discord
      await this.login(config.BOT_TOKEN);
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      process.exit(1);
    }
  }
}

const bot = new LevelingBot();
bot.start();