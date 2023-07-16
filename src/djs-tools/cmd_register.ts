import Djs from "discord.js"

import * as CmdPermissions from "./permissions"



export class CmdParameter {
    public name: string
    public description: string
    public autocomplete: boolean
    public required: boolean

    constructor(
        {name, description, autocomplete = false, required = false}: {
            name: string,
            description: string,
            autocomplete?: boolean,
            required?: boolean
        }
    ) {
        this.name = name
        this.description = description
        this.autocomplete = autocomplete
        this.required = required
    }


    public toGetterArgs(): [string, boolean] {
        return [this.name, this.required]
    }

}

export class CmdParamString extends CmdParameter {}


export class CmdInfo {
    public name: string
    public description: string
    public permissions: CmdPermissions.CmdPermission[]
    public parameters: CmdParameter[]

    constructor(
        {name, description, permissions = [], parameters = []}: {
            name: string
            description: string
            permissions: CmdPermissions.CmdPermission[]
            parameters: CmdParameter[]
        }
    ) {
        this.name = name
        this.description = description
        this.permissions = permissions
        this.parameters = parameters
    }
}

export function cmdInfoToSlashCommandBuilder(cmdInfo: CmdInfo) {
    const scb = (new Djs.SlashCommandBuilder())
        .setName(cmdInfo.name)
        .setDescription(cmdInfo.description)

    for (const parameter of cmdInfo.parameters) {
        if (parameter instanceof CmdParamString) {
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



export class CmdBundle {
    constructor(
        public cmdInfo: CmdInfo,
        public execute: (interaction: Djs.ChatInputCommandInteraction) => Promise<void>)
    {}
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




