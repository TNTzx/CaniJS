import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"

import * as CmdGroup from "./cmd_group"
import * as PrismaLocal from "./prisma"



const paramRegister = [
    new DjsTools.CmdParamString({
        required: true,
        name: "action",
        description: "The action to do.",
        choices: [
            DjsTools.createGenericChoice("add"),
            DjsTools.createGenericChoice("remove")
        ]
    }),
    new DjsTools.CmdParamChannel({
        required: true,
        name: "channel",
        description: "The channel to add / remove as a claimable channel.",
        validChannelTypes: [DjsTools.ChannelRestrict.Text]
    })
] as const

export const cmdRegister = CmdGroup.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "edit-channels",
    description: "Edits the channels able to be claimed.",
    parameters: paramRegister,
    useCases: [Moderation.caseIsAdmin],
    async executeFunc(interaction, args) {
        const registeredChannels = PrismaLocal.getClaimableChannels(interaction.guild.id)

    },
})