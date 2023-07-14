import Djs from 'discord.js'
import env from 'dotenv'

import * as CmdRegister from './cmd_register'
import CmdCaller from  './cmd_caller'



env.config()

function validateKeyFromEnv(keyFromEnv: string | undefined) {
    if (keyFromEnv === undefined) throw 'No token defined.'
    return keyFromEnv
}

let botToken = process.env.bot_token
export function getBotToken() {
    return validateKeyFromEnv(botToken)
}

let appId = process.env.application_id
export function getAppId() {
    return validateKeyFromEnv(appId)
}


export class ClientExtend extends Djs.Client {
    commands: Djs.Collection<any, any>

    constructor(options: Djs.ClientOptions) {
        super(options)
        this.commands = new Djs.Collection()
    }
}

let globalClient: ClientExtend | null = null


export function setClient(client: ClientExtend) {
    globalClient = client
}

export function getClient() {
    if (globalClient === null) throw 'No client found.'
    return globalClient
}

export function clientLogin() {
    const client = getClient()

    client.once(Djs.Events.ClientReady, clientPass => {
        console.log(`Logged in as ${clientPass.user.tag}, ID ${clientPass.user.id}.`)
    })

    CmdCaller(client)

    console.log('Logging into client for running...')
    client.login(getBotToken())
}


export async function deployCmdsGuildBased() {
    const restApi = new Djs.REST()
    restApi.setToken(getBotToken())

    const cmdBundles = CmdRegister.getRegisteredCmds()
    const commandCount = cmdBundles.size

    const client = getClient()

    console.log('Logging into client for deploying slash commands (guild based)...')
    await client.login(getBotToken())


    const commandDatas = cmdBundles.map((cmdBundle) => CmdRegister.cmdInfoToSlashCommandBuilder(cmdBundle.cmdInfo).toJSON())

    try {
		console.log(`Refreshing ${commandCount} slash commands...`)

        client.guilds.cache.forEach(async (guild) => {
            await restApi.put(
                Djs.Routes.applicationGuildCommands(getAppId(), guild.id),
                { body: commandDatas },
            )
        })

		console.log(`Successfully refreshed ${commandCount} slash commands.`)

        client.destroy()
	} catch (error) {
		console.error(error)
	}
}