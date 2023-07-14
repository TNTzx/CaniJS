import * as DjsTools from '../djs-tools'

import * as Hello from './hello/hello'



let commandList = [
    Hello.cmdHello
]


if (DjsTools.getDevEnvStatus()) {
    import('./test/test').then((Test) => {
        const commandListTests = Test.default
        commandList = commandList.concat(commandListTests)
    }).catch(() => {})
}


export default commandList