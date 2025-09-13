const { createCanvas, loadImage, registerFont } = require('canvas');
const config = require('../../config/config');

class CanvasUtils {
  static async createRankCard(user, serverData) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // User avatar
    try {
      const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
      const avatar = await loadImage(avatarURL);
      
      // Create circular mask for avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 40, 90, 120, 120);
      ctx.restore();
      
      // Avatar border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
      ctx.stroke();
    } catch (error) {
      console.error('Error loading avatar:', error);
    }

    // Username
    const fallbackName = user.displayName || user.globalName || user.username || 'User';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(fallbackName, 200, 80);

    // Text Level
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Text Level: ${serverData.textLevel}`, 200, 120);
    
    // Voice Level
    ctx.fillText(`Voice Level: ${serverData.voiceLevel}`, 200, 160);

    // XP Info
    ctx.font = '18px Arial';
    ctx.fillText(`Text XP: ${serverData.textXP}`, 200, 190);
    ctx.fillText(`Voice XP: ${serverData.voiceXP}`, 200, 220);

    // Progress bars could be added here
    
    return canvas.toBuffer();
  }

  static async createProfileCard(user, globalData) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f2027');
    gradient.addColorStop(1, '#203a43');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // User avatar
    try {
      const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
      const avatar = await loadImage(avatarURL);

      // Create circular mask for avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 40, 90, 120, 120);
      ctx.restore();

      // Avatar border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(100, 150, 60, 0, Math.PI * 2, true);
      ctx.stroke();
    } catch (error) {
      console.error('Error loading avatar:', error);
    }

    // Username
    const fallbackName = user.displayName || user.globalName || user.username || 'User';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(fallbackName, 200, 80);

    // Global Level
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Global Level: ${globalData.level}`, 200, 120);

    // Stats
    ctx.font = '18px Arial';
    ctx.fillText(`Total XP: ${globalData.totalXP}`, 200, 160);
    ctx.fillText(`Messages: ${globalData.totalMessages}`, 200, 190);
    ctx.fillText(`Voice Time: ${Math.floor(globalData.totalVoiceTime / 60000)} minutes`, 200, 220);

    return canvas.toBuffer();
  }
}

module.exports = CanvasUtils;