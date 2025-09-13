const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GlobalLevel = require('../models/GlobalLevel');
const LevelUtils = require('../utils/levelUtils');
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

      const progress = LevelUtils.getProgressToNextLevel(userData.totalXP);
      const progressBar = LevelUtils.generateProgressBar(progress.percentage);

      const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle(`${config.EMOJIS.CROWN} ${targetUser.displayName}'s Global Profile`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: `${config.EMOJIS.STAR} Global Level ${userData.level}`,
            value: `\`\`\`${progressBar}\`\`\`${progress.progress}/${progress.total} XP`,
            inline: false
          },
          {
            name: 'Global Statistics',
            value: `**Total XP:** ${userData.totalXP}\n**Messages Sent:** ${userData.totalMessages}\n**Voice Time:** ${Math.floor(userData.totalVoiceTime / 60000)} minutes`,
            inline: false
          }
        )
        .setFooter({ text: 'This shows your progress across all servers' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in profile command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching profile data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};