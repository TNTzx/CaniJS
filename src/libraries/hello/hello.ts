import { SlashCommandBuilder } from 'discord.js'
import * as DjsToolsCmdReg from '../../djs-tools/cmd_register'



let cmdHello: DjsToolsCmdReg.CmdInfo = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello! Dog!'),

    execute: async (interaction) => {
        interaction.reply('Hellooo! :D')
    }
}

export default cmdHello