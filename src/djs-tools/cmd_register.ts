import Djs from 'discord.js'



export type CmdInfo = {
    data: Djs.SlashCommandBuilder,
    execute: (interaction: any) => Promise<void>
}

const registeredCmds: Djs.Collection<string, CmdInfo> = new Djs.Collection()
export function addCmd(cmdInfo: CmdInfo) {
    registeredCmds.set(cmdInfo.data.name, cmdInfo)
    return cmdInfo
}
export function addAllCmds(cmdInfos: CmdInfo[]) {
    cmdInfos.forEach((cmdInfo) => {
        addCmd(cmdInfo)
    })
}
export function getRegisteredCmds() {
    return registeredCmds
}




