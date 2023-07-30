import * as DjsTools from "djs-tools"



export async function getClaimableChannels(guildSid: string) {
    const result = await DjsTools.getPrismaClient().moduleChannelClaiming.findFirst({
        where: {guildSid: guildSid},
        include: {claimChannels: true}
    })

    if (result === null) return null
    return result.claimChannels
}