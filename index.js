import 'dotenv/config';
import {Client, GatewayIntentBits, Events, REST} from 'discord.js';
import 'express';
import 'axios';

const status_array = ['Waiting...', 'Lurking...', 'Sleeping...', 'Bouncing...'];
var twitchUser = process.env.TWITCH_USER;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//  Twitch
async function getAppAccessToken() {
  console.log('Fetching token...')
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_TOKEN,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  twitchToken = data.access_token;
  console.log('Twitch authenticated')
  return twitchToken; //valid ~60 days
}
var twitchToken = await getAppAccessToken();
console.log(twitchToken)

async function GetOnlineState() {
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchUser}`, {
      headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchToken}`
      }
    });
    const data = await res.json();
    const streamData = data.data;

    if (!streamData || streamData.length === 0) {
        return null;
    }
    return streamData[0];
}

var streamData = await GetOnlineState();
console.log(streamData);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
//  Discord
client.once(Events.ClientReady, (c) => {
  const Guilds = client.guilds.cache.map(guild => guild.id);
    const clientId = client.id
  console.log(`Bot is online as ${c.user.tag}`);
  client.user.setPresence({ activities: [{ name: 'Booting up...', type: 0 }], status: 'idle' });
});

client.on('clientReady', () => {


  setInterval(async() => {
      console.log("Checking...")
      const streamData = await GetOnlineState();

    if (streamData) {
      console.log('true');
        client.user.setPresence({
          activities: [{ name:`${streamData.user_name} - ${streamData.game_name}`, type: 1, url: 'https://twitch.tv/jessydelua'
            }], status: 'web'
        })
      return;
    } else {
      console.log(`${twitchUser} ist offline`)
    }
    const status = status_array[Math.floor(Math.random() * status_array.length)];
    client.user.setPresence({ activities: [{ name: status, type: 0 }], status: 'idle' });
    client.user.setStatus('idle');
    console.log(`Status changed to ${status}`);
  }, 30000);
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Simple ping command
  if (message.content === '!ping') {
      await message.reply('Pong!');
      console.log(twitchToken)
  }
});

client.on(Events.InteractionCreate, async (interaction) => {

//   if (interaction.isModalSubmit()) {
//     if (interaction.customId === 'whitelist-modal') {
//       let role = interaction.guild.roles.cache.find(r => r.name === "Whitelisted");

//       if (!role) {
//         try {
//           role = await interaction.guild.roles.create({
//             name: 'Whitelisted',
//             color: 'White',
//             reason: 'Automatisch erstellte rolle für whitelisting (Morningstar)'
//           });
//           console.log('Missing Role. Role Created!');
//         } catch (error) {
//           await interaction.reply({
//             content: 'Erstellen der Rolle fehlgeschlagen. Überprüfe die permissions!',
//             flags: [64] // 64 -- Ephemeral
//           });
//           return;
//         }
//       }
//       const username = interaction.fields.getTextInputValue('minecraft-username');
//       const isValid = /^[a-zA-Z0-9_]{3,16}$/.test(username);

//       if (!isValid) {
//         await interaction.reply({
//           content: 'Username ungültig!',
//           flags: [64] // 64 -- Ephemeral
//         });
//         return;
//       }

//       if (interaction.member.roles.cache.has(role.id)) {
//         await interaction.reply({
//           content: 'Du hast bereits einen Account gewhitelisted',
//           flags: [64] // 64 -- Ephemeral
//         });
//         return;
//       }

//       try {
//         const rcon = await Rcon.connect({
//           host: process.env.RCON_HOST,
//           port: parseInt(process.env.RCON_PORT),
//           password: process.env.RCON_PASSWORD
//         });

//         const response = await rcon.send(`whitelist add ${username}`);
//         await rcon.end();
//         console.log( response )
//         if (response.toLowerCase().includes('already whitelisted')) {
//           await interaction.reply({
//             content: 'Dieser Username ist bereits auf der Whitelist',
//             flags: [64] // 64 -- Ephemeral
//           });
//           return;
//         } else if (response.toLowerCase().includes('does not exist')) {
//           await interaction.reply({
//             content: 'User nicht gefunden!\nBist du sicher dass der Username richtig ist?',
//             flags: [64] // 64 -- Ephemeral
//           });
//           return;
//         } else if (response.toLowerCase().includes('added') && response.toLowerCase().includes('whitelist')) {
//           await interaction.member.roles.add(role);
//           await interaction.reply({
//           content: `${username} wurde zur Whitelist hinzugefügt!`,
//           flags: [4096] // 4096 -- Silent Message
//           });
//         } else {
//           await interaction.reply({
//           content: `Etwas ist schief gelaufen! Bitte Versuche es in ein paar Minuten erneut!`,
//           flags: [64] // 64 -- Ephemeral
//           });
//           console.log(`Unusual RCON response \nResponse: ${response}`)
//         }
//       } catch (error) {
//         console.error('RCON error:', error);
//         await interaction.reply({
//           content: 'Verbindung zum Server fehlgeschlagen.\nVersuche es in ein paar Minuten erneut oder melde dich beim Server-Team',
//           flags: [64] // 64 -- Ephemeral
//         });
//       }
//       return;
//     }
//   }

  // Handle slash commands
  if (!interaction.isChatInputCommand()) {
    return;
  }

  // if (interaction.commandName === 'whitelist') {
  //   if (interaction.member.roles.cache.some(role => role.name === 'Twitch Subscriber' )) {
  //     const modal = new ModalBuilder()
  //       .setCustomId('whitelist-modal')
  //       .setTitle('Minecraft Whitelist');

  //     const usernameInput = new TextInputBuilder()
  //       .setCustomId('minecraft-username')
  //       .setLabel('Minecraft Username')
  //       .setStyle(TextInputStyle.Short)
  //       .setPlaceholder('Gebe deinen Minecraft-Namen hier ein')
  //       .setRequired(true)
  //       .setMinLength(3)
  //       .setMaxLength(16);

  //     const row = new ActionRowBuilder().addComponents(usernameInput);
  //     modal.addComponents(row);
  //     await interaction.showModal(modal);
  //   } else {
  //     await interaction.reply({
  //       content: 'Du hast nicht die nötige Rolle um diesen Command zu nutzen!',
  //       flags: [64] // 64 -- Ephemeral
  //     });
  //   }
  // }
});

client.login(process.env.DISCORD_TOKEN);
