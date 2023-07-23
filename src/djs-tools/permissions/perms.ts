import Djs from "discord.js"



export interface CmdPermission {
    name: string,
    onRejectMessage: string,
    checkGrant: (interaction: Djs.ChatInputCommandInteraction) => boolean
}

export const permServerOwner: CmdPermission = {
    name: "server owner",
    onRejectMessage: "You are not the server owner!",
    checkGrant: (interaction) => {
        return interaction.user.id === interaction.guild?.ownerId
    }
}