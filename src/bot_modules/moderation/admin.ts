import Djs from "discord.js"

import * as DjsTools from "djs-tools"



export class HErrorAdminRoleNotSet extends DjsTools.HandleableError {
    private __nominalHErrorAdminRoleNotSet() { }

    constructor(public guild: Djs.Guild, cause?: Error) {
        super(`The admin role for GuildSID ${guild.id} is not set.`, cause)
    }

    public override getDisplayMessage(): string {
        return "The admin role for this server is not set!"
    }
}

export class HErrorAdminRoleNotFound extends DjsTools.HandleableError {
    private __nominalHErrorAdminRoleNotSet() { }

    constructor(public supposedAdminRoleSid: string, public guild: Djs.Guild, cause?: Error) {
        super(`The admin role SID ${supposedAdminRoleSid} for GuildSID ${guild.id} is not found.`, cause)
    }

    public override getDisplayMessage(): string {
        return `The admin role for this server is not set to a valid role! Please set another admin role using ${cmdSetAdmin.getReferenceDisplay()}.`
    }
}

export class HErrorUserNotAdmin extends DjsTools.HandleableError {
    private __nominalHErrorUCNoAdminRole() { }

    constructor(public guild: Djs.Guild, public adminRole: Djs.Role, public member: Djs.GuildMember, cause?: Error) {
        super(`MemberSID ${member.id} doesn't have the admin role SID ${adminRole.id} in GuildSID ${guild.id}.`, cause)
    }

    public override getDisplayMessage(): string {
        return "You are not an admin of this server! You don't have the admin role!"
    }
}


async function getAdminRoleSid(guildSid: string) {
    const prismaBMAdmin = await DjsTools.getPrismaClient().bMAdmin.findUniqueOrThrow({
        where: { guildSid: guildSid }
    })

    return prismaBMAdmin.adminSid
}


export const caseIsAdmin = new DjsTools.UseCase({
    name: "is admin",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: async (interaction) => {
        const adminRoleSid = await getAdminRoleSid(interaction.guild.id)
        if (adminRoleSid === null) return new HErrorAdminRoleNotSet(interaction.guild)

        const adminRole = await interaction.guild.roles.fetch(adminRoleSid)
        if (adminRole === null) return new HErrorAdminRoleNotFound(adminRoleSid, interaction.guild)

        if (interaction.member.roles.cache.find(role => role.id === adminRole.id) !== undefined) return null
        return new HErrorUserNotAdmin(interaction.guild, adminRole, interaction.member)
    }
})



async function editAdminRole(guildSid: string, adminRoleSid: string) {
    return await DjsTools.getPrismaClient().bMAdmin.update({
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
        await interaction.followUp(`Setting admin to ${Djs.inlineCode(args[0].name)}...`)

        const currentAdminRoleSid = await getAdminRoleSid(interaction.guild.id)
        if (currentAdminRoleSid === args[0].id) {
            await interaction.followUp("That role is already the admin role set for this server!")
            return
        }

        await editAdminRole(interaction.guild.id, args[0].id)

        await interaction.followUp("The admin role for this server has been set.")
    }
})