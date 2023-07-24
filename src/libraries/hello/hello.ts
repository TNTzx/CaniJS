import * as DjsTools from "djs-tools"



export const cmdHello = new DjsTools.CmdNormalInfo({
    commandName: "hello",
    genericName: "Hello",
    description: "Says hello! Dog!",
    permissions: [DjsTools.permServerOwner],
    executeFunc: async (interaction) => {
        await interaction.reply("Hellooo! :D")
    }
})