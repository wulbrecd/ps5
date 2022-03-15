/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 *
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    // You'll need to finish this...
    console.log("saving: " + word)
    savedWordsArray.push(word);
    document.getElementById("saved_words").innerHTML = savedWords.join(', ');
}

// Add additional functions/callbacks here.



document.getElementById("saved_words").innerHTML = "(None)";

let saveButton = document.createElement('savebtn');
saveButton.style.backgroundColor = "#3dfe3a";
saveButton.textContent = "Save";


function getRhymes() {
    datamuseRequest( getDatamuseRhymeUrl(wordInput.value), (data) => {
        wordOutput.innerHTML = '';
        outputDescription.innerHTML = 'Words that rhyme with ' + wordInput.value;
        if (data.length) {
            let results = groupBy(data, 'numSyllables');
            for (syllables in results) {
                wordOutput.innerHTML += `<h3 class="syllables"> Syllables: ${syllables}</h3>`
                for (item in results[syllables]) {
                    wordOutput.innerHTML += `<li class="col-item">${results[syllables][item].word} <button id='save' style='background-color:#3dfe3a' value='${results[syllables][item].word}'>Save</button></li>`;
                }
            }
        } else {
            wordOutput.innerHTML = 'no results';
        }
    })
}

// Add event listeners here.

showRhymesButton.addEventListener('click', () => {
    getRhymes();
})

wordInput.addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
        getRhymes();
    }
})

showSynonymsButton.addEventListener('click', () => {
    datamuseRequest( getDatamuseSimilarToUrl(wordInput.value), (data) => {
        wordOutput.innerHTML = '';
        if (data.length) {
            data.forEach((item) => {
                outputDescription.innerHTML = 'Words with a similar meaning to ' + wordInput.value;
                wordOutput.innerHTML += `<li class="col-item">${item.word} <button class='save' style='background-color:#3dfe3a' value='${item.word}>Save</button></li>`;
            });
        } else {
            wordOutput.innerHTML = '(no results)';
        }

    })
})



saveButton.addEventListener('click', () => {
    addToSavedWords(saveButton.value);
});
