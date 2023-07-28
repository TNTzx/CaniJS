import Djs from "discord.js"
import { Prisma } from "@prisma/client"

import * as PrismaClient from "./client"



export function getGuildCreateData(guildSid: string): Prisma.GuildCreateInput {
    return {
        guildSid: guildSid,
        permissions: {create: {}}
    }
}

export function getGuildWhereUnique(guildSid: string): Prisma.GuildWhereUniqueInput {
    return {guildSid: guildSid}
}


export async function addGuildToDB(guildSid: string) {
    return await PrismaClient.getPrismaClient().guild.create({
        data: getGuildCreateData(guildSid)
    })
}

export async function deleteGuildFromDB(guildSid: string) {
    return await PrismaClient.getPrismaClient().guild.delete({
        where: getGuildWhereUnique(guildSid)
    })
}

export async function updateGuildsDB(botGuildSids: string[]) {
    const prismaClient = PrismaClient.getPrismaClient()


    const prismaGuildEntries = await prismaClient.guild.findMany()
    const prismaGuildSids = prismaGuildEntries.map(prismaGuildEntry => prismaGuildEntry.guildSid)

    const toAddGuildSids = botGuildSids.filter(botGuildSid => !prismaGuildSids.includes(botGuildSid))
    const createdEntries = toAddGuildSids.length !== 0
        ? await prismaClient.$transaction(toAddGuildSids.map(
            toAddGuildSid => prismaClient.guild.create({data: getGuildCreateData(toAddGuildSid)})
        ))
        : null

    const toDeleteGuildSids = prismaGuildSids.filter(prismaGuildSid => !botGuildSids.includes(prismaGuildSid))
    const deletedEntries = toDeleteGuildSids.length !== 0
        ? await prismaClient.$transaction(toDeleteGuildSids.map(
            toDeleteGuildSid => prismaClient.guild.delete({where: getGuildWhereUnique(toDeleteGuildSid)})
        ))
        : null

    return {createdEntries: createdEntries, deletedEntries: deletedEntries}
}



export class DBGuildSetupper {
    public isAlreadySetup: (guildSid: string) => Promise<boolean>
    public setup: (guildSid: string) => Promise<unknown>

    constructor(
        args: {
            isAlreadySetup: (guildSid: string) => Promise<boolean>,
            setup: (guildSid: string) => Promise<unknown>
        }
    ) {
        this.isAlreadySetup = args.isAlreadySetup
        this.setup = args.setup
    }
}

const dbGuildSetuppers: DBGuildSetupper[] = []
export function addDBGuildSetupper(dbGuildSetupper: DBGuildSetupper) {
    dbGuildSetuppers.push(dbGuildSetupper)
}

export async function runGuildSetupFuncs(guildSid: string) {
    for (const dbGuildSetupper of dbGuildSetuppers) {
        if (!(await dbGuildSetupper.isAlreadySetup(guildSid)))
            await dbGuildSetupper.setup(guildSid)
    }
}

export async function runGuildSetupFuncsAllGuilds(guildSids: string[]) {
    for (const guildSid of guildSids) {
        await runGuildSetupFuncs(guildSid)
    }
}



export function addGuildDBUpdater(botClient: Djs.Client) {
    botClient.on(Djs.Events.GuildCreate, async guild => {
        await addGuildToDB(guild.id)
        await runGuildSetupFuncs(guild.id)
    })

    botClient.on(Djs.Events.GuildDelete, async guild => {
        await deleteGuildFromDB(guild.id)
    })

    botClient.on(Djs.Events.ClientReady, async client => {
        const allGuildIds = client.guilds.cache.map(guild => guild.id)

        console.log("Updating guild list...")
        await updateGuildsDB(allGuildIds)

        console.log("Setting up all guilds...")
        await runGuildSetupFuncsAllGuilds(allGuildIds)

        console.log("Finished setting up database for all guilds.")
    })
}
