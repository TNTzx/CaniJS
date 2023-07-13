import { Client, Events, GatewayIntentBits } from 'discord.js';
import env from 'dotenv';

env.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, clientPass => {
	console.log(`Ready! Logged in as ${clientPass.user.tag}.`);
});

// Log in to Discord with your client's token
client.login(process.env.token);