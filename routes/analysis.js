const express = require("express")
const path = require("path")
const router = express.Router()

router.get("/", async (req, res, next) => {
  res.type("html")
  res.sendFile(path.join(__dirname, "../public/analysis.html"))
})

module.exports = router
