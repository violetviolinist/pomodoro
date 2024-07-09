const express = require("express")
const { appendFile } = require("fs/promises")
const path = require("path")
const router = express.Router()

const logFilePath = path.join(__dirname, "../workStats.log")

router.post("/", async (req, res, next) => {
  const newLogEntry = `${req.body.type}:${Date.now()}\n`

  await appendFile(logFilePath, newLogEntry)

  res.status(200).send("ok")
})

module.exports = router