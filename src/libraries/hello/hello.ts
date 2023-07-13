import { SlashCommandBuilder } from "discord.js";
import cmdRegister from "../../djs-tools/cmd_register"
 
cmdRegister({
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Says hello! Dog!"),

    execute: async (interaction) => {
        interaction.reply("Hellooo! :D");
    }
})



