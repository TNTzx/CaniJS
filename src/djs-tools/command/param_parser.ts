import Djs from "discord.js"

import * as UseScope from "./use_scope"
import * as OtherTypes from "../other_types"



export type ChoiceOption<T> = {name: string, value: T}
export type Choices<T> = readonly ChoiceOption<T>[] | null


export abstract class CmdParameter<
    ValueType = unknown,
    IsRequired extends boolean = boolean,
    ChoicesT extends Choices<ValueType> = Choices<ValueType>
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


    public toGetterArgs(): [string, boolean] {
        return [this.name, this.required]
    }

    public abstract getValue(options: OtherTypes.ChatInputCommandInteractionOptions): ValueType | null
}



export class CmdParamString<
    IsRequired extends boolean,
    ChoicesT extends Choices<string>
> extends CmdParameter<string, IsRequired, ChoicesT> {
    private __nominalString() {}

    public min_chars: number = 1
    public max_chars: number = 2000

    public setLengthLimits(min?: number, max?: number) {
        this.min_chars = min ?? this.min_chars
        this.max_chars = max ?? this.max_chars
        return this
    }

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getString(...this.toGetterArgs())
    }
}


interface ParamNumeric {
    min_value: number | undefined
    max_value: number | undefined
    setSizeLimits: (min?: number, max?: number) => this
}

export class CmdParamInteger<
    IsRequired extends boolean,
    ChoicesT extends Choices<number>
> extends CmdParameter<number, IsRequired, ChoicesT> implements ParamNumeric {
    private __nominalInt() {}

    public min_value: number | undefined = undefined
    public max_value: number | undefined = undefined

    public setSizeLimits(min?: number, max?: number) {
        this.min_value = min
        this.max_value = max
        return this
    }

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getInteger(...this.toGetterArgs())
    }
}

export class CmdParamNumber<
    IsRequired extends boolean,
    ChoicesT extends Choices<number>
> extends CmdParameter<number, IsRequired, ChoicesT> implements ParamNumeric {
    private __nominalNumber() {}

    public min_value: number | undefined = undefined
    public max_value: number | undefined = undefined

    public setSizeLimits(min?: number, max?: number) {
        this.min_value = min
        this.max_value = max
        return this
    }

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getNumber(...this.toGetterArgs())
    }
}

export class CmdParamBoolean<
    IsRequired extends boolean,
    ChoicesT extends Choices<boolean>
> extends CmdParameter<boolean, IsRequired, ChoicesT> {
    private __nominalBoolean() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getBoolean(...this.toGetterArgs())
    }
}


export type CmdParamMentionableValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getMentionable"]>>
export class CmdParamMentionable<
    IsRequired extends boolean,
    ChoicesT extends Choices<CmdParamMentionableValue>
> extends CmdParameter<CmdParamMentionableValue, IsRequired, ChoicesT> {
    private __nominalMentionable() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getMentionable(...this.toGetterArgs())
    }
}

export type CmdParamChannelValue = NonNullable<ReturnType<OtherTypes.ChatInputCommandInteractionOptions["getChannel"]>>
export class CmdParamChannel<
    IsRequired extends boolean,
    ChoicesT extends Choices<CmdParamChannelValue>
> extends CmdParameter<CmdParamChannelValue, IsRequired, ChoicesT> {
    private __nominalChannel() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getChannel(...this.toGetterArgs())
    }
}

export type CmdParamRoleValue = Djs.Role | Djs.APIRole
export class CmdParamRole<
    IsRequired extends boolean,
    ChoicesT extends Choices<CmdParamRoleValue>
> extends CmdParameter<CmdParamRoleValue, IsRequired, ChoicesT> {
    private __nominalRole() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getRole(...this.toGetterArgs())
    }
}

export type CmdParamUserValue = Djs.User
export class CmdParamUser<
    IsRequired extends boolean,
    ChoicesT extends Choices<CmdParamUserValue>
> extends CmdParameter<CmdParamUserValue, IsRequired, ChoicesT> {
    private __nominalUser() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getUser(...this.toGetterArgs())
    }
}

export type CmdParamAttachmentValue = Djs.Attachment
export class CmdParamAttachment<
    IsRequired extends boolean,
    ChoicesT extends Choices<CmdParamAttachmentValue>
> extends CmdParameter<CmdParamAttachmentValue, IsRequired, ChoicesT> {
    private __nominalAttachment() {}

    public getValue(options: OtherTypes.ChatInputCommandInteractionOptions) {
        return options.getAttachment(...this.toGetterArgs())
    }
}



export function createGenericChoice<ChoiceType extends string | number>(nameValue: ChoiceType): ChoiceOption<ChoiceType> {
    return {
        name: nameValue.toString(),
        value: nameValue
    }
}



type ValueOrChoiceMap<ValueType, ChoicesT extends Choices<ValueType>> = (
    ChoicesT extends null ? ValueType : NonNullable<ChoicesT>[number]["value"]
)

type ParamsToValueMap<CmdParameters extends readonly CmdParameter[]> = {
    [P in keyof CmdParameters]: CmdParameters[P] extends CmdParameter<infer ValueType, infer IsRequired, infer ChoiceArrayT> ? (
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