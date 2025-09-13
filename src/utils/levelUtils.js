const config = require('../../config/config');

class LevelUtils {
  static calculateLevel(xp) {
    return Math.floor(xp / config.XP.LEVEL_MULTIPLIER) + 1;
  }

  static calculateXPForLevel(level) {
    return (level - 1) * config.XP.LEVEL_MULTIPLIER;
  }

  static getXPForNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevel = currentLevel + 1;
    return this.calculateXPForLevel(nextLevel);
  }

  static getProgressToNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    const currentLevelXP = this.calculateXPForLevel(currentLevel);
    const nextLevelXP = this.calculateXPForLevel(currentLevel + 1);
    
    const progress = currentXP - currentLevelXP;
    const total = nextLevelXP - currentLevelXP;
    
    return { progress, total, percentage: (progress / total) * 100 };
  }

  static generateProgressBar(percentage, length = 20) {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  static getRandomXP() {
    return Math.floor(Math.random() * (config.XP.TEXT_MAX - config.XP.TEXT_MIN + 1)) + config.XP.TEXT_MIN;
  }
}

module.exports = LevelUtils;
