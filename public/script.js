$(document).ready(function() {
    const timerDisplay = $('#timer');
    const toggleBtn = $('#toggleBtn');
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerInterval;
    let isRunning = false;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                alert('Pomodoro session completed!');
                resetTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function resetTimer() {
        timeLeft = 25 * 60;
        updateDisplay();
        isRunning = false;
        toggleBtn.text('Start');
    }

    toggleBtn.on('click', function() {
        if (isRunning) {
            stopTimer();
            toggleBtn.text('Resume');
        } else {
            startTimer();
            toggleBtn.text('Pause');
        }
        isRunning = !isRunning;
    });

    updateDisplay();
});
