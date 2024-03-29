const URL = "https://raw.githubusercontent.com/freedan42x/sentence-generator/master/english";

const WORDS = fetch(URL)
    .then(r => r.text())
    .then(t => t.split(" "));

let $textlen = document.getElementById("textlen");
let $generate = document.getElementById("generate");
let $result = document.getElementById("result");

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function generateText(words, len) {
    let result = [];
    for (let i = 0; i < len; i++) {
        let word = words[randomInt(words.length)];

        // 11% ", "
        // 8% ". "
        // so [0, 11), [11, 19)
        let k = randomInt(100); 
        let suffix = (k >= 0 && k < 10) ? ","
                   : (k >= 11 && k < 19) ? "."
                   : "";

        result.push(word + suffix);
    }
    return result.join(" ");
}

$generate.onclick = () => {
    const len = parseInt($textlen.value);
    if (!Number.isInteger(len)) return;
    WORDS.then(w => {
        const r = generateText(w, len);
        $result.value = r;
        navigator.clipboard.writeText(r);
    });
};
