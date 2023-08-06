import * as DjsTools from "djs-tools"

import * as Test from "./test"

import * as Basic from "./basic"
import * as Moderation from "./moderation"
import * as ChannelClaiming from "./channel_claiming"


const botModules: DjsTools.BotModule[] = [
    Test.botModule,
    Basic.botModule,
    Moderation.botModule,
    ChannelClaiming.botModule
]

export function loadAllModules() {
    for (const botModule of botModules) {
        DjsTools.addBotModule(botModule)
    }
}