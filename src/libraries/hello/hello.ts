import * as DjsTools from '../../djs-tools'



export const cmdHello: DjsTools.CmdReg.CmdBundle = {
    cmdInfo: {
        name: 'hello',
        description: 'Says hello! Dog!',
        permissions: [DjsTools.CmdPermissions.permServerOwner]
    },

    execute: async (interaction) => {
        await interaction.followUp('Hellooo! :D')
    }
}