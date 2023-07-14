import Djs from 'discord.js'

import * as CmdRegister from './cmd_register'
import * as CmdPermissions from './permissions'



export default function addCmdCaller(client: Djs.Client) {
    client.on(Djs.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        const cmdBundle = CmdRegister.getRegisteredCmds().get(interaction.commandName)

        if (cmdBundle === undefined) {
            interaction.reply(`\`${interaction.commandName}\` is not a command.`)
            return
        }


        if (cmdBundle.cmdInfo.permissions !== undefined) {
            for (const cmdPerm of cmdBundle.cmdInfo.permissions) {
                if (!cmdPerm.checkGrant(interaction)) {
                    interaction.reply({content: `You do not have the permission to use this command! ${cmdPerm.onRejectMessage}`})
                    return
                }
            }
        }



        try {
            cmdBundle.execute(interaction)
        } catch (error) {
            console.error(error)

            let messageContent: Djs.InteractionReplyOptions = {
                content: 'There was an error while executing this command!',
                ephemeral: true
            }
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(messageContent)
            } else {
                await interaction.reply(messageContent)
            }
        }
    })
}