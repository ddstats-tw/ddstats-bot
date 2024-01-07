import { SlashCommandBuilder } from "discord.js"
import { points } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Shows the current ranked points leaderboard or at a certain date.")
        .addStringOption((option) =>
            option
                .setName("date").setDescription("Which date? (format: 2022-12-24)")
                .setRequired(false)
        )

    return command.toJSON()
}

const invoke = async (interaction) => {
    const lastUpdate = points.prepare("SELECT max(date) as max FROM rankedpoints").get()
    const date = interaction.options.getString("date") ?? lastUpdate.max

    await interaction.deferReply()
    const rankPoints = points.prepare(`
        SELECT RANK() OVER (ORDER BY rankpoints DESC) rank, 
            player, 
            rankpoints
        FROM rankedpoints 
        WHERE date = ? 
        ORDER BY rankpoints DESC 
        LIMIT 20;
    `).all(date)

    const teamPoints = points.prepare(`
        SELECT RANK() OVER (ORDER BY teampoints DESC) rank, 
            player, 
            teampoints
        FROM rankedpoints 
        WHERE date = ?
        ORDER BY teampoints DESC 
        LIMIT 20;
    `).all(date)

    if(!rankPoints.length) {
        return interaction.followUp({
            content: `No data, invalid date. Please choose a date between 2013-07-19 - ${lastUpdate.max}`,
            ephemeral: false,
        })
    }

    interaction.followUp({
        content: `Showing leaderboard during \`${date}\` \`\`\`
${formatTable(rankPoints, ["Rank", "Player", "Rank points"])}
${formatTable(teamPoints, ["Rank", "Player", "Team points"])}\`\`\``,
        ephemeral: false,
    })
}

export { create, invoke }
