import { REST, Routes } from 'discord.js';
import 'dotenv/config';
console.log('Token exists:', !!process.env.DISCORD_TOKEN);
console.log('Client ID exists:', !!process.env.DISCORD_CLIENT_ID);
console.log('Token first 20 chars:', process.env.DISCORD_TOKEN?.substring(0, 20));
const commands = [
  // {
    // name: 'whitelist',
    // description: 'Open a whitelist Modal to enter your Username',
  // },
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
