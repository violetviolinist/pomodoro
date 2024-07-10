const express = require("express")
const { appendFile, readFile, readdir,  } = require("fs/promises")
const { DateTime, Duration } = require("luxon")
const path = require("path")
const router = express.Router()
const workLogsDir = path.join(__dirname, "../workLogs")

const readLogsFromFile = async (filePath) => {
  const content = await readFile(filePath, 'utf-8');
  const logs = (
    content
    .split('\n')
    .filter(line => line)
    .map(line => {
      const [type, timestamp] = line.split(':');
      return { type, timestamp: parseInt(timestamp) };
    })
  )
  return logs;
};

const processLogs = (logs, date) => {
  const sessions = [];
  let currentSession = null;

  logs.forEach(log => {
    if (log.type.startsWith('WORK_START') || log.type.startsWith('BREAK_START')) {
      currentSession = { type: log.type.split('_')[0].toLowerCase(), start: log.timestamp, end: null };
    } else if ((log.type.startsWith('WORK_STOP') || log.type.startsWith('BREAK_STOP')) && currentSession) {
      currentSession.end = log.timestamp;
      sessions.push(currentSession);
      currentSession = null;
    }
  });

  return { date, sessions };
};

router.get("/", async (req, res, next) => {
  const processedData = [];
  
  const files = await readdir(workLogsDir)
  for (const file of files) {
    const filePath = path.join(workLogsDir, file)
    const logs = await readLogsFromFile(filePath)
    const date = DateTime.fromFormat(file.replace('.log', ''), 'yyyy_LL_dd').toFormat('yyyy-LL-dd')
    processedData.push(processLogs(logs, date))
  }

  res.json(processedData);
})

router.post("/", async (req, res, next) => {
  const todayAsString = DateTime.now().setZone("UTC+5:30").toFormat("yyyy_LL_dd")
  const logFilePath = path.join(__dirname, `../workLogs/${todayAsString}.log`)

  const newLogEntry = `${req.body.type}:${Date.now()}\n`

  await appendFile(logFilePath, newLogEntry)

  res.status(200).send("ok")
})

module.exports = router
