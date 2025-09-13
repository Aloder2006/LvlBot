const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and bot information'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.COLORS.INFO)
      .setTitle(`${config.EMOJIS.STAR} Leveling Bot Help`)
      .setDescription('A powerful leveling bot with both server and global progression systems!')
      .addFields(
        {
          name: '📊 Server Commands',
          value: '`/rank` - View your server rank and progress\n`/top <type>` - View server leaderboards (text/voice)',
          inline: false
        },
        {
          name: '🌍 Global Commands',
          value: '`/profile` - View your global profile across all servers',
          inline: false
        },
        {
          name: '⚙️ General Commands',
          value: '`/help` - Show this help menu\n`/ping` - Check bot latency',
          inline: false
        },
        {
          name: '📈 How It Works',
          value: '• **Text XP**: Earn 15-25 XP per message (1 minute cooldown)\n• **Voice XP**: Earn 10 XP per minute in voice channels\n• **Server System**: Separate text and voice levels per server\n• **Global System**: Combined XP across all servers',
          inline: false
        },
        {
          name: '🎯 Features',
          value: '• Real-time level up notifications\n• Detailed progress bars\n• Server leaderboards\n• Global profile tracking\n• Voice time tracking',
          inline: false
        }
      )
      .setFooter({ text: 'Made with ❤️ for Discord communities' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};