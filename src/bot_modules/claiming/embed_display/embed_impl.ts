import { Prisma } from "@prisma/client"
import * as Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as BMCmds from "../bm_commands"
import * as General from "../general"



export class ErrorEmbedDataNotFound extends DjsTools.HandleableError {
    private __nominalErrorEmbedDataNotFound() { }

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`GuildSID ${guild.id} doesn't have channel claiming embed data.`, cause)
    }
}

export class HErrorEmbedDataNotSet extends DjsTools.HandleableError {
    private __nominalHErrorEmbedDataNotSet() { }

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`GuildSID ${guild.id} has no set channel claiming embed data.`, cause)
    }

    public override getDisplayMessage(): string {
        return "This server doesn't have a set channel to display embeds yet! " +
            `Please set an embed using the ${BMCmds.cmdEmbedSet.getReferenceDisplay()} command!`
    }
}

export class HErrorEmbedDataCannotFetch extends DjsTools.HandleableError {
    private __nominalHErrorEmbedDataCannotFetch() { }

    constructor(public guild: Djs.Guild, public type: "channel" | "message", cause?: Error) {
        super(`GuildSID ${guild.id} has a channel claiming embed but bot cannot access the ${type}.`, cause)
    }

    public override getDisplayMessage(): string {
        const actionRequired = this.type === "channel" ? "view the channel" : "view / edit the message"

        return "This server's embed display cannot be accessed or is deleted. " +
            `Please make sure the bot has permission to ${actionRequired} or set a new embed using ${BMCmds.cmdEmbedSet.getReferenceDisplay()}.`
    }
}



export async function generateEmbed(
    claimables: Prisma.BMCC_ClaimableGetPayload<undefined>[]
) {
    function sortResults(results: Awaited<ReturnType<typeof General.getChannelsFromClaimables>>) {
        return [...results].sort((a, b) => {
            // TODO better handling
            if (a.result instanceof DjsTools.HandleableError) return +1
            if (b.result instanceof DjsTools.HandleableError) return -1
            return a.result.name.localeCompare(b.result.name, undefined, { sensitivity: "base" })
        })
    }

    let fields: Djs.EmbedField[]

    if (claimables.length > 0) {
        const results = await General.getChannelsFromClaimables(claimables)
        const sortedResults = sortResults(results)
        fields = sortedResults.map((result) => {
            if (result.result instanceof DjsTools.HandleableError) {
                if (result.result instanceof General.HErrorClaimableChannelNotFound) {
                    return {
                        name: `${result.claimable.channelSid} (${Djs.underscore("Deleted channel")})`,
                        value: `This channel is deleted. Please use ${BMCmds.cmdEditChannelsRemoveDeleted.getReferenceDisplay()} to clear this.`,
                        inline: false
                    }
                } else if (result.result instanceof General.HErrorClaimableForbidden) {
                    return {
                        name: `${result.claimable.channelSid} (${Djs.underscore("Channel Unaccessible")})`,
                        value: "This channel cannot be accessed by the bot. " +
                            "Please give the bot permission to view this channel " +
                            `or use ${BMCmds.cmdEditChannelsRemoveDeleted.getReferenceDisplay()} to clear this.`,
                        inline: false
                    }
                } else {
                    throw result.result
                }
            } else {
                return {
                    name: `${result.result.toString()} : ${result.claimable.isClaimed ? "Claimed" : "Unclaimed"}`,
                    value: (result.claimable.isClaimed ? `${Djs.underscore("Location")}: ${Djs.bold(result.claimable.location ?? "<unknown>")}\n` : "") +
                        `Updated ${Djs.time(result.claimable.timeUpdated, Djs.TimestampStyles.RelativeTime)}`,
                    inline: false
                }
            }
        })
    } else {
        fields = [{
            name: "No claimable channels!",
            value: `There are no claimable channels. Add one using ${BMCmds.cmdEditChannelsAdd.getReferenceDisplay()}!`,
            inline: false
        }]
    }


    return new Djs.EmbedBuilder({
        title: "RP Channels",
        description: "All the claimable RP channels are listed here.",
        fields: fields
    })
}


export async function updateEmbedFromBMCC(
    guild: Djs.Guild,
    claimables: Prisma.BMCC_ClaimableGetPayload<undefined>[],
    embedData: Prisma.BMCC_EmbedDataGetPayload<undefined>
) {
    if ((!embedData.isSet) || embedData.channelSid === null || embedData.messageSid === null) {
        throw new HErrorEmbedDataNotSet(guild)
    }

    const botClient = DjsTools.getClient()
    let channel
    try {
        channel = await botClient.channels.fetch(embedData.channelSid, { force: true })
    } catch (error) {
        if (error instanceof Djs.DiscordAPIError && error.code === 10003) throw new HErrorEmbedDataCannotFetch(guild, "channel", error)
        throw error
    }
    if (channel === null || !(channel instanceof Djs.TextChannel)) throw new HErrorEmbedDataCannotFetch(guild, "channel")

    let message
    try {
        message = await channel.messages.fetch({ message: embedData.messageSid, force: true })
    } catch (error) {
        if (error instanceof Djs.DiscordAPIError && error.code === 10008) throw new HErrorEmbedDataCannotFetch(guild, "message", error)
        throw error
    }

    const embed = await generateEmbed(claimables)
    await message.edit({ content: "__ __", embeds: [embed] })

    return message
}

export async function updateEmbedFromGuild(guild: Djs.Guild) {
    const bmcc = await DjsTools.getPrismaClient().bMChannelClaiming.findUniqueOrThrow({
        where: { guildSid: guild.id },
        include: { claimables: true, embedData: true }
    })

    if (bmcc.embedData === null) throw new ErrorEmbedDataNotFound(guild)

    return await updateEmbedFromBMCC(guild, bmcc.claimables, bmcc.embedData)
}


export async function setEmbedMessage(guild: Djs.Guild, channel: Djs.TextChannel) {
    const message = await channel.send("Setting up embed, please wait!")

    const bmcc = await DjsTools.getPrismaClient().bMChannelClaiming.findUniqueOrThrow({
        where: { guildSid: guild.id },
        include: { claimables: true, embedData: true }
    })

    const embedData = await DjsTools.getPrismaClient().bMCC_EmbedData.update({
        where: { bmChannelClaimingId: bmcc.id },
        data: {
            isSet: true,
            channelSid: channel.id,
            messageSid: message.id
        }
    })

    return await updateEmbedFromBMCC(guild, bmcc.claimables, embedData)
}



BMCmds.cmdEmbedSet.setExecuteFunc(async (interaction, [channel]) => {
    await interaction.followUp(`Setting channel ${channel.toString()} as the embed display channel...`)
    const message = await setEmbedMessage(interaction.guild, channel)
    await interaction.followUp(`The channel is now set! The display can be found at ${message.url}.`)
})



BMCmds.cmdEmbedUpdate.setExecuteFunc(async (interaction, _args) => {
    await interaction.followUp("Updating the embed display...")
    const message = await updateEmbedFromGuild(interaction.guild)
    await interaction.followUp(`Updated. The display can be found at ${message.url}.`)
})