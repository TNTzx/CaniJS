import Djs from "discord.js"

import * as CmdRegister from "./registerer"



export function addCmdCaller(client: Djs.Client) {
    client.on(Djs.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return
        interaction = interaction as Djs.ChatInputCommandInteraction

        await interaction.deferReply()

        const cmdWithEntry = CmdRegister.getRegisteredCmds().get(interaction.commandName)

        // if (cmdWithEntry === undefined) {
        //     await interaction.reply(`\`${interaction.commandName}\` is not a command.`)
        //     return
        // }


        // if (cmdWithEntry.permissions !== undefined) {
        //     for (const cmdPerm of cmdWithEntry.cmdInfo.permissions) {
        //         if (!cmdPerm.checkGrant(interaction)) {
        //             await interaction.reply(`You do not have the permission to use this command! ${cmdPerm.onRejectMessage}`)
        //             return
        //         }
        //     }
        // }



        // try {
        //     await cmdWithEntry.execute(interaction)
        // } catch (error: unknown) {
        //     console.error(error)

        //     const userDisplay = error instanceof Error ? error.name : typeof error
        //     const messageContent = `There was an error while executing this command! ${Djs.inlineCode(userDisplay)}`

        //     if (interaction.replied || interaction.deferred) {
        //         await interaction.followUp(messageContent)
        //     } else {
        //         await interaction.channel?.send(messageContent)
        //     }
        // }
    })
}