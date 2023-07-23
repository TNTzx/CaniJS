import * as Djs from "discord.js"
import * as DjsTools from "../../djs-tools"



const cmdTestParams = [
    DjsTools.createParameter(
        DjsTools.ParamEnum.string, true,
        "test", "Very long description!!!",
    ).setLengthLimits(2, 10),
    DjsTools.createParameter(
        DjsTools.ParamEnum.integer, true,
        "test2", "WAWA"
    ).setSizeLimits(1, 10),
    DjsTools.createParameter(
        DjsTools.ParamEnum.number, true,
        "test3", "WAWA"
    ).setSizeLimits(10, 20)
] as const
export const cmdTest = new DjsTools.CmdNormalInfo({
    name: "test",
    description: "Test command!",
    permissions: [DjsTools.permServerOwner],
    parameters: cmdTestParams,

    executeFunc: async (interaction) => {
        const parameters = DjsTools.getParameterValues(interaction, cmdTestParams)
        await interaction.reply(parameters[0])
        await interaction.followUp((parameters[0] === "wa").toString())
    }
})

async function commandTest(interaction: Djs.ChatInputCommandInteraction) {
    await interaction.deferReply()
    await interaction.editReply("test success")
}

export const cmdTestSubUnderGroup = new DjsTools.CmdSubInfo({
    name: "subundergroup",
    description: "Subcommand under the group.",
    executeFunc: commandTest
})
export const cmdTestSubGroup = new DjsTools.CmdSubGroupInfo({
    name: "group",
    description: "Group.",
    cmdSubInfos: [cmdTestSubUnderGroup]
})
export const cmdTestSub = new DjsTools.CmdSubInfo({
    name: "sub",
    description: "Subcommand.",
    executeFunc: commandTest
})
export const cmdTestParent = new DjsTools.CmdParentInfo({
    name: "subundergroup",
    description: "Subcommand under the group.",
    cmdSubGroupInfos: [cmdTestSubGroup],
    cmdSubInfos: [cmdTestSub]
})

export default [
    cmdTest,
    cmdTestSubUnderGroup,
    cmdTestSubGroup,
    cmdTestSub,
    cmdTestParent
]