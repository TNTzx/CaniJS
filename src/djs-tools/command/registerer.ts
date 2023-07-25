import Djs from "discord.js"

import * as CmdPermissions from "../permissions"
import * as ParamParser from "./param_parser"



export interface GuildCommandInteraction extends Djs.ChatInputCommandInteraction {
    guild: typeof Djs.CommandInteraction.prototype.guild
    guildId: typeof Djs.CommandInteraction.prototype.guildId
    channel: typeof Djs.CommandInteraction.prototype.channel
}

export interface DMCommandInteraction
    extends Omit<Djs.ChatInputCommandInteraction, "guild" | "guildId" | "channel">
{}


export interface UseScope<IsGuildUsable extends boolean = boolean, IsDmsUsable extends boolean = boolean> {
    isGuildUsable: IsGuildUsable
    isDmsUsable: IsDmsUsable
}

export const useScopeAll: UseScope<true, true> = {isGuildUsable: true, isDmsUsable: true}
export const useScopeGuildOnly: UseScope<true, false> = {isGuildUsable: true, isDmsUsable: false}
export const useScopeDMsOnly: UseScope<false, true> = {isGuildUsable: false, isDmsUsable: true}

type UseScopeToInteractionMap<UseScopeT extends UseScope<boolean, boolean>> = (
    UseScopeT extends UseScope<true, true>
    ? Djs.ChatInputCommandInteraction

    : UseScopeT extends UseScope<true, false>
    ? GuildCommandInteraction

    : UseScopeT extends UseScope<false, true>
    ? DMCommandInteraction

    : Djs.ChatInputCommandInteraction | GuildCommandInteraction | DMCommandInteraction
)

type ExecuteFunc<UseScopeT extends UseScope> = (interaction: UseScopeToInteractionMap<UseScopeT>) => Promise<void>


type ParamStorage = readonly ParamParser.CmdParameter<boolean, ParamParser.ChoiceArrayGeneral<unknown>>[]


interface CommandInfo {
    commandName: string
    genericName: string
    description: string
}


export class CmdFunctionalInfo<
    Builder extends Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder,
    UseScopeT extends UseScope
> {
    public commandInfo: CommandInfo
    public parameters: ParamStorage
    public permissions: CmdPermissions.CmdPermission[]
    public executeFunc: ExecuteFunc<UseScopeT>

    constructor(
        {
            commandInfo,
            parameters = [],
            permissions = [],
            executeFunc
        }: {
            commandInfo: CommandInfo
            parameters?: ParamStorage
            permissions?: CmdPermissions.CmdPermission[]
            executeFunc: ExecuteFunc<UseScopeT>
        }
    ) {
        this.commandInfo = commandInfo
        this.parameters = parameters
        this.permissions = permissions
        this.executeFunc = executeFunc
    }


    public setupBuilder(builder: Builder) {
        builder
            .setName(this.commandInfo.commandName)
            .setDescription(this.commandInfo.description)


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

export class CmdNormalInfo<UseScopeT extends UseScope> extends CmdFunctionalInfo<Djs.SlashCommandBuilder, UseScopeT> implements HasEntry {
    public useScope: UseScopeT

    constructor(
        {
            commandInfo, parameters = [],
            useScope, permissions = [],
            executeFunc
        }: {
            commandInfo: CommandInfo
            parameters?: ParamStorage
            useScope: UseScopeT
            permissions?: CmdPermissions.CmdPermission[]
            executeFunc: ExecuteFunc<UseScopeT>
        }
    ) {
        super({commandInfo, parameters, permissions, executeFunc})
        this.useScope = useScope
    }
    public createBuilder(): Djs.SlashCommandBuilder {
        return this.setupBuilder(new Djs.SlashCommandBuilder())
    }
}





interface Parent<UseScopeT extends UseScope = UseScope> {
    useScope: UseScopeT
}

type inferParentUseScope<ParentT extends Parent> = ParentT extends Parent<infer UseScopeT> ? UseScopeT : never

interface Child<ParentT extends Parent> {
    useScope: inferParentUseScope<ParentT>
    parent: ParentT
}


export class ChildContainer<
    ChildT extends Child<Parent>
> {
    private collection: Map<string, ChildT>

    constructor() {
        this.collection = new Map()
    }

    public getFromName(name: string | null) {
        if (name === null) return undefined
        return this.collection.get(name)
    }

    public addItem(child: ChildT) {
        this.collection.set(cmdInfo.commandName, cmdInfo)
    }
}



export class CmdSubInfo<ParentT extends Parent>
    extends CmdFunctionalInfo<Djs.SlashCommandSubcommandBuilder, inferParentUseScope<ParentT>>
    implements Child<ParentT>
{
    public useScope: inferParentUseScope<ParentT>
    public parent: ParentT

    constructor(
        {
            parent,
            commandInfo,
            parameters = [],
            permissions = [],
            executeFunc
        }: {
            parent: ParentT
            commandInfo: CommandInfo
            parameters?: ParamStorage
            permissions?: CmdPermissions.CmdPermission[]
            executeFunc: ExecuteFunc<inferParentUseScope<ParentT>>
        }
    ) {
        super({commandInfo, parameters, permissions, executeFunc})
        this.parent = parent
        this.parent.addCmdSubInfo(this)
    }
}



export class CmdSubGroupInfo<Parent extends ParentType<UseScopeT>, UseScopeT extends UseScope = inferParentUseScope<Parent>> extends SubContainer<UseScopeT> implements Child<Parent, UseScopeT> {
    public parent: Parent
    public commandInfo: CommandInfo
    public permissions: CmdPermissions.CmdPermission[]

    constructor(
        {parent, commandInfo, permissions = []}: {
            parent: Parent
            commandInfo: CommandInfo
            permissions?: CmdPermissions.CmdPermission[]
        }
    ) {
        super()
        this.parent = parent
        this.parent.addCmdSubGroupInfo(this)

        this.commandInfo = commandInfo
        this.permissions = permissions
    }


    public setupBuilder(builder: Djs.SlashCommandSubcommandGroupBuilder) {
        builder
            .setName(this.commandInfo.commandName)
            .setDescription(this.commandInfo.description)

        for (const cmdSubInfos of this.cmdSubInfoColl.cmdInfos) {
            builder.addSubcommand(cmdSubInfos.setupBuilder.bind(cmdSubInfos))
        }

        return builder
    }
}

export class CmdParentInfo<UseScopeT extends UseScope> extends SubContainer<UseScopeT> implements HasEntry {
    public commandInfo: CommandInfo
    public useScope: UseScopeT
    public permissions: CmdPermissions.CmdPermission[]

    constructor(
        {
            commandInfo,
            useScope, permissions = []
        }: {
            commandInfo: CommandInfo
            useScope: UseScopeT
            permissions?: CmdPermissions.CmdPermission[]
        }
    ) {
        super()
        this.commandInfo = commandInfo
        this.cmdSubInfoColl = new CmdSubsCollection([])
        this.cmdSubGroupInfoColl = new CmdSubsCollection([])
        this.useScope = useScope
        this.permissions = permissions
    }

    public createBuilder() {
        const builder = new Djs.SlashCommandBuilder()
            .setName(this.commandInfo.commandName)
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


export type CmdWithEntry = CmdNormalInfo<UseScope> | CmdParentInfo<UseScope>
export type CmdInfoAll =
    CmdNormalInfo<UseScope>
    | CmdSubInfo<ParentType<UseScope>, UseScope>
    | CmdSubGroupInfo<ParentType<UseScope>, UseScope>
    | CmdParentInfo<UseScope>




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