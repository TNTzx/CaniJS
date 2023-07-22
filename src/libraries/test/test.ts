import * as DjsTools from "../../djs-tools"



const cmdTestParams = [
    DjsTools.createParameter(
        DjsTools.ParamEnum.string, true,
        "test", "Very long description!!!",
        ["wa", "wawa"] as const
    )
] as const
export const cmdTest = new DjsTools.CmdBundle(
    new DjsTools.CmdInfo({
        name: "test",
        description: "Test command!",
        permissions: [DjsTools.permServerOwner],
        parameters: cmdTestParams
    }),

    async (interaction) => {
        const parameters = DjsTools.getParameterValues(interaction, cmdTestParams)
        await interaction.reply(parameters[0])
        await interaction.followUp((parameters[0] === "wa").toString())
    }
)

export default [
    cmdTest
]