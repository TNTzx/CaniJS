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
    function recursive(nextPath: string[], currentTemplate: Templates.CmdTemplateType): EffectiveTemplate {
        if (currentTemplate instanceof Templates.CmdTemplateLeaf) {
            return {template: currentTemplate, permissions: currentTemplate.permissions}
        }

        if (nextPath.length === 0) throw new Error("Command not found.")

        const nextTemplate = currentTemplate.getSubTemplate(nextPath[0])
        if (nextTemplate === undefined) throw new Error("Command not found.")

        const result = recursive(nextPath.slice(1), nextTemplate)
        return {template: result.template, permissions: result.permissions.concat(currentTemplate.permissions)}
    }

    function getPath(optionsData: Djs.CommandInteractionOption<Djs.CacheType>): string[] {
        if (optionsData.options === undefined) throw new Error("Interaction options are invalid.")

        // type >= 3 means not subcommandgroup or subcommand
        if (optionsData.options.length === 0 || optionsData.options[0].type >= 3) return [optionsData.name]
        return [optionsData.name, ...getPath(optionsData.options[0])]
    }

    function expandPath(path: string[]) {
        let newPath: string[] = []
        for (const pathPoint of path) {
            if (pathPoint.includes(Templates.CmdTemplateGroup.combineIdSeparator)) {
                newPath = newPath.concat(pathPoint.split(Templates.CmdTemplateGroup.combineIdSeparator))
            } else {
                newPath.push(pathPoint)
            }
        }

        return newPath
    }

    const result = recursive(expandPath(getPath(interactionOptions.data[0])), cmdTemplateGroup)
    return {template: result.template, permissions: result.permissions.concat(cmdTemplateGroup.permissions)}
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