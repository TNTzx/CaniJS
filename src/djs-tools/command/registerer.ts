import Djs from "discord.js"

import * as CmdPermissions from "../permissions"
import * as ParamParser from "./param_parser"



type ParamStorage = readonly ParamParser.CmdParameter<boolean, ParamParser.ChoiceArrayGeneral>[]

export class CmdInfo {
    public name: string
    public description: string
    public permissions: CmdPermissions.CmdPermission[]
    public parameters: ParamStorage

    constructor(
        {name, description, permissions = [], parameters = []}: {
            name: string
            description: string
            permissions?: CmdPermissions.CmdPermission[]
            parameters?: ParamStorage
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


    function getSetupOptionFunc<T extends Djs.ApplicationCommandOptionBase>(parameter: ParamParser.CmdParameter) {
        return (option: T) => {
            option
            .setName(parameter.name)
            .setDescription(parameter.description)
            .setRequired(parameter.required)

            if (parameter.choices !== undefined)
                (parameter as unknown as T extends Djs.ApplicationCommandOptionWithChoicesAndAutocompleteMixin<infer R> ? Djs.ApplicationCommandOptionWithChoicesAndAutocompleteMixin<R> : never)
                .addChoices(parameter.choices)

            return option
        }
    }

    for (const parameter of cmdInfo.parameters) {
        if (parameter instanceof ParamParser.CmdParamString) {
            scb.addStringOption(getSetupOptionFunc<Djs.SlashCommandStringOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamInteger) {
            scb.addIntegerOption(getSetupOptionFunc<Djs.SlashCommandIntegerOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamNumber) {
            scb.addNumberOption(getSetupOptionFunc<Djs.SlashCommandNumberOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamBoolean) {
            scb.addBooleanOption(getSetupOptionFunc<Djs.SlashCommandBooleanOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamMentionable) {
            scb.addMentionableOption(getSetupOptionFunc<Djs.SlashCommandMentionableOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamChannel) {
            scb.addChannelOption(getSetupOptionFunc<Djs.SlashCommandChannelOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamRole) {
            scb.addRoleOption(getSetupOptionFunc<Djs.SlashCommandRoleOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamUser) {
            scb.addUserOption(getSetupOptionFunc<Djs.SlashCommandUserOption>(parameter))
        } 
        else if (parameter instanceof ParamParser.CmdParamAttachment) {
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




