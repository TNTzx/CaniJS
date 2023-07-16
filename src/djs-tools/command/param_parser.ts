import Djs, { ChannelType, SlashCommandBuilder } from "discord.js"
import * as Registerer from "./registerer"


export type CmdParamTypes =
    Registerer.CmdParamString
    | Registerer.CmdParamInteger
    | Registerer.CmdParamNumber
    | Registerer.CmdParamBoolean
    | Registerer.CmdParamMentionable
    | Registerer.CmdParamChannel
    | Registerer.CmdParamRole
    | Registerer.CmdParamUser
    | Registerer.CmdParamAttachment


type CmdParamTypeMap<T extends CmdParamTypes[]> = {
    [P in keyof T]:
        T[P] extends Registerer.CmdParamString ? string
        : T[P] extends Registerer.CmdParamInteger ? string
        : T[P] extends Registerer.CmdParamNumber ? string
        : T[P] extends Registerer.CmdParamBoolean ? string
        : T[P] extends Registerer.CmdParamMentionable ? string
        : T[P] extends Registerer.CmdParamChannel ? string
        : T[P] extends Registerer.CmdParamRole ? string
        : T[P] extends Registerer.CmdParamUser ? string
        : T[P] extends Registerer.CmdParamAttachment ? string
        : never
}


type CmdParamResultTypes = (
    string
    | number
    | boolean
    | NonNullable<Djs.GuildMember | Djs.APIInteractionDataResolvedGuildMember | Djs.Role | Djs.APIRole | Djs.User | null | undefined>
    | ChannelType | Djs.CategoryChannel
    | Djs.Role | Djs.APIRole
    | Djs.User
    | Djs.Attachment
)


export function getParameters<T extends CmdParamTypes[]>(interaction: Djs.ChatInputCommandInteraction, parameters: T): CmdParamTypeMap<T> {
    const options = interaction.options

    const results: CmdParamResultTypes[] = []
    
    for (const parameter of parameters) {
        const getterArgs = parameter.toGetterArgs()
        let result: CmdParamResultTypes | null

        if (parameter instanceof Registerer.CmdParamString) {
            result = options.getString(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamInteger) {
            result = options.getInteger(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamNumber) {
            result = options.getNumber(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamBoolean) {
            result = options.getBoolean(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamMentionable) {
            result = options.getMentionable(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamChannel) {
            result = options.getChannel(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamRole) {
            result = options.getRole(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamUser) {
            result = options.getUser(...getterArgs)
        } else if (parameter instanceof Registerer.CmdParamAttachment) {
            result = options.getAttachment(...getterArgs)
        } else {
            throw "Invalid parameter!"
        }

        if (parameter.required) result = result ?? ""
    }

    return result
}