import * as CmdTemplates from "./templates"



const registeredCmdTemplateMap: Map<string, CmdTemplates.CmdTemplateType> = new Map()
export function registerCmdTemplate(cmdTemplate: CmdTemplates.CmdTemplateType) {
    if (registeredCmdTemplateMap.has(cmdTemplate.id)) throw new Error(`Command ${cmdTemplate} already registered.`)

    registeredCmdTemplateMap.set(cmdTemplate.id, cmdTemplate)
}

export function registerAllCmdTemplates(cmdTemplates: (CmdTemplates.CmdTemplateType)[]) {
    for (const cmdTemplate of cmdTemplates) registerCmdTemplate(cmdTemplate)
}

export function getRegisteredCmdTemplateMap() {
    return registeredCmdTemplateMap
}

export function getCmdTemplate(id: string) {
    return registeredCmdTemplateMap.get(id)
}