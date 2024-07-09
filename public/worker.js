const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;
const EXTENSION_TIME = 5 * 60;

let timeLeft = WORK_TIME;
let isRunning = false;
let isWorkSession = true;
let sessionCount = 0;
let controlButtonText = "Start"

const getTimeAsString = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeAsString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return timeAsString
}

function getSessionLabel({
  isWorkSession,
  sessionCount,
  sessionsBeforeLongBreak,
}) {
  let sessionLabel = isWorkSession ? "Work Session" : "Short Break";
  if (!isWorkSession && sessionCount % sessionsBeforeLongBreak === 0) {
    sessionLabel = "Long Break";
  }
  return sessionLabel
}

function tick() {
  if (isRunning) {
    if (timeLeft > 0) {
      timeLeft--;
      if (timeLeft == 0) {
        postMessage({
          operation: "notification",
          text: "Session ended!",
        })
        skipToNextSession()
      } else {
        setTimeout(tick, 1000);
      }
    }
    postMessage({
      operation: "updateElements",
      data: {
        timeAsString: getTimeAsString(timeLeft),
        newSessionLabel: getSessionLabel({
          isWorkSession,
          sessionCount,
          sessionsBeforeLongBreak: SESSIONS_BEFORE_LONG_BREAK,
        }),
        sessionCount,
        controlButtonText,
      },
    })
  }
}

function startTimer() {
  isRunning = true;
  tick();
}

function stopTimer() {
  isRunning = false;
}

function skipToNextSession() {
    if (isWorkSession) {
        sessionCount++;
        isWorkSession = false;
        if (sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
            timeLeft = LONG_BREAK_TIME;
        } else {
            timeLeft = SHORT_BREAK_TIME;
        }
    } else {
        isWorkSession = true;
        timeLeft = WORK_TIME;
    }
    stopTimer()
    controlButtonText = "Start"
}

function resetTimer() {
  stopTimer()
  controlButtonText = "Start"
  isWorkSession = true;
  sessionCount = 0;
  timeLeft = WORK_TIME;
  isRunning = false;
}

function extendTimer() {
  timeLeft += EXTENSION_TIME;
}

function doControlButtonClick() {
  if (timeLeft > 0) {
    if (isRunning) {
      stopTimer()
      controlButtonText = "Resume"
    } else {
      startTimer()
      controlButtonText = "Pause"
    }
  }
}

onmessage = (msg) => {
  const { operation } = msg.data;

  if (operation === "skipToNextSession") {
    skipToNextSession()
  } else if (operation === "resetTimer") {
    resetTimer()
  } else if (operation === "extendTimer") {
    extendTimer()
  } else if (operation === "controlButtonClick") {
    doControlButtonClick()
  }

  const timeAsString = getTimeAsString(timeLeft)
  const newSessionLabel = getSessionLabel({
    isWorkSession,
    sessionCount,
    sessionsBeforeLongBreak: SESSIONS_BEFORE_LONG_BREAK,
  })

  postMessage({
    operation: "updateElements",
    data: {
      timeAsString,
      newSessionLabel,
      sessionCount,
      controlButtonText,
    },
  })
}
