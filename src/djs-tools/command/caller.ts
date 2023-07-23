import Djs from "discord.js"

import * as CmdPerms from "../permissions"
import * as CmdRegister from "./registerer"



interface InfoSearchResult {
    cmdSubInfo: CmdRegister.CmdSubInfo
    permissions: CmdPerms.CmdPermission[]
}



function searchSubcommand(
    cmdParentInfo: CmdRegister.CmdParentInfo,
    interactionOptions: Omit<Djs.CommandInteractionOptionResolver<Djs.CacheType>, "getMessage" | "getFocused">
) {
    function recursive(
        data: Djs.CommandInteractionOption<Djs.CacheType>,
        cmdSubInfoColl: CmdRegister.CmdSubsCollection<CmdRegister.CmdSubInfo>,
        cmdSubGroupInfoColl: CmdRegister.CmdSubsCollection<CmdRegister.CmdSubGroupInfo>
    ): InfoSearchResult {
        const cmdSubInfo = cmdSubInfoColl.getFromName(data.name)
        if (cmdSubInfo !== undefined) return {cmdSubInfo: cmdSubInfo, permissions: cmdSubInfo.permissions}

        const cmdSubGroupInfo = cmdSubGroupInfoColl.getFromName(data.name)
        if (cmdSubGroupInfo !== undefined) {
            if (data.options === undefined) throw new Error("Command not found.")
            const result = recursive(data.options[0], cmdSubGroupInfo.cmdSubInfoColl, cmdSubGroupInfo.cmdSubGroupInfoColl)
            return {cmdSubInfo: result.cmdSubInfo, permissions: cmdSubGroupInfo.permissions.concat(result.permissions)}
        }

        throw new Error("Command not found.")
    }

    const result = recursive(interactionOptions.data[0], cmdParentInfo.cmdSubInfoColl, cmdParentInfo.cmdSubGroupInfoColl)
    return {cmdSubInfo: result.cmdSubInfo, permissions: cmdParentInfo.permissions.concat(result.permissions)}
}



export function addCmdCaller(client: Djs.Client) {
    client.on(Djs.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return
        interaction = interaction as Djs.ChatInputCommandInteraction

        await interaction.deferReply()

        const cmdWithEntry = CmdRegister.getRegisteredCmds().get(interaction.commandName)

        let cmdFunctionalInfo: CmdRegister.CmdFunctionalInfo<Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder>
        let permissions: CmdPerms.CmdPermission[]

        if (cmdWithEntry instanceof CmdRegister.CmdParentInfo) {
            const result = searchSubcommand(cmdWithEntry, interaction.options)
            cmdFunctionalInfo = result.cmdSubInfo
            permissions = result.permissions
        } else if (cmdWithEntry instanceof CmdRegister.CmdNormalInfo) {
            cmdFunctionalInfo = cmdWithEntry
            permissions = cmdWithEntry.permissions
        } else {
            await interaction.reply(`\`${interaction.commandName}\` is not a command.`)
            return
        }


        if (permissions !== undefined) {
            for (const cmdPerm of permissions) {
                if (!cmdPerm.checkGrant(interaction)) {
                    await interaction.reply(`You do not have the permission to use this command! ${cmdPerm.onRejectMessage}`)
                    return
                }
            }
        }



        try {
            await cmdFunctionalInfo.executeFunc(interaction)
        } catch (error: unknown) {
            console.error(error)

            const userDisplay = error instanceof Error ? error.name : typeof error
            const messageContent = `There was an error while executing this command! ${Djs.inlineCode(userDisplay)}`

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(messageContent)
            } else {
                await interaction.channel?.send(messageContent)
            }
        }
    })
}