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



export const cmdTest = new DjsTools.CmdTemplateLeaf({
    id: "test",
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


export const cmdTestA = new DjsTools.CmdTemplateGroup({
    id: "a",
    description: "a",
    useScope: DjsTools.useScopeAll,
    permissions: [aPerm]
})

export const cmdTestAA = cmdTestA.addSubTemplateLeaf({
    id: "aa",
    description: "aa",
    executeFunc: commandTest
})

export const cmdTestAB = cmdTestA.addSubTemplateGroup({
    id: "ab",
    description: "ab",
    permissions: [bPerm]
})

export const cmdTestABA = cmdTestAB.addSubTemplateLeaf({
    id: "aba",
    description: "aba",
    executeFunc: commandTest
})

export const cmdTestABB = cmdTestAB.addSubTemplateGroup({
    id: "abb",
    description: "abb",
    permissions: [cPerm],
})

export const cmdTestABBA = cmdTestABB.addSubTemplateLeaf({
    id: "abba",
    description: "abba",
    executeFunc: commandTest
})

export default [
    cmdTest,
    cmdTestA
]