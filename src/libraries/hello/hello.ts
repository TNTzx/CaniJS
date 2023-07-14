import * as DjsTools from '../../djs-tools'



export const cmdHello: DjsTools.CmdBundle = {
    cmdInfo: {
        name: 'hello',
        description: 'Says hello! Dog!',
        permissions: [DjsTools.permServerOwner]
    },

    execute: async (interaction) => {
        await interaction.followUp('Hellooo! :D')
    }
}