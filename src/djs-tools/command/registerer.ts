import Djs from "discord.js"

import * as CmdPermissions from "../permissions"
import * as ParamParser from "./param_parser"



type ParamStorage = readonly ParamParser.CmdParameter<boolean, ParamParser.ChoiceArrayGeneral<unknown>>[]


export interface GuildCommandInteraction extends Djs.ChatInputCommandInteraction {
    guild: typeof Djs.CommandInteraction.prototype.guild
    guildId: typeof Djs.CommandInteraction.prototype.guildId
    channel: typeof Djs.CommandInteraction.prototype.channel
}

export interface DMCommandInteraction
    extends Omit<Djs.ChatInputCommandInteraction, "guild" | "guildId" | "channel">
{}

type UsabilityToInteractionMap<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> = (
    IsGuildUsable extends true
    ? (IsDmsUsable extends true ? Djs.ChatInputCommandInteraction : GuildCommandInteraction)
    : (IsDmsUsable extends true ? DMCommandInteraction : never)
)

type ExecuteFunc<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> = (interaction: UsabilityToInteractionMap<IsGuildUsable, IsDmsUsable>) => Promise<void>



export class CmdFunctionalInfo<
    Builder extends Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder,
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> {
    public commandName: string
    public genericName: string
    public description: string
    public parameters: ParamStorage
    public isGuildUsable: IsGuildUsable
    public isDmsUsable: IsDmsUsable
    public permissions: CmdPermissions.CmdPermission[]
    public executeFunc: ExecuteFunc<IsGuildUsable, IsDmsUsable>

    constructor(
        {
            commandName, genericName, description, parameters = [],
            isGuildUsable, isDmsUsable, permissions = [],
            executeFunc
        }: {
            commandName: string
            genericName: string
            description: string
            parameters?: ParamStorage
            isGuildUsable: IsGuildUsable
            isDmsUsable: IsDmsUsable
            permissions?: CmdPermissions.CmdPermission[]
            executeFunc: ExecuteFunc<IsGuildUsable, IsDmsUsable>
        }
    ) {
        this.commandName = commandName
        this.genericName = genericName
        this.description = description
        this.parameters = parameters
        this.isGuildUsable = isGuildUsable
        this.isDmsUsable = isDmsUsable
        this.permissions = permissions
        this.executeFunc = executeFunc
    }


    public setupBuilder(builder: Builder) {
        builder
            .setName(this.commandName)
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


interface HasEntry {
    createBuilder: () => Djs.SlashCommandBuilder
}

export class CmdNormalInfo<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> extends CmdFunctionalInfo<Djs.SlashCommandBuilder, IsGuildUsable, IsDmsUsable> implements HasEntry {
    public createBuilder(): Djs.SlashCommandBuilder {
        return this.setupBuilder(new Djs.SlashCommandBuilder())
    }
}

export class CmdSubInfo<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> extends CmdFunctionalInfo<Djs.SlashCommandSubcommandBuilder, IsGuildUsable, IsDmsUsable> {
}


export class CmdSubsCollection<
    CmdInfoType extends CmdSubInfo<boolean, boolean> | CmdSubGroupInfo<boolean, boolean>
> {
    private collection: Djs.Collection<string, CmdInfoType>

    constructor(readonly cmdInfos: CmdInfoType[]) {
        this.collection = new Djs.Collection()
        for (const cmdInfo of cmdInfos) {
            this.collection.set(cmdInfo.commandName, cmdInfo)
        }
    }

    public getFromName(name: string | null) {
        if (name === null) return undefined
        return this.collection.get(name)
    }
}

export class CmdSubGroupInfo<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> {
    public commandName: string
    public genericName: string
    public description: string
    public cmdSubInfoColl: CmdSubsCollection<CmdSubInfo<IsGuildUsable, IsDmsUsable>>
    public cmdSubGroupInfoColl: CmdSubsCollection<CmdSubGroupInfo<IsGuildUsable, IsDmsUsable>>
    public permissions: CmdPermissions.CmdPermission[]

    constructor(
        {commandName, genericName, description, cmdSubInfos, cmdSubGroupInfos = [], permissions = []}: {
            commandName: string,
            genericName: string,
            description: string,
            cmdSubInfos: CmdSubInfo<IsGuildUsable, IsDmsUsable>[]
            cmdSubGroupInfos?: CmdSubGroupInfo<IsGuildUsable, IsDmsUsable>[],
            permissions?: CmdPermissions.CmdPermission[]
        }
    ) {
        this.commandName = commandName
        this.genericName = genericName
        this.description = description
        this.cmdSubInfoColl = new CmdSubsCollection(cmdSubInfos)
        this.cmdSubGroupInfoColl = new CmdSubsCollection(cmdSubGroupInfos)
        this.permissions = permissions
    }


    public setupBuilder(builder: Djs.SlashCommandSubcommandGroupBuilder) {
        builder
            .setName(this.commandName)
            .setDescription(this.description)

        for (const cmdSubInfos of this.cmdSubInfoColl.cmdInfos) {
            builder.addSubcommand(cmdSubInfos.setupBuilder.bind(cmdSubInfos))
        }

        return builder
    }
}

export class CmdParentInfo<
    IsGuildUsable extends boolean,
    IsDmsUsable extends boolean
> implements HasEntry {
    public commandName: string
    public genericName: string
    public description: string
    public cmdSubInfoColl: CmdSubsCollection<CmdSubInfo<IsGuildUsable, IsDmsUsable>>
    public cmdSubGroupInfoColl: CmdSubsCollection<CmdSubGroupInfo<IsGuildUsable, IsDmsUsable>>
    public isGuildUsable: IsGuildUsable
    public isDmsUsable: IsDmsUsable
    public permissions: CmdPermissions.CmdPermission[]

    constructor(
        {
            commandName, genericName, description,
            cmdSubInfos = [], cmdSubGroupInfos = [],
            isGuildUsable, isDmsUsable, permissions = []
        }: {
            commandName: string
            genericName: string
            description: string
            cmdSubInfos?: CmdSubInfo<IsGuildUsable, IsDmsUsable>[]
            cmdSubGroupInfos?: CmdSubGroupInfo<IsGuildUsable, IsDmsUsable>[]
            isGuildUsable: IsGuildUsable
            isDmsUsable: IsDmsUsable
            permissions?: CmdPermissions.CmdPermission[]
        }
    ) {
        this.commandName = commandName
        this.genericName = genericName
        this.description = description
        this.cmdSubInfoColl = new CmdSubsCollection(cmdSubInfos)
        this.cmdSubGroupInfoColl = new CmdSubsCollection(cmdSubGroupInfos)
        this.isGuildUsable = isGuildUsable
        this.isDmsUsable = isDmsUsable
        this.permissions = permissions
    }

    public createBuilder() {
        const builder = new Djs.SlashCommandBuilder()
            .setName(this.commandName)
            .setDescription(this.description)

        for (const cmdSubInfo of this.cmdSubInfoColl.cmdInfos) {
            builder.addSubcommand(cmdSubInfo.setupBuilder.bind(cmdSubInfo))
        }

        for (const cmdSubGroupInfo of this.cmdSubGroupInfoColl.cmdInfos) {
            builder.addSubcommandGroup(cmdSubGroupInfo.setupBuilder.bind(cmdSubGroupInfo))
        }

        return builder
    }
}


export type CmdWithEntry = CmdNormalInfo<boolean, boolean> | CmdParentInfo<boolean, boolean>
export type CmdInfoAll = CmdNormalInfo<boolean, boolean> | CmdSubInfo<boolean, boolean> | CmdSubGroupInfo<boolean, boolean> | CmdParentInfo<boolean, boolean>




const registeredCmds: Djs.Collection<string, CmdWithEntry> = new Djs.Collection()
export function addCmd(cmdWithEntry: CmdWithEntry) {
    registeredCmds.set(cmdWithEntry.genericName, cmdWithEntry)
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