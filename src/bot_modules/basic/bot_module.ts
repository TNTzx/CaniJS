import * as DjsTools from "djs-tools"

import * as Hello from "./hello"



export const botModule = new DjsTools.BotModule({
    id: "basic",
    cmdTemplates: [
        Hello.cmdHello
    ]
})