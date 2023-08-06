import * as DjsTools from "djs-tools"

import * as Admin from "./admin"



export const botModule = new DjsTools.BotModule({
    id: "moderation",

    dbGuildSetupper: new DjsTools.DBGuildSetupper({
        async isAlreadySetup(guildSid) {
            const result = await DjsTools.getPrismaClient().permissions.findFirst({
                where: {guildSid: guildSid}
            })

            return !(result === null)
        },

        getSetupData(_guildSid) {
            return {permissions: {create: {}}}
        }
    }),

    cmdTemplates: [
        Admin.cmdSetAdmin
    ]
})