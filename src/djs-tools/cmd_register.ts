import Djs from "discord.js"

import * as CmdPermissions from "./permissions"



export class CmdParameter {
    name: string
    description: string
    autocomplete: boolean
    required: boolean

    constructor(name: string, description: string, autocomplete: boolean = false, required: boolean = true) {
        this.name = name
        this.description = description
        this.autocomplete = autocomplete
        this.required = required
    }

}

export class CmdParamString extends CmdParameter {}


export interface CmdInfo {
    name: string,
    description: string,
    permissions?: CmdPermissions.CmdPermission[],
    parameters?: CmdParameter[]
}

export function cmdInfoToSlashCommandBuilder(cmdInfo: CmdInfo) {
    const scb = (new Djs.SlashCommandBuilder())
        .setName(cmdInfo.name)
        .setDescription(cmdInfo.description)

    if (cmdInfo.parameters !== undefined) {
        for (const parameter of cmdInfo.parameters) {
            if (parameter instanceof CmdParamString)
                scb.addStringOption(option =>
                    option.setName(parameter.name)
                        .setDescription(parameter.description)
                        .setAutocomplete(parameter.autocomplete)
                        .setRequired(parameter.required)
                )
        }
    }

    return scb
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




