import { SlashCommandBuilder } from "discord.js"
import { ddnet } from "../../libs/database.js"
import { getRank1Servers } from "../../libs/helpers.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("rank1s")
        .setDescription("Shows the amount of rank1s of a player or the top in a certain category")
        .addStringOption((option) =>
            option
                .setName("player").setDescription("Which player?")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("category").setDescription("Which category?")
                .addChoices(
                    { name: "Novice", value: "Novice" },
                    { name: "Moderate", value: "Moderate" },
                    { name: "Brutal", value: "Brutal" },
                    { name: "Insane", value: "Insane" },
                    { name: "Dummy", value: "Dummy" },
                    { name: "DDmaX.Easy", value: "DDmaX.Easy" },
                    { name: "DDmaX.Next", value: "DDmaX.Next" },
                    { name: "DDmaX.Pro", value: "DDmaX.Pro" },
                    { name: "DDmaX.Nut", value: "DDmaX.Nut" },
                    { name: "Oldschool", value: "Oldschool" },
                    { name: "Solo", value: "Solo" },
                    { name: "Race", value: "Race" },
                    { name: "Fun", value: "Fun" }
                )
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("sortby").setDescription("Which column to sort by?")
                .addChoices(
                    { name: "Date", value: "rankings.timestamp" },
                    { name: "category", value: "maps.server" },
                    { name: "Map", value: "rankings.map" },
                    { name: "Time", value: "rankings.time" },
                )
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("order").setDescription("Sorted by ascending order or descending order?")
                .addChoices(
                    { name: "Ascending", value: "ASC" },
                    { name: "Descending", value: "DESC" }
                )
                .setRequired(false)
        )
        .addBooleanOption((option) =>
            option
                .setName("includeteammates").setDescription("Include teammates in output?")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("region").setDescription("Which region?")
                .addChoices(...getRank1Servers())
                .setRequired(false)
        )

    return command.toJSON()
}

const invoke = async (interaction) => {
    const player = interaction.options.getString("player") ?? "%"
    const sortby = interaction.options.getString("sortby") ?? "time"
    const order = interaction.options.getString("order") ?? "ASC"
    const category = interaction.options.getString("category") ?? "%"
    const region = interaction.options.getString("region") ?? "%"
    const includeTeammates = interaction.options.getBoolean("includeteammates") ?? false
    const isSolo = ["Solo", "Race", "Dummy"].includes(category) ? true : false

    await interaction.deferReply()

    const allRank1s = ddnet.prepare(`
    SELECT rankings.timestamp, maps.server as category, rankings.name, rankings.map, strftime('%M:%f', time/86400.0), rankings.server FROM rankings AS rankings
        JOIN maps AS maps ON rankings.map = maps.map WHERE
        rank = 1 AND name = ? AND rankings.server LIKE ? AND maps.server IN ('Solo', 'Dummy', 'Race') ORDER BY ${sortby} ${order}`)
        .all(player, region == "UNK" ? "" : region)

    const allTeamRank1s = ddnet.prepare(`
        SELECT rankings.timestamp, maps.server as category, rankings.name, rankings.map, strftime('%M:%f', time/86400.0), rankings.server FROM ${isSolo ? "rankings" : "teamrankings"} AS rankings
            JOIN maps AS maps ON rankings.map = maps.map
            WHERE ${!isSolo ? "id IN (SELECT id FROM teamrankings WHERE rank = 1 AND name LIKE ?) AND" : ""}
            rank = 1 ${isSolo ? "AND name LIKE ?" : ""} AND rankings.server LIKE ? AND maps.server LIKE ? AND NAME LIKE ? ORDER BY ${sortby} ${order}`)
        .all(player, region == "UNK" ? "" : region, category, includeTeammates ? "%" : player)

    const msg = `${allTeamRank1s.length ? formatTable(allTeamRank1s, ["Date", "Category", "Player", "Map", "Time", "Region"]) : ""}${player != "%" && allRank1s.length ? formatTable(allRank1s, ["Date", "Category", "Player", "Map", "Time", "Region"]) : ""}`
    const title = `Showing all rank1s ${player != "%" ? `by player, \`${player}\`` : ""} ${category != "%" ? `in category ${category}` : ""}`

    if(!allRank1s.length && !allTeamRank1s.length) {
        return await interaction.followUp({
            content: "Found no rank1s"
        })
    }
    if(msg.length >= 1700) {
        return interaction.followUp({
            content: `${title}`,
            files: [{ attachment: Buffer.from(msg), name: "teamrank1s.txt" }],
            ephemeral: false,
        })
    }
    else {
        return interaction.followUp({
            content: `${title} \`\`\`${msg}\`\`\``,
            ephemeral: false,
        })
    }
}

export { create, invoke }