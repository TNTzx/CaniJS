import * as DjsTools from "djs-tools"



export const cmdSetAdmin = new DjsTools.CmdTemplateLeaf({
    id: "set-admin",
    description: "Sets the admin role for this server.",
    useScope: DjsTools.useScopeGuildOnly,
    parameters: [
        new DjsTools.CmdParamRole({
            required: true,
            name: "admin-role",
            description: "The new admin role."
        } as const)
    ],
    useCases: [DjsTools.caseServerOwner]
} as const)