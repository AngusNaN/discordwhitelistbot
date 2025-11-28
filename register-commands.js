const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'hello',
    description: 'Replies with a friendly greeting',
  },
  {
    name: 'whitelistchannel',
    description: 'Start listening for minecraft usernames in this channel',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Slash commands registered successfully!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();