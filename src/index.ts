import Djs from 'discord.js'
import * as DjsToolsClient from './djs-tools/client'
import * as DjsToolsCmdReg from './djs-tools/cmd_register'

import commands from './libraries/command_import'



DjsToolsClient.setClient(new DjsToolsClient.ClientExtend({
    intents: [
        Djs.GatewayIntentBits.Guilds,
        Djs.GatewayIntentBits.GuildPresences,
        Djs.GatewayIntentBits.GuildMembers,
        Djs.GatewayIntentBits.MessageContent
    ]
}))

DjsToolsCmdReg.addAllCmds(commands)

const mode = process.argv[2]

if (mode === '--deploy-cmds-guild') {
    DjsToolsClient.deployCmdsGuildBased()
} else if (mode === '--deploy-cmds-global') {
    // TODO
} else if (mode === '--login') {
    DjsToolsClient.clientLogin()
} else {
    console.error('Please pass a mode: --deploy-cmds-guild or --deploy-cmds-global or --login.')
}