import { SlashCommandBuilder } from 'discord.js'
import * as DjsTools from '../../djs-tools'



let cmdHello: DjsTools.CmdReg.CmdInfo = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello! Dog!'),

    execute: async (interaction) => {
        interaction.reply('Hellooo! :D')
    }
}

export default cmdHello