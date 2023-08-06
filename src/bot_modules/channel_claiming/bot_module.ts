import * as DjsTools from "djs-tools"

import * as CmdGroup from "./cmd_group"


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
        CmdGroup.cmdGroupChannelClaiming
    ]
})