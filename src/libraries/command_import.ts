import * as DjsTools from '../djs-tools'

import * as Hello from './hello/hello'

import Test from './test/test'



let commandList = [
    Hello.cmdHello
]


if (DjsTools.getDevEnvStatus()) {
    import('./test/test').then((Test) => {
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