import Djs from 'discord.js'

import * as CmdPermissions from './permissions'



export interface CmdInfo {
    name: string,
    description: string,
    permissions?: CmdPermissions.CmdPermission[]
}

export function cmdInfoToSlashCommandBuilder(cmdInfo: CmdInfo) {
    return new Djs.SlashCommandBuilder()
        .setName(cmdInfo.name)
        .setDescription(cmdInfo.description)
}


export interface CmdBundle {
    cmdInfo: CmdInfo
    execute: (interaction: Djs.CommandInteraction) => Promise<void>
}


const registeredCmds: Djs.Collection<string, CmdBundle> = new Djs.Collection()
export function addCmd(cmdBundle: CmdBundle) {
    registeredCmds.set(cmdBundle.cmdInfo.name, cmdBundle)
    return cmdBundle
}
export function addAllCmds(cmdBundles: CmdBundle[]) {
    cmdBundles.forEach((cmdBundle) => {
        addCmd(cmdBundle)
    })
}
export function getRegisteredCmds() {
    return registeredCmds
}




