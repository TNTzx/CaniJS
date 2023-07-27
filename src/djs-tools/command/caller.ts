import Djs from "discord.js"

import * as Perms from "../permissions"
import * as Registerer from "./registerer"
import * as Templates from "./templates"



interface EffectiveTemplate {
    template: Templates.CmdTemplateLeaf
    permissions: readonly Perms.CmdPermission[]
}



function searchSubcommand(
    cmdTemplateGroup: Templates.CmdTemplateGroup,
    interactionOptions: Omit<Djs.CommandInteractionOptionResolver<Djs.CacheType>, "getMessage" | "getFocused">
) {
    function recursive(optionsData: Djs.CommandInteractionOption<Djs.CacheType>, currentTemplate: Templates.CmdTemplateType): EffectiveTemplate {
        if (currentTemplate instanceof Templates.CmdTemplateLeaf) {
            return {template: currentTemplate, permissions: currentTemplate.permissions}
        }

        const nextTemplate = currentTemplate.getSubTemplate(optionsData.name)
        if (nextTemplate === undefined) throw new Error("Command not found.")

        if (optionsData.options === undefined) throw new Error("Command not found.")
        const result = recursive(optionsData.options[0], nextTemplate)
        return {template: result.template, permissions: result.permissions.concat(currentTemplate.permissions)}
    }

    const result = recursive(interactionOptions.data[0], cmdTemplateGroup)
    return {template: result.template, permissions: cmdTemplateGroup.permissions.concat(result.permissions)}
}



export function addCmdCaller(client: Djs.Client) {
    client.on(Djs.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return
        interaction = interaction as Djs.ChatInputCommandInteraction

        await interaction.deferReply()

        const initialCmdTemplate = Registerer.getCmdTemplate(interaction.commandName)

        let effectiveTemplate: EffectiveTemplate

        if (initialCmdTemplate instanceof Templates.CmdTemplateGroup) {
            const result = searchSubcommand(initialCmdTemplate, interaction.options)
            effectiveTemplate = result
        } else if (initialCmdTemplate instanceof Templates.CmdTemplateLeaf) {
            effectiveTemplate = {
                template: initialCmdTemplate,
                permissions: initialCmdTemplate.permissions
            }
        } else {
            await interaction.editReply(`\`${interaction.commandName}\` is not a command.`)
            return
        }


        for (const cmdPerm of effectiveTemplate.permissions) {
            if (!cmdPerm.checkGrant(interaction)) {
                await interaction.editReply(`You do not have the permission to use this command! ${cmdPerm.onRejectMessage}`)
                return
            }
        }



        try {
            await effectiveTemplate.template.executeFunc(interaction)
        } catch (error) {
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