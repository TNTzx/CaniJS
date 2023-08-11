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
                bmChannelClaiming: {
                    connect: {
                        guildSid: guild.id
                    }
                },
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



BMCommands.cmdEditChannels.setExecuteFunc(async (interaction, [action, channel]) => {
    await interaction.followUp("Editing the claimable channels list...")

    if (action === "add") {
        try {
            await prismaClaimableAdd(interaction.guild, channel)
        } catch (error) {
            if (error instanceof General.HErrorClaimableAlreadyExists) {
                throw new DjsTools.HErrorReferredParams([BMCommands.cmdEditChannels.parameters[1]], error)
            }
        }
        await interaction.followUp(`Added ${channel.toString()} as a claimable channel!`)
    } else {
        try {
            await prismaClaimableRemove(interaction.guild, channel)
        } catch (error) {
            if (error instanceof General.HErrorClaimableNotExists) {
                throw new DjsTools.HErrorReferredParams([BMCommands.cmdEditChannels.parameters[1]], error)
            }
        }
        await interaction.followUp(`Removed ${channel.toString()} as a claimable channel!`)
    }

    // TEST
    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})