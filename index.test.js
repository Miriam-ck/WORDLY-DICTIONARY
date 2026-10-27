/** @jest-environment jsdom */                          
const fs = require("fs");
const path = require("path");

document.documentElement.innerHTML = fs.readFileSync(
  path.join(__dirname,"index.html"),
  "utf8"
);
const {searchWord,toggleSave} = require("./index.js");

const helloData = [
    {word:"hello",tags:["pron:HH AHO L OW 1"],defs:["n\tan expression of greeting"]},
];
const helloSynonyms = [{word:"hi"},{word:"howdy"}];
const plainData = [{word:"plain",defs:["adj\tsimple"]}];

function fakeFetch(wordData,synData){
    globalThis.fetch = jest.fn()
     .mockResolvedValueOnce({json:async() => wordData})
     .mockResolvedValueOnce({json:async() => synData});
}
function text(id) {
    return document.getElementById(id).textContent;
}

 test("empty search shows an error",async() => {
    fakeFetch([],[]);
    await searchWord("");
    expect(text("error")).toBe("Please type a word.");
 });

 test("valid word shows its details",async() => {
    fakeFetch(helloData,helloSynonyms);
    await searchWord("hello");
    expect(text("word")).toBe("hello");
    expect(text("phonetic")).toContain("HH AHO L OW 1");
    expect(text("meaning")).toContain("noun: an expression of greeting");
    expect(text("synonyms")).toBe("Synonyms: hi, howdy");
 });

 test("missing pronunciation and synonyms show fallbacks",async() => {
     fakeFetch(plainData,[]);
     await searchWord("plain");
     expect(text("phonetic")).toBe("No pronunciation available");
     expect(text("synonyms")).toBe("Synonyms: none available");
    });

    test("unknown word shows not-found error",async()=> {
        fakeFetch([],[]);
        await searchWord("zzzzzz");
        expect(text("error")).toBe("Word not found. Please check the spelling.");
    });
    test("network failure shows connection error",async() => {
        globalThis.fetch = jest.fn().mockRejectedValue(new Error("offline"));
        await searchWord("hello");
        expect(text("error")).toBe("Something went wrong. Please check your internet connection.");

    });

    test("toggleSave saves the current word",async() => {
        fakeFetch(helloData,helloSynonyms);
        await searchWord("hello");
        toggleSave();
        expect(JSON.parse(localStorage.getItem("savedWords"))).toEqual(["hello"]);
        expect(text("save-Btn")).toBe("*Saved");
    });