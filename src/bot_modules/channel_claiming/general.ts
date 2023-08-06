import Djs from "discord.js"
import * as DjsTools from "djs-tools"



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


export async function getClaimableChannels(guildSid: string) {
    const result = await DjsTools.getPrismaClient().moduleChannelClaiming.findFirst({
        where: { guildSid: guildSid },
        include: { claimChannels: true }
    })

    if (result === null) throw new Error("Claimable channels not found.")
    return result.claimChannels
}

