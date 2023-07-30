import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"

import * as CmdGroup from "./cmd_group"
import * as PrismaLocal from "./prisma"



const paramRegister = [
    new DjsTools.CmdParamString(
        true,
        "action", "The action to do.", [
            DjsTools.createGenericChoice("wa"),
            DjsTools.createGenericChoice("wae")
        ]
    )
] as const

export const cmdRegister = CmdGroup.cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "edit-channels",
    description: "Edits the channels able to be claimed.",
    parameters: paramRegister,
    useCases: [Moderation.caseIsAdmin],
    async executeFunc(interaction) {
        const parameters = DjsTools.getParameterValues(interaction, paramRegister)
        const registeredChannels = PrismaLocal.getClaimableChannels(interaction.guild.id)

    },
})