import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import CommandImport from "./libraries/command_import"



DjsTools.setClient(new Djs.Client({
    intents: [
        Djs.GatewayIntentBits.Guilds,
        Djs.GatewayIntentBits.GuildPresences,
        Djs.GatewayIntentBits.GuildMembers,
        Djs.GatewayIntentBits.MessageContent
    ]
}))


const mode = process.argv[2]
let modePromise: () => Promise<void> = async () => {}

if (mode === "--deploy-cmds-guild") {
    modePromise = DjsTools.deployCmdsGuildBased
} else if (mode === "--deploy-cmds-global") {
    // TODO
} else if (mode === "--login") {
    modePromise = DjsTools.clientLogin
} else {
    throw new Error("Please pass a mode for the second argument: --deploy-cmds-guild or --deploy-cmds-global or --login.")
}


const environment = process.argv[3]
if (environment === "--dev") {
    DjsTools.setDevEnvStatus(true)
} else if (environment === "--prod") {
    DjsTools.setDevEnvStatus(false)
} else {
    throw new Error("Please pass a mode for the third argument: --dev or --prod.")
}


DjsTools.sayDevEnvStatus()

DjsTools.addAllCmds(CommandImport())


const prismaClient = DjsTools.getPrismaClient()

modePromise().then(
    async () => {prismaClient.$disconnect()}
).catch(
    (reason: unknown) => {
        prismaClient.$disconnect()
        throw reason
    }
)