const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const ServerLevel = require('../models/ServerLevel');
const LevelUtils = require('../utils/levelUtils');
const CanvasUtils = require('../utils/canvasUtils');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your server rank and level progress')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Check another user\'s rank')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;
    const guildId = interaction.guild.id;

    try {
      const userData = await ServerLevel.findOne({ userId, guildId });
      
      if (!userData) {
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.ERROR)
          .setDescription(`${targetUser.displayName} hasn't earned any XP yet in this server!`);
        
        return await interaction.editReply({ embeds: [embed] });
      }

      const serverData = {
        textLevel: userData.textLevel,
        voiceLevel: userData.voiceLevel,
        textXP: userData.textXP,
        voiceXP: userData.voiceXP,
      };

      const buffer = await CanvasUtils.createRankCard(targetUser, serverData);
      const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });

      await interaction.editReply({ files: [attachment] });

    } catch (error) {
      console.error('Error in rank command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching rank data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};