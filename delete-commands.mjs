import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const namesToDelete = new Set([
  'whitelist',
  // add more names here
]);

(async () => {
  const cmds = await rest.get(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID));
  const targets = cmds.filter(c => namesToDelete.has(c.name));

  console.log('Deleting:', targets.map(c => ({ name: c.name, id: c.id })));

  for (const cmd of targets) {
    await rest.delete(Routes.applicationCommand(process.env.DISCORD_CLIENT_ID, cmd.id));
    console.log(`Deleted ${cmd.name} (${cmd.id})`);
  }
})();
