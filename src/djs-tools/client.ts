import Djs from "discord.js"
import env from "dotenv"

import * as DjsToolsCmds from "./command"



env.config()

function validateKeyFromEnv(keyFromEnv: string | undefined) {
    if (keyFromEnv === undefined) throw "No token defined."
    return keyFromEnv
}

const botToken = process.env.bot_token
export function getBotToken() {
    return validateKeyFromEnv(botToken)
}

const appId = process.env.application_id
export function getAppId() {
    return validateKeyFromEnv(appId)
}


let globalClient: Djs.Client | null = null


export function setClient(client: Djs.Client) {
    globalClient = client
}

export function getClient() {
    if (globalClient === null) throw "No client found."
    return globalClient
}


export async function clientLogin() {
    const client = getClient()

    client.once(Djs.Events.ClientReady, clientPass => {
        console.log(`Logged in as ${clientPass.user.tag}, ID ${clientPass.user.id}.`)
    })

    DjsToolsCmds.addCmdCaller(client)

    console.log("Logging into client for running...")
    await client.login(getBotToken())
}


export async function deployCmdsGuildBased() {
    const restApi = new Djs.REST()
    restApi.setToken(getBotToken())

    const cmdInfos = DjsToolsCmds.getRegisteredCmds()
    const commandCount = cmdInfos.size

    const client = getClient()

    console.log("Logging into client for deploying slash commands (guild based)...")
    await client.login(getBotToken())


    const commandDatas = cmdInfos.map((cmdInfo) => cmdInfo.createBuilder().toJSON())

    try {
		console.log(`Refreshing ${commandCount} slash commands:`)
        for (const cmdName of cmdInfos.keys())
            console.log(`- ${cmdName}`)

        for (const guild of client.guilds.cache.values()) {
            await restApi.put(
                Djs.Routes.applicationGuildCommands(getAppId(), guild.id),
                { body: commandDatas },
            )
        }

		console.log(`Successfully refreshed ${commandCount} slash commands.`)

        client.destroy()
	} catch (error) {
		console.error(error)
	}
}


let devEnvStatus = false
export function setDevEnvStatus(isDevEnv: boolean) {
    devEnvStatus = isDevEnv
}

export function getDevEnvStatus() {
    return devEnvStatus
}

export function sayDevEnvStatus() {
    console.log(`Currently in ${devEnvStatus ? "development" : "production"} environment.`)
}