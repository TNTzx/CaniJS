import _s from "underscore.string"

import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"



export const cmdGroupChannelClaiming = new DjsTools.CmdTemplateGroup({
    id: "cc",
    description: "RP channel claiming commands.",
    useScope: DjsTools.useScopeGuildOnly
} as const)


export const cmdGroupEditChannels = cmdGroupChannelClaiming.addSubTemplateGroup({
    id: "edit-channels",
    description: "Commands that change what channels are claimable or not.",
    useCases: [Moderation.caseIsAdmin]
} as const)



function getEditChannelsDesc(action: "add" | "remove") {
    return `${_s.capitalize(action)}s a channel as a claimable channel.`
}

function getEditChannelsParam(action: "add" | "remove") {
    return [
        new DjsTools.CmdParamChannel({
            required: true,
            name: "channel",
            description: `The channel to ${action} as a claimable channel.`,
            validChannelTypes: [DjsTools.ChannelRestrict.Text]
        } as const)
    ] as const
}

export const cmdEditChannelsAdd = cmdGroupEditChannels.addSubTemplateLeaf({
    id: "add",
    description: getEditChannelsDesc("add"),
    parameters: getEditChannelsParam("add"),
} as const)

export const cmdEditChannelsRemove = cmdGroupEditChannels.addSubTemplateLeaf({
    id: "remove",
    description: getEditChannelsDesc("remove"),
    parameters: getEditChannelsParam("remove"),
} as const)

export const cmdEditChannelsRemoveDeleted = cmdGroupEditChannels.addSubTemplateLeaf({
    id: "remove-deleted",
    description: "Removes a channel that has been deleted but still remained as a claimable channel.",
    parameters: [
        new DjsTools.CmdParamString({
            required: true,
            name: "deleted-channel-id",
            description: "The string of numbers that appear on the display embed which refers to the deleted channel."
        } as const)
    ],
} as const)



export const cmdClaim = cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "claim",
    description: "Claims the current channel.",
    parameters: [
        new DjsTools.CmdParamString({
            required: true as const,
            name: "location",
            description: "The new location of this channel."
            // TODO move setLengthLimits to constructor args
        } as const).setLengthLimits(1, 100)
    ]
} as const)

export const cmdUnclaim = cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "unclaim",
    description: "Unclaims the current channel and marks it as free to use."
} as const)



export const cmdGroupEmbed = cmdGroupChannelClaiming.addSubTemplateGroup({
    id: "embed-display",
    description: "Embed display controls for channel claiming.",
    useCases: [Moderation.caseIsAdmin]
} as const)



// TODO update names
export const cmdSetEmbed = cmdGroupEmbed.addSubTemplateLeaf({
    id: "set",
    description: "Sets the channel where the embed display would go.",
    parameters: [
        new DjsTools.CmdParamChannel({
            required: true,
            name: "channel",
            description: "The channel where the embed message would display at.",
            validChannelTypes: [DjsTools.ChannelRestrict.Text]
        } as const)
    ]
} as const)

export const cmdUpdateEmbed = cmdGroupEmbed.addSubTemplateLeaf({
    id: "update",
    description: "Updates the embed display for claim channels."
})