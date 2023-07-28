import * as DjsTools from "djs-tools"


import * as ModuleChannelClaiming from "./channel_claiming"


const dbGuildSetuppers: DjsTools.DBGuildSetupper[] = [
    ModuleChannelClaiming.dbGuildSetupper
]

export default () => {
    for (const dbGuildSetupper of dbGuildSetuppers) {
        DjsTools.addDBGuildSetupper(dbGuildSetupper)
    }
}