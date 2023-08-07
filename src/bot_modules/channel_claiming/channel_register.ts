import { Prisma } from "@prisma/client"
import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"

import * as CmdGroup from "./cmd_group"
import * as General from "./general"



async function prismaClaimableAdd(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        return await DjsTools.getPrismaClient().bMCC_Claimable.create({
            data: {
                bmChannelClaiming: {connect: {
                    guildSid: guild.id
                }},
                channelSid: channel.id,
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new General.HErrorClaimableAlreadyExists(guild, channel, error)
            }
        }
        throw error
    }
}


async function prismaClaimableRemove(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        return await DjsTools.getPrismaClient().bMCC_Claimable.delete({
            where: {
                bmChannelClaiming: {
                    guildSid: guild.id
                },
                channelSid: channel.id,
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new General.HErrorClaimableNotExists(guild, channel, error)
            }
        }
        throw error
    }
}


const paramRegister = [
    new DjsTools.CmdParamString({
        required: true,
        name: "action",
        description: "The action to do.",
        choiceManager: new DjsTools.ChoiceManager([
            DjsTools.createGenericChoice("add"),
            DjsTools.createGenericChoice("remove")
        ])
    }),
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel",
        description: "The channel to add / remove as a claimable channel.",
        validChannelTypes: [DjsTools.ChannelRestrict.Text]
    })
] as const

export const cmdRegister = CmdGroup.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "edit-channels",
    description: "Edits the channels able to be claimed.",
    parameters: paramRegister,
    useCases: [Moderation.caseIsAdmin],
    async executeFunc(interaction, [action, channel]) {
        await interaction.editReply("Editing the claimable channels list...")

        if (action === "add") {
            try {
                await prismaClaimableAdd(interaction.guild, channel)
            } catch (error) {
                if (error instanceof General.HErrorClaimableAlreadyExists) {
                    throw new DjsTools.HErrorReferredParams([paramRegister[1]], error)
                }
            }
            await interaction.followUp(`Added ${channel.toString()} as a claimable channel!`)
        } else {
            try {
                await prismaClaimableRemove(interaction.guild, channel)
            } catch (error) {
                if (error instanceof General.HErrorClaimableNotExists) {
                    throw new DjsTools.HErrorReferredParams([paramRegister[1]], error)
                }
            }
            await interaction.followUp(`Removed ${channel.toString()} as a claimable channel!`)
        }
    },
})