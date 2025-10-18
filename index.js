const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages // Important for DMs
    ]
});

// 8-ball responses
const responses = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful."
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const commands = [
    new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the 8-ball')
                .setRequired(true))
        .setDMPermission(true) // Enable DM usage
].map(command => command.toJSON());

async function registerCommands() {
    try {
        console.log('Registering slash commands...');
        
        // Use guild-specific for instant testing, or global for wider use
        if (process.env.GUILD_ID) {
            // Guild-specific (instant)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log('Guild-specific commands registered!');
        } else {
            // Global (slower)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log('Global commands registered!');
        }
        
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready for DMs and server commands!');
    registerCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === '8ball') {
        const question = interaction.options.getString('question');
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Different response format for DMs vs servers
        if (interaction.inGuild()) {
            await interaction.reply(`🎱 **Question:** ${question}\n**Answer:** ${randomResponse}`);
        } else {
            // In DMs
            await interaction.reply(`🎱 **Your Question:** ${question}\n**Magic 8-Ball says:** ${randomResponse}`);
        }
    }
});

// Optional: Handle direct messages (non-slash commands)
client.on('messageCreate', async message => {
    // Ignore messages from bots and without prefix
    if (message.author.bot) return;
    
    // Only handle DMs (not server messages)
    if (message.channel.type !== 1) return; // 1 = DM channel
    
    // Respond to regular messages in DMs with a hint
    if (message.content.toLowerCase().includes('?')) {
        message.reply("💡 Want to ask the magic 8-ball? Use the `/8ball` command! Type `/` and select '8ball' from the commands list.");
    }
});

client.login(process.env.TOKEN);