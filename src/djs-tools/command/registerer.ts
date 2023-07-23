import Djs from "discord.js"

import * as CmdPermissions from "../permissions"
import * as ParamParser from "./param_parser"



type ParamStorage = readonly ParamParser.CmdParameter<boolean, ParamParser.ChoiceArrayGeneral<unknown>>[]
type ExecuteFunc = (interaction: Djs.ChatInputCommandInteraction) => Promise<void>

export class CmdFunctionalInfo<Builder extends Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder> {
    public name: string
    public description: string
    public permissions: CmdPermissions.CmdPermission[]
    public parameters: ParamStorage
    public executeFunc: ExecuteFunc

    constructor(
        {name, description, permissions = [], parameters = [], executeFunc}: {
            name: string
            description: string
            permissions?: CmdPermissions.CmdPermission[]
            parameters?: ParamStorage,
            executeFunc: ExecuteFunc
        }
    ) {
        this.name = name
        this.description = description
        this.permissions = permissions
        this.parameters = parameters
        this.executeFunc = executeFunc
    }


    public setupBuilder(builder: Builder) {
        builder
            .setName(this.name)
            .setDescription(this.description)


        function getSetupOptionFunc<T extends Djs.ApplicationCommandOptionBase>(parameter: ParamParser.CmdParameter<boolean, ParamParser.ChoiceArrayGeneral<string | number | undefined>>) {
            return (option: T) => {
                option
                .setName(parameter.name)
                .setDescription(parameter.description)
                .setRequired(parameter.required)

                if (parameter.choices !== undefined)
                    (option as unknown as T extends Djs.ApplicationCommandOptionWithChoicesAndAutocompleteMixin<infer R> ? Djs.ApplicationCommandOptionWithChoicesAndAutocompleteMixin<R> : never)
                    .addChoices(...(parameter.choices as NonNullable<ParamParser.ChoiceArrayGeneral<string | number>>))

                if (parameter instanceof ParamParser.CmdParamString) {
                    (option as unknown as Djs.SlashCommandStringOption)
                        .setMaxLength(parameter.max_chars)
                        .setMinLength(parameter.min_chars)
                } else if (parameter instanceof ParamParser.CmdParamInteger || parameter instanceof ParamParser.CmdParamNumber) {
                    if (parameter.max_value !== undefined) {
                        (option as unknown as Djs.ApplicationCommandNumericOptionMinMaxValueMixin)
                            .setMaxValue(parameter.max_value)
                    }
                    if (parameter.min_value !== undefined) {
                        (option as unknown as Djs.ApplicationCommandNumericOptionMinMaxValueMixin)
                            .setMinValue(parameter.min_value)
                    }
                }

                return option
            }
        }

        for (const parameter of this.parameters) {
            if (parameter instanceof ParamParser.CmdParamString) {
                builder.addStringOption(getSetupOptionFunc<Djs.SlashCommandStringOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamInteger) {
                builder.addIntegerOption(getSetupOptionFunc<Djs.SlashCommandIntegerOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamNumber) {
                builder.addNumberOption(getSetupOptionFunc<Djs.SlashCommandNumberOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamBoolean) {
                builder.addBooleanOption(getSetupOptionFunc<Djs.SlashCommandBooleanOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamMentionable) {
                builder.addMentionableOption(getSetupOptionFunc<Djs.SlashCommandMentionableOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamChannel) {
                builder.addChannelOption(getSetupOptionFunc<Djs.SlashCommandChannelOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamRole) {
                builder.addRoleOption(getSetupOptionFunc<Djs.SlashCommandRoleOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamUser) {
                builder.addUserOption(getSetupOptionFunc<Djs.SlashCommandUserOption>(parameter))
            }
            else if (parameter instanceof ParamParser.CmdParamAttachment) {
                builder.addAttachmentOption(getSetupOptionFunc<Djs.SlashCommandAttachmentOption>(parameter))
            }
        }

        return builder
    }
}

export class CmdNormalInfo extends CmdFunctionalInfo<Djs.SlashCommandBuilder> {
    public createBuilder(): Djs.SlashCommandBuilder {
        return this.setupBuilder(new Djs.SlashCommandBuilder())
    }
}

export class CmdSubInfo extends CmdFunctionalInfo<Djs.SlashCommandSubcommandBuilder> {
}


export class CmdFunctionalInfoCollection<
    CmdInfoType extends CmdFunctionalInfo<Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder>
> {
    private collection: Djs.Collection<string, CmdInfoType>

    constructor(readonly cmdFunctionalInfos: CmdInfoType[]) {
        this.collection = new Djs.Collection()
        for (const cmdFunctionalInfo of cmdFunctionalInfos) {
            this.collection.set(cmdFunctionalInfo.name, cmdFunctionalInfo)
        }
    }

    public getFromName(name: string) {
        return this.collection.get(name)
    }
}

export class CmdSubGroupInfo {
    public name: string
    public description: string
    public cmdSubInfos: CmdSubInfo[]

    constructor(
        {name, description, cmdSubInfos}: {
            name: string,
            description: string,
            cmdSubInfos: CmdSubInfo[]
        }
    ) {
        this.name = name
        this.description = description
        this.cmdSubInfos = cmdSubInfos
    }


    public setupBuilder(builder: Djs.SlashCommandSubcommandGroupBuilder) {
        builder
            .setName(this.name)
            .setDescription(this.description)

        for (const cmdSubInfos of this.cmdSubInfos) {
            builder.addSubcommand(cmdSubInfos.setupBuilder.bind(cmdSubInfos))
        }

        return builder
    }
}

export class CmdParentInfo {
    public name: string
    public description: string
    public cmdSubInfos: CmdSubInfo[]
    public cmdSubGroupInfos: CmdSubGroupInfo[]

    constructor(
        {name, description, cmdSubInfos = [], cmdSubGroupInfos = []}: {
            name: string
            description: string
            cmdSubInfos?: CmdSubInfo[]
            cmdSubGroupInfos?: CmdSubGroupInfo[]
        }
    ) {
        this.name = name
        this.description = description
        this.cmdSubInfos = cmdSubInfos
        this.cmdSubGroupInfos = cmdSubGroupInfos
    }

    public createBuilder() {
        const builder = new Djs.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        for (const cmdSubInfo of this.cmdSubInfos) {
            builder.addSubcommand(cmdSubInfo.setupBuilder.bind(cmdSubInfo))
        }

        for (const cmdSubGroupInfo of this.cmdSubGroupInfos) {
            builder.addSubcommandGroup(cmdSubGroupInfo.setupBuilder.bind(cmdSubGroupInfo))
        }
    }
}


export type CmdWithEntry = CmdNormalInfo | CmdParentInfo
export type CmdInfoAll = CmdNormalInfo | CmdSubInfo | CmdSubGroupInfo | CmdParentInfo




const registeredCmds: Djs.Collection<string, CmdWithEntry> = new Djs.Collection()
export function addCmd(cmdWithEntry: CmdWithEntry) {
    registeredCmds.set(cmdWithEntry.name, cmdWithEntry)
    return cmdWithEntry
}
export function addAllCmds(cmdsWithEntry: CmdWithEntry[]) {
    for (const cmdWithEntry of cmdsWithEntry) {
        addCmd(cmdWithEntry)
    }
}
export function getRegisteredCmds() {
    return registeredCmds
}