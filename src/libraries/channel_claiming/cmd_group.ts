import * as DjsTools from "djs-tools"



export const cmdGroupChannelClaiming = new DjsTools.CmdTemplateGroup({
    id: "claim",
    description: "RP channel claiming commands.",
    useScope: DjsTools.useScopeGuildOnly
})