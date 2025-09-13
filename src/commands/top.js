const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerLevel = require('../models/ServerLevel');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('View server leaderboards')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose leaderboard type')
        .setRequired(true)
        .addChoices(
          { name: 'Text Levels', value: 'text' },
          { name: 'Voice Levels', value: 'voice' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const type = interaction.options.getString('type');
    const guildId = interaction.guild.id;

    try {
      let leaderboard;
      let title;
      let emoji;

      if (type === 'text') {
        leaderboard = await ServerLevel.find({ guildId })
          .sort({ textXP: -1 })
          .limit(10);
        title = 'Text Levels Leaderboard';
        emoji = config.EMOJIS.KEYBOARD;
      } else {
        leaderboard = await ServerLevel.find({ guildId })
          .sort({ voiceXP: -1 })
          .limit(10);
        title = 'Voice Levels Leaderboard';
        emoji = config.EMOJIS.MICROPHONE;
      }

      if (leaderboard.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.ERROR)
          .setDescription('No users found on the leaderboard yet!');
        
        return await interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor(config.COLORS.PRIMARY)
        .setTitle(`${config.EMOJIS.TROPHY} ${title}`)
        .setDescription(`Top 10 users in ${interaction.guild.name}`)
        .setTimestamp();

      let description = '';
      
      for (let i = 0; i < leaderboard.length; i++) {
        const userData = leaderboard[i];
        let user;
        
        try {
          user = await interaction.client.users.fetch(userData.userId);
        } catch (error) {
          user = { username: 'Unknown User', discriminator: '0000' };
        }

        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        if (type === 'text') {
          description += `${medal} **${user.username}** - Level ${userData.textLevel} (${userData.textXP} XP)\n`;
        } else {
          description += `${medal} **${user.username}** - Level ${userData.voiceLevel} (${userData.voiceXP} XP)\n`;
        }
      }

      embed.setDescription(description);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in top command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching leaderboard data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};