$(document).ready(function() {
  const timerDisplay = $('#timer');
  const statusDisplay = $('#status');
  const toggleBtn = $('#toggleBtn');
  const resetBtn = $('#resetBtn');
  const nextSessionBtn = $('#nextSessionBtn');
  const extendBtn = $('#extendBtn');
  const enableNotifsBtn = $('#enableNotifsBtn');
  const sessionCountDisplay = $('#sessionCount');

  const WORK_TIME = 25 * 60;
  const SHORT_BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;
  const SESSIONS_BEFORE_LONG_BREAK = 4;
  const EXTENSION_TIME = 5 * 60;

  let timeLeft = WORK_TIME;
  let isRunning = false;
  let isWorkSession = true;
  let sessionCount = 0;

  function askNotificationPermission() {
    console.log("called permission")
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      alert("success")
      // set the button to shown or hidden, depending on what the user answers
      // enableNotifsBtn.style.display = permission === "granted" ? "none" : "block";
    });
  }

  function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timeAsString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timerDisplay.text(timeAsString);
      updateTitle(timeAsString)
  }

  function updateStatus() {
      if (isWorkSession) {
          statusDisplay.text('Work Session');
      } else {
          statusDisplay.text(sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'Long Break' : 'Short Break');
      }
  }

  function updateTitle(newTitle) {
    document.title = newTitle
  }

  function tick() {
    if (isRunning) {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
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
      toggleBtn.text('Resume');
      new Notification("Session ended!", {
        silent: false,
      })
      updateDisplay();
  }

  function startNextSession() {
      if (isWorkSession) {
          sessionCount++;
          sessionCountDisplay.text(`Sessions: ${sessionCount}`);
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
      endSession();
      updateStatus();
      updateDisplay();
      toggleBtn.text('Start')
  }

  function resetTimer() {
      if (confirm("Are you sure you want to reset the timer?")) {
          stopTimer();
          isWorkSession = true;
          sessionCount = 0;
          timeLeft = WORK_TIME;
          isRunning = false;
          toggleBtn.text('Start');
          updateStatus();
          updateDisplay();
          sessionCountDisplay.text('Sessions: 0');
      }
  }

  function extendTimer() {
      timeLeft += EXTENSION_TIME;
      updateDisplay();
  }

  toggleBtn.on('click', function() {
      if (timeLeft > 0) {
          if (isRunning) {
              stopTimer();
              toggleBtn.text('Resume');
          } else {
              startTimer();
              toggleBtn.text('Pause');
          }
      }
  });
  resetBtn.on('click', resetTimer);
  nextSessionBtn.on('click', startNextSession);
  extendBtn.on('click', extendTimer);

  enableNotifsBtn.on('click', askNotificationPermission);

  updateStatus();
  updateDisplay();
});