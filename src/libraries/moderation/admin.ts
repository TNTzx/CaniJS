import Djs from "discord.js"

import * as DjsTools from "djs-tools"



async function editAdminRole(guildSid: string, adminRoleSid: string) {
    return await DjsTools.getPrismaClient().permissions.update({
        where: {guildSid: guildSid},
        data: {adminSid: adminRoleSid}
    })
}



const paramSetAdmin = [
    DjsTools.createParameter(
        DjsTools.ParamEnum.role, true,
        "admin role", "The new admin role."
    )
] as const
export const cmdSetAdmin = new DjsTools.CmdTemplateLeaf({
    id: "setadmin",
    description: "Sets the admin role for this server.",
    useScope: DjsTools.useScopeGuildOnly,
    parameters: paramSetAdmin,
    permissions: [DjsTools.permServerOwner],

    async executeFunc(interaction) {
        if (interaction.isCommand()) interaction
        const parameters = DjsTools.getParameterValues(interaction, paramSetAdmin)
        await interaction.editReply(`Setting admin to ${Djs.inlineCode(parameters[0].name)}...`)

        await editAdminRole(interaction.guild.id, parameters[0].id)

        await interaction.followUp("The admin role for this server has been set.")
    }
})