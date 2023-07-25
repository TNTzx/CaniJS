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


interface CommandInfo {
    cmdName: unknown
    cmdDesc: unknown
    helpName: unknown
    helpDesc: unknown
}



class CmdTemplateNormal {
    public commandInfo: CommandInfo
    public parameters: ParamParser.CmdParameter[]
    public useScope: UseScope
    public permissions: CmdPermissions.CmdPermission[]
    public executeFunc: ExecuteFunc<UseScope>

    constructor(
        {
            commandInfo, parameters = [],
            useScope, permissions = [],
            executeFunc,
        }: {
            commandInfo: CmdTemplateNormal["commandInfo"]
            parameters?: CmdTemplateNormal["parameters"]
            useScope: CmdTemplateNormal["useScope"]
            permissions?: CmdTemplateNormal["permissions"]
            executeFunc: CmdTemplateNormal["executeFunc"]
        }
    ) {
        this.commandInfo = commandInfo
        this.parameters = parameters
        this.useScope = useScope
        this.permissions = permissions
        this.executeFunc = executeFunc
    }
}


class CmdTempSubs {
    public map: Map<string, unknown>

    constructor() {
        this.map = new Map()
    }
}

class CmdTempSubsContainer {
    public subgroups: CmdTempSubs
    public subs: CmdTempSubs

    constructor() {
        this.subgroups = new CmdTempSubs()
        this.subs = new CmdTempSubs
    }
}

class CmdTemplateParent {
    public commandInfo: CommandInfo
    public useScope: UseScope
    public permissions: CmdPermissions.CmdPermission[]
    public subsContainer: CmdTempSubsContainer

    constructor(
        {commandInfo, useScope, permissions}: {
            commandInfo: CmdTemplateParent["commandInfo"]
            useScope: CmdTemplateParent["useScope"]
            permissions: CmdTemplateParent["permissions"]
        }
    ) {
        this.commandInfo = commandInfo
        this.useScope = useScope
        this.permissions = permissions
        this.subsContainer = new CmdTempSubsContainer()
    }
}

class CmdTemplateSubgroup {
    public commandInfo: CommandInfo
    public permissions: CmdPermissions.CmdPermission[]
    public subsContainer: CmdTempSubsContainer

    constructor(
        {commandInfo, permissions}: {
            commandInfo: CmdTemplateSubgroup["commandInfo"]
            permissions: CmdTemplateSubgroup["permissions"]
        }
    ) {
        this.commandInfo = commandInfo
        this.permissions = permissions
        this.subsContainer = new CmdTempSubsContainer()
    }
}

class CmdTemplateSub {
    public commandInfo: CommandInfo
    public parameters: ParamParser.CmdParameter[]
    public permissions: CmdPermissions.CmdPermission[]
    public executeFunc: ExecuteFunc<UseScope>

    constructor(
        {
            commandInfo, parameters = [],
            permissions = [],
            executeFunc,
        }: {
            commandInfo: CmdTemplateNormal["commandInfo"]
            parameters?: CmdTemplateNormal["parameters"]
            permissions?: CmdTemplateNormal["permissions"]
            executeFunc: CmdTemplateNormal["executeFunc"]
        }
    ) {
        this.commandInfo = commandInfo
        this.parameters = parameters
        this.permissions = permissions
        this.executeFunc = executeFunc
    }
}