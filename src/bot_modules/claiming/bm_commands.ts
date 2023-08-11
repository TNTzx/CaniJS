import * as DjsTools from "djs-tools"

import * as Moderation from "../moderation"



export const cmdGroupChannelClaiming = new DjsTools.CmdTemplateGroup({
    id: "cc",
    description: "RP channel claiming commands.",
    useScope: DjsTools.useScopeGuildOnly
} as const)



export const cmdEditChannels = cmdGroupChannelClaiming.addSubTemplateLeaf({
    id: "edit-channels",
    description: "Edits the channels able to be claimed.",
    parameters: [
        new DjsTools.CmdParamString({
            required: true,
            name: "action",
            description: "The action to do.",
            choiceManager: new DjsTools.ChoiceManager([
                DjsTools.createGenericChoice("add"),
                DjsTools.createGenericChoice("remove")
            ])
        } as const),
        new DjsTools.CmdParamChannel({
            required: true,
            name: "channel",
            description: "The channel to add / remove as a claimable channel.",
            validChannelTypes: [DjsTools.ChannelRestrict.Text]
        } as const)
    ] as const,
    useCases: [Moderation.caseIsAdmin]
})



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