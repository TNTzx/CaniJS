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
        },

        async botModuleUpdator(guildSid) {
            const prisma = DjsTools.getPrismaClient()
            const result = await prisma.bMCC_EmbedData.findFirst({
                where: {bmChannelClaiming: {guildSid: guildSid}}
            })

            if (result === null) {
                await prisma.bMCC_EmbedData.create({
                    data: {bmChannelClaiming: {connect: {guildSid: guildSid}}}
                })
            }
        },
    }),

    cmdTemplates: [
        CmdGroup.cmdGroupChannelClaiming
    ]
})