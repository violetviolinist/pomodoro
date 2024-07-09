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
    Notification.requestPermission().then(() => {
      alert("Notifications are on!")
    });
  }

  function updateTimerDisplay({ timeAsString }) {
    timerDisplay.text(timeAsString);
  }

  function updateTitle({ newTitle }) {
    document.title = newTitle
  }

  function updateSessionLabel({ newSessionLabel }) {
    statusDisplay.text(newSessionLabel)
  }

  function updateSessionCount({ sessionCount }) {
    sessionCountDisplay.text(`Sessions: ${sessionCount}`);
  }

  function updateControlButtonText({ controlButtonText }) {
    toggleBtn.text(controlButtonText)
  }

  function updateElements({
    timeAsString,
    newSessionLabel,
    sessionCount,
    controlButtonText,
  }) {
    updateTimerDisplay({ timeAsString })
    updateTitle({ newTitle: timeAsString })
    updateSessionLabel({ newSessionLabel })
    updateSessionCount({ sessionCount })
    updateControlButtonText({ controlButtonText })
  }

  enableNotifsBtn.on('click', askNotificationPermission);
  toggleBtn.on('click', function() {
    worker.postMessage({
      operation: "controlButtonClick"
    })
  });
  resetBtn.on('click', () => {
    if (confirm("Are you sure you want to reset the timer?")) {
      worker.postMessage({
        operation: "resetTimer",
      })
    }
  });
  nextSessionBtn.on('click', () => {
    worker.postMessage({
      operation: "skipToNextSession",
    })
  });
  extendBtn.on('click', () => {
    worker.postMessage({
      operation: "extendTimer",
    })
  });

  document.addEventListener("keypress", (e) => {
    if (e.key === " ") {
      toggleBtn.click();
    }
  })

  worker.onmessage = (msg) => {
    const { operation, data } = msg.data;

    if (operation === "updateElements") {
      updateElements(data)
    } else if (operation === "notification") {
      new Notification(data.text)
    }
  }

  updateSessionLabel("Work Session");
});