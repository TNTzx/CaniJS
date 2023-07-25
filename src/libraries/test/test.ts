import * as Djs from "discord.js"
import * as DjsTools from "../../djs-tools"


const aPerm: DjsTools.CmdPermission = {
    name: "Has 'a' in nicknname",
    onRejectMessage: "You don't have an 'a' in your nickname!",
    checkGrant: (interaction) => {
        return (interaction.member as Djs.GuildMember).displayName.includes("a")
    }
}

const bPerm: DjsTools.CmdPermission = {
    name: "Has 'b' in nicknname",
    onRejectMessage: "You don't have a 'b' in your nickname!",
    checkGrant: (interaction) => {
        return (interaction.member as Djs.GuildMember).displayName.includes("b")
    }
}

const cPerm: DjsTools.CmdPermission = {
    name: "Has 'c' in nicknname",
    onRejectMessage: "You don't have a 'c' in your nickname!",
    checkGrant: (interaction) => {
        return (interaction.member as Djs.GuildMember).displayName.includes("c")
    }
}



export const cmdTest = new DjsTools.CmdNormalInfo({
    commandName: "test",
    genericName: "Test",
    description: "Test command!",

    useScope: DjsTools.useScopeAll,
    permissions: [DjsTools.permServerOwner],

    executeFunc: async (interaction) => {
        await interaction.editReply("win")
    }
})

async function commandTest(interaction: Djs.ChatInputCommandInteraction) {
    await interaction.editReply("test success")
}


export const cmdTestParent = new DjsTools.CmdParentInfo({
    commandName: "parent",
    genericName: "Parent",
    description: "Parent.",
    cmdSubGroupInfos: [cmdTestSubGroup],
    cmdSubInfos: [cmdTestSub],

    isGuildUsable: true as const,
    isDmsUsable: true as const,
    permissions: [aPerm]
})

export const cmdTestSub = new DjsTools.CmdSubInfo({
    commandName: "sub",
    genericName: "Subcommand",
    description: "Subcommand.",
    executeFunc: commandTest
})

export const cmdTestSubGroup = new DjsTools.CmdSubGroupInfo({
    commandName: "group",
    genericName: "Group",
    description: "Group.",
    cmdSubInfos: [cmdTestSubUnderGroup],
    permissions: [bPerm]
})

export const cmdTestSubUnderGroup = new DjsTools.CmdSubInfo({
    commandName: "subundergroup",
    genericName: "Subcommand Under Group",
    description: "Subcommand under the group.",
    permissions: [cPerm],
    executeFunc: commandTest
})

export default [
    cmdTest,
    cmdTestParent
]