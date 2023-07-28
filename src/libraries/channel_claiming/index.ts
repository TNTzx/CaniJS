import * as DjsTools from "djs-tools"



export const dbGuildSetupper = new DjsTools.DBGuildSetupper({
    async isAlreadySetup(guildSid) {
        const result = DjsTools.getPrismaClient().moduleChannelClaiming.findFirst({
            where: {guildSid: guildSid}
        })

        return !(result === null)
    },

    async setup(guildSid) {
        return await DjsTools.getPrismaClient().guild.update({
            where: {guildSid: guildSid},
            data: {moduleChannelClaiming: {create: {}}}
        })
    }
})