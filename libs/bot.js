import { Client, GatewayIntentBits } from "discord.js"
import fs from "fs"

/**
 * @type {Client}
 */
export let client = undefined

export default async function botInit() {
    for(const token of process.env.DISCORD_TOKEN.split(";")) {
        client = new Client({ intents: [GatewayIntentBits.Guilds] })

        const events = fs
            .readdirSync("./events")
            .filter((file) => file.endsWith(".js"))

        for (let event of events) {
            const eventFile = await import(`#events/${event}`)

            if (eventFile.once)
                client.once(eventFile.name, (...args) => { eventFile.invoke(...args) })
            else
                client.on(eventFile.name, (...args) => { eventFile.invoke(...args) })
        }

        // Log in to Discord with your client's token
        client.login(token)
    }
}
