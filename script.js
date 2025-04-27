const resultDiv = document.getElementById("result");
const statusDiv = document.getElementById("status");
const langSelect = document.getElementById("langSelect");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const clearButton = document.getElementById("clearButton");

let recognition;
let isListening = false;

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
    if (langCode === "ar") {
        resultDiv.dir = "rtl";
        resultDiv.style.fontFamily = "'Cairo', 'Amiri', sans-serif";
        resultDiv.style.textAlign = "right"; // Align right for Arabic
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
    statusDiv.textContent = "Listening...";
    startButton.disabled = true;
    stopButton.disabled = false;

    recognition.onresult = (event) => {
        const transcript =
            event.results[event.results.length - 1][0].transcript;
        resultDiv.textContent += transcript + " "; // Add space for better readability
        // Scroll to the bottom to keep the latest text in view
        resultDiv.scrollTop = resultDiv.scrollHeight;
    };

    recognition.onerror = (event) => {
        statusDiv.textContent = "Error: " + event.error;
        isListening = false;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    recognition.onend = () => {
        if (isListening) {
            recognition.start(); // Restart if still listening
        } else {
            statusDiv.textContent = "Ready.";
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    };

    recognition.start();
}

function stopRecognition() {
    if (!isListening) return;
    isListening = false;
    recognition.stop();
    statusDiv.textContent = "Stopped listening.";
    startButton.disabled = false;
    stopButton.disabled = true;
}

function clearText() {
    resultDiv.textContent = "";
    statusDiv.textContent = "";
}

langSelect.addEventListener("change", () => {
    if (recognition && !isListening) {
        initializeRecognition(); // Re-initialize with the new language
    } else if (isListening) {
        stopRecognition();
        setTimeout(startRecognition, 500); // Restart with new language after a short delay
    } else {
        initializeRecognition();
    }
});

startButton.addEventListener("click", startRecognition);
stopButton.addEventListener("click", stopRecognition);
clearButton.addEventListener("click", clearText);

// Initial status message
statusDiv.textContent = "Ready.";
