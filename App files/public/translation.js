let inputtext;
let outputtext;
let ipl;
let opl;
let lower;
let copyMessage;
let apiKey;
let apiKeyFetched;
let preferredEnglishVoiceM = "Microsoft Hazel Desktop - English (Great Britain)"; // microsoft browser
let preferredEngishvoiceG = "Google UK English Female"; // google browser
let availableVoices = [];
let voicesReady;
let inputspeech = document.getElementById("ipspeech");
let outputspeech = document.getElementById("opspeech");
let themeToggle = document.getElementById("theme-select");
let langToggle = document.getElementById("lang-select");


themeToggle.addEventListener("change", function() {
    if (themeToggle.value === "dark") {
        document.documentElement.classList.add("dark-theme");
    } else {
        document.documentElement.classList.remove("dark-theme");
    }
    //save theme preference
    localStorage.setItem("theme", themeToggle.value);
});

//on page load, set theme to saved preference
document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        themeToggle.value = savedTheme;
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark-theme");
        }
    }
});

//ability to change site language to different languages
// call google api to translate elements
// When language selected, send all element text through translation function and update elements with translated text
// q is text, target is language to translate to, source is language to translate from (can be auto detected)

async function translateElements(elements, language) {
    const key = await fetchAPI();
    if (!key) {
        console.error("API key is missing");
        return;
    }
    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
        const headers = {"Content-Type": "application/json"};
        const payload = {
            q: elements,
            target: language,
            format: "text"
        };
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        // Process the translation results
    } catch (error) {
        console.error("Error translating elements:", error);
    }
}

const titles = document.querySelectorAll("title")
const placeholders = document.querySelectorAll("placeholder")
const copymessage = 
langToggle.addEventListener("DOMContentLoaded" || "change", function(event) {
    const elementsToTranslate = [];
    elementsToTranslate += document.querySelectorAll("title" && "placeholder" && "label" && "options" && "aboutmessage");

    translateElements(elementsToTranslate, langToggle.value);

    localStorage.setItem("language", langToggle.value); // doesnt save dropdown selection because 
});

document.addEventListener("DOMContentLoaded", function() {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
        langToggle.value = savedLanguage;
        // call function to translate site to saved language
    }
});

// define dropdown languages in js not in html
document.addEventListener("DOMContentLoaded", function() {
    const lang = document.querySelectorAll(".ttext"); // all select elements with class 'text'

    lang.forEach((get, con) => {
        for (let country in language) {
            let initial = "";
            if (con === 0 && country === "en") {
                initial = "selected";
            } else if (con === 1 && country === "mc") {
                initial = "selected";
            }

            const option = `<option value="${country}" ${initial}>${language[country]}</option>`;
            get.insertAdjacentHTML("beforeend", option);
        }
    });

    inputtext = document.getElementById("userinput"); //access to text input area
    outputtext = document.getElementById("textoutput");
    ipl = document.getElementById("ip"); // select element itself
    opl = document.getElementById("op"); // select element itself

    // inputtext.addEventListener("input", translate, scheduleTranslate);
    // ipl.addEventListener("change", scheduleTranslate);
    // opl.addEventListener("change", scheduleTranslate);
        // above is code needed to get translation automatically without pressing enter
        // but causes too many api requests, so disabled for now (can charge money to use)

    inputtext.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            translate();
        }
    });
    ipl.addEventListener("change", translate);
    opl.addEventListener("change", translate); // auto changes when languages change

});

//add so if input is english, select english dropdown
// if input is detected as morse, auto select morse dropdown

// can change the input to all lowercase and then convert to morse code
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
    '.-.-.-', '--..--', '-.-.--', '..--..', '.----.', '.-..-.', '-....-', '---...', '-.-.-.',
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
    , '.', ',', '!', '?', '\'', '"', '-', ':', ';',
];

function lowercase() {
    lower = inputtext.value.toLowerCase();
}

function englishtomorse() {
    lowercase();
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

async function otherlang() { // not using server, save API locally
    outputtext.value = "";
    const key = await fetchAPI();
    if (!key) {
        outputtext.value = "API key not found.";
        console.error("API key is missing");
        return;
    }
    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
        const headers = {"Content-Type": "application/json"};
        const payload = {
            q: inputtext.value,
            source: ipl.value,
            target: opl.value,            
            format: "text"
        };
        const response = await fetch(url, {
            method: "POST",
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
    } catch (error) {
        console.error("Translation error:", error);
        outputtext.value = "Translation failed. Please check console for error.";
    }
}

function translate() {
    outputtext.value = ""; //clear output box before new output
    if (ipl.value === opl.value) {
        outputtext.value = inputtext.value; //if both are the same, just copy input to output
    }
    else if (inputtext.value === "") { // if no input, clear output
        outputtext.value = ""; //if input is empty, clear output, dont call translation
    }
    else if (ipl.value === "en" && opl.value === "mc") {
        englishtomorse();
    } 
    else if (ipl.value === "mc" && opl.value === "en") { // morse code only works to english
        morsetoenglish();
    } else if (ipl.value == "mc" || opl.value === "mc") { // can api translate morse? could use my version for english, and api for others
        outputtext.value = "Morse Code translation only works to and from English.";
    } else {
        otherlang();
    }
};

// change speech to text english or morse voice to specific browser voices
// if dropdown language is english, set voice to chosen speakers
// if not available, use default voice
document.addEventListener("DOMContentLoaded", function() { // load voices on page load
    availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        voicesReady = true;
    } else {
        speechSynthesis.addEventListener("voiceschanged", function() {
            availableVoices = speechSynthesis.getVoices();
            voicesReady = true;
        });
    }
});    

function getEnglishVoice() {
    const voices = availableVoices
    return voices.find(v => v.name === preferredEnglishVoiceM) 
    || voices.find(v => v.name === preferredEngishvoiceG)
    || voices.find(v => v.lang.startsWith("en-GB")) // fallback
    || voices.find(v => v.lang.startsWith("en")) // fallback to any english voice
    || null;
}   

function morseToSpeakable(morseText) {
    return morseText 
        .split('')
        .map(char => {
            if (char === '.') return 'dit';
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
    if (ipl.value === "mc") {
        const morseVoice = getEnglishVoice();
        if (morseVoice) {
            inputsp.voice = morseVoice;
        }
        inputsp.lang = "en"; // set to english for morse code speaking
        inputsp.text = morseToSpeakable(inputtext.value);
    }
    if (inputsp.lang === "en") {
        const englishVoice = getEnglishVoice(); 
        if (englishVoice) {
            inputsp.voice = englishVoice;
        }
    }
    if(!voicesReady) loadVoices();
    if (speechSynthesis.speaking) speechSynthesis.cancel(); // stop current speech if still speaking
    else speechSynthesis.speak(inputsp);
};

function outputSpeech() {
    let outputsp = new SpeechSynthesisUtterance(outputtext.value);
    outputsp.lang = opl.value;
    if (opl.value === "mc") {
        const morseVoice = getEnglishVoice();
        if (morseVoice) {
        outputsp.voice = morseVoice;
        }
        outputsp.lang = "en"; // set to english for morse code speaking
        outputsp.text = morseToSpeakable(outputtext.value);
    }
    if (opl.value === "en") {
    const englishVoice = getEnglishVoice(); 
        if (englishVoice) {
            outputsp.voice = englishVoice;
        }
    }
    if (!voicesReady) loadVoices();
    if (speechSynthesis.speaking) speechSynthesis.cancel(); // stop current speech if still speaking
    else speechSynthesis.speak(outputsp);
};

function swapLanguages() {
    const temp = ipl.value;
    ipl.value = opl.value;
    opl.value = temp;   
    const tempText = inputtext.value;
    inputtext.value = outputtext.value;
    outputtext.value = tempText;
    translate();
}

copyMessage = document.getElementById("copy-message");
function copyToClipboard() {
    const textToCopy = outputtext.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
        if (copyMessage) {
            copyMessage.textContent = "Copied";
            copyMessage.style.display = "block";
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 1000);
        }
    }).catch(err => {
        alert("Failed to copy text", err);
    });
}

// create history of recent translations, store in local storage, show in expandable menu, click to re-translate that text
// once clicked, hide nav menu
// add section next to translation box if browser is full screen
// Could make side navigation tab - can put about info inside it as well as history

function openNav() {
    document.getElementById("sidenav").style.width = "35vw";
}

function closeNav() {
    if (newabout.style.display === "block") {
        newabout.style.display = "none"; // also close about message if open
    }
    document.getElementById("sidenav").style.width = "0px";
}

const newabout = document.getElementById("newaboutmessage");

document.addEventListener("click", (e) => {
    const sidenav = document.getElementById("sidenav");
    const navopen = document.getElementById("navopen");
    
    if (!sidenav.contains(e.target) && e.target !== navopen) {
        closeNav(); // if not click within sidenav, close
        if (newabout.style.display === "block") {
            newabout.style.display = "none"; // also close about message if open
        }
    }
});

function showabout() {
    if (newabout.style.display === "block") {
        newabout.style.display = "none";
        return;
    } else newabout.style.display = "block";
}