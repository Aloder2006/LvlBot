const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerLevel = require('../models/ServerLevel');
const LevelUtils = require('../utils/levelUtils');
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

      // Get text progress
      const textProgress = LevelUtils.getProgressToNextLevel(userData.textXP);
      const textBar = LevelUtils.generateProgressBar(textProgress.percentage);
      
      // Get voice progress
      const voiceProgress = LevelUtils.getProgressToNextLevel(userData.voiceXP);
      const voiceBar = LevelUtils.generateProgressBar(voiceProgress.percentage);

      const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle(`${config.EMOJIS.STAR} ${targetUser.displayName}'s Server Rank`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: `${config.EMOJIS.KEYBOARD} Text Level ${userData.textLevel}`,
            value: `\`\`\`${textBar}\`\`\`${textProgress.progress}/${textProgress.total} XP`,
            inline: false
          },
          {
            name: `${config.EMOJIS.MICROPHONE} Voice Level ${userData.voiceLevel}`,
            value: `\`\`\`${voiceBar}\`\`\`${voiceProgress.progress}/${voiceProgress.total} XP`,
            inline: false
          },
          {
            name: 'Statistics',
            value: `**Total Text XP:** ${userData.textXP}\n**Total Voice XP:** ${userData.voiceXP}\n**Voice Time:** ${Math.floor(userData.voiceTime / 60000)} minutes`,
            inline: false
          }
        )
        .setFooter({ text: `Use /top to see server leaderboards` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in rank command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching rank data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};