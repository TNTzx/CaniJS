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
    ChoicesT extends Choices | null
> = {
    required: IsRequired,
    name: string,
    description: string,
    choices?: ChoicesT,
}
export abstract class CmdParameter<
    ValueTypeT = unknown,
    AssertedValueTypeT = unknown,
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices | null = Choices,
    BuilderOption extends Djs.ApplicationCommandOptionBase = Djs.ApplicationCommandOptionBase
> {
    public required: IsRequired
    public name: string
    public description: string
    public choices: ChoicesT

    constructor(args: CmdParameterArgs<IsRequired, ChoicesT>) {
        this.required = args.required
        this.name = args.name
        this.description = args.description
        this.choices = args.choices ?? null as unknown as ChoicesT
    }


    public toGetValueArgs(): [string, boolean] {
        return [this.name, this.required]
    }

    public abstract getValue(interactionOptions: OtherTypes.ChatInputCommandInteractionOptions): ValueTypeT | null


    protected async assertFunc(value: ValueTypeT): Promise<string | AssertedValueTypeT> {
        return value as unknown as AssertedValueTypeT
    }

    public async assertValue(value: ValueTypeT): Promise<string | AssertedValueTypeT> {
        return await this.assertFunc(value)
    }


    public setupBuilderOption(option: BuilderOption) {
        option
            .setName(this.name)
            .setDescription(this.description)
            .setRequired(this.required)

        if (this.choices !== null) {
            (option as unknown as Djs.ApplicationCommandOptionWithChoicesAndAutocompleteMixin<string | number>)
                .addChoices(...this.choices)
        }

        return option
    }

    public abstract addOptionToBuilder(builder: Builder): BuilderReturned
}



export class CmdParamString<
    IsRequired extends boolean,
    ChoicesT extends Choices<string>
> extends CmdParameter<string, string, IsRequired, ChoicesT, Djs.SlashCommandStringOption> {
    private __nominalString() {}

    public min_chars: number = 1
    public max_chars: number = 2000

    public setLengthLimits(min?: number, max?: number) {
        this.min_chars = min ?? this.min_chars
        this.max_chars = max ?? this.max_chars
        return this
    }

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
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

function setupBuilderOptionNumeric<
    BuilderOption extends Djs.SlashCommandIntegerOption | Djs.SlashCommandNumberOption
>(parameter: ParamNumeric, option: BuilderOption): BuilderOption {
    if (parameter.max_value !== null) option.setMaxValue(parameter.max_value)
    if (parameter.min_value !== null) option.setMinValue(parameter.min_value)

    return option
}

export class CmdParamInteger<
    IsRequired extends boolean,
    ChoicesT extends Choices<number>
> extends CmdParameter<number, number, IsRequired, ChoicesT, Djs.SlashCommandIntegerOption> implements ParamNumeric {
    private __nominalInt() {}

    public min_value: number | null = null
    public max_value: number | null = null

    public setSizeLimits(min: number | null, max: number | null) {
        this.min_value = min
        this.max_value = max
        return this
    }

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
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
    IsRequired extends boolean,
    ChoicesT extends Choices<number>
> extends CmdParameter<number, number, IsRequired, ChoicesT, Djs.SlashCommandNumberOption> implements ParamNumeric {
    private __nominalNumber() {}

    public min_value: number | null = null
    public max_value: number | null = null

    public setSizeLimits(min: number | null, max: number | null) {
        this.min_value = min
        this.max_value = max
        return this
    }

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
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
    IsRequired extends boolean,
> extends CmdParameter<boolean, boolean, IsRequired, null, Djs.SlashCommandBooleanOption> {
    private __nominalBoolean() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getBoolean(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addBooleanOption(this.setupBuilderOption.bind(this))
    }
}


export type CmdParamMentionableValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getMentionable"]>>
export class CmdParamMentionable<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamMentionableValue, CmdParamMentionableValue, IsRequired, null, Djs.SlashCommandMentionableOption> {
    private __nominalMentionable() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
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
    ChannelRestrictsT extends ChannelRestrict[] | null,
    ValueTypeT extends CmdParamChannelValue,
    AssertedValueTypeT extends ChannelRestrictsOptionalMap<ChannelRestrictsT>,
    IsRequired extends boolean,
> extends CmdParameter<ValueTypeT, AssertedValueTypeT, IsRequired, null, Djs.SlashCommandChannelOption> {
    private __nominalChannel() {}

    public validChannelTypes: ChannelRestrictsT

    constructor(args: CmdParameterArgs<IsRequired, null> & {validChannelTypes?: ChannelRestrictsT}) {
        super(args)
        this.validChannelTypes = args.validChannelTypes ?? null as unknown as ChannelRestrictsT
    }

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getChannel(...this.toGetValueArgs()) as ValueTypeT
    }

    protected override async assertFunc(value: ValueTypeT): Promise<string | AssertedValueTypeT> {
        const validatedValue = value as unknown as AssertedValueTypeT
        if (this.validChannelTypes === null) return validatedValue

        if (this.validChannelTypes.includes(value.type as number)) return validatedValue
        return "The channel is not a channel of the correct type." + (
            this.validChannelTypes.length === 1
                ? `You must input a ${channelEnumToStringMap[this.validChannelTypes[0]]} channel.`
                : `You must input a channel of one of these types: ${
                    this.validChannelTypes.map(validChannelType => channelEnumToStringMap[validChannelType] + "channel").join(", ")
                }`
        )
    }


    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addChannelOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamRoleValue = Djs.Role | Djs.APIRole
export class CmdParamRole<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamRoleValue, CmdParamRoleValue, IsRequired, null, Djs.SlashCommandRoleOption> {
    private __nominalRole() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getRole(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addRoleOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamUserValue = Djs.User
export class CmdParamUser<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamUserValue, CmdParamUserValue, IsRequired, null, Djs.SlashCommandUserOption> {
    private __nominalUser() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getUser(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addUserOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamAttachmentValue = Djs.Attachment
export class CmdParamAttachment<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamAttachmentValue, CmdParamAttachmentValue, IsRequired, null, Djs.SlashCommandAttachmentOption> {
    private __nominalAttachment() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
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



type ValueOrChoiceMap<AssertedValueTypeT, ChoicesT extends Choices<string | number>> = (
    ChoicesT extends null ? AssertedValueTypeT : NonNullable<ChoicesT>[number]["value"]
)



export type ParamsToValueMap<CmdParameters extends readonly CmdParameter[]> = {
    [P in keyof CmdParameters]:
        CmdParameters[P] extends CmdParameter<
            infer _ValueTypeT,
            infer AssertedValueTypeT,
            infer IsRequired,
            infer ChoiceArrayT extends Choices<string | number> | null
        > ? (
            IsRequiredMap<ValueOrChoiceMap<AssertedValueTypeT, ChoiceArrayT>, IsRequired>
    ) : never
}

export function getParameterValues<
    Parameters extends readonly CmdParameter[],
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