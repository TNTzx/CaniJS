import * as DjsTools from "djs-tools"

import * as Test from "./test"

import * as Basic from "./basic"
import * as Moderation from "./moderation"
import * as ChannelClaiming from "./claiming"


const botModules: DjsTools.BotModule[] = [
    Basic.botModule,
    Moderation.botModule,
    ChannelClaiming.botModule
]

export function loadAllModules() {
    for (const botModule of botModules) {
        DjsTools.addBotModule(botModule)
    }

    if (DjsTools.getDevEnvStatus()) {
        DjsTools.addBotModule(Test.botModule)
    }
}