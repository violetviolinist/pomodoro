$(document).ready(function() {
  const timerDisplay = $('#timer');
  const statusDisplay = $('#status');
  const toggleBtn = $('#toggleBtn');
  const resetBtn = $('#resetBtn');
  const nextSessionBtn = $('#nextSessionBtn');
  const extendBtn = $('#extendBtn');
  const sessionCountDisplay = $('#sessionCount');

  const WORK_TIME = 25 * 60;
  const SHORT_BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;
  const SESSIONS_BEFORE_LONG_BREAK = 4;
  const EXTENSION_TIME = 5 * 60;

  let timeLeft = WORK_TIME;
  let timerInterval;
  let isRunning = false;
  let isWorkSession = true;
  let sessionCount = 0;

  function updateDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }

  function updateStatus() {
      if (isWorkSession) {
          statusDisplay.text('Work Session');
      } else {
          statusDisplay.text(sessionCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'Long Break' : 'Short Break');
      }
  }

  function startTimer() {
      timerInterval = setInterval(() => {
          if (timeLeft > 0) {
              timeLeft--;
              updateDisplay();
          } else {
              endSession();
          }
      }, 1000);
  }

  function stopTimer() {
      clearInterval(timerInterval);
  }

  function endSession() {
      clearInterval(timerInterval);
      isRunning = false;
      toggleBtn.text('Resume');
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
          isRunning = !isRunning;
      }
  });

  resetBtn.on('click', resetTimer);
  nextSessionBtn.on('click', startNextSession);
  extendBtn.on('click', extendTimer);

  updateStatus();
  updateDisplay();
});