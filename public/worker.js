const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;
const EXTENSION_TIME = 5 * 60;

let timeLeft = WORK_TIME;
let isRunning = false;
let isWorkSession = true;
let sessionCount = 0;

const getTimeAsString = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeAsString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return timeAsString
}

function tick() {
  if (isRunning) {
    if (timeLeft > 0) {
      timeLeft--;
      postMessage({
        operation: "updateDisplay",
        data: {
          timeAsString: getTimeAsString(timeLeft),
        },
      })
      if (timeLeft == 0) {
        endSession()
      } else {
        setTimeout(tick, 1000);
      }
    }
  }
}

function startTimer() {
    isRunning = true;
    tick();
}

function stopTimer() {
    isRunning = false;
}

function endSession() {
    isRunning = false;
    postMessage({
      operation: "endSessionAck",
      data: {
        timeAsString: getTimeAsString(timeLeft),
      },
    })
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
    endSession()
}

function resetTimer() {
  stopTimer();
  isWorkSession = true;
  sessionCount = 0;
  timeLeft = WORK_TIME;
  isRunning = false;
}

function extendTimer() {
  timeLeft += EXTENSION_TIME;
}

function playOrResume() {
  if (timeLeft > 0) {
    if (isRunning) {
      stopTimer()
      postMessage({
        operation: "setMainButton",
        data: {
          str: "Resume",
        },
      })
    } else {
        startTimer()
        postMessage({
          operation: "setMainButton",
          data: {
            str: "Pause",
          },
        })
    }
  }
}

postMessage({
  operation: "updateDisplay",
  data: {
    timeAsString: getTimeAsString(timeLeft),
  },
})

onmessage = (msg) => {
  const { data, operation } = msg.data;

  if (operation === "skipToNextSession") {
    skipToNextSession()
    postMessage({
      operation: "skipToNextSessionAck",
      data: {
        timeAsString: getTimeAsString(timeLeft),
        sessionCount,
        isWorkSession,
      },
    })
  } else if (operation === "resetTimer") {
    resetTimer()
    postMessage({
      operation: "resetTimerAck",
      data: {
        timeAsString: getTimeAsString(timeLeft)
      },
    })
  } else if (operation === "extendTimer") {
    extendTimer()
    postMessage({
      operation: "extendTimerAck",
      data: {
        timeAsString: getTimeAsString(timeLeft),
      },
    })
  } else if (operation === "play/resume") {
    playOrResume()
  }
}
