import * as DjsTools from "djs-tools"

import * as CmdGroup from "./bm_commands"



export const botModule = new DjsTools.BotModule({
    id: "moderation",

    dbGuildSetupper: new DjsTools.DBGuildSetupper({
        async isAlreadySetup(guildSid) {
            const result = await DjsTools.getPrismaClient().bMAdmin.findFirst({
                where: { guildSid: guildSid }
            })

            return !(result === null)
        },

        getSetupData(_guildSid) {
            return { bmAdmin: { create: {} } }
        }
    }),

    cmdTemplates: [
        CmdGroup.cmdSetAdmin
    ]
})