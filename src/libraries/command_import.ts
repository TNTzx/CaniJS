import * as DjsTools from "djs-tools"

import * as Basic from "./basic"

import Test from "./test/test"



let commandList: DjsTools.CmdTemplateType[] = [
    Basic.cmdHello
]


if (DjsTools.getDevEnvStatus()) {
    import("./test/test").then((Test) => {
        const commandListTests = Test.default
        commandList = commandList.concat(commandListTests)
    }).catch(() => {})
}


export default () => {
    if (DjsTools.getDevEnvStatus()) {
        return commandList.concat(Test)
    }

    return commandList
}