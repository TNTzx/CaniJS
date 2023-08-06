import * as Djs from "discord.js"
import * as DjsTools from "../../djs-tools"

import * as Admin from "../moderation"



// Normal commands

export const cmdTestNormal = new DjsTools.CmdTemplateLeaf({
    id: "test",
    description: "Test command!",
    useScope: DjsTools.useScopeGuildOnly,
    useCases: [Admin.caseIsAdmin],

    async executeFunc(interaction, _args) {
        await interaction.editReply("win")
    }
})



// Parameter commands

const paramTestParam = [
    new DjsTools.CmdParamString({
        required: true,
        name: "string",
        description: "String"
    }),
    new DjsTools.CmdParamString({
        required: true,
        name: "string-choices",
        description: "String choices",
        choiceManager: new DjsTools.ChoiceManager([
            DjsTools.createGenericChoice("choice1"),
            { name: "choice2_differentvalue", value: "choice2___" }
        ] as const)
    }),
    new DjsTools.CmdParamInteger({
        required: true,
        name: "integer",
        description: "Integer"
    }),
    new DjsTools.CmdParamInteger({
        required: true,
        name: "integer-choices",
        description: "Integer choices",
        choiceManager: new DjsTools.ChoiceManager([
            DjsTools.createGenericChoice(1),
            { name: "choice2_differentvalue", value: 2 }
        ] as const)
    }),
    new DjsTools.CmdParamNumber({
        required: true,
        name: "number",
        description: "Number"
    }),
    new DjsTools.CmdParamNumber({
        required: true,
        name: "number-choices",
        description: "Number choices",
        choiceManager: new DjsTools.ChoiceManager([
            DjsTools.createGenericChoice(1.11),
            { name: "choice2_differentvalue", value: 2.22 }
        ] as const)
    }),
    new DjsTools.CmdParamNumber({
        required: true,
        name: "boolean",
        description: "Boolean"
    }),
    new DjsTools.CmdParamMentionable({
        required: true,
        name: "mentionable",
        description: "Mentionable"
    }),
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel",
        description: "Channel"
    }),
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel-restrict",
        description: "Restricted Channel",
        validChannelTypes: [DjsTools.ChannelRestrict.Text]
    }),
    new DjsTools.CmdParamRole({
        required: true,
        name: "role",
        description: "Role"
    }),
    new DjsTools.CmdParamUser({
        required: true,
        name: "user",
        description: "User"
    }),
    new DjsTools.CmdParamAttachment({
        required: true,
        name: "attachment",
        description: "Attachment"
    }),
    new DjsTools.CmdParamString({
        required: false,
        name: "optional",
        description: "Optional test"
    }),
] as const
const cmdTestParam = new DjsTools.CmdTemplateLeaf({
    id: "param-test",
    description: "Test parameters.",
    parameters: paramTestParam,
    useScope: DjsTools.useScopeGuildOnly,

    async executeFunc(interaction, args) {
        const results: string[] = []
        for (const arg of args) {
            if (arg === null) {
                results.push("null")
                continue
            }
            results.push(arg.toString())
        }

        await interaction.editReply(results.join("\n"))
    }
})


// Case tests + Subcommands and Subcommand Groups

const caseB = new DjsTools.UseCase({
    name: "Has 'b' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: async (interaction) => {
        if (!interaction.member.displayName.includes("b"))
            return "You don't have a 'b' in your nickname!"
        return null
    }
})

const caseA = new DjsTools.UseCase({
    name: "Has 'a' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    initialUseCases: [caseB],
    conditionFunc: async (interaction) => {
        if (!interaction.member.displayName.includes("a"))
            return "You don't have an 'a' in your nickname!"
        return null
    }
})

const caseC = new DjsTools.UseCase({
    name: "Has 'c' in nickname",
    useScope: DjsTools.useScopeGuildOnly,
    conditionFunc: async (interaction) => {
        if (!interaction.member.displayName.includes("c"))
            return "You don't have a 'c' in your nickname!"
        return null
    }
})


async function genericExecute(interaction: Djs.ChatInputCommandInteraction) {
    await interaction.editReply("test success")
}

export const cmdTestGroupA = new DjsTools.CmdTemplateGroup({
    id: "group-a",
    description: "a",
    useScope: DjsTools.useScopeGuildOnly,
    useCases: [caseA]
})

export const cmdTestGroupAA = cmdTestGroupA.addSubTemplateLeaf({
    id: "group-aa",
    description: "aa",
    executeFunc: genericExecute
})

export const cmdTestGroupAB = cmdTestGroupA.addSubTemplateGroup({
    id: "group-ab",
    description: "ab"
})

export const cmdTestGroupABA = cmdTestGroupAB.addSubTemplateLeaf({
    id: "group-aba",
    description: "aba",
    executeFunc: genericExecute
})

export const cmdTestGroupABB = cmdTestGroupAB.addSubTemplateGroup({
    id: "group-abb",
    description: "abb",
    useCases: [caseC],
})

export const cmdTestGroupABBA = cmdTestGroupABB.addSubTemplateLeaf({
    id: "group-abba",
    description: "abba",
    executeFunc: genericExecute
})




export default [
    cmdTestNormal,
    cmdTestGroupA,
    cmdTestParam
]