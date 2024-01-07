import { SlashCommandBuilder } from "discord.js"
import { ddnet } from "../../libs/database.js"
import { formatTable } from "../../libs/table.js"


const create = () => {
    const command = new SlashCommandBuilder()
        .setName("teampartners")
        .setDescription("Shows who you have made the most teamranks with.")
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
        const favouritePartners = ddnet.prepare("select r.Name, count(r.Name) from (select Name, ID from teamrace where Name = ?) as l inner join (select ID, Name from teamrace) as r on l.ID = r.ID and l.Name != r.Name group by r.Name order by count(r.Name) desc")
            .all(player)

        const msg = formatTable(favouritePartners, ["Player", "Teamranks"])

        if(!favouritePartners.length) {
            return await interaction.followUp({
                content: "Player has no teamranks"
            })
        }
        if(msg.length >= 2000) {
            return interaction.followUp({
                content: `Showing favourite partners for teamranks for player, \`${player}\``,
                files: [{ attachment: Buffer.from(msg), name: "team-partners.txt" }],
                ephemeral: false,
            })
        }
        else {
            return interaction.followUp({
                content: `Showing favourite partners for teamranks for player, \`${player}\` \`\`\`${msg}\`\`\``,
                ephemeral: false,
            })
        }  
    }
}

export { create, invoke }