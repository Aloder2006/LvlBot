const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and status'),

  async execute(interaction) {
    await interaction.reply('Pinging...');
    const sent = await interaction.fetchReply();
    
    const embed = new EmbedBuilder()
      .setColor(config.COLORS.SUCCESS)
      .setTitle('🏓 Pong!')
      .addFields(
        {
          name: 'Roundtrip Latency',
          value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`,
          inline: true
        },
        {
          name: 'WebSocket Heartbeat',
          value: `${Math.round(interaction.client.ws.ping)}ms`,
          inline: true
        },
        {
          name: 'Status',
          value: '✅ Online and Ready',
          inline: true
        }
      )
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};
