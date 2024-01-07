import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import { SlashCommandBuilder } from "discord.js"
import { points } from "../../libs/database.js"


const create = () => {
    const command = new SlashCommandBuilder()
        .setName("rankedpoints")
        .setDescription("Shows a graph of your historial rank/team points")
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

    const rankedPoints = points.prepare(`
        SELECT rankpoints AS y,
               teampoints AS y2,
               date as x
        FROM   rankedpoints
        WHERE  player = ?
        ORDER BY date
    `).all(player)

    if (!rankedPoints.length)
        return await interaction.followUp({
            content: "Player has not collected any ranked points"
        })

    const width = 900
    const height = 400
    const backgroundColour = "white"
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour, plugins: {
            globalVariableLegacy: ["chartjs-adapter-moment"],
            modern: ["chartjs-plugin-datalabels"]
        }
    })
    const configuration = {
        type: "line",
        data: {
            datasets: [{
                label: "Rank Points",
                data: rankedPoints,
                fill: false,
                borderColor: "#4C9CEF",
                tension: 0,
                pointRadius: 0
            },
            {
                label: "Team Points",
                data: rankedPoints,
                fill: false,
                borderColor: "#EF5255",
                tension: 0,
                pointRadius: 0,
                parsing: {
                    yAxisKey: "y2"
                }
            }
            ]

        },
        options: {
            scales: {
                x: {
                    grid: {
                        color: "#A0A0BF"
                    },
                    ticks: {
                        font: {
                            weight: "bold",
                            size: 20,
                        }
                    },
                    type: "time",
                    time: {
                        unit: "year"
                    }
                },
                y: {
                    suggestedMax: 250,
                    grid: {
                        color: (line) => (line.index === 0 ? "rgba(0, 0, 0, 0)" : "#A0A0BF")
                    },
                    ticks: {
                        callback: function (value) {
                            return formatNumber(value)
                        },
                        font: {
                            size: 20,
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 25,
                    right: 80,
                    down: 10,
                    up: 20,
                }
            },
            plugins: {
                datalabels: {
                    formatter: function (value, context) {
                        if (context.dataIndex === context.dataset.data.length - 1) {
                            if(context.dataset.parsing) {
                                return formatNumber(value[context.dataset.parsing.yAxisKey])
                            }
                            return formatNumber(value.y)
                        }
                        return ""
                    },
                    align: "right",
                    offset: 2,
                    font: {
                        weight: "bold",
                        size: 20,
                    },
                },
                title: {
                    display: true,
                    align: "start",
                    text: player,
                    padding: {
                        top: 0,
                        bottom: 0
                    },
                    font: {
                        weight: "bold",
                        size: 30,
                    },
                }
            }
        }
    }
    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration)
    interaction.followUp({
        files: [{ attachment: buffer }],
        ephemeral: false,
    })
}

/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === "undefined" || +exp === 0) {
        return Math[type](value)
    }
    value = +value
    exp = +exp
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
        return NaN
    }
    // Shift
    value = value.toString().split("e")
    value = Math[type](+(value[0] + "e" + (value[1] ? (+value[1] - exp) : -exp)))
    // Shift back
    value = value.toString().split("e")
    return +(value[0] + "e" + (value[1] ? (+value[1] + exp) : exp))
}
  
// Decimal floor
const floor10 = (value, exp) => decimalAdjust("floor", value, exp)

function formatNumber(value) {
    if (value >= 1000000000 || value <= -1000000000) {
        return value / 1e9 + "B"
    } else if (value >= 1000000 || value <= -1000000) {
        return value / 1e6 + "M"
    } else if (value >= 1000 || value <= -1000) {
        return floor10(value / 1e3, -1) + "K"
    }
    return value
}

export { create, invoke }
