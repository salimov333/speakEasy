const resultDiv = document.getElementById("result");
const statusDiv = document.getElementById("status");
const langSelect = document.getElementById("langSelect");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const clearButton = document.getElementById("clearButton");

let recognition;
let isListening = false;

// Initial status
document.addEventListener("DOMContentLoaded", () => {
    statusDiv.textContent = "Ready.";
    clearButton.disabled = true;
    resultDiv.contentEditable = "false"
});

// Initialize the SpeechRecognition API
function initializeRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        statusDiv.textContent =
            "Web Speech API is not supported in this browser.";
        startButton.disabled = true;
        return null;
    }

    const recog = new SpeechRecognition();
    recog.lang = langSelect.value;
    const langCode = langSelect.value.slice(0, 2);

    // Set text direction and font based on language
    if (langCode === "ar") {
        resultDiv.dir = "rtl";
        resultDiv.style.fontFamily = "'Cairo', 'Amiri', sans-serif";
        resultDiv.style.textAlign = "right";
    } else {
        resultDiv.dir = "ltr";
        resultDiv.style.fontFamily = "'Roboto', sans-serif";
        resultDiv.style.textAlign = "left";
    }

    recog.maxAlternatives = 1;
    recog.interimResults = false;
    recog.continuous = true;

    return recog;
}

function startRecognition() {
    if (isListening) return;

    recognition = initializeRecognition();
    if (!recognition) return;

    isListening = true;
    resultDiv.contentEditable = "false";

    // Update buttons state and animations
    startButton.classList.add("listening");
    startButton.querySelector(".button-text").textContent = "Listening...";
    statusDiv.textContent = "Speak now – we're listening";
    startButton.disabled = true;
    stopButton.disabled = false;
    clearButton.disabled = true;

    recognition.onresult = (event) => {
        const transcript =
            event.results[event.results.length - 1][0].transcript;
        resultDiv.textContent += transcript + " ";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    };

    recognition.onerror = (event) => {
        statusDiv.textContent = "Error: " + event.error;
        isListening = false;
        resetButtonState();
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        } else {
            statusDiv.textContent = "Ready.";
            resetButtonState();
        }
    };

    recognition.start();
}

function stopRecognition() {
    if (!isListening) return;
    isListening = false;
    recognition.stop();
    resultDiv.contentEditable = resultDiv.textContent ? "true" : "false";
    resetButtonState();
}

function resetButtonState() {
    startButton.classList.remove("listening");
    startButton.querySelector(".button-text").textContent = "Speak";
    startButton.disabled = false;
    stopButton.disabled = true;
    clearButton.disabled = resultDiv.textContent ? false : true;
}

function clearText() {
    resultDiv.textContent = "";
    clearButton.disabled = true;
    resultDiv.contentEditable = "false";
}
// Event Listeners
langSelect.addEventListener("change", () => {
    if (recognition && !isListening) {
        initializeRecognition();
    } else if (isListening) {
        stopRecognition();
        setTimeout(startRecognition, 100);
    } else {
        initializeRecognition();
    }
});

startButton.addEventListener("click", startRecognition);
stopButton.addEventListener("click", stopRecognition);
clearButton.addEventListener("click", clearText);