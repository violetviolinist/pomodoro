const SESSIONS_BEFORE_LONG_BREAK = 4

$(document).ready(function() {
  const timerDisplay = $('#timer');
  const statusDisplay = $('#status');
  const toggleBtn = $('#toggleBtn');
  const resetBtn = $('#resetBtn');
  const nextSessionBtn = $('#nextSessionBtn');
  const extendBtn = $('#extendBtn');
  const enableNotifsBtn = $('#enableNotifsBtn');
  const sessionCountDisplay = $('#sessionCount');

  const worker = new Worker("/worker.js")

  function askNotificationPermission() {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      alert("success")
    });
  }

  function updateDisplay(timeAsString) {
    timerDisplay.text(timeAsString);
    updateTitle(timeAsString)
  }

  function updateStatus(isWorkSession) {
      if (isWorkSession) {
          statusDisplay.text('Work Session');
      } else {
          statusDisplay.text(sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'Long Break' : 'Short Break');
      }
  }

  function updateTitle(newTitle) {
    document.title = newTitle
  }

  function updateSessionCount({ sessionCount }) {
    sessionCountDisplay.text(`Sessions: ${sessionCount}`);
  }

  function endSessionAck({ timeAsString }) {
      new Notification("Session ended!", {
        silent: false,
      })
      updateDisplay(timeAsString);
  }

  function skipToNextSession() {
    worker.postMessage({
      operation: "skipToNextSession",
    })
  }

  function skipToNextSessionAck({
    timeAsString,
    sessionCount,
    isWorkSession,
  }) {
    sessionCountDisplay.text(`Sessions: ${sessionCount}`);
    updateStatus(isWorkSession);
    toggleBtn.text('Start')
  }

  function resetTimer() {
    if (confirm("Are you sure you want to reset the timer?")) {
      worker.postMessage({
        operation: "resetTimer",
      })
    }
  }
  function resetTimerAck({
    timeAsString,
  }) {
    toggleBtn.text('Start');
    updateStatus(true);
    updateDisplay(timeAsString);
    sessionCountDisplay.text('Sessions: 0');
  }

  function extendTimer() {
    worker.postMessage({
      operation: "extendTimer",
    })
  }
  function extendTimerAck({ timeAsString }) {
    updateDisplay(timeAsString)
  }

  function setMainButton (str) {
    toggleBtn.text(str)
  }

  toggleBtn.on('click', function() {
    worker.postMessage({
      operation: "play/resume"
    })
  });
  resetBtn.on('click', resetTimer);
  nextSessionBtn.on('click', skipToNextSession);
  extendBtn.on('click', extendTimer);

  enableNotifsBtn.on('click', askNotificationPermission);

  document.addEventListener("keypress", (e) => {
    if (e.key === " ") {
      toggleBtn.click();
    }
  })

  worker.onmessage = (msg) => {
    const { operation, data } = msg.data;

    if (operation === "updateDisplay") {
      updateDisplay(data.timeAsString);
    } else if (operation === "endSessionAck") {
      endSessionAck(data)
    } else if (operation === "setMainButton") {
      setMainButton(data.str)
    } else if (operation === "updateSessionCount") {
      updateSessionCount(data)
    } else if (operation === "skipToNextSessionAck") {
      skipToNextSessionAck(data)
    } else if (operation === "resetTimerAck") {
      resetTimerAck(data)
    } else if (operation === "extendTimerAck") {
      extendTimerAck(data)
    }
  }

  updateStatus(true);
});