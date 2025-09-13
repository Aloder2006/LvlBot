const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

async function loadCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }

  // Register slash commands
  const rest = new REST().setToken(config.BOT_TOKEN);
  try {
    console.log('🔄 Refreshing application (/) commands...');
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: commands });
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Error refreshing commands:', error);
  }
}

module.exports = { loadCommands };