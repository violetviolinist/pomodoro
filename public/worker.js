const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;
const EXTENSION_TIME = 5 * 60;

let savedStates = {
  WORKPLACE: {
    timeLeft: WORK_TIME,
    isRunning: false,
    isWorkSession: true,
    sessionCount: 0,
    controlButtonText: "Start",
  },
  personal: {
    timeLeft: WORK_TIME,
    isRunning: false,
    isWorkSession: true,
    sessionCount: 0,
    controlButtonText: "Start",
  }
}

let currentZone = "WORKPLACE"
let currentState = {
  timeLeft: WORK_TIME,
  isRunning: false,
  isWorkSession: true,
  sessionCount: 0,
  controlButtonText: "Start",
}

const postLogEntry = ({
  logType,
  zone
}) => {
  fetch('/log', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: logType,
      zone,
    })
  })
  .catch(error => {
    alert("Error logging session start.")
  });
}

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

function sendUpdateElementsMessage() {
  const timeAsString = getTimeAsString(currentState.timeLeft)
  const newSessionLabel = getSessionLabel({
    isWorkSession: currentState.isWorkSession,
    sessionCount: currentState.sessionCount,
    sessionsBeforeLongBreak: SESSIONS_BEFORE_LONG_BREAK,
  })

  postMessage({
    operation: "updateElements",
    data: {
      timeAsString,
      newSessionLabel,
      sessionCount: currentState.sessionCount,
      controlButtonText: currentState.controlButtonText,
    },
  })
}

function changeZone({ newZone }) {
  savedStates[currentZone] = currentState
  currentZone = newZone
  currentState = savedStates[currentZone]
}

function tick() {
  if (currentState.isRunning) {
    if (currentState.timeLeft > 0) {
      currentState.timeLeft--;
      if (currentState.isWorkSession && currentState.timeLeft === 30) {
        postMessage({
          operation: "notification",
          data: {
            text: "30 seconds left!",
          }
        })
      }
      if (currentState.timeLeft == 0) {
        postMessage({
          operation: "notification",
          data: {
            text: "Session ended!",
          }
        })
        skipToNextSession()
      } else {
        setTimeout(tick, 1000);
      }
    }
    sendUpdateElementsMessage()
  }
}

function startTimer() {
  if (!currentState.isRunning) {
    const logType = currentState.isWorkSession ? 'WORK_START' : 'BREAK_START';
    postLogEntry({
      logType,
      zone: currentZone,
    })
  }
  currentState.isRunning = true;
  tick();
}

function stopTimer() {
  if (currentState.isRunning) {
    const logType = currentState.isWorkSession ? 'WORK_STOP' : 'BREAK_STOP';
    postLogEntry({
      logType,
      zone: currentZone,
    })
  }
  currentState.isRunning = false;
}

function skipToNextSession() {
    stopTimer()
    if (currentState.isWorkSession) {
        currentState.sessionCount++;
        currentState.isWorkSession = false;
        if (currentState.sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0) {
            currentState.timeLeft = LONG_BREAK_TIME;
        } else {
            currentState.timeLeft = SHORT_BREAK_TIME;
        }
    } else {
        currentState.isWorkSession = true;
        currentState.timeLeft = WORK_TIME;
    }
    currentState.controlButtonText = "Start"
}

function resetTimer() {
  stopTimer()
  currentState.controlButtonText = "Start"
  currentState.isWorkSession = true;
  currentState.sessionCount = 0;
  currentState.timeLeft = WORK_TIME;
  currentState.isRunning = false;
}

function extendTimer() {
  currentState.timeLeft += EXTENSION_TIME;
}

function doControlButtonClick() {
  if (currentState.timeLeft > 0) {
    if (currentState.isRunning) {
      stopTimer()
      currentState.controlButtonText = "Resume"
    } else {
      startTimer()
      currentState.controlButtonText = "Pause"
    }
  }
}

onmessage = (msg) => {
  const { operation, data } = msg.data;

  if (operation === "skipToNextSession") {
    skipToNextSession()
  } else if (operation === "resetTimer") {
    resetTimer()
  } else if (operation === "extendTimer") {
    extendTimer()
  } else if (operation === "controlButtonClick") {
    doControlButtonClick()
  } else if (operation === "changeZone") {
    changeZone(data)
  }
  
  sendUpdateElementsMessage()
}

sendUpdateElementsMessage()
