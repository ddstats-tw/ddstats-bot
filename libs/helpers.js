import { ddnet } from "./database.js"

export function getRank1Servers() {
    const servers = ddnet.prepare("SELECT server FROM rankings WHERE rank = 1 GROUP BY server").all()

    let regions = []
    for (const server of servers) {
        if(server.Server == "")
            regions.push({ name: "Unknown", value: "UNK"})
        else
            regions.push({ name: server.Server, value: server.Server})
    }
    return regions
}