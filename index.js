const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot is online as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Simple ping command
  if (message.content === '!ping') {
    await message.reply('Pong! 🏓');
  }

  // Echo command
  if (message.content.startsWith('!echo ')) {
    const text = message.content.slice(6);
    await message.reply(text);
  }
});

// Slash command and modal handling
client.on(Events.InteractionCreate, async (interaction) => {
  // Handle modal submissions FIRST
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'whitelist-modal') {
      const username = interaction.fields.getTextInputValue('minecraft-username');
      const isValid = /^[a-zA-Z0-9_]{3,16}$/.test(username);
      
      if (!isValid) {
        await interaction.reply({ 
          content: '❌ Username ungültig!', 
          ephemeral: true 
        });
        return;
      }
      
      try {
        const rcon = await Rcon.connect({
          host: process.env.RCON_HOST,
          port: parseInt(process.env.RCON_PORT),
          password: process.env.RCON_PASSWORD
        });
        
        const response = await rcon.send(`whitelist add ${username}`);
        await rcon.end();

        // Add the role after successful whitelist
        const serverRoles = {
          [process.env.SERVERID_JESSY]: process.env.ROLEID_JESSY,
          [process.env.SERVERID_MALLE]: process.env.ROLEID_MALLE,
          [process.env.SERVERID_BOOMII]: process.env.ROLEID_BOOMII,
        };
        
        const roleId = serverRoles[interaction.guildId];

        console.log('Guild ID:', interaction.guildId);
        console.log('Server Roles:', serverRoles);
        console.log('Role ID:', roleId);
        
        await interaction.member.roles.add(roleId);
        
        await interaction.reply({ 
          content: `✅ ${username} wurde zur Whitelist hinzugefügt!`, 
          ephemeral: true 
        });

        await interaction.reply({ 
          content: `✅ ${username} wurde zur Whitelist hinzugefügt!\n⚙️ Server: ${response}`, 
          ephemeral: false
        });
      } catch (error) {
        console.error('RCON error:', error);
        await interaction.reply({
          content: '❌ Failed to connect to server',
          ephemeral: true
        });
      }
      return;
    }
  }

  // Handle slash commands
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'hello') {
    await interaction.reply(`Hello ${interaction.user.username}! 👋`);
  }

if (interaction.commandName === 'whitelist') {
  const serverRoles = {
    'server_a_id': process.env.WHITELISTED_ROLE_STREAMER_A,
    'server_b_id': process.env.WHITELISTED_ROLE_STREAMER_B,
    'server_c_id': process.env.WHITELISTED_ROLE_STREAMER_C,
  };
  
  const roleId = serverRoles[interaction.guildId];
  
  // Check if they already have the role
  if (interaction.member.roles.cache.has(roleId)) {
    await interaction.reply({
      content: '❌ Du hast bereits einen Account gewhitelisted',
      ephemeral: true
    });
    return;  // Stop here, don't show modal
  }
  
  // Only show modal if they don't have the role yet
  const modal = new ModalBuilder()
    .setCustomId('whitelist-modal')
    .setTitle('Minecraft Whitelist');
  
  const usernameInput = new TextInputBuilder()
    .setCustomId('minecraft-username')
    .setLabel('Minecraft Username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Gebe deinen Minecraft-Namen hier ein')
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(16);
  
  const row = new ActionRowBuilder().addComponents(usernameInput);
  modal.addComponents(row);
  
  await interaction.showModal(modal);

}});

client.login(process.env.DISCORD_TOKEN);