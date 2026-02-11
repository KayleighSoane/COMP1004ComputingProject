let inputtext;
let outputtext;
let ipl;
let opl;
let lower;
let copyMessage;
let translateTimeout;
let inputspeech = document.getElementById("ipspeech");
let outputspeech = document.getElementById("opspeech");
let themeToggle = document.getElementById("theme-select");


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
    copyMessage = document.getElementById("copy-message");

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

function otherlang() {
    const serverURL = 'http://localhost:3000/translate'; //calls server.js translation api
    
    fetch(serverURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: inputtext.value,
            sourceLanguage: ipl.value,
            targetLanguage: opl.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.translatedText) {
            outputtext.value = data.translatedText;
        } else {
            outputtext.value = "Error in translation. Please try again.";
        }
    })
    .catch(error => {
        console.error('Translation error:', error); //write to console for debugging
        outputtext.value = "Error in translation. Please try again.";
    });
}

function scheduleTranslate() { // prevents overloading api with requests on every input change when translating without pressing enter
    if (!inputtext || !ipl || !opl) {
        return;
    }
    clearTimeout(translateTimeout);
    translateTimeout = setTimeout(translate, 1000); // translates if user stops typing for 1000ms
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


const btn = document.getElementById('aboutbtn');
const panel = document.getElementById('aboutcontent');

btn.addEventListener('click', () => {
    panel.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('show');
    }
});

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

inputspeech.addEventListener("click", function() {
    let inputsp = new SpeechSynthesisUtterance(inputtext.value);
    inputsp.lang = ipl.value;
    if (ipl.value === "mc") {
        inputsp.lang = "en"; // set to english for morse code speaking
        inputsp.text = morseToSpeakable(inputtext.value);
    }
    speechSynthesis.speak(inputsp);
});

outputspeech.addEventListener("click", function() {
    let outputsp = new SpeechSynthesisUtterance(outputtext.value);
    outputsp.lang = opl.value;
    if (opl.value === "mc") {
        outputsp.lang = "en"; // set to english for morse code speaking
        outputsp.text = morseToSpeakable(outputtext.value);
    }
    speechSynthesis.speak(outputsp);
});


function swapLanguages() {
    const temp = ipl.value;
    ipl.value = opl.value;
    opl.value = temp;   
    const tempText = inputtext.value;
    inputtext.value = outputtext.value;
    outputtext.value = tempText;
    translate();
}

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