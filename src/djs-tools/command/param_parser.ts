import Djs from "discord.js"

import * as UseScope from "./use_scope"
import * as OtherTypes from "../other_types"



export type ChoiceOption<T extends string | number = string | number> = {name: string, value: T}
export type Choices<T extends string | number = string | number> = readonly ChoiceOption<T>[] | null

type Builder = Djs.SlashCommandBuilder | Djs.SlashCommandSubcommandBuilder
type BuilderReturned = Djs.SlashCommandSubcommandBuilder | Omit<Djs.SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">

export abstract class CmdParameter<
    ValueType = unknown,
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices | null = Choices,
    BuilderOption extends Djs.ApplicationCommandOptionBase = Djs.ApplicationCommandOptionBase
> {
    public required: IsRequired
    public name: string
    public description: string
    public choices: ChoicesT

    constructor(
        required: IsRequired,
        name: string,
        description: string,
        choices: ChoicesT = null as unknown as ChoicesT
    ) {
        this.required = required
        this.name = name
        this.description = description

        this.choices = choices
    }


    public toGetValueArgs(): [string, boolean] {
        return [this.name, this.required]
    }

    public abstract getValue(interactionOptions: OtherTypes.ChatInputCommandInteractionOptions): ValueType | null

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
> extends CmdParameter<string, IsRequired, ChoicesT, Djs.SlashCommandStringOption> {
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
> extends CmdParameter<number, IsRequired, ChoicesT, Djs.SlashCommandIntegerOption> implements ParamNumeric {
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
> extends CmdParameter<number, IsRequired, ChoicesT, Djs.SlashCommandNumberOption> implements ParamNumeric {
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
> extends CmdParameter<boolean, IsRequired, null, Djs.SlashCommandBooleanOption> {
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
> extends CmdParameter<CmdParamMentionableValue, IsRequired, null, Djs.SlashCommandMentionableOption> {
    private __nominalMentionable() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getMentionable(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addMentionableOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamChannelValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getChannel"]>>
export class CmdParamChannel<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamChannelValue, IsRequired, null, Djs.SlashCommandChannelOption> {
    private __nominalChannel() {}

    public override getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getChannel(...this.toGetValueArgs())
    }

    public override addOptionToBuilder(builder: Builder): BuilderReturned {
        return builder.addChannelOption(this.setupBuilderOption.bind(this))
    }
}

export type CmdParamRoleValue = Djs.Role | Djs.APIRole
export class CmdParamRole<
    IsRequired extends boolean,
> extends CmdParameter<CmdParamRoleValue, IsRequired, null, Djs.SlashCommandRoleOption> {
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
> extends CmdParameter<CmdParamUserValue, IsRequired, null, Djs.SlashCommandUserOption> {
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
> extends CmdParameter<CmdParamAttachmentValue, IsRequired, null, Djs.SlashCommandAttachmentOption> {
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



type ValueOrChoiceMap<ValueType, ChoicesT extends Choices<string | number>> = (
    ChoicesT extends null ? ValueType : NonNullable<ChoicesT>[number]["value"]
)

type ParamsToValueMap<CmdParameters extends readonly CmdParameter[]> = {
    [P in keyof CmdParameters]:
        CmdParameters[P] extends CmdParameter<
            infer ValueType,
            infer IsRequired,
            infer ChoiceArrayT extends Choices<string | number> | null
        > ? (
        IsRequired extends true ? ValueOrChoiceMap<ValueType, ChoiceArrayT> : ValueOrChoiceMap<ValueType, ChoiceArrayT> | null
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