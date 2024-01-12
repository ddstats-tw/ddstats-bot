import Database from "better-sqlite3"

/**
 * @type {Database.Database}
 */
export let master = undefined
export let points = undefined
export let ddnet = undefined

export default function dbInit() {
    /* load in db using better-sqlite3 */
    master = new Database("../scripts/db/master.db", { })
    points = new Database("../scripts/db/points.db", { })
    ddnet = new Database("../scripts/db/ddnet.sqlite", {})

    /* WAL mode */
    master.pragma("journal_mode = WAL")
    points.pragma("journal_mode = WAL")
    ddnet.pragma("journal_mode = WAL")

    /* Unsafe mode */
    master.unsafeMode()
    points.unsafeMode()
    ddnet.unsafeMode()

    console.log("Loaded in 'master.db'!")
    console.log("Loaded in 'points.db'!")
    console.log("Loaded in 'ddnet.sqlite'!")
}
