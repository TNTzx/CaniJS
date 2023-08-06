import Djs from "discord.js"

import * as DjsTools from "djs-tools"



async function getAdminRoleSid(guildSid: string) {
    const prismaPermissions = await DjsTools.getPrismaClient().permissions.findFirst({
        where: {guildSid: guildSid}
    })

    if (prismaPermissions === null) return null
    return prismaPermissions.adminSid
}


export const caseIsAdmin = new DjsTools.UseCase({
    name: "is admin",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: async (interaction) => {
        const adminRoleSid = await getAdminRoleSid(interaction.guild.id)
        if (adminRoleSid === null) return "The admin role for this server is not set!"

        if (interaction.member.roles.cache.find(role => role.id === adminRoleSid) !== undefined) return null
        return "You do not have the admin role for this server."
    }
})



async function editAdminRole(guildSid: string, adminRoleSid: string) {
    return await DjsTools.getPrismaClient().permissions.update({
        where: { guildSid: guildSid },
        data: { adminSid: adminRoleSid }
    })
}



const paramSetAdmin = [
    new DjsTools.CmdParamRole({
        required: true,
        name: "admin-role",
        description: "The new admin role."
    })
] as const
export const cmdSetAdmin = new DjsTools.CmdTemplateLeaf({
    id: "set-admin",
    description: "Sets the admin role for this server.",
    useScope: DjsTools.useScopeGuildOnly,
    parameters: paramSetAdmin,
    useCases: [DjsTools.caseServerOwner],

    async executeFunc(interaction, args) {
        await interaction.editReply(`Setting admin to ${Djs.inlineCode(args[0].name)}...`)

        const currentAdminRoleSid = await getAdminRoleSid(interaction.guild.id)
        if (currentAdminRoleSid === args[0].id) {
            await interaction.followUp("That role is already the admin role set for this server!")
            return
        }

        await editAdminRole(interaction.guild.id, args[0].id)

        await interaction.followUp("The admin role for this server has been set.")
    }
})