const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ ${client.user.tag} is online and ready!`);
    console.log(`🎮 Serving ${client.guilds.cache.size} servers`);
    
    // Set bot status
    client.user.setActivity('/help', { type: ActivityType.Playing });
  },
};
