import Djs from "discord.js"

import * as UseScope from "./use_scope"
import * as OtherTypes from "../other_types"



export type ChoiceOption<T extends string | number = string | number> = {name: string, value: T}
export type Choices<T extends string | number = string | number> = readonly ChoiceOption<T>[] | null

type IsRequiredMap<ValueTypeT, IsRequired extends boolean> = IsRequired extends true ? ValueTypeT : ValueTypeT | null

type Builder = Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder
type BuilderReturned = Djs.SlashCommandSubcommandBuilder | Omit<Djs.SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">



type CmdParameterArgs<
    IsRequired extends boolean,
> = {
    required: IsRequired,
    name: string,
    description: string
}
export abstract class CmdParameter<
    ValueTypeT = unknown,
    IsRequired extends boolean = boolean,
    BuilderOption extends Djs.ApplicationCommandOptionBase = Djs.ApplicationCommandOptionBase
> {
    public required: IsRequired
    public name: string
    public description: string

    constructor(args: CmdParameterArgs<IsRequired>) {
        this.required = args.required
        this.name = args.name
        this.description = args.description
    }


    public toGetValueArgs(): [string, boolean] {
        return [this.name, this.required]
    }

    protected abstract getValueFromInteractionOptions(interactionOptions: OtherTypes.ChatInputCommandInteractionOptions): ValueTypeT | null

    public async getValue(interactionOptions: OtherTypes.ChatInputCommandInteractionOptions): Promise<IsRequiredMap<ValueTypeT, IsRequired> | OtherTypes.AssertFailInfo> {
        const value = this.getValueFromInteractionOptions(interactionOptions)
        if (this.required && value === null) return new OtherTypes.AssertFailInfo("This argument is required.")

        if (value !== null) {
            const assertResult = await this.assertValue(value)
            if (assertResult !== null) return assertResult
        }

        return value as IsRequiredMap<ValueTypeT, IsRequired>
    }

    public async assertValue(_value: ValueTypeT): Promise<OtherTypes.AssertFailInfo | null> {
        return null
    }


    public setupBuilderOption(option: BuilderOption) {
        option
            .setName(this.name)
            .setDescription(this.description)
            .setRequired(this.required)

        return option
    }

    public abstract addOptionToBuilder(builder: Builder): BuilderReturned
}



interface HasChoices<ChoicesT extends Choices> {
    choices: ChoicesT
}



export class CmdParamString<
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices<string> = Choices<string>
> extends CmdParameter<string, IsRequired, Djs.SlashCommandStringOption>
implements HasChoices<ChoicesT>  {
    private __nominalString() {}

    public choices: ChoicesT

    constructor(args: CmdParameterArgs<IsRequired> & {choices?: ChoicesT}) {
        super(args)
        this.choices = args.choices ?? null as ChoicesT
    }

    public min_chars: number = 1
    public max_chars: number = 2000

    public setLengthLimits(min?: number, max?: number) {
        this.min_chars = min ?? this.min_chars
        this.max_chars = max ?? this.max_chars
        return this
    }

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getString(...this.toGetValueArgs())
    }


    public override setupBuilderOption(option: Djs.SlashCommandStringOption): Djs.SlashCommandStringOption {
        return super.setupBuilderOption(option)
            .setMaxLength(this.max_chars)
            .setMinLength(this.min_chars)
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addStringOption(this.setupBuilderOption.bind(this))
    }
}


interface ParamNumeric {
    min_value: number | null
    max_value: number | null
    setSizeLimits: (min: number | null, max: number | null) => this
}

function setSizeLimitsNumeric(paramNumeric: ParamNumeric, min: number | null, max: number | null) {
    paramNumeric.min_value = min
    paramNumeric.max_value = max
}

function setupBuilderOptionNumeric<
    BuilderOption extends Djs.SlashCommandIntegerOption | Djs.SlashCommandNumberOption
>(parameter: ParamNumeric, option: BuilderOption): BuilderOption {
    if (parameter.max_value !== null) option.setMaxValue(parameter.max_value)
    if (parameter.min_value !== null) option.setMinValue(parameter.min_value)

    return option
}

export class CmdParamInteger<
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices<number> = Choices<number>
> extends CmdParameter<number, IsRequired, Djs.SlashCommandIntegerOption> implements ParamNumeric, HasChoices<ChoicesT> {
    private __nominalInt() {}

    public choices: ChoicesT
    public min_value: number | null = null
    public max_value: number | null = null

    constructor(args: CmdParameterArgs<IsRequired> & {choices?: ChoicesT}) {
        super(args)
        this.choices = args.choices ?? null as ChoicesT
    }

    public setSizeLimits(min: number | null, max: number | null) {
        setSizeLimitsNumeric(this, min, max)
        return this
    }

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getInteger(...this.toGetValueArgs())
    }


    public override setupBuilderOption(option: Djs.SlashCommandIntegerOption): Djs.SlashCommandIntegerOption {
        return setupBuilderOptionNumeric(this, super.setupBuilderOption(option))
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addIntegerOption(this.setupBuilderOption.bind(this))
    }
}

export class CmdParamNumber<
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices<number> = Choices<number>
> extends CmdParameter<number, IsRequired, Djs.SlashCommandNumberOption> implements ParamNumeric, HasChoices<ChoicesT> {
    private __nominalNumber() {}

    public choices: ChoicesT
    public min_value: number | null = null
    public max_value: number | null = null

    constructor(args: CmdParameterArgs<IsRequired> & {choices?: ChoicesT}) {
        super(args)
        this.choices = args.choices ?? null as ChoicesT
    }

    public setSizeLimits(min: number | null, max: number | null) {
        this.min_value = min
        this.max_value = max
        return this
    }

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getNumber(...this.toGetValueArgs())
    }

    public override setupBuilderOption(option: Djs.SlashCommandNumberOption): Djs.SlashCommandNumberOption {
        return setupBuilderOptionNumeric(this, super.setupBuilderOption(option))
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addNumberOption(this.setupBuilderOption.bind(this))
    }
}

export class CmdParamBoolean<
    IsRequired extends boolean = boolean,
> extends CmdParameter<boolean, IsRequired, Djs.SlashCommandBooleanOption> {
    private __nominalBoolean() {}

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getBoolean(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addBooleanOption(this.setupBuilderOption.bind(this))
    }
}


export type CmdParamMentionableValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getMentionable"]>>
export class CmdParamMentionable<
    IsRequired extends boolean = boolean,
> extends CmdParameter<CmdParamMentionableValue, IsRequired, Djs.SlashCommandMentionableOption> {
    private __nominalMentionable() {}

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getMentionable(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addMentionableOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamChannelValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getChannel"]>>

export enum ChannelRestrict {
    Text = Djs.ChannelType.GuildText,
    DM = Djs.ChannelType.DM,
    Voice = Djs.ChannelType.GuildVoice,
    Category = Djs.ChannelType.GuildCategory,
    PublicThread = Djs.ChannelType.PublicThread,
    PrivateThread = Djs.ChannelType.PrivateThread,
    Stage = Djs.ChannelType.GuildStageVoice,
    Forum = Djs.ChannelType.GuildForum
}

type ChannelRestrictsMap<ValidChannelTypes extends ChannelRestrict[]> = (
    {[P in keyof ValidChannelTypes]: ChannelEnumToRestrictMap<ValidChannelTypes[P]>}[number]
)
type ChannelRestrictsOptionalMap<ValidChannelTypes extends ChannelRestrict[] | null> = (
    ValidChannelTypes extends ChannelRestrict[]
        ? ChannelRestrictsMap<ValidChannelTypes>
        : CmdParamChannelValue
)
type ChannelEnumToRestrictMap<ChannelType extends ChannelRestrict> = (
    ChannelType extends ChannelRestrict.Text ? Djs.TextChannel :
    ChannelType extends ChannelRestrict.DM ? Djs.DMChannel :
    ChannelType extends ChannelRestrict.Voice ? Djs.VoiceChannel :
    ChannelType extends ChannelRestrict.Category ? Djs.CategoryChannel :
    ChannelType extends ChannelRestrict.PublicThread ? Djs.PublicThreadChannel<boolean> :
    ChannelType extends ChannelRestrict.PrivateThread ? Djs.PrivateThreadChannel :
    ChannelType extends ChannelRestrict.Stage ? Djs.StageChannel :
    ChannelType extends ChannelRestrict.Forum ? Djs.ForumChannel :
    never
)
const channelEnumToStringMap = {
    [ChannelRestrict.Text]: "text",
    [ChannelRestrict.DM]: "DM",
    [ChannelRestrict.Voice]: "voice",
    [ChannelRestrict.Category]: "category",
    [ChannelRestrict.PublicThread]: "public thread",
    [ChannelRestrict.PrivateThread]: "private thread",
    [ChannelRestrict.Stage]: "stage",
    [ChannelRestrict.Forum]: "forum"
}
export class CmdParamChannel<
    ChannelRestrictsT extends ChannelRestrict[] | null = ChannelRestrict[] | null,
    ValueTypeT extends ChannelRestrictsOptionalMap<ChannelRestrictsT> = ChannelRestrictsOptionalMap<ChannelRestrictsT>,
    IsRequired extends boolean = boolean,
> extends CmdParameter<ValueTypeT, IsRequired, Djs.SlashCommandChannelOption> {
    private __nominalChannel() {}

    public validChannelTypes: ChannelRestrictsT

    constructor(args: CmdParameterArgs<IsRequired> & {validChannelTypes?: ChannelRestrictsT}) {
        super(args)
        this.validChannelTypes = args.validChannelTypes ?? null as unknown as ChannelRestrictsT
    }

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getChannel(...this.toGetValueArgs()) as ValueTypeT
    }

    public override async assertValue(value: ValueTypeT): Promise<OtherTypes.AssertFailInfo | null> {
        if (this.validChannelTypes === null) return null
        if (this.validChannelTypes.includes(value.type as number)) return null

        return new OtherTypes.AssertFailInfo(
            "The channel is not a channel of the correct type." + (
                this.validChannelTypes.length === 1
                    ? `You must input a ${channelEnumToStringMap[this.validChannelTypes[0]]} channel.`
                    : `You must input a channel of one of these types: ${
                        this.validChannelTypes.map(validChannelType => channelEnumToStringMap[validChannelType] + "channel").join(", ")
                    }`
            )
        )
    }


    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addChannelOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamRoleValue = Djs.Role | Djs.APIRole
export class CmdParamRole<
    IsRequired extends boolean = boolean,
> extends CmdParameter<CmdParamRoleValue, IsRequired, Djs.SlashCommandRoleOption> {
    private __nominalRole() {}

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getRole(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addRoleOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamUserValue = Djs.User
export class CmdParamUser<
    IsRequired extends boolean = boolean,
> extends CmdParameter<CmdParamUserValue, IsRequired, Djs.SlashCommandUserOption> {
    private __nominalUser() {}

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getUser(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addUserOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamAttachmentValue = Djs.Attachment
export class CmdParamAttachment<
    IsRequired extends boolean = boolean,
> extends CmdParameter<CmdParamAttachmentValue, IsRequired, Djs.SlashCommandAttachmentOption> {
    private __nominalAttachment() {}

    protected override getValueFromInteractionOptions(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getAttachment(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addAttachmentOption(this.setupBuilderOption.bind(this))
    }
}



export function createGenericChoice<ChoiceType extends string | number>(nameValue: ChoiceType): ChoiceOption<ChoiceType> {
    return {
        name: nameValue.toString(),
        value: nameValue
    }
}



type ParamsWithChoices = CmdParamString | CmdParamInteger | CmdParamNumber

type InferChoices<ParamWithChoice extends ParamsWithChoices> = (
    ParamWithChoice extends CmdParamString<boolean, infer ChoicesT> ? ChoicesT
    : ParamWithChoice extends CmdParamInteger<boolean, infer ChoicesT> ? ChoicesT
    : ParamWithChoice extends CmdParamNumber<boolean, infer ChoicesT> ? ChoicesT
    : null
)


type ValueOrChoiceMap<ValueTypeT, ChoicesT extends Choices<string | number>> = (
    ChoicesT extends null ? ValueTypeT : NonNullable<ChoicesT>[number]["value"]
)


export type CmdGeneralParameter = (
    CmdParamString | CmdParamInteger | CmdParamNumber | CmdParamBoolean
    | CmdParamMentionable | CmdParamChannel | CmdParamRole | CmdParamUser | CmdParamAttachment
)



export type ParamsToValueMap<CmdParameters extends readonly CmdGeneralParameter[]> = {
    [P in keyof CmdParameters]:
        CmdParameters[P] extends CmdParameter<
            infer ValueTypeT,
            infer IsRequired
        > ? (
            CmdParameters[P] extends ParamsWithChoices
            ? IsRequiredMap<ValueOrChoiceMap<ValueTypeT, InferChoices<CmdParameters[P]>>, IsRequired>
            : IsRequiredMap<ValueTypeT, IsRequired>
        ) : never
}

export function getParameterValues<
    Parameters extends readonly CmdGeneralParameter[],
>(
    interaction: UseScope.AllScopedCommandInteraction,
    parameters: Parameters,
): ParamsToValueMap<Parameters> {
    const results = []
    for (const parameter of parameters) {
        results.push(parameter.getValue(interaction.options))
    }

    return results as ParamsToValueMap<Parameters>
}