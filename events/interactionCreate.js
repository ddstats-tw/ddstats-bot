const once = false
const name = "interactionCreate"

async function invoke(interaction) {
    // Check if the interaction is a command and call the invoke method in the corresponding file
    // The #commands ES6 import-abbreviation is defined in the package.json
    if (interaction.isChatInputCommand()) {
        await (await import(`#commands/${interaction.commandName}`)).invoke(interaction)

        let args = ""
        for(const arg of interaction.options._hoistedOptions) {
            args += `${arg.name}: "${arg.value}" `
        }

        console.log(`${interaction.createdAt.toLocaleString("sv-SE")} - ${interaction.user.tag} (${interaction.guild ? interaction.guild.name : "DMs"}) ran command /${interaction.commandName} ${args}`)
    }
}

export { once, name, invoke }
