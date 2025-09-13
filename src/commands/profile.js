const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const GlobalLevel = require('../models/GlobalLevel');
const LevelUtils = require('../utils/levelUtils');
const CanvasUtils = require('../utils/canvasUtils');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Check your global profile across all servers')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Check another user\'s global profile')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

    try {
      const userData = await GlobalLevel.findOne({ userId });
      
      if (!userData) {
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.ERROR)
          .setDescription(`${targetUser.displayName} hasn't earned any global XP yet!`);
        
        return await interaction.editReply({ embeds: [embed] });
      }

      const globalData = {
        level: userData.level,
        totalXP: userData.totalXP,
        totalMessages: userData.totalMessages,
        totalVoiceTime: userData.totalVoiceTime,
      };

      const buffer = await CanvasUtils.createProfileCard(targetUser, globalData);
      const attachment = new AttachmentBuilder(buffer, { name: 'profile-card.png' });

      await interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Error in profile command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching profile data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};