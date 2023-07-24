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


export function addGuildDBUpdater(botClient: Djs.Client) {
    botClient.on(Djs.Events.GuildCreate, async guild => {
        await addGuildToDB(guild.id)
    })

    botClient.on(Djs.Events.GuildDelete, async guild => {
        await deleteGuildFromDB(guild.id)
    })

    botClient.on(Djs.Events.ClientReady, async client => {
        await updateGuildsDB(client.guilds.cache.map(guild => guild.id))
    })
}
