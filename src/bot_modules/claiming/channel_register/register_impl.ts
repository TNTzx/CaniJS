import { Prisma } from "@prisma/client"
import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as BMCommands from "../bm_commands"
import * as General from "../general"
import * as EmbedDisplay from "../embed_display/embed_impl"



async function prismaClaimableAdd(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        return await DjsTools.getPrismaClient().bMCC_Claimable.create({
            data: {
                bmChannelClaiming: {connect: {guildSid: guild.id}},
                channelSid: channel.id,
            }
        })
    } catch (error) {
        // TODO centralized prisma error handling
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new General.HErrorClaimableAlreadyExists(guild, channel, error)
            }
        }
        throw error
    }
}


async function prismaClaimableRemoveGeneral(guild: Djs.Guild, channelSid: string) {
    try {
        return await DjsTools.getPrismaClient().bMCC_Claimable.delete({
            where: {
                bmChannelClaiming: {guildSid: guild.id},
                channelSid: channelSid,
            }
        })
    } catch (error) {
        // TODO centralized prisma error handling
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new General.HErrorClaimableNotExistsGeneral(guild, channelSid, error)
            }
        }
        throw error
    }
}

async function prismaClaimableRemove(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        return await prismaClaimableRemoveGeneral(guild, channel.id)
    } catch (error) {
        if (error instanceof General.HErrorClaimableNotExistsGeneral) throw new General.HErrorClaimableNotExists(guild, channel, error)
        throw error
    }
}



BMCommands.cmdEditChannelsAdd.setExecuteFunc(async (interaction, [channel]) => {
    await interaction.followUp("Adding the channel as a claimable channel...")
    try {
        await prismaClaimableAdd(interaction.guild, channel)
    } catch (error) {
        if (error instanceof General.HErrorClaimableAlreadyExists) {
            throw new DjsTools.HErrorReferredParams([BMCommands.cmdEditChannelsAdd.parameters[0]], error)
        }
    }
    await interaction.followUp(`Added ${channel.toString()} as a claimable channel!`)

    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})


BMCommands.cmdEditChannelsRemove.setExecuteFunc(async (interaction, [channel]) => {
    await interaction.followUp("Removing the channel as a claimable channel...")
    try {
        await prismaClaimableRemove(interaction.guild, channel)
    } catch (error) {
        if (error instanceof General.HErrorClaimableNotExists) {
            throw new DjsTools.HErrorReferredParams([BMCommands.cmdEditChannelsRemove.parameters[0]], error)
        }
    }
    await interaction.followUp(`Removed ${channel.toString()} as a claimable channel!`)

    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})


BMCommands.cmdEditChannelsRemoveDeleted.setExecuteFunc(async (interaction, [channelSid]) => {
    await interaction.followUp("Removing the deleted channel as a claimable channel...")

    try {
        await prismaClaimableRemoveGeneral(interaction.guild, channelSid)
    } catch (error) {
        if (error instanceof General.HErrorClaimableNotExistsGeneral) {
            throw new DjsTools.HErrorReferredParams([BMCommands.cmdEditChannelsRemoveDeleted.parameters[0]], error)
        }
    }

    await interaction.followUp(`Removed ${Djs.inlineCode(channelSid)} as a claimable channel! About time lmao~`)

    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})