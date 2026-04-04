let inputtext = document.getElementById("userinput");
let outputtext = document.getElementById("textoutput");
let ipl = document.getElementById("ip"); 
let opl = document.getElementById("op");
let themecheckbox = document.getElementById("colch");
let langToggle = document.getElementById("lang-select");


document.addEventListener("DOMContentLoaded", function() {

    loadVoices(); // saved as function to be able to call if voices not ready

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        themecheckbox.checked = savedTheme === "dark";
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark-theme");
        }
    } // on page load, set theme to saved theme

    saturateDropdowns(); 

    // inputtext.addEventListener("input", translate, scheduleTranslate);
    // ipl.addEventListener("change", scheduleTranslate);
    // opl.addEventListener("change", scheduleTranslate);
        // above is code needed to get translation automatically without pressing enter
        // but causes too many api requests, so disabled (can charge money if too many calls)

    ipl.addEventListener("change", translate);
    opl.addEventListener("change", translate); // auto changes when languages change

    renderHistory(); // render history on page load

});

function toggleTheme() {
    if (themecheckbox.checked) {
        document.documentElement.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark-theme");
        localStorage.setItem("theme", "light");
    }
};

function saturateDropdowns() {
const lang = document.querySelectorAll(".ttext"); // all select elements with class 'text'

    lang.forEach((get, con) => {
        for (let country in language) { // language is object in languages.js
            let initial = "";
            if (con === 0 && country === "") { // set as default input
                initial = "selected";
            } else if (con === 1 && country === "en") { // set as default output
                initial = "selected";
            }

            const option = `<option value="${country}" ${initial}>${language[country]}</option>`; // create option element for each language
            get.insertAdjacentHTML("beforeend", option);
        }
    });
};

const morsedetected = () => {
    if (inputtext.value.trim() === "") return false; // if input is empty, dont detect as morse code
    const morseChars = ['.', '-', ' ', '/'];
    for (let char of inputtext.value) {
        if (!morseChars.includes(char)) {
            return false; // if any character is not a valid morse code character, return false
        }
    }
    return true;
};

function translate() { // main function called that processess all inputs
    outputtext.value = ""; //clear output box before new output
    inputtext.value = inputtext.value.trim(); // remove extra spaces from input to avoid translation issues and false morse code detection
    if (opl.value === "") {
        opl.value = "en"; // set default output language
    }
    if (ipl.value === opl.value) {
        outputtext.value = inputtext.value; //if both are the same language, just copy input to output
    } else if (ipl.value === "" && morsedetected()) { // if auto detect and morse code detected, set to english and translate morse to english
        ipl.value = "mc";
        morsetoenglish();
        addToHistory(ipl.value, outputtext.value, inputtext.value, opl.value); // add to history after translation
    }
    else if (inputtext.value === "") {
        outputtext.value = ""; //if input is empty, clear output, dont call translation
    }
    else if (ipl.value === "en" && opl.value === "mc") {
        englishtomorse();
        addToHistory(ipl.value, outputtext.value, inputtext.value, opl.value);
    } 
    else if (ipl.value === "mc" && opl.value === "en") { // morse code only works to english
        if (!morsedetected()) {
            outputtext.value = "Please enter valid Morse Code.";
        } else {
            morsetoenglish();
            addToHistory(ipl.value, outputtext.value, inputtext.value, opl.value);
        }
    } else if (ipl.value === "mc" || opl.value === "mc") { // if using morse with any other language
        outputtext.value = "Morse Code translation only works with English."; // doesnt save to history
    } else {
        otherlang(); // history added inside otherlang function since it is async
    }
};

const transbutton = document.getElementById("translate"); // translate button - calling translate as onclick in html doesnt work
transbutton.addEventListener("click", translate);

function clearinput() {
    inputtext.value = "";
    charcount.textContent = "0";
    charcount.style.color = "";
}

// translation shortcut - ctrl + enter
inputtext.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "Enter") {
        translate();
    }
});

// Morse code implementation

const morse = [
    // a-z
    '.-', '-...', '-.-.', '-..', '.', '..-.',
    '--.', '....', '..', '.---', '-.-', '.-..',
    '--', '-.', '---', '.--.', '--.-', '.-.', '...',
    '-', '..-', '...-', '.--', '-..-', '-.--', '--..',
    // 0-9
    '-----', '.----', '..---', '...--', '....-', '.....',
    '-....', '--...', '---..', '----.',
    // .,!?'"-:;"
    '.-.-.-', '--..--', '-.-.--', '..--..', '.----.', '.-..-.', '-....-', '---...', '-.-.-.', '-..-.'
];

const alphabet = [  
    // a-z
    'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z',
    // 0-9
    '0', '1', '2', '3', '4', '5',
    '6', '7', '8', '9'
    // .,!?'"-:;"
    , '.', ',', '!', '?', '\'', '"', '-', ':', ';', '/'
];

function englishtomorse() {
    let lower = inputtext.value.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
        const num = lower[i];
        if (num === " ") {
            outputtext.value += " / "; // 3 spaces for word separator
        } else {
            const index = alphabet.indexOf(num);
            if (index !== -1) {
                outputtext.value += morse[index] + " ";
            }
        }
    }
}

function morsetoenglish() {
    const morseWords = inputtext.value.split(" / "); // split by 3 spaces for words
    for (let word = 0; word < morseWords.length; word++) {
        const morseChars = morseWords[word].split(" "); // split by 1 space for characters
        for (let i = 0; i < morseChars.length; i++) {
            const index = morse.indexOf(morseChars[i]);
            if (index !== -1) {
                outputtext.value += alphabet[index];
            }
        }
        if (word < morseWords.length - 1) {
            outputtext.value += " "; // add space between words
        }
    }
}

// API and language translation implementation
let apiKey;
let apiKeyFetched;
async function fetchAPI() {
    if (apiKey) return apiKey; // if it already exists, return it without fetching again
    if (!apiKeyFetched) { // if not, fetch it
        apiKeyFetched = fetch("apikey.txt")
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error status: ${response.status}`); }
            return response.text();
        })
        .then(key => {
            apiKey = key.trim();
            return apiKey;
        })
        .catch(error => {
            console.error("Error fetching API key:", error);
            return "";
        });
    }
    return apiKeyFetched;
}

async function otherlang() { // all translation not morse code
    outputtext.value = "";
    const key = await fetchAPI();
    if (!key) {
        outputtext.value = "API key not found.";
        console.error("API key is missing");
        return;
    }
    try {
        // definitions
        const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
        const headers = {"Content-Type": "application/json"};
        const payload = {
            q: inputtext.value,
            source: ipl.value,
            target: opl.value,            
            format: "text"
        };

        // request send to API
        const response = await fetch(url, {
            method: "POST", // post means sending data to api and also getting response back
            headers: headers,
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }
        const data = await response.json();
        const translatedText = data?.data?.translations?.[0]?.translatedText;
        if (!translatedText) throw new Error("Invalid API response structure");
        outputtext.value = translatedText;
        addToHistory(ipl.value, outputtext.value, inputtext.value, opl.value); // add to history after async translation
    } catch (error) {
        console.error("Translation error:", error);
        outputtext.value = "Translation failed.";
    }
}

const charcount = document.getElementById("charcount");
inputtext.addEventListener("input", function() {
    const length = inputtext.value.length;
    charcount.textContent = length;
    if (length >= 500) {
        charcount.style.color = "red";
    } else {
        charcount.style.color = "";
    }
});

// Text to speech implementation

// change speech to text english or morse voice to specific browser voices
// if dropdown language is english, set voice to chosen speakers
// if not available, use default voice
let availableVoices = [];
let voicesReady;

function loadVoices() { // load voices on page load
    availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        voicesReady = true;
    } else {
        speechSynthesis.addEventListener("voiceschanged", function() { // some browsers load voices asynchronously, so listen for event
            availableVoices = speechSynthesis.getVoices();
            voicesReady = true;
        });
    }
};    


function getEnglishVoice() {
    const preferredEnglishVoiceM = "Microsoft Hazel Desktop - English (Great Britain)"; // microsoft browser
    const preferredEngishvoiceG = "Google UK English Female"; // google browser
    let voices = availableVoices
    return voices.find(v => v.name === preferredEnglishVoiceM) 
    || voices.find(v => v.name === preferredEngishvoiceG)
    || voices.find(v => v.lang.startsWith("en-GB")) // fallback
    || voices.find(v => v.lang.startsWith("en")) // fallback to any english voice
    || null;
}   

function morseToSpeakable(morseText) {
    return morseText.split('').map(char => {
            if (char === '.') return 'dit'; // di and dah makes it flow better when spoken, and more recognizable as morse code
            if (char === '-') return 'dah';
            if (char === '/') return 'space,';
            else if (char === ' ') return ','; // make speech pause between letters
            return char;
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function inputSpeech() {
    let inputsp = new SpeechSynthesisUtterance(inputtext.value);
    inputsp.lang = ipl.value;
    if (ipl.value === "" && morsedetected()) { // set auto to english if morse detecetd
        const autoVoice = getEnglishVoice();
        if (autoVoice) {            
            inputsp.voice = autoVoice;
        } else {
            console.warn("Preferred Morse voice not found, using default voice");
        }         
        inputsp.lang = "en"; // set to english voice for morse code speaking
        inputsp.text = morseToSpeakable(inputtext.value);
    }
    if (ipl.value === "mc") {
        const morseVoice = getEnglishVoice();
        if (morseVoice) {
            inputsp.voice = morseVoice;
        } else {
            console.warn("Preferred Morse voice not found, using default voice");
        }
        inputsp.lang = "en"; // set to english voice for morse code speaking
        inputsp.text = morseToSpeakable(inputtext.value);
    }
    if (inputsp.lang === "en") {
        const englishVoice = getEnglishVoice(); 
        if (englishVoice) {
            inputsp.voice = englishVoice;
        } else {
            console.warn("Preferred English voice not found, using default voice");
        }
    }
    if(!voicesReady) loadVoices();
    if (speechSynthesis.speaking) speechSynthesis.cancel(); // stop current speech if still speaking
    else speechSynthesis.speak(inputsp);
};

function outputSpeech() {
    let outputsp = new SpeechSynthesisUtterance(outputtext.value);
    outputsp.lang = opl.value;
    if (opl.value === "") {
        const autovoice = getEnglishVoice();
        if (autovoice) {
            outputsp.voice = autovoice;
        } else {
            console.warn("Preferred Morse voice not found, using default voice");
        }
    }
    if (opl.value === "mc") {
        const morseVoice = getEnglishVoice();
        if (morseVoice) {
        outputsp.voice = morseVoice;
        } else {
            console.warn("Preferred Morse voice not found, using default voice");
        }
        outputsp.lang = "en"; // set to english voice for morse code speaking
        outputsp.text = morseToSpeakable(outputtext.value);
    }
    if (opl.value === "en") {
    const englishVoice = getEnglishVoice(); 
        if (englishVoice) {
            outputsp.voice = englishVoice;
        } else {
            console.warn("Preferred English voice not found, using default voice");
        }
    }
    if (!voicesReady) loadVoices();
    if (speechSynthesis.speaking) speechSynthesis.cancel(); // stop current speech if still speaking
    else speechSynthesis.speak(outputsp);
};


// swap function

function swapLanguages() {
    const temp = ipl.value;
    ipl.value = opl.value;
    opl.value = temp;   
    const tempText = inputtext.value;
    inputtext.value = outputtext.value;
    outputtext.value = tempText;
    translate();
}
// keyboard shortcut for swap - alt + s
document.addEventListener("keydown", function(event) {
    if (event.altKey && event.key.toLowerCase() === "s") {
        swapLanguages();
    }
});


// copy to clipboard

let copyMessage = document.getElementById("copy-message");
function copyToClipboard() {
    let textToCopy = outputtext.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
        if (copyMessage) {
            copyMessage.textContent = "Copied";
            copyMessage.style.display = "block";
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 1000);
        }
    }).catch(err => {
        console.error("Clipboard copy failed:", err); 
    });
}
// add keyboard shortcut for copy - alt + c
document.addEventListener("keydown", function(event) {
    if (event.altKey && event.key.toLowerCase() === "c") {
        copyToClipboard();
    }
});


// side navigation menu for about and history
const navopen = document.getElementById("navopen");
const sidenav = document.getElementById("sidenav");
navopen.addEventListener("click", function(event) {
    if (sidenav.style.width === "0px" || sidenav.style.width === "") {
        openNav();
    } else {
        closeNav();
    }
    event.stopPropagation(); 
}); // open nav when clicking the open button, but stop event from propagating to document click listener that closes nav

function openNav() {
    if (newabout.style.display === "0vw") {
        closeNav();
    } else {
        sidenav.style.width = "35vw";
    }
}

function closeNav() {
    if (newabout.style.display === "block") {
        newabout.style.display = "none"; // also close about message if open
    }
    sidenav.style.width = "0px";
}

const newabout = document.getElementById("newaboutmessage");
const abouticon = document.getElementById("about-icon");   

document.addEventListener("click", (e) => {
    if (!sidenav.contains(e.target) && e.target !== navopen) {
        if (newabout.style.display === "block") {
            newabout.style.display = "none"; // close about message if open
            abouticon.style.transform = "rotate(0deg)"; /// return arrow to original position
        }
        closeNav(); // if not click within sidenav, close
    }
});

function showabout() {
    if (newabout.style.display === "block") {
        newabout.style.display = "none";
        abouticon.style.transform = "rotate(0deg)";
        abouticon.style.transitionDuration = "0.3s";
        return;
    } else { newabout.style.display = "block";
        abouticon.style.transform = "rotate(180deg)";
        abouticon.style.transitionDuration = "0.3s";
    }

}
//shortcut for open nav - alt + h
document.addEventListener("keydown", function(event) {
    if (event.altKey && event.key.toLowerCase() === "h") {
        if (sidenav.style.width === "0px") {
            openNav();
        } else {
            closeNav();
        }
    }
});


//History implementation

// 1. load existing history from local storage
// 2. render history in side nav
// 3. save lang and text to local storage after translation
// 4. add items to history list
// 5. click button to clear history from list and local storage
// 6. click on history to re-translate in box - set input lang and text to that of history

const histstorage = "translationHistory"; // key for local storage
const histlist = document.getElementById("historylist"); // element to display history

function loadHistory() { // used in render to load from local storage
    try {
        return JSON.parse(localStorage.getItem(histstorage)) || []; // if no history, return empty array
    } catch (err) {
        console.error("Failed to load translation history:", err);
        return [];
    }
}

function renderHistory() { // create history list from local storage (do upon page load)
    const history = loadHistory();
    histlist.innerHTML = ""; // clear existing list before rendering
    history.forEach(({iplang, text, input, oplang}, index) => {
        const li = document.createElement("li");
        if (iplang === '') iplang = "auto"; // display auto instead of blank for auto detected input language
        li.textContent = `${iplang}: \"${input}\" → ${oplang}: ${text}`;
        li.addEventListener("click", () => retranslateFromHistory({iplang, text, input, oplang}));
        histlist.appendChild(li);
    });
}

function saveHistory(history) { // save to local storage
    localStorage.setItem(histstorage, JSON.stringify(history));
}

function addToHistory(iplang, text, input, oplang) { // add new item using opl value and outputtext value
    if (text.trim() === "") return; // dont save empty translations
    let history = loadHistory(); // load existing history before adding new
    history = history.filter(item => item.text !== text); // remove duplicates - remove item if the same as existing text (same text = same lang too)
    history.unshift({ iplang, text, input, oplang }); // add to top of list
    if (history.length > 10) history.pop(); // keep only last 10 items
    saveHistory(history);
    renderHistory(); // re-render history list after adding new item
}

function clearHistory() {
    localStorage.removeItem(histstorage);
    renderHistory();
}

function retranslateFromHistory({iplang, text, input, oplang}) {
    inputtext.value = input;
    ipl.value = iplang; // set input language to language code stored with this history text
    opl.value = oplang; // set output language to language code stored with this history text
    translate();
    closeNav();
}

function displayFunFact() {
    const funfacts = document.getElementById("funfacts");
    for (let key in facts) {
        if (opl.value === key) {
            funfacts.textContent = facts[key];
            break;
        }
    }
}
opl.addEventListener("change", displayFunFact);
document.addEventListener("DOMContentLoaded", displayFunFact); // also call on page load to show fact for default language