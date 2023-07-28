import * as DjsTools from "djs-tools"



export const cmdHello = new DjsTools.CmdTemplateLeaf({
    id: "hello",
    description: "Says hello! Dog!",
    useScope: DjsTools.useScopeAll,
    executeFunc: async (interaction) => {
        await interaction.reply("Hellooo! :D")
    }
})