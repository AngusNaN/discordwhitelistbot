import { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { Rcon } from 'rcon-client';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log('❌❌❌ ', `✅ Bot is online as ${c.user.tag}`);
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

client.on(Events.InteractionCreate, async (interaction) => {
  console.log('❌❌❌ ', 'Interaction recieved');
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'whitelist-modal') {
      let role = interaction.guild.roles.cache.find(r => r.name === "Whitelisted");
      console.log('❌❌❌ ', 'let role dings')
      if (!role) {
        console.log('❌❌❌ ', '!role')
        try {
          role = await interaction.guild.roles.create({
            name: 'Whitelisted',
            color: 'White',
            reason: '✅ Automatisch erstellte rolle für whitelisting (Morningstar)'
          });
        } catch (error) {
          await interaction.reply({
            content: '❌ Erstellen der Rolle fehlgeschlagen. Überprüfe die permissions!',
            ephemeral: true
          });
          console.log('❌❌❌ ', 'permission error')
        }
      }
      const username = interaction.fields.getTextInputValue('minecraft-username');
      const isValid = /^[a-zA-Z0-9_]{3,16}$/.test(username);
    
      if (!isValid) {
        await interaction.reply({ 
          content: '❌ Username ungültig!', 
          ephemeral: true 
        });
        return;
      }
      if (interaction.member.roles.cache.has(role)) {
        console.log('❌❌❌ ', 'has role')
        await interaction.reply({
        content: '❌ Du hast bereits einen Account gewhitelisted',
        ephemeral: true
      });
      try {
          const rcon = await Rcon.connect({
            host: process.env.RCON_HOST,
            port: parseInt(process.env.RCON_PORT),
            password: process.env.RCON_PASSWORD
          });
          
          const response = await rcon.send(`whitelist add ${username}`);
          console.log('❌❌❌ ', `${username} added to whitelist`);
          await rcon.end();

          // Add the role after successful whitelist
          await interaction.member.roles.add(role);
          await interaction.reply({ 
            content: `✅ ${username} wurde zur Whitelist hinzugefügt!\n⚙️ Server: ${response}`, 
            ephemeral: false
          });
        } catch (error) {
          console.error('RCON error:', error);
          await interaction.reply({
            content: '❌ Verbindung zum Server fehlgeschlagen. Schlag Angus',
            ephemeral: true
          });
        }
      return;
      }
    }
  }
  // Handle slash commands
  if (!interaction.isChatInputCommand()) {
    console.log('❌❌❌ ', 'Command: ', interaction.commandName, interaction.user.username)
    return;
  }
  if (interaction.commandName === 'hello') {
    await interaction.reply(`Hello ${interaction.user.username}! 👋`);
  }

  if (interaction.commandName === 'whitelist') {
    console.log('❌❌❌ ', 'User used a command!')
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
    console.log('❌❌❌ ', 'modal was shown')
  }
});

client.login(process.env.DISCORD_TOKEN);