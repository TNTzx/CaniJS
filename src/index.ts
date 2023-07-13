import Djs from "discord.js"
import djsTools from "./djs-tools/client";
import env from 'dotenv';

env.config();

djsTools.setClient(new Djs.Client({
    intents: [
        Djs.GatewayIntentBits.Guilds,
        Djs.GatewayIntentBits.GuildPresences,
        Djs.GatewayIntentBits.GuildMembers,
        Djs.GatewayIntentBits.MessageContent
    ]
}));