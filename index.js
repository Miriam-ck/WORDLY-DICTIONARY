const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const errorBox = document.getElementById("error");
const resultBox = document.getElementById("result");
const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const speakBtn = document.getElementById("speak-btn");
const meaningsEl = document.getElementById("meaning");
const synonymsEl = document.getElementById("synonyms");
const saveBtn = document.getElementById("save-Btn");
const saveList = document.getElementById("saved-list");

let currentWord ="";
let savedWords =JSON.parse(localStorage.getItem("savedWords"))|| [];
const partName = { n:"noun",v:"verb",adj:"adjective",adv:"adverb",u:"other"}

async function searchWord(word) {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");

    if (word === "") {
        showError("Please type a word.");
        return;
    }



try {
    const response = await fetch(
        "https://api.datamuse.com/words?sp=" + encodeURIComponent(word) + "&md=dpr&max=1"
    );

   const data = await response.json();

        if (data.length === 0 || data[0].word !== word || !data[0].defs) {
            showError("Word not found. Please check the spelling.");
            return;
        }
        const synResponse = await fetch (
            "https://api.datamuse.com/words?rel_syn=" + encodeURIComponent(word)
        );
        const synData = await synResponse.json();

        showWord(data[0], synData);
    } catch (error) {
        console.error(error);
        showError("Something went wrong. Please check your internet connection.");
    }
}
function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove("hidden");
        resultBox.classList.add("hidden");
    }
    function showWord(entry, synData) {
        currentWord = entry.word;
        wordEl.textContent = entry.word;
    
    
    let pronunciation = "No pronunciation available";
    (entry.tags || []).forEach(function (tag) {
        if (tag.startsWith("pron:")) {
            pronunciation = tag.slice(5);
        }
        });
    
    phoneticEl.textContent = pronunciation;

    meaningsEl.innerHTML = "";
    (entry.defs || []).forEach(function(def){
        const parts = def.split("\t");
        const type = partName[parts[0]] || parts[0] || "Meaning";
        const definition = parts.slice(1).join("\t") || def;

        const p = document.createElement("p");
        p.className = "mb-2";
        p.textContent = type + ": " + definition;
        meaningsEl.appendChild(p);
    });

    const synonyms = synData.map(function(item) {
        return item.word;
    });
    synonymsEl.textContent = synonyms.length > 0
    ? "Synonyms: " + synonyms.join(", ")
    : "Synonyms: none available";

    updateSaveButton();
    resultBox.classList.remove("hidden");
 }
 function updateSaveButton() {
        const isSaved = savedWords.includes(currentWord);
        saveBtn.textContent = isSaved ? "*Saved" : "*Save";
        resultBox.classList.toggle("bg-yellow-100", isSaved);
        resultBox.classList.toggle("bg-white", !isSaved);
    }
    function toggleSave() {
        if (savedWords.includes(currentWord)) {
            savedWords = savedWords.filter(function (w) {
                return w !== currentWord;
            });
        } else {
            savedWords.push(currentWord);
        }
        localStorage.setItem("savedWords", JSON.stringify(savedWords));
        updateSaveButton();
        showSavedWords();

    }
function showSavedWords(){
    saveList.innerHTML = "";
    savedWords.forEach(function(word){
        const button = document.createElement("button");
        button.textContent = word;
        button.className = "rounded bg-yellow-200 px-3 py-1 hover:bg-yellow-300";
        button.addEventListener("click",function() {
            input.value = word;
            searchWord(word);
        });
        const item = document.createElement("li");
        item.appendChild(button);
        saveList.appendChild(item);
    });
}

form.addEventListener("submit",function (event) {
    event.preventDefault();
    searchWord(input.value.trim().toLowerCase());
});

saveBtn.addEventListener("click",toggleSave);
speakBtn.addEventListener("click",function() {
   speechSynthesis.speak(new SpeechSynthesisUtterance(currentWord));
});

showSavedWords();

if(typeof module !=="undefined") {
    module.exports = {searchWord, toggleSave};
}



