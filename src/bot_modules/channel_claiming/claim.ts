import { Prisma } from "@prisma/client"
import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as Group from "./cmd_group"
import * as General from "./general"



//async function updateClaimStatus(channel: Djs.TextChannel, isClaimed: boolean, location: string | null) {}


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

        const guild = interaction.guild
        const channel = interaction.channel
        if (!(channel instanceof Djs.TextChannel)) {
            throw new General.HErrorChannelNotText(channel)
        }

        const claimedAt = new Date()

        try {
            await DjsTools.getPrismaClient().bMCC_Claimable.update({
                where: {channelSid: channel.id},
                data: {
                    isClaimed: true,
                    location: location,
                    claimedAt: claimedAt
                }
            })

            await interaction.followUp(
                Djs.bold("Channel has been claimed!") + "\n" +
                `Current location: ${Djs.bold(location)}\n` +
                `Claimed ${Djs.time(claimedAt, Djs.TimestampStyles.RelativeTime)} | ${Djs.time(claimedAt, Djs.TimestampStyles.ShortDateTime)}`
            )
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new General.HErrorClaimableNotExists(guild, channel, error)
            }
            throw error
        }
    }
})



export const cmdUnclaim = Group.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "unclaim",
    description: "Unclaims the current channel and marks it as free to use.",

    async executeFunc(interaction, _args) {
        // TODO merge
        await interaction.editReply("Unclaiming current channel...")

        const guild = interaction.guild
        const channel = interaction.channel
        if (!(channel instanceof Djs.TextChannel)) {
            throw new General.HErrorChannelNotText(channel)
        }

        try {
            await DjsTools.getPrismaClient().bMCC_Claimable.update({
                where: {channelSid: channel.id},
                data: {
                    isClaimed: false,
                    location: null,
                    claimedAt: null // TODO updated at
                }
            })

            await interaction.followUp(
                Djs.bold("Channel has been unclaimed!")
            )
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new General.HErrorClaimableNotExists(guild, channel, error)
            }
            throw error
        }
    }
})