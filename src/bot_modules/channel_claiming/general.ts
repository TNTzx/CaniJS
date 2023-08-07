import Djs from "discord.js"
import {Prisma} from "@prisma/client"
import * as DjsTools from "djs-tools"



export class HErrorChannelNotText extends DjsTools.HandleableError {
    private __nominalHErrorChannelNotText() {}
    constructor(public channel: Exclude<Djs.TextBasedChannel, Djs.TextChannel>, cause?: Error) {
        super(`ChannelSID ${channel.id} is not a text channel and cannot be used as a claimable channel.`, cause)
    }

    public override getDisplayMessage(): string {
        return `The channel ${this.channel.toString()} is not a text channel!`
    }
}



export class HErrorClaimableAlreadyExists extends DjsTools.HandleableError {
    private __nominalClaimableAlreadyExists() {}

    constructor(public guild: Djs.Guild, public channel: Djs.TextChannel, cause?: Error) {
        super(`GuildSID ${guild.id} already has a registered channel of SID ${channel.id}.`, cause)
    }

    public override getDisplayMessage(): string {
        return `The channel ${this.channel.toString()} is already claimable!`
    }
}

export class HErrorClaimableNotExists extends DjsTools.HandleableError {
    private __nominalClaimableNotExists() {}

    constructor(public guild: Djs.Guild, public channel: Djs.TextChannel, cause?: Error) {
        super(`GuildSID ${guild.id} doesn't have a registered channel of SID ${channel.id}.`, cause)
    }

    public override getDisplayMessage(): string {
        return `The channel ${this.channel.toString()} is not claimable!`
    }
}


export class HErrorClaimablesNotFound extends DjsTools.HandleableError {
    private __nominalClaimableNotExists() {}

    constructor(public guild: Djs.Guild,cause?: Error) {
        super(`GuildSID ${guild.id} doesn't have registered channels.`, cause)
    }

    public override getDisplayMessage(): string {
        return "This guild has no claimable channels!"
    }
}


export async function getClaimableChannels(guild: Djs.Guild) {
    try {
        const result = await DjsTools.getPrismaClient().bMChannelClaiming.findUniqueOrThrow({
            where: { guildSid: guild.id },
            include: { claimables: true }
        })
        return result.claimables
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") throw new HErrorClaimablesNotFound(guild, error)
        }
        throw error
    }
}

export async function getClaimableChannel(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        const result = await DjsTools.getPrismaClient().bMCC_Claimable.findUniqueOrThrow({
            where: {
                bmChannelClaiming: {guildSid: guild.id},
                channelSid: channel.id
            },
        })
        return result
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") throw new HErrorClaimableNotExists(guild, channel, error)
        }
        throw error
    }
}


export async function isChannelClaimable(guild: Djs.Guild, channel: Djs.TextChannel) {
    try {
        await getClaimableChannel(guild, channel)
        return true
    } catch (error) {
        if (error instanceof HErrorClaimableNotExists) return false
        throw error
    }
}


// TEST
export function getParamClaimable<IsRequired extends boolean>(required: IsRequired) {
    return new DjsTools.CmdParamChannel({
        required: required,
        name: "claimable-channel",
        description: "A channel that is claimable.",
        validChannelTypes: [DjsTools.ChannelRestrict.Text],
        async valueChecker(value) {
            if (!(await isChannelClaimable(value.guild, value))) {
                return new DjsTools.HErrorParamValueCheck(
                    new HErrorClaimableNotExists(value.guild, value)
                )
            }

            return null
        },
    })
}