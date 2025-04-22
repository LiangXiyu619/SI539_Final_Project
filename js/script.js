const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const alarmSound = new Audio("./src/mixkit-bell-notification-933.wav");

let timeLeft = 25 * 60;
let timer;
let isRunning = false;
let isWorkSession = true;
let workDuration = 25;
let breakDuration = 5;
let tasks = [];

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            pauseTimer();
            alarmSound.play().catch(error => console.error("Audio play failed:", error));
            alert(isWorkSession ? "Time's up! Take a break." : "Back to work!");
            switchSession();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    pauseTimer();
    if (isWorkSession) {
        timeLeft = workDuration * 60;
    } else {
        timeLeft = breakDuration * 60;
    }
    updateDisplay();
}

function switchSession() {
    isWorkSession = !isWorkSession;
    timeLeft = isWorkSession ? workDuration * 60 : breakDuration * 60;
    pauseTimer();
    updateDisplay();
}

function saveState() {
    localStorage.setItem("timeLeft", timeLeft);
    localStorage.setItem("isRunning", isRunning);
    localStorage.setItem("isWorkSession", isWorkSession);
}

function loadState() {
    if (localStorage.getItem('workDuration')) {
        workDuration = parseInt(localStorage.getItem('workDuration'));
        document.getElementById("workDuration").value = workDuration;
    }
    if (localStorage.getItem('breakDuration')) {
        breakDuration = parseInt(localStorage.getItem('breakDuration'));
        document.getElementById("breakDuration").value = breakDuration;
    }
    if (localStorage.getItem("timeLeft")) {
        timeLeft = parseInt(localStorage.getItem("timeLeft"));
        isRunning = localStorage.getItem("isRunning") === "true";
        isWorkSession = localStorage.getItem("isWorkSession") === "true";
        const workMode = document.getElementById("workMode");
        const breakMode = document.getElementById("breakMode");
        if (isWorkSession) {
            workMode.classList.add("active");
            if (breakMode.classList.contains("active")) {
                breakMode.classList.remove("active");
            }
        } else {
            if (workMode.classList.contains("active")) {
                workMode.classList.remove("active");
            }
            breakMode.classList.add("active");
        }
        updateDisplay();
    } else {
        timeLeft = workDuration * 60;
    }
    loadTasks();
    if (isRunning) {
        isRunning = false;
        startTimer();
    }
}

function renderTasks() {
    const container = document.getElementById("tasksContainer");
    container.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";
        const iconSrc = task.completed ? "src/undo.png" : "src/check-mark.png";
        const iconAlt = task.completed ? "undo complete" : "complete";
        const iconLabel = task.completed ? "undo complete task" : "complete task";
        li.innerHTML = `
            <span>${task.name}</span>
            <div class="task-actions">
                <button onclick="toggleComplete(${index})" aria-label="${iconLabel}">
                    <img src='${iconSrc}' alt='${iconAlt}'>
                </button>
                <button onclick="deleteTask(${index})" aria-label="delete task">
                    <img src='src/delete.png' alt='delete'>
                </button>
            </div>
        `;
        container.appendChild(li);
    });
}

function loadTasks() {
    const saved = localStorage.getItem("tasks");
    if (saved) {
        tasks = JSON.parse(saved);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

document.getElementById('saveSettings').addEventListener("click", function() {
    const workInput = document.getElementById("workDuration").value;
    const breakInput = document.getElementById("breakDuration").value;
    workDuration = parseInt(workInput);
    breakDuration = parseInt(breakInput);
    localStorage.setItem("workDuration", workDuration);
    localStorage.setItem("breakDuration", breakDuration);
    timeLeft = isWorkSession ? workDuration * 60 : breakDuration * 60;
    pauseTimer();
    updateDisplay();
});

document.getElementById("addTaskBtn").addEventListener("click", function() {
    const input = document.getElementById("newTaskInput");
    console.log(input.value);
    const text = input.value.trim();
    console.log(text);
    if (text) {
        tasks.push({name: text, completed: false});
        input.value = "";
        console.log(tasks);
        saveTasks();
        renderTasks();
    }
});

document.getElementById("workMode").addEventListener("click", function() {
    if (! isWorkSession) {
        this.classList.toggle("active");
        const breakMode = document.getElementById("breakMode");
        if (breakMode.classList.contains("active")) {
            breakMode.classList.remove("active");
        }
        pauseTimer();
        switchSession();
    }
});

document.getElementById("breakMode").addEventListener("click", function() {
    if (isWorkSession) {
        this.classList.toggle("active");
        const workMode = document.getElementById("workMode");
        if (workMode.classList.contains("active")) {
            workMode.classList.remove("active");
        }
        pauseTimer();
        switchSession();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        event.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    } else if (event.code === "KeyR") {
        resetTimer();
    }
});

setInterval(saveState, 1000);

window.onload = loadState;

updateDisplay();