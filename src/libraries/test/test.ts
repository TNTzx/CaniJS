import * as Djs from "discord.js"
import * as DjsTools from "../../djs-tools"


const caseA = new DjsTools.UseCase({
    name: "Has 'a' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: (interaction) => {
        if (!interaction.member.displayName.includes("a"))
            return "You don't have an 'a' in your nickname!"
        return null
    }
})

const caseB = new DjsTools.UseCase({
    name: "Has 'b' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: (interaction) => {
        if (!interaction.member.displayName.includes("b"))
            return "You don't have a 'b' in your nickname!"
        return null
    }
})

const caseC = new DjsTools.UseCase({
    name: "Has 'c' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: (interaction) => {
        if (!interaction.member.displayName.includes("c"))
            return "You don't have a 'c' in your nickname!"
        return null
    }
})



export const cmdTest = new DjsTools.CmdTemplateLeaf({
    id: "test",
    description: "Test command!",
    useScope: DjsTools.useScopeGuildOnly,
    useCases: [DjsTools.caseServerOwner],

    executeFunc: async (interaction) => {
        await interaction.editReply("win")
    }
})

async function commandTest(interaction: Djs.ChatInputCommandInteraction) {
    await interaction.editReply("test success")
}


const dummyOptions = [
    DjsTools.createParameter(
        DjsTools.ParamEnum.string, false,
        "parameter", "Parameter!"
    )
] as const


export const cmdTestA = new DjsTools.CmdTemplateGroup({
    id: "a",
    description: "a",
    useScope: DjsTools.useScopeGuildOnly,
    useCases: [caseA]
})

export const cmdTestAA = cmdTestA.addSubTemplateLeaf({
    id: "aa",
    description: "aa",
    executeFunc: commandTest
})

export const cmdTestAB = cmdTestA.addSubTemplateGroup({
    id: "ab",
    description: "ab",
    useCases: [caseB]
})

export const cmdTestABA = cmdTestAB.addSubTemplateLeaf({
    id: "aba",
    description: "aba",
    executeFunc: commandTest
})

export const cmdTestABB = cmdTestAB.addSubTemplateGroup({
    id: "abb",
    description: "abb",
    useCases: [caseC],
})

export const cmdTestABBA = cmdTestABB.addSubTemplateLeaf({
    id: "abba",
    description: "abba",
    parameters: dummyOptions,
    executeFunc: commandTest
})

export default [
    cmdTest,
    cmdTestA
]