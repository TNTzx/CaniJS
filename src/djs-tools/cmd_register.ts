import Djs from "discord.js"

export type CmdInfo = {
    data: Djs.SlashCommandBuilder,
    execute: (interaction: any) => Promise<void>
}

const registeredCmds: CmdInfo[] = [];
export default function addRegisteredCmd(cmdInfo: CmdInfo) {
    registeredCmds.push(cmdInfo);
}
export function getRegisteredCmds() {
    return registeredCmds;
}




