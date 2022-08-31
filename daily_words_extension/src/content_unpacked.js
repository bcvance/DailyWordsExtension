import tippy, { hideAll } from 'tippy.js';
import 'tippy.js/dist/tippy.css';


const authKey = process.env.DEEPL_AUTH_KEY
let toolTipActive = false;

// top level function controlling the isolation of word in body text and creation of tooltip
function tooltipResponse(event) {
    if (event.target.id !== 'save-btn'){
        console.log('tooltipResponse triggered');
        console.log(toolTipActive);
        if (!event.target.hasAttribute('click')) {
            console.log('doesnt have click attribute');
            let wordData = wordFinder(event);
            let word = wordData[0];
            let selection = wordData[1];
            let range = wordData[2];
            wrapWord(word,selection,range);
            createToolTip(word);
        }
    }
}
// create tooltip, fetch translation from API, create event listeners for saving and deleting words
function createToolTip(word) {
    fetch(`https://api-free.deepl.com/v2/translate?auth_key=${authKey}&text=${word}&target_lang=EN-US`, {
            method: 'POST'
        })
        .then((response) => response.json())
        .then((data) => {
            // once translation data has been received, create tooltip on word
            const el = document.getElementById(`${word}-node`);
            const instance = tippy(el, {
                content: 
                `<div>
                    <strong>${word} - </strong>
                    <p style='margin: 5px 0;'>${data.translations[0].text}</p>
                    <strong id='save-btn' style='text-decoration: underline; cursor: pointer;'>Save This Word</strong> 
                </div>
                `
                ,
                allowHTML: true,
                trigger: 'click',
                hideOnClick: true,
                interactive: true,
                showOnCreate: true,
                // when tippy is showing, clicking anywhere simply minimizes the tippy,
                // and does not try to evaluate next thing clicked
                // onShow(instance) {
                //     console.log('onSHow');
                //     $("body").off('click');
                // },
                // when tippy is minimized, we reactivate wordFinder event listener so that
                // we can continue to translate new terms
                // onHidden(instance) {
                //     console.log("onHidden");
                //     hideAll();
                //     $("body").on('click', (event) => {
                //         wordFinder(event);
                //     });
                // }
            });
            // highlight word to indicate it has been clicked
            el.style.backgroundColor = '#00ffd9';

            // add event listeners to save button
            document.getElementById('save-btn').onclick = (event) => {
                // here we will save word - translation pair to storage
                console.log(word);
                if (event.target.innerHTML === 'Save This Word') {
                    // send message to background.js to initiate call to backend API to save word
                    chrome.runtime.sendMessage({word: word, translation: data.translations[0].text, type: 'save'}, function(response) {
                      });
                    event.target.innerHTML = 'Unsave Word';
                }
    
                else {
                    // send message to background.js to initiate call to backend API to delete word
                    chrome.runtime.sendMessage({word: word, type: 'delete'}, function(response) {
                      });
                    event.target.innerHTML = 'Save This Word';
                }
                
            }
        })
}

function wrapWord(word,selection,range) {
    console.log(word);
    // checks if what was clicked on was a word (no numbers)
    if (word && !/\d/.test(word)){
        console.log(`word is ${word}`);
        // surrounds word with span so that tooltip can be create on it and highlighting can be applied
        let newSpan = document.createElement('span');
        newSpan.id = `${word}-node`;
        newSpan.setAttribute('click', 'true');
        newSpan.appendChild(document.createTextNode(word));

        if (selection.rangeCount) {
            range.deleteContents();
            range.insertNode(newSpan);
        }
        
        
    }
}

// isolates word clicked on and returns information about its range in the body text
// so that tooltip can be created in the right location with the right data
function wordFinder(event) {
    // Gets clicked on word (or selected text if text is selected)
    let t;
    let html;
    let range;
    let sel;
    let s;
    if (window.getSelection && (sel = window.getSelection()).modify) {
        // Webkit, Gecko
        s = window.getSelection();
        if (s.isCollapsed) {
            s.modify('move', 'forward', 'character');
            s.modify('move', 'backward', 'word');
            s.modify('extend', 'forward', 'word');
            t = s.toString();
            range = s.getRangeAt(0);
            console.log(range)
            s.modify('move', 'forward', 'character'); //clear selection
        }
        else {
            t = s.toString();
            range = s.getRangeAt(0);
        }   
    }
    return [t,s,range];
}



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'activation'){
            //chrome.storage.sync.set({'activated': request.status});
            chrome.storage.sync.get('activated', function(result){
                if (result.activated) {
                    console.log('if executed')
                    $("body").on('click', (event) => {
                        tooltipResponse(event);
                    });
                }
                else {
                    console.log('else executed');
                    toolTipActive = false;
                    $("body").off('click');
                }
            });
        }
    // I think this set is redundant since I set "activated" in popup.js
      
    }
  );

// chrome.storage.onChanged.addListener(function() {
//     chrome.storage.sync.get('words', function(result) {
//         console.log(result.words);
//     })
// })



// // testing

// chrome.storage.sync.get('words', function(result) {
//     console.log(result.words);
// });

// chrome.storage.sync.get('activated', function(result) {
//     console.log(result.activated);
// });

