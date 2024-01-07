import { SlashCommandBuilder } from "discord.js"
import { playtime } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("playtime")
        .setDescription("Shows various statistics about a player.")
        .addStringOption((option) =>
            option
                .setName("player").setDescription("Which player?")
                .setRequired(true)
        )

    return command.toJSON()
}

const invoke = async (interaction) => {
    const player = interaction.options.getString("player")

    await interaction.deferReply()
    const mostPlayedMaps = playtime.prepare("SELECT Map, SUM(time)/60/60 FROM record_playtime WHERE player = ? GROUP BY map ORDER BY sum(time) DESC LIMIT 15").all(player)
    const totalPlaytime = playtime.prepare("SELECT SUM(time)/60/60 FROM record_playtime WHERE player = ?").all(player)
    const mostPlayedCategories = playtime.prepare("SELECT b.Server, SUM(a.time)/60/60 FROM record_playtime AS a JOIN record_maps AS b ON a.map = b.map WHERE player = ? GROUP BY b.Server ORDER BY SUM(a.time) DESC").all(player)

    if(!mostPlayedMaps.length)
        return await interaction.followUp({
            content: "Player not found"
        })

    interaction.followUp({
        content: `Showing overall playtime for player, \`${interaction.options.getString("player")}\` \`\`\`
${formatTable(mostPlayedMaps, ["Map", "Playtime (hours)"])}\n
${formatTable(mostPlayedCategories, ["Category", "Playtime (hours)"])}\n
${formatTable(totalPlaytime, ["Total Playtime (hours)"])}\`\`\``,
        ephemeral: false,
    })
}

export { create, invoke }
