import Djs from "discord.js"
import { getRegisteredCmds } from "./cmd_register"

export class ClientExtend extends Djs.Client {
    commands: Djs.Collection<any, any>;

    constructor(options: Djs.ClientOptions) {
        super(options)
        this.commands = new Djs.Collection();
        this.loadCommands()
    }

    loadCommands() {
        
    }
}

let globalClient: ClientExtend | null = null;



export function setClient(client: ClientExtend) {
    globalClient = client;
}

export function getClient() {
    return globalClient
}

export function clientLogin() {
    if (globalClient == null) throw "No client found.";


    globalClient.once(Djs.Events.ClientReady, clientPass => {
        console.log(`Logged in as ${clientPass.user.tag}, ID ${clientPass.user.id}.`);
    });


    globalClient.on(Djs.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get
    })

    globalClient.login(process.env.bot_token);
}


export default {
    globalClient: globalClient,
    setClient: setClient,
    clientLogin: clientLogin
}