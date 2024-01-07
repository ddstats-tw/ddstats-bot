import Database from "better-sqlite3"

/**
 * @type {Database.Database}
 */
export let playtime = undefined
export let points = undefined
export let ddnet = undefined

export default function dbInit() {
    /* load in db using better-sqlite3 */
    playtime = new Database("../scripts/db/playtime.db", { })
    points = new Database("../scripts/db/points.db", { })
    ddnet = new Database("../scripts/db/ddnet.sqlite", {})

    /* WAL mode */
    playtime.pragma("journal_mode = WAL")
    points.pragma("journal_mode = WAL")
    ddnet.pragma("journal_mode = WAL")

    /* Unsafe mode */
    playtime.unsafeMode()
    points.unsafeMode()
    ddnet.unsafeMode()

    console.log("Loaded in 'playtime.db'!")
    console.log("Loaded in 'points.db'!")
    console.log("Loaded in 'ddnet.sqlite'!")
}
