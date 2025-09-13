const ServerLevel = require('../models/ServerLevel');
const GlobalLevel = require('../models/GlobalLevel');
const LevelUtils = require('../utils/levelUtils');
const config = require('../../config/config');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const userId = newState.member?.user.id;
    const guildId = newState.guild?.id;
    
    if (!userId || !guildId || newState.member?.user.bot) return;

    try {
      // User joined voice channel
      if (!oldState.channelId && newState.channelId) {
        client.voiceXP.set(`${guildId}-${userId}`, Date.now());
      }
      
      // User left voice channel
      if (oldState.channelId && !newState.channelId) {
        const joinTime = client.voiceXP.get(`${guildId}-${userId}`);
        if (!joinTime) return;
        
        const timeSpent = Date.now() - joinTime;
        const minutesSpent = Math.floor(timeSpent / 60000);
        
        if (minutesSpent > 0) {
          const xpGain = minutesSpent * config.XP.VOICE_PER_MINUTE;
          
          // Update server data
          let serverData = await ServerLevel.findOne({ userId, guildId });
          if (!serverData) {
            serverData = new ServerLevel({ userId, guildId });
          }
          
          const oldVoiceLevel = serverData.voiceLevel;
          serverData.voiceXP += xpGain;
          serverData.voiceLevel = LevelUtils.calculateLevel(serverData.voiceXP);
          serverData.voiceTime += timeSpent;
          
          await serverData.save();
          
          // Update global data
          let globalData = await GlobalLevel.findOne({ userId });
          if (!globalData) {
            globalData = new GlobalLevel({ userId });
          }
          
          globalData.totalXP += xpGain;
          globalData.level = LevelUtils.calculateLevel(globalData.totalXP);
          globalData.totalVoiceTime += timeSpent;
          
          await globalData.save();
          
          // Check for voice level up
          if (serverData.voiceLevel > oldVoiceLevel) {
            const member = newState.member;
            try {
              await member.send(`${config.EMOJIS.LEVEL_UP} **Voice Level Up!** You reached Voice Level ${serverData.voiceLevel} in ${newState.guild.name}!`);
            } catch (error) {
              // User has DMs disabled, ignore
            }
          }
        }
        
        client.voiceXP.delete(`${guildId}-${userId}`);
      }
    } catch (error) {
      console.error('Error processing voice XP:', error);
    }
  },
};