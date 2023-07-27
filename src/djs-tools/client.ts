import Djs from "discord.js"
import env from "dotenv"

import * as DjsToolsCmds from "./command"
import * as DjsToolsPrisma from "./prisma"



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
    DjsToolsPrisma.addGuildDBUpdater(client)

    console.log("Logging into client for running...")
    await client.login(getBotToken())
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