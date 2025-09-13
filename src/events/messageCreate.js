const ServerLevel = require('../models/ServerLevel');
const GlobalLevel = require('../models/GlobalLevel');
const LevelUtils = require('../utils/levelUtils');
const config = require('../../config/config');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    try {
      // Get or create server level data
      let serverData = await ServerLevel.findOne({ userId, guildId });
      if (!serverData) {
        serverData = new ServerLevel({ userId, guildId });
      }

      // Check cooldown
      const now = Date.now();
      if (now - serverData.lastMessage < config.XP.COOLDOWN) return;

      // Add XP
      const xpGain = LevelUtils.getRandomXP();
      const oldTextLevel = serverData.textLevel;
      
      serverData.textXP += xpGain;
      serverData.textLevel = LevelUtils.calculateLevel(serverData.textXP);
      serverData.lastMessage = now;

      await serverData.save();

      // Update global data
      let globalData = await GlobalLevel.findOne({ userId });
      if (!globalData) {
        globalData = new GlobalLevel({ userId });
      }
      
      globalData.totalXP += xpGain;
      globalData.level = LevelUtils.calculateLevel(globalData.totalXP);
      globalData.totalMessages += 1;
      
      await globalData.save();

      // Check for level up
      if (serverData.textLevel > oldTextLevel) {
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.SUCCESS)
          .setTitle(`${config.EMOJIS.LEVEL_UP} Level Up!`)
          .setDescription(`Congratulations! You reached **Text Level ${serverData.textLevel}**!`)
          .setTimestamp();

        await message.reply({ embeds: [embed], ephemeral: true });
      }

    } catch (error) {
      console.error('Error processing message XP:', error);
    }
  },
};
