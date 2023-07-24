import * as DjsTools from "djs-tools"


const paramSetAdmin = [
    DjsTools.createParameter(
        DjsTools.ParamEnum.role, true,
        "admin role", "The new admin role."
    )
] as const
export const cmdSetAdmin = new DjsTools.CmdNormalInfo({
    commandName: "setadmin",
    genericName: "Set Admin",
    description: "Sets the admin role for this server.",
    parameters: paramSetAdmin,
    async executeFunc(interaction) {
        const parameters = DjsTools.getParameterValues(interaction, paramSetAdmin)
        interaction.editReply(parameters[0].id)
    }
})