import Djs from "discord.js"

import * as UseCase from "./use_case"
import * as Templates from "./templates"
import * as Registerer from "./registerer"



interface EffectiveTemplate {
    template: Templates.CmdTemplateLeaf
    useCases: readonly UseCase.UseCase[]
}



function searchSubcommand(
    cmdTemplateGroup: Templates.CmdTemplateGroup,
    interactionOptions: Omit<Djs.CommandInteractionOptionResolver<Djs.CacheType>, "getMessage" | "getFocused">
): EffectiveTemplate {
    function recursive(nextPath: string[], currentTemplate: Templates.CmdTemplateType): EffectiveTemplate {
        if (currentTemplate instanceof Templates.CmdTemplateLeaf) {
            return { template: currentTemplate, useCases: currentTemplate.useCases }
        }

        if (nextPath.length === 0) throw new Error("Command not found.")

        const nextTemplate = currentTemplate.getSubTemplate(nextPath[0])
        if (nextTemplate === undefined) throw new Error("Command not found.")

        const result = recursive(nextPath.slice(1), nextTemplate)
        return { template: result.template, useCases: result.useCases.concat(currentTemplate.useCases) }
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
    return { template: result.template, useCases: result.useCases.concat(cmdTemplateGroup.useCases) }
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
                useCases: initialCmdTemplate.useCases
            }
        } else {
            await interaction.editReply(`\`${interaction.commandName}\` is not a command.`)
            return
        }



        for (const cmdPerm of effectiveTemplate.useCases) {
            const conditionResult = await cmdPerm.isMet(interaction)
            if (conditionResult !== null) {
                await interaction.editReply(`You cannot use this command! ${conditionResult}`)
                return
            }
        }



        try {
            await effectiveTemplate.template.runCmd(interaction)
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