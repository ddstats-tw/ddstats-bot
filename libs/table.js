
function createTable(data) {
    const MARGIN_RIGHT = 2

    let result = ""
    let values = []
    let longest = []

    // Find the longest string in each column
    for (const row of data) {
        let columnIndex = 0
        for (const column in row) {
            if (longest[columnIndex] === undefined)
                longest[columnIndex] = 0
            if (values[columnIndex] === undefined)
                values[columnIndex] = []

            if (row[column].length > longest[columnIndex])
                longest[columnIndex] = row[column].toString().length

            values[columnIndex].push(row[column].toString())
            columnIndex++
        }
    }

    for (let column = 0; column < values[0].length; column++) {
        for (let row = 0; row < values.length; row++) {
            values[row][column] += " ".repeat(longest[row] - values[row][column].length + MARGIN_RIGHT)
            result += values[row][column]
        }
        // Last line shouldn't be a new line
        if (column != values[0].length - 1)
            result += "\n"
    }
    return result
}

export function formatTable(object, header) {
    if (header === undefined)
        header = Object.keys(object[0])

    const rows = object.map(object => Object.values(object))
    rows.unshift(header)

    // Create a seperator between rows and header
    let seperator = []
    for (let i = 0; i < rows[0].length; i++) {
        seperator.push("-".repeat(Math.max(...(rows.map(el => String(el[i]).length)))))
    }
    rows.splice(1, 0, seperator)

    return createTable(rows)
}

export default {
    formatTable
}
