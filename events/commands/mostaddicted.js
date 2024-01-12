import { SlashCommandBuilder } from "discord.js"
import { master } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("mostaddicted")
        .setDescription("Shows the top players for most playtime on a given map.")
        .addStringOption((option) =>
            option
                .setName("map").setDescription("Which map?")
                .setRequired(true)
        )

    return command.toJSON()
}

const invoke = async (interaction) => {
    const map = interaction.options.getString("map")

    console.log(map)

    await interaction.deferReply()
    const mostAddicted = master.prepare("SELECT name as Player, SUM(time)/60/60 AS 'Playtime (hours)' FROM record_snapshot WHERE map = ? AND name NOT IN ('nameless tee', '(connecting)') GROUP BY name ORDER BY SUM(time) DESC LIMIT 15").all(map)

    if(!mostAddicted.length)
        return await interaction.followUp({
            content: "Map not found"
        })

    interaction.followUp({
        content: `Showing top playtime for map, \`${map}\` \`\`\`
${formatTable(mostAddicted, ["Player", "Total Playtime (hours)"])}\`\`\``,
        ephemeral: false,
    })
}

export { create, invoke }
