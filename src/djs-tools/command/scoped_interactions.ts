import Djs from "discord.js"



export interface GuildCommandInteraction extends Djs.ChatInputCommandInteraction {
    guild: typeof Djs.CommandInteraction.prototype.guild
    guildId: typeof Djs.CommandInteraction.prototype.guildId
    channel: typeof Djs.CommandInteraction.prototype.channel
}

export interface DMCommandInteraction
    extends Omit<Djs.ChatInputCommandInteraction, "guild" | "guildId" | "channel">
{}

export type AllScopedCommandInteraction = Djs.ChatInputCommandInteraction | GuildCommandInteraction | DMCommandInteraction