import * as DjsTools from "djs-tools"

import * as Basic from "./basic"
import * as Moderation from "./moderation"

import Test from "./test/test"



const commandList = [
    Basic.cmdHello,
    Moderation.cmdSetAdmin
]

const commandListTest = [...commandList, ...Test]


export default () => {
    let allCommands
    if (DjsTools.getDevEnvStatus()) {
        allCommands = commandListTest
    } else {
        allCommands = commandList
    }

    DjsTools.registerAllCmdTemplates(allCommands)
}