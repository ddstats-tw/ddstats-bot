import { SlashCommandBuilder } from "discord.js"
import { ddnet } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"

const create = () => {
    const command = new SlashCommandBuilder()
        .setName("rank1partners")
        .setDescription("Shows who you have made the most teamrank1s with.")
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

    if (player) {
        const favouritePartners = ddnet.prepare(`
            SELECT NAME, Count(*)
            FROM   teamrace
            WHERE  id IN (SELECT besttime.id
                        FROM   teamrace AS records
                                JOIN (SELECT id,
                                            rank1s.map,
                                            Min(time) AS time
                                        FROM   teamrace AS rank1s
                                            JOIN maps AS maps
                                                ON maps.map = rank1s.map
                                        GROUP  BY rank1s.map) AS besttime
                                    ON records.map = besttime.map
                        WHERE  records.time = besttime.time
                                AND records.NAME = ?
                        GROUP  BY records.map,
                                    NAME)
                    AND NAME != ?
            GROUP  BY NAME
            ORDER  BY Count(*) DESC `)
            .all(player, player)

        return interaction.followUp({
            content: `Showing favourite partners for teamrank1s for player, \`${player}\` \`\`\`${formatTable(favouritePartners, ["Player", "Rank 1s"])}\`\`\``,
            ephemeral: false,
        })
    }
}

export { create, invoke }