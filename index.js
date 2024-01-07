import dotenv from "dotenv"
import botInit from "./libs/bot.js"
import dbInit from "./libs/database.js"

dotenv.config()

dbInit()
botInit()