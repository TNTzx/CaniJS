import * as CmdTemplates from "./templates"



const registeredCmdTemplateMap: Map<string, CmdTemplates.CmdTemplateType> = new Map()
export function registerCmdTemplate<CmdTemplateT>(cmdTemplate: CmdTemplateT) {
    const typedCmdTemplate = cmdTemplate as CmdTemplates.CmdTemplateType
    if (registeredCmdTemplateMap.has(typedCmdTemplate.id)) throw new Error(`Command ${cmdTemplate} already registered.`)

    registeredCmdTemplateMap.set(typedCmdTemplate.id, typedCmdTemplate)
}

export function registerAllCmdTemplates<CmdTemplateT>(cmdTemplates: (CmdTemplateT)[]) {
    for (const cmdTemplate of cmdTemplates) registerCmdTemplate(cmdTemplate)
}

export function getRegisteredCmdTemplateMap() {
    return registeredCmdTemplateMap
}

export function getCmdTemplate(id: string) {
    return registeredCmdTemplateMap.get(id)
}