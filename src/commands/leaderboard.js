const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ServerLevel = require('../models/ServerLevel');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View detailed server leaderboards with pagination')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose leaderboard type')
        .setRequired(true)
        .addChoices(
          { name: 'Text Levels', value: 'text' },
          { name: 'Voice Levels', value: 'voice' },
          { name: 'Combined XP', value: 'combined' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();
    
    const type = interaction.options.getString('type');
    const guildId = interaction.guild.id;
    let page = 0;
    const usersPerPage = 10;

    try {
      let sortField;
      let title;
      let emoji;

      switch (type) {
        case 'text':
          sortField = { textXP: -1 };
          title = 'Text Levels Leaderboard';
          emoji = config.EMOJIS.KEYBOARD;
          break;
        case 'voice':
          sortField = { voiceXP: -1 };
          title = 'Voice Levels Leaderboard';
          emoji = config.EMOJIS.MICROPHONE;
          break;
        case 'combined':
          // We'll calculate combined XP in the aggregation
          sortField = { combinedXP: -1 };
          title = 'Combined XP Leaderboard';
          emoji = config.EMOJIS.STAR;
          break;
      }

      const generateLeaderboard = async (currentPage) => {
        let leaderboard;

        if (type === 'combined') {
          leaderboard = await ServerLevel.aggregate([
            { $match: { guildId } },
            { $addFields: { combinedXP: { $add: ['$textXP', '$voiceXP'] } } },
            { $sort: { combinedXP: -1 } },
            { $skip: currentPage * usersPerPage },
            { $limit: usersPerPage }
          ]);
        } else {
          leaderboard = await ServerLevel.find({ guildId })
            .sort(sortField)
            .skip(currentPage * usersPerPage)
            .limit(usersPerPage);
        }

        if (leaderboard.length === 0) {
          const embed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setDescription('No users found on this page!');
          
          return { embeds: [embed], components: [] };
        }

        const embed = new EmbedBuilder()
          .setColor(config.COLORS.PRIMARY)
          .setTitle(`${emoji} ${title}`)
          .setDescription(`Page ${currentPage + 1} • ${interaction.guild.name}`)
          .setTimestamp();

        let description = '';
        
        for (let i = 0; i < leaderboard.length; i++) {
          const userData = leaderboard[i];
          let user;
          
          try {
            user = await interaction.client.users.fetch(userData.userId);
          } catch (error) {
            user = { username: 'Unknown User' };
          }

          const rank = (currentPage * usersPerPage) + i + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
          
          switch (type) {
            case 'text':
              description += `${medal} **${user.username}** - Level ${userData.textLevel} (${userData.textXP} XP)\n`;
              break;
            case 'voice':
              description += `${medal} **${user.username}** - Level ${userData.voiceLevel} (${userData.voiceXP} XP)\n`;
              break;
            case 'combined':
              const totalLevel = Math.floor((userData.textXP + userData.voiceXP) / config.XP.LEVEL_MULTIPLIER) + 1;
              description += `${medal} **${user.username}** - Level ${totalLevel} (${userData.combinedXP} XP)\n`;
              break;
          }
        }

        embed.setDescription(description);

        // Navigation buttons
        const previousButton = new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0);

        const nextButton = new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(leaderboard.length < usersPerPage);

        const row = new ActionRowBuilder()
          .addComponents(previousButton, nextButton);

        return { embeds: [embed], components: [row] };
      };

      const response = await generateLeaderboard(page);
      const message = await interaction.editReply(response);

      // Button interaction collector
      const collector = message.createMessageComponentCollector({
        time: 300000 // 5 minutes
      });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          return buttonInteraction.reply({
            content: 'You cannot use these buttons!',
            ephemeral: true
          });
        }

        if (buttonInteraction.customId === 'previous') {
          page = Math.max(0, page - 1);
        } else if (buttonInteraction.customId === 'next') {
          page += 1;
        }

        const newResponse = await generateLeaderboard(page);
        await buttonInteraction.update(newResponse);
      });

      collector.on('end', async () => {
        // Disable buttons when collector expires
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            ButtonBuilder.from(response.components[0].components[0]).setDisabled(true),
            ButtonBuilder.from(response.components[0].components[1]).setDisabled(true)
          );

        try {
          await message.edit({ components: [disabledRow] });
        } catch (error) {
          // Message might have been deleted
        }
      });

    } catch (error) {
      console.error('Error in leaderboard command:', error);
      
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.ERROR)
        .setDescription('An error occurred while fetching leaderboard data.');
        
      await interaction.editReply({ embeds: [embed] });
    }
  },
};