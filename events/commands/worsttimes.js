import { SlashCommandBuilder } from "discord.js"
import { ddnet } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"


const create = () => {
    const command = new SlashCommandBuilder()
        .setName("worsttimes")
        .setDescription("Shows finishes with worst times")
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

    await interaction.deferReply()
    if (!player && !interaction.options.getString("category")) {
        const mostRank1s = ddnet.prepare("SELECT race.map, race.name, ROUND(race.time/60/60/24, 2) FROM race AS race JOIN mapinfo AS mapinfo ON race.map = mapinfo.map WHERE mapinfo.BONUS = 0 ORDER BY time DESC LIMIT 25").all()

        return interaction.followUp({
            content: `Showing the worst times\`\`\`${formatTable(mostRank1s, ["Map", "Player", "Time (days)"])}\`\`\``,
            ephemeral: false,
        })
    }
    if (interaction.options.getString("category")) {
        const mostRank1s = ddnet.prepare("SELECT race.map, race.name, ROUND(race.time/60/60, 2) FROM race AS race JOIN mapinfo AS mapinfo ON race.map = mapinfo.map JOIN maps AS maps ON race.map = maps.map WHERE mapinfo.BONUS = 0 AND maps.server = ? ORDER BY time DESC LIMIT 25").all(interaction.options.getString("category"))

        return interaction.followUp({
            content: `Showing the worst times in the ${interaction.options.getString("category")} category\`\`\`${formatTable(mostRank1s, ["Map", "Player", "Time (hours)"])}\`\`\``,
            ephemeral: false,
        })
    }
    if (player) {
        const mostRank1s = ddnet.prepare("SELECT race.map, race.name, ROUND(race.time/60/60, 2) FROM race AS race JOIN mapinfo AS mapinfo ON race.map = mapinfo.map WHERE mapinfo.BONUS = 0 AND race.name = ? ORDER BY time DESC LIMIT 25").all(player)

        return interaction.followUp({
            content: `Showing the worst times for player, \`${player}\` \`\`\`${formatTable(mostRank1s, ["Map", "Player", "Time (hours)"])}\`\`\``,
            ephemeral: false,
        })
    }
}

export { create, invoke }
