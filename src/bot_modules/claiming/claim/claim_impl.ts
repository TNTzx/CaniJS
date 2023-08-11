import { Prisma } from "@prisma/client"
import Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as BMCmds from "../bm_commands"
import * as General from "../general"
import * as EmbedDisplay from "../embed_display/embed_impl"



class HErrorClaimableAlreadyUnclaimed extends DjsTools.HandleableError {
    private __nominalHErrorClaimableAlreadyUnclaimed() { }

    constructor(public channel: Djs.TextChannel, cause?: Error) {
        super(`ChannelSID ${channel.id} is already unclaimed.`, cause)
    }

    public override getDisplayMessage(): string {
        return "This channel is already unclaimed!"
    }
}



async function updateClaimStatus(channel: Djs.TextChannel, isClaimed: boolean, location: string | null) {
    let channelSearch
    try {
        channelSearch = await DjsTools.getPrismaClient().bMCC_Claimable.findUniqueOrThrow({
            where: { channelSid: channel.id }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") throw new General.HErrorClaimableNotExists(channel.guild, channel, error)
        }
        throw error
    }

    if ((!channelSearch.isClaimed) && (!isClaimed)) throw new HErrorClaimableAlreadyUnclaimed(channel)

    const currentTime = new Date()

    try {
        return await DjsTools.getPrismaClient().bMCC_Claimable.update({
            where: { channelSid: channelSearch.channelSid },
            data: {
                isClaimed: isClaimed,
                location: location,
                timeUpdated: currentTime
            }
        })
    } catch (error) {
        // TODO prisma centralized handling
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") throw new General.HErrorClaimableNotExists(channel.guild, channel, error)
        }
        throw error
    }
}


function getUpdateTimeDisplay(time: Date) {
    return `Updated ${Djs.time(time, Djs.TimestampStyles.RelativeTime)} | ${Djs.time(time, Djs.TimestampStyles.ShortDateTime)}`
}



BMCmds.cmdClaim.setExecuteFunc(async (interaction, [location]) => {
    await interaction.followUp("Claiming current channel...")

    const channel = interaction.channel
    if (!(channel instanceof Djs.TextChannel)) {
        throw new General.HErrorChannelNotText(channel)
    }

    const result = await updateClaimStatus(channel, true, location)

    await interaction.followUp(
        Djs.bold("Channel has been claimed!") + "\n" +
        `Current location: ${Djs.bold(location)}\n` +
        getUpdateTimeDisplay(result.timeUpdated)
    )

    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})




BMCmds.cmdUnclaim.setExecuteFunc(async (interaction, _args) => {
    await interaction.followUp("Unclaiming current channel...")

    const channel = interaction.channel
    if (!(channel instanceof Djs.TextChannel)) {
        throw new General.HErrorChannelNotText(channel)
    }

    const result = await updateClaimStatus(channel, false, null)

    await interaction.followUp(
        Djs.bold("Channel has been unclaimed!") + "\n" +
        getUpdateTimeDisplay(result.timeUpdated)
    )

    await EmbedDisplay.updateEmbedFromGuild(interaction.guild)
})