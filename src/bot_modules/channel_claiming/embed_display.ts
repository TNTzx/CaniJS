import { Prisma } from "@prisma/client"
import * as Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"
import * as CmdGroup from "./cmd_group"
import * as General from "./general"



export class ErrorEmbedDataNotFound extends DjsTools.HandleableError {
    private __nominalErrorEmbedDataNotFound() {}

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`GuildSID ${guild.id} doesn't have channel claiming embed data.`, cause)
    }
}

export class HErrorEmbedDataNotSet extends DjsTools.HandleableError {
    private __nominalHErrorEmbedDataNotSet() {}

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`GuildSID ${guild.id} has no set channel claiming embed data.`, cause)
    }

    public override getDisplayMessage(): string {
        // TODO reference commands
        return "This server doesn't have a set channel to display embeds yet! " +
        "Please set an embed using the /cc set-embed-display command!"
    }
}

export class HErrorEmbedDataCannotFetch extends DjsTools.HandleableError {
    private __nominalHErrorEmbedDataCannotFetch() {}

    constructor(public guild: Djs.Guild, public type: "channel" | "message", cause?: Error) {
        super(`GuildSID ${guild.id} has a channel claiming embed but bot cannot access the ${type}.`, cause)
    }

    public override getDisplayMessage(): string {
        const actionRequired = this.type === "channel" ? "view the channel" : "view / edit the message"

        // TODO reference commands
        return "This server's embed display cannot be accessed or is deleted. " +
        `Please make sure the bot has permission to ${actionRequired} or set a new embed using /cc set-embed-display.`
    }
}



export async function generateEmbed(claimables: Prisma.BMCC_ClaimableGetPayload<undefined>[]) {
    let fields: Djs.EmbedField[]

    if (claimables.length > 0) {
        const channelOrHErrors = await General.getChannelsFromClaimables(claimables)
        fields = channelOrHErrors.map((channelOrHError, idx) => {
            const claimable = claimables[idx]

            if (channelOrHError instanceof General.HErrorClaimableChannelNotFound) {
                // TODO make /cc edit-channels clear-invalid
                return {
                    name: `${claimable.channelSid} (${Djs.underscore("Unknown channel")})`,
                    // TODO reference commands
                    value: "This channel is not accessible or has been deleted. Please use /cc edit-channels clear-invalid to clear this or give permission to the bot to access this.",
                    inline: false
                }
            } else {
                const channel = channelOrHError
                return {
                    name: `${channel.toString()} : ${claimable.isClaimed ? "Claimed" : "Unclaimed"}`,
                    value: (claimable.isClaimed ? `${Djs.underscore("Location")}: ${Djs.bold(claimable.location ?? "<unknown>")}\n` : "") +
                        `Updated ${Djs.time(claimable.timeUpdated, Djs.TimestampStyles.RelativeTime)}`,
                    inline: false
                }
            }
        })
    } else {
        fields = [{
            name: "No claimable channels!",
            // TODO reference commands
            value: "There are no claimable channels. Add one using /cc edit-channels!",
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
        channel = await botClient.channels.fetch(embedData.channelSid, {force: true})
    } catch (error) {
        if (error instanceof Djs.DiscordAPIError && error.code === 10003) throw new HErrorEmbedDataCannotFetch(guild, "channel", error)
        throw error
    }
    if (channel === null || !(channel instanceof Djs.TextChannel)) throw new HErrorEmbedDataCannotFetch(guild, "channel")

    let message
    try {
        message = await channel.messages.fetch({message: embedData.messageSid, force: true})
    } catch (error) {
        if (error instanceof Djs.DiscordAPIError && error.code === 10008) throw new HErrorEmbedDataCannotFetch(guild, "message", error)
        throw error
    }

    const embed = await generateEmbed(claimables)
    await message.edit({content: "__ __", embeds: [embed]})

    return message
}

export async function updateEmbedFromGuild(guild: Djs.Guild) {
    const bmcc = await DjsTools.getPrismaClient().bMChannelClaiming.findUniqueOrThrow({
        where: {guildSid: guild.id},
        include: {claimables: true, embedData: true}
    })

    if (bmcc.embedData === null) throw new ErrorEmbedDataNotFound(guild)

    return await updateEmbedFromBMCC(guild, bmcc.claimables, bmcc.embedData)
}


export async function setEmbedMessage(guild: Djs.Guild, channel: Djs.TextChannel) {
    const message = await channel.send("Setting up embed, please wait!")

    const bmcc = await DjsTools.getPrismaClient().bMChannelClaiming.findUniqueOrThrow({
        where: {guildSid: guild.id},
        include: {claimables: true, embedData: true}
    })

    const embedData = await DjsTools.getPrismaClient().bMCC_EmbedData.update({
        where: {bmChannelClaimingId: bmcc.id},
        data: {
            isSet: true,
            channelSid: channel.id,
            messageSid: message.id
        }
    })

    return await updateEmbedFromBMCC(guild, bmcc.claimables, embedData)
}



export const cmdGroupEmbed = CmdGroup.cmdGroupChannelClaiming.addSubTemplateGroup({
    id: "embed-display",
    description: "Embed display controls for channel claiming.",
    useCases: [Moderation.caseIsAdmin]
})



const paramsEditEmbed = [
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel",
        description: "The channel where the embed message would display at.",
        validChannelTypes: [DjsTools.ChannelRestrict.Text]
    })
]
export const cmdEditEmbed = cmdGroupEmbed.addSubTemplateLeaf({
    id: "set",
    description: "Sets the channel where the embed display would go.",
    parameters: paramsEditEmbed,

    async executeFunc(interaction, [channel]) {
        await interaction.followUp(`Setting channel ${channel.toString()} as the embed display channel...`)
        const message = await setEmbedMessage(interaction.guild, channel)
        await interaction.followUp(`The channel is now set! The display can be found at ${message.url}.`)
    },
})


export const cmdUpdateEmbed = cmdGroupEmbed.addSubTemplateLeaf({
    id: "update",
    description: "Updates the embed display for claim channels.",

    async executeFunc(interaction, _args) {
        await interaction.followUp("Updating the embed display...")
        const message = await updateEmbedFromGuild(interaction.guild)
        await interaction.followUp(`Updated. The display can be found at ${message.url}.`)
    }
})