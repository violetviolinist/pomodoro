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

  function endSession() {
      toggleBtn.text('Resume');
      new Notification("Session ended!", {
        silent: false,
      })
      updateDisplay();
  }

  function startNextSession() {
    worker.postMessage({
      operation: "startNextSession",
    })
  }

  function startNextSessionAck({
    sessionCount,
    isWorkSession,
  }) {
    sessionCountDisplay.text(`Sessions: ${sessionCount}`);
    endSession();
    updateStatus(isWorkSession);
    updateDisplay();
    toggleBtn.text('Start')
  }

  function resetTimer() {
      if (confirm("Are you sure you want to reset the timer?")) {
        worker.postMessage({
          operation: "resetTimer",
        })
        toggleBtn.text('Start');
        updateStatus(true);
        updateDisplay();
        sessionCountDisplay.text('Sessions: 0');
      }
  }

  function extendTimer() {
    worker.postMessage({
      operation: "extendTimer",
    })
    updateDisplay();
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
  nextSessionBtn.on('click', startNextSession);
  extendBtn.on('click', extendTimer);

  enableNotifsBtn.on('click', askNotificationPermission);

  worker.onmessage = (msg) => {
    const { operation, data } = msg.data;

    if (operation === "updateDisplay") {
      updateDisplay(data.timeAsString);
    } else if (operation === "endSession") {
      endSession()
    } else if (operation === "setMainButton") {
      setMainButton(data.str)
    } else if (operation === "startNextSessionAck") {
      startNextSessionAck(data)
    }
  }

  updateStatus(true);
  updateDisplay();
});