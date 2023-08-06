import * as DjsTools from "djs-tools"

import Test from "./test"



export const botModule = new DjsTools.BotModule({
    id: "test",
    cmdTemplates: DjsTools.getDevEnvStatus() ? Test : []
})