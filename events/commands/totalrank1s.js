import { SlashCommandBuilder } from "discord.js"
import { ddnet } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("totalrank1s")
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
    return command.toJSON()
}

const invoke = async (interaction) => {
    const player = interaction.options.getString("player")
    const category = interaction.options.getString("category")

    await interaction.deferReply()
    if (!player && !category) {
        const mostRank1s = ddnet.prepare(`
            SELECT teamrank1s.name, IFNULL(COUNT(*), 0), IFNULL(rank1s.rank1s, 0)
            FROM   teamrankings AS teamrank1s
                LEFT JOIN (SELECT name,
                                    Count(*)    AS rank1s
                            FROM   rankings AS rank1s
                            WHERE  rank = 1
                            GROUP  BY name) AS rank1s
                        ON teamrank1s.name = rank1s.name
                        WHERE rank = 1
            GROUP  BY teamrank1s.name ORDER  BY COUNT(*) DESC LIMIT 30;
        `)
            .all()

        return interaction.followUp({
            content: `Showing the leaderboard for most rank1s\`\`\`${formatTable(mostRank1s, ["Player", "Teamrank 1s", "Rank 1s"])}\`\`\``,
            ephemeral: false,
        })
    }
    if (category) {
        const isSolo = ["Solo", "Race", "Dummy"].includes(category) ? true : false

        const mostRank1s = ddnet.prepare(`
            SELECT rank1s.name, COUNT(*)
            FROM   ${isSolo ? "rankings" : "teamrankings"}  AS rank1s
                JOIN maps AS maps ON maps.map = rank1s.map
                WHERE rank = 1 AND maps.server = ?
            GROUP  BY rank1s.name ORDER  BY COUNT(*) DESC LIMIT 25;
        `).all(category)

        return interaction.followUp({
            content: `Showing the leaderboard for most ${isSolo ? "rank1s" : "teamranks"} in the ${category} category\`\`\`${formatTable(mostRank1s, ["Player", isSolo ? "Rank 1s" : "Teamrank 1s"])}\`\`\``,
            ephemeral: false,
        })
    }
    if (player) {
        const teamRanked = ddnet.prepare(`
            SELECT maps.server, IFNULL(rank1s.rank1s, 0), IFNULL(rank1s.rank1s, 0)*25
            FROM   teamrankings AS ranks
                JOIN maps AS maps
                    ON ranks.map = maps.map
                LEFT JOIN (SELECT maps.server AS server,
                                    Count(*)    AS rank1s
                            FROM   teamrankings AS rank1s
                                    JOIN maps AS maps
                                    ON maps.map = rank1s.map
                            WHERE  rank = 1
                                    AND NAME = ?
                            GROUP  BY maps.server) AS rank1s
                        ON rank1s.server = maps.server
            WHERE  NAME = ?
            GROUP  BY maps.server ORDER  BY rank1s.rank1s DESC`)
            .all(player, player)

        const soloRanked = ddnet.prepare(`
            SELECT maps.server, IFNULL(rank1s.rank1s, 0), IFNULL(rank1s.rank1s, 0)*25
            FROM   rankings AS ranks
                JOIN maps AS maps
                    ON ranks.map = maps.map
                LEFT JOIN (SELECT maps.server AS server,
                                    Count(*)    AS rank1s
                            FROM    rankings AS rank1s
                                    JOIN maps AS maps
                                    ON maps.map = rank1s.map
                            WHERE  rank = 1 AND name = ?
                            GROUP  BY maps.server) AS rank1s
                        ON rank1s.server = maps.server
            WHERE  name = ?
            GROUP  BY maps.server ORDER  BY rank1s.rank1s DESC`)
            .all(player, player)

        const placementSplit = ddnet.prepare(`
            SELECT rank, COUNT(*), SUM(points)
            FROM (
                SELECT min(teamrankings.rank) as rank, SUM(rankpoints.points) as points
                    FROM teamrankings
                    JOIN rankpoints ON teamrankings.rank = rankpoints.rank
                WHERE name = ?
                GROUP BY map)
            GROUP BY rank;
            `)
            .all(player)

        return interaction.followUp({
            content: `Showing total rank1s and rankedpoints for player, \`${player}\` \`\`\`${formatTable(teamRanked, ["Category", "Teamrank 1s", "Team Points"])}
\n${formatTable(soloRanked, ["Category", "Rank 1s", "Rank Points"])}\n
${formatTable(placementSplit, ["Rank", "Amount", "Team Points"])}\`\`\``,
            ephemeral: false,
        })
    }
}

export { create, invoke }
