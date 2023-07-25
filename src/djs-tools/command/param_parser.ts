import Djs from "discord.js"



export type ChoiceOption<T> = {name: string, value: T}
export type ChoiceArrayGeneral<T> = readonly ChoiceOption<T>[] | undefined


export class CmdParameter<IsRequired extends boolean = boolean, ChoiceArray extends ChoiceArrayGeneral<unknown> = undefined> {
    public required: IsRequired
    public name: string
    public description: string
    public choices: ChoiceArray

    constructor(
        required: IsRequired,
        name: string,
        description: string,
        choices: ChoiceArray
    ) {
        this.required = required
        this.name = name
        this.description = description

        this.choices = choices
    }


    public toGetterArgs(): [string, boolean] {
        return [this.name, this.required]
    }
}



export class CmdParamString<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalString() {}

    public min_chars: number = 1
    public max_chars: number = 2000

    public setLengthLimits(min?: number, max?: number) {
        this.min_chars = min ?? this.min_chars
        this.max_chars = max ?? this.max_chars
        return this
    }
}


interface ParamNumeric {
    min_value: number | undefined
    max_value: number | undefined
    setSizeLimits: (min?: number, max?: number) => this
}

export class CmdParamInteger<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> implements ParamNumeric {
    private __nominalInt() {}

    public min_value: number | undefined = undefined
    public max_value: number | undefined = undefined

    public setSizeLimits(min?: number, max?: number) {
        this.min_value = min
        this.max_value = max
        return this
    }
}

export class CmdParamNumber<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> implements ParamNumeric {
    private __nominalNumber() {}

    public min_value: number | undefined = undefined
    public max_value: number | undefined = undefined

    public setSizeLimits(min?: number, max?: number) {
        this.min_value = min
        this.max_value = max
        return this
    }
}

export class CmdParamBoolean<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalBoolean() {}
}


export class CmdParamMentionable<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalMentionable() {}
}

export class CmdParamChannel<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalChannel() {}
}

export class CmdParamRole<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalRole() {}
}

export class CmdParamUser<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalUser() {}
}


export class CmdParamAttachment<
    IsRequired extends boolean,
    ChoiceArray extends ChoiceArrayGeneral<unknown>
> extends CmdParameter<IsRequired, ChoiceArray> {
    private __nominalAttachment() {}
}


export enum ParamEnum {
    string,
    integer,
    number,
    boolean,
    mentionable,
    channel,
    role,
    user,
    attachment
}

export type CmdParamEnumMap<ParamEnumT extends ParamEnum, IsRequired extends boolean, ChoicesT extends ChoiceArrayGeneral<unknown>> = (
    ParamEnumT extends ParamEnum.string ? CmdParamString<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.integer ? CmdParamInteger<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.number ? CmdParamNumber<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.boolean ? CmdParamBoolean<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.mentionable ? CmdParamMentionable<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.channel ? CmdParamChannel<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.role ? CmdParamRole<IsRequired, ChoicesT>
    : ParamEnumT extends ParamEnum.user ? CmdParamUser<IsRequired, ChoicesT>
    : CmdParamAttachment<IsRequired, ChoicesT>
)


export type ParamToChoiceMap<ParamTypeEnum extends ParamEnum> = (
    ParamTypeEnum extends ParamEnum.string ? readonly ChoiceOption<string>[]
    : ParamTypeEnum extends ParamEnum.integer ? readonly ChoiceOption<number>[]
    : ParamTypeEnum extends ParamEnum.number ? readonly ChoiceOption<number>[]
    : undefined
)

export function createParameter<
    IsRequired extends boolean,
    ParamTypeEnum extends ParamEnum,
    ChoiceArray extends ParamToChoiceMap<ParamTypeEnum> | undefined = undefined
>(
    paramType: ParamTypeEnum,
    required: IsRequired,
    name: string,
    description: string,
    choices?: ChoiceArray
) {
    const args: ConstructorParameters<typeof CmdParameter<IsRequired, ChoiceArray | undefined>>
        = [required, name, description, choices]

    let parameter
    if (paramType === ParamEnum.string) {parameter = new CmdParamString(...args)}
    else if (paramType === ParamEnum.integer) {parameter = new CmdParamInteger(...args)}
    else if (paramType === ParamEnum.number) {parameter = new CmdParamNumber(...args)}
    else if (paramType === ParamEnum.boolean) {parameter = new CmdParamBoolean(...args)}
    else if (paramType === ParamEnum.mentionable) {parameter = new CmdParamMentionable(...args)}
    else if (paramType === ParamEnum.channel) {parameter = new CmdParamChannel(...args)}
    else if (paramType === ParamEnum.role) {parameter = new CmdParamRole(...args)}
    else if (paramType === ParamEnum.user) {parameter = new CmdParamUser(...args)}
    else {parameter = new CmdParamAttachment(...args)}

    return parameter as CmdParamEnumMap<ParamTypeEnum, IsRequired, ChoiceArray extends ParamToChoiceMap<ParamTypeEnum> ? ChoiceArray : undefined>
}


export type ParamResult = (
    string
    | number
    | boolean
    | NonNullable<
        Djs.GuildMember | Djs.APIInteractionDataResolvedGuildMember | Djs.Role | Djs.APIRole | Djs.User
        | null | undefined
    >
    | Djs.ChannelType | Djs.CategoryChannel
    | Djs.Role | Djs.APIRole
    | Djs.User
    | Djs.Attachment
    | null
)


export type ParamToResultMap<T extends CmdParameter<boolean, ChoiceArrayGeneral<unknown>>> =
    T extends CmdParameter<infer IsRequired, infer ChoiceArray> ? (
        ChoiceArray extends undefined ? (
            T extends CmdParamString<IsRequired, ChoiceArray> ? string | null
            : T extends CmdParamInteger<IsRequired, ChoiceArray> ? number | null
            : T extends CmdParamNumber<IsRequired, ChoiceArray> ? number | null
            : T extends CmdParamBoolean<IsRequired, ChoiceArray> ? boolean | null
            : T extends CmdParamMentionable<IsRequired, ChoiceArray> ?
                NonNullable<
                    Djs.GuildMember | Djs.APIInteractionDataResolvedGuildMember | Djs.Role | Djs.APIRole | Djs.User
                    | null | undefined
                > | null
            : T extends CmdParamChannel<IsRequired, ChoiceArray> ? Djs.ChannelType | Djs.CategoryChannel | null
            : T extends CmdParamRole<IsRequired, ChoiceArray> ? Djs.Role | Djs.APIRole | null
            : T extends CmdParamUser<IsRequired, ChoiceArray> ? Djs.User | null
            : Djs.Attachment | null
        ) : {
            [Choice in keyof NonNullable<ChoiceArray>]: NonNullable<ChoiceArray>[Choice] extends ChoiceOption<infer R> ? R : never
        }[number]
    ) : never

export type ParamToNullMap<T extends CmdParameter<boolean, ChoiceArrayGeneral<unknown>>> =
    T extends CmdParameter<infer IsRequired, ChoiceArrayGeneral<unknown>> ? (
        IsRequired extends true ? NonNullable<ParamToResultMap<T>> : ParamToResultMap<T>
    ) : never


export type ParamsMap<T extends readonly CmdParameter<boolean, ChoiceArrayGeneral<unknown>>[]> = {
    [P in keyof T]: ParamToNullMap<T[P]>
}




export function getParameterValues<
    Parameters extends readonly CmdParameter<boolean, ChoiceArrayGeneral<unknown>>[],
>(
    interaction: Djs.ChatInputCommandInteraction,
    parameters: Parameters,
): ParamsMap<Parameters> {
    const options = interaction.options

    const results = []

    for (const parameter of parameters) {
        const getterArgs = parameter.toGetterArgs()
        let result: ParamResult

        if (parameter instanceof CmdParamString) {
            result = options.getString(...getterArgs)
        } else if (parameter instanceof CmdParamInteger) {
            result = options.getInteger(...getterArgs)
        } else if (parameter instanceof CmdParamNumber) {
            result = options.getNumber(...getterArgs)
        } else if (parameter instanceof CmdParamBoolean) {
            result = options.getBoolean(...getterArgs)
        } else if (parameter instanceof CmdParamMentionable) {
            result = options.getMentionable(...getterArgs)
        } else if (parameter instanceof CmdParamChannel) {
            result = options.getChannel(...getterArgs)
        } else if (parameter instanceof CmdParamRole) {
            result = options.getRole(...getterArgs)
        } else if (parameter instanceof CmdParamUser) {
            result = options.getUser(...getterArgs)
        } else if (parameter instanceof CmdParamAttachment) {
            result = options.getAttachment(...getterArgs)
        } else {
            throw "Invalid parameter!"
        }

        results.push(result)
    }

    return results as ParamsMap<Parameters>
}