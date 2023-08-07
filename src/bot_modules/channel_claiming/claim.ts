import { Prisma } from "@prisma/client"
import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as Group from "./cmd_group"
import * as General from "./general"



async function updateClaimStatus(channel: Djs.TextChannel, isClaimed: boolean, location: string | null) {
    const currentTime = new Date()

    try {
        await DjsTools.getPrismaClient().bMCC_Claimable.update({
            where: {channelSid: channel.id},
            data: {
                isClaimed: isClaimed,
                location: location,
                timeUpdated: currentTime
            }
        })

        return {timeUpdated: currentTime}
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") throw new General.HErrorClaimableNotExists(channel.guild, channel, error)
        }
        throw error
    }
}


function getUpdateTimeDisplay(time: Date) {
    return `Updated ${Djs.time(time, Djs.TimestampStyles.RelativeTime)} | ${Djs.time(time, Djs.TimestampStyles.ShortDateTime)}`
}


const paramsClaim = [
    new DjsTools.CmdParamString({
        required: true,
        name: "location",
        description: "The new location of this channel."
    }).setLengthLimits(1, 100)
] as const
export const cmdClaim = Group.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "claim",
    description: "Claims the current channel.",
    parameters: paramsClaim,

    async executeFunc(interaction, [location]) {
        await interaction.editReply("Claiming current channel...")

        const channel = interaction.channel
        if (!(channel instanceof Djs.TextChannel)) {
            throw new General.HErrorChannelNotText(channel)
        }

        // TEST regular update
        // TEST channel not claimable
        const result = await updateClaimStatus(channel, true, location)

        await interaction.followUp(
            Djs.bold("Channel has been claimed!") + "\n" +
            `Current location: ${Djs.bold(location)}\n` +
            getUpdateTimeDisplay(result.timeUpdated)
        )
    }
})



export const cmdUnclaim = Group.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "unclaim",
    description: "Unclaims the current channel and marks it as free to use.",

    async executeFunc(interaction, _args) {
        await interaction.editReply("Unclaiming current channel...")

        const channel = interaction.channel
        if (!(channel instanceof Djs.TextChannel)) {
            throw new General.HErrorChannelNotText(channel)
        }

        // TEST regular update
        const result = await updateClaimStatus(channel, false, null)

        await interaction.followUp(
            Djs.bold("Channel has been unclaimed!") + "\n" +
            getUpdateTimeDisplay(result.timeUpdated)
        )
    }
})