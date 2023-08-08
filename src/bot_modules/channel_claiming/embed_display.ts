import { Prisma } from "@prisma/client"
import * as Djs from "discord.js"
import * as DjsTools from "djs-tools"

import * as CmdGroup from "./cmd_group"



export class HErrorEmbedDataNotFound extends DjsTools.HandleableError {
    private __nominalHErrorEmbedDataNotFound() {}

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`GuildSID ${guild.id} doesn't have channel claiming embed data.`, cause)
    }

    public override getDisplayMessage(): string {
        // TODO reference commands
        return "This server doesn't have a set channel to display embeds yet! " +
        "Please set an embed using the /cc set-embed-display command!"
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
        fields = await Promise.all(claimables.map(async claimable => {
            const channel = await DjsTools.getClient().channels.fetch(claimable.channelSid)
            // TEST
            if (channel === null) {
                return {
                    name: `${claimable.channelSid} (${Djs.underscore("Unknown channel")})`,
                    // TODO reference commands
                    value: "This channel is not accessible or has been deleted. Please remove this channel and/or replace it using /cc edit-channels.",
                    inline: false
                }
            }

            if (!(channel instanceof Djs.TextChannel)) {
                return {
                    name: `${channel.toString()} (${Djs.underscore("Invalid channel type")})`,
                    // TODO reference commands
                    value: "This channel is not a text channel. Please remove this channel using /cc edit-channels.",
                    inline: false
                }
            }

            // TEST
            return {
                name: `${channel.toString()} : ${claimable.isClaimed ? "Claimed" : "Unclaimed"}`,
                value: (claimable.isClaimed ? `Location: ${claimable.location}\n` : "") +
                    `Updated ${Djs.time(claimable.timeUpdated, Djs.TimestampStyles.ShortDateTime)}`,
                inline: false
            }
        }))
    } else {
        fields = [{
            // TEST
            // TODO reference commands
            name: "No claimable channels!",
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
    // TEST on implementation
    if ((!embedData.isSet) || embedData.channelSid === null || embedData.messageSid === null) {
        throw new HErrorEmbedDataNotSet(guild)
    }

    const botClient = DjsTools.getClient()
    const channel = await botClient.channels.fetch(embedData.channelSid)
    // TEST
    if (channel === null || !(channel instanceof Djs.TextChannel)) throw new HErrorEmbedDataCannotFetch(guild, "channel")
    const message = await channel.messages.fetch(embedData.messageSid)
    // TODO missing message

    const embed = await generateEmbed(claimables)
    // TEST regular
    await message.edit({content: "", embeds: [embed]})

    return message
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



const paramsEditEmbed = [
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel",
        description: "The channel where the embed message would display at.",
        validChannelTypes: [DjsTools.ChannelRestrict.Text]
    })
]
export const cmdEditEmbed = CmdGroup.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "set-embed-display",
    description: "Sets the channel where the embed display would go.",
    parameters: paramsEditEmbed,
    async executeFunc(interaction, [channel]) {
        await interaction.editReply(`Setting channel ${channel.toString()} as the embed display channel...`)
        const message = await setEmbedMessage(interaction.guild, channel)
        await interaction.followUp(`The channel is now set! The display can be found at ${message.url}.`)
    },
})