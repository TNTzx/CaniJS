import * as DjsTools from '../../djs-tools'



let cmdHello: DjsTools.CmdReg.CmdBundle = {
    cmdInfo: {
        name: 'hello',
        description: 'Says hello! Dog!',
        permissions: [DjsTools.CmdPermissions.permServerOwner]
    },

    execute: async (interaction) => {
        interaction.reply('Hellooo! :D')
    }
}

export default cmdHello