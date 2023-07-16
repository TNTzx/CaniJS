import Djs from "discord.js"

import * as CmdPermissions from "../permissions"



export class CmdParameter {
    public name: string
    public description: string
    public required: boolean
    // TODO choices
    // TODO validation

    constructor(
        {name, description, required = true}: {
            name: string,
            description: string,
            required?: boolean
        }
    ) {
        this.name = name
        this.description = description
        this.required = required
    }


    public toGetterArgs(): [string, boolean] {
        return [this.name, this.required]
    }

}

export class CmdParamString extends CmdParameter {
}
export class CmdParamInteger extends CmdParameter {
}
export class CmdParamNumber extends CmdParameter {
}
export class CmdParamBoolean extends CmdParameter {
}

export class CmdParamMentionable extends CmdParameter {
}
export class CmdParamChannel extends CmdParameter {
}
export class CmdParamRole extends CmdParameter {
}
export class CmdParamUser extends CmdParameter {
}

export class CmdParamAttachment extends CmdParameter {
}



export class CmdInfo {
    public name: string
    public description: string
    public permissions: CmdPermissions.CmdPermission[]
    public parameters: CmdParameter[]

    constructor(
        {name, description, permissions = [], parameters = []}: {
            name: string
            description: string
            permissions?: CmdPermissions.CmdPermission[]
            parameters?: CmdParameter[]
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


    function getSetupOptionFunc<T extends Djs.ApplicationCommandOptionBase>(parameter: CmdParameter) {
        return (option: T) => option
            .setName(parameter.name)
            .setDescription(parameter.description)
            .setRequired(parameter.required)
    }

    for (const parameter of cmdInfo.parameters) {
        if (parameter instanceof CmdParamString) {
            scb.addStringOption(getSetupOptionFunc<Djs.SlashCommandStringOption>(parameter))
        } 
        else if (parameter instanceof CmdParamInteger) {
            scb.addIntegerOption(getSetupOptionFunc<Djs.SlashCommandIntegerOption>(parameter))
        } 
        else if (parameter instanceof CmdParamNumber) {
            scb.addNumberOption(getSetupOptionFunc<Djs.SlashCommandNumberOption>(parameter))
        } 
        else if (parameter instanceof CmdParamBoolean) {
            scb.addBooleanOption(getSetupOptionFunc<Djs.SlashCommandBooleanOption>(parameter))
        } 
        else if (parameter instanceof CmdParamMentionable) {
            scb.addMentionableOption(getSetupOptionFunc<Djs.SlashCommandMentionableOption>(parameter))
        } 
        else if (parameter instanceof CmdParamChannel) {
            scb.addChannelOption(getSetupOptionFunc<Djs.SlashCommandChannelOption>(parameter))
        } 
        else if (parameter instanceof CmdParamRole) {
            scb.addRoleOption(getSetupOptionFunc<Djs.SlashCommandRoleOption>(parameter))
        } 
        else if (parameter instanceof CmdParamUser) {
            scb.addUserOption(getSetupOptionFunc<Djs.SlashCommandUserOption>(parameter))
        } 
        else if (parameter instanceof CmdParamAttachment) {
            scb.addAttachmentOption(getSetupOptionFunc<Djs.SlashCommandAttachmentOption>(parameter))
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




