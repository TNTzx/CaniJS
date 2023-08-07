import * as DjsTools from "djs-tools"

import * as CmdGroup from "./cmd_group"



export const botModule = new DjsTools.BotModule({
    id: "channel-claiming",

    dbGuildSetupper: new DjsTools.DBGuildSetupper({
        async isAlreadySetup(guildSid) {
            const result = await DjsTools.getPrismaClient().bMChannelClaiming.findFirst({
                where: {guildSid: guildSid}
            })

            return !(result === null)
        },

        getSetupData(_guildSid) {
            return {bmChannelClaiming: {create: {}}}
        }
    }),

    cmdTemplates: [
        CmdGroup.cmdGroupChannelClaiming
    ]
})