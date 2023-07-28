import * as DjsTools from "djs-tools"

import * as Basic from "./basic"
import * as Moderation from "./moderation"

import Test from "./test/test"



let commandList: DjsTools.CmdTemplateType[] = [
    Basic.cmdHello,
    Moderation.cmdSetAdmin
]


if (DjsTools.getDevEnvStatus()) {
    import("./test/test").then((Test) => {
        const commandListTests = Test.default
        commandList = commandList.concat(commandListTests)
    }).catch(() => {})
}


export default () => {
    let fullCommandList: DjsTools.CmdTemplateType[]
    if (DjsTools.getDevEnvStatus()) {
        fullCommandList = commandList.concat(Test)
    } else {
        fullCommandList = commandList
    }

    DjsTools.registerAllCmdTemplates(fullCommandList)
}