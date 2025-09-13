const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure server leveling settings (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current server settings')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Reset all server leveling data')
        .addStringOption(option =>
          option.setName('confirm')
            .setDescription('Type CONFIRM to reset all data')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const embed = new EmbedBuilder()
        .setColor(config.COLORS.INFO)
        .setTitle('⚙️ Server Leveling Settings')
        .addFields(
          {
            name: 'XP Configuration',
            value: `**Text XP:** ${config.XP.TEXT_MIN}-${config.XP.TEXT_MAX} per message\n**Voice XP:** ${config.XP.VOICE_PER_MINUTE} per minute\n**Cooldown:** ${config.XP.COOLDOWN / 1000} seconds`,
            inline: false
          },
          {
            name: 'Level System',
            value: `**Level Multiplier:** ${config.XP.LEVEL_MULTIPLIER} XP per level\n**Formula:** Level = (XP ÷ ${config.XP.LEVEL_MULTIPLIER}) + 1`,
            inline: false
          },
          {
            name: 'Features',
            value: '✅ Dual leveling system (Text/Voice)\n✅ Private level-up notifications\n✅ Leaderboards\n✅ Global profile tracking',
            inline: false
          }
        )
        .setFooter({ text: 'Settings are configured in the bot\'s config file' });

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'reset') {
      const confirmation = interaction.options.getString('confirm');
      
      if (confirmation !== 'CONFIRM') {
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.ERROR)
          .setDescription('❌ Invalid confirmation. Type `CONFIRM` to reset all server data.');
        
        return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      await interaction.deferReply();

      try {
        const ServerLevel = require('../models/ServerLevel');
        const result = await ServerLevel.deleteMany({ guildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(config.COLORS.SUCCESS)
          .setTitle('✅ Server Data Reset Complete')
          .setDescription(`Successfully reset leveling data for **${result.deletedCount}** users in this server.`)
          .setFooter({ text: 'Global profiles remain unaffected' });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Error resetting server data:', error);
        
        const embed = new EmbedBuilder()
          .setColor(config.COLORS.ERROR)
          .setDescription('❌ An error occurred while resetting server data.');
          
        await interaction.editReply({ embeds: [embed] });
      }
    }
  },
};