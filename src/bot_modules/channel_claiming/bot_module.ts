import * as DjsTools from "djs-tools"

import * as ChannelRegister from "./channel_register"


export const botModule = new DjsTools.BotModule({
    id: "channel-claiming",

    dbGuildSetupper: new DjsTools.DBGuildSetupper({
        async isAlreadySetup(guildSid) {
            const result = await DjsTools.getPrismaClient().moduleChannelClaiming.findFirst({
                where: {guildSid: guildSid}
            })

            return !(result === null)
        },

        getSetupData(_guildSid) {
            return {moduleChannelClaiming: {create: {}}}
        }
    }),

    cmdTemplates: [
        ChannelRegister.cmdRegister
    ]
})