let inputtext;
let outputtext;
let ipl;
let opl;
let submit;
let lower;

// define dropdown languages in js not in html
// build options after DOM is ready so the selects exist
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
    submit = document.querySelector("input[type='submit']"); //access to submit button
    enter = document.getElementById("userinput"); //access to text input area for enter key
    submit.addEventListener("click", translate);
    enter.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); //prevent form submission on Enter key
            translate();
        }
    });
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

//when morse code selected, translate alphabet to morse
//when english selected, translate morse to alphabet
function translate() {
    outputtext.value = ""; //clear output box before new output
    if (ipl.value === opl.value) {
        outputtext.value = inputtext.value; //if both are the same, just copy input to output
    }
    else if (ipl.value === "en" && opl.value === "mc") {
        englishtomorse();
    } 
    else if (ipl.value === "mc" && opl.value === "en") { // morse code only works to english
        morsetoenglish();
    } else {
        outputtext.value = "Translation for this pair isn't implemented yet.";
    }

};

// need to display output in html output box
// above code needs to work when input is given and submit button clicked
// when submit clicked, call function and clear output box before displaying new output
// if no input, output box remains empty