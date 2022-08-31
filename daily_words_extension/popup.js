let activatedBtn = document.getElementById('activated');

// check how this is actually stored in chrome starage across tabs and windows
chrome.storage.sync.get('activated', function(result) {
    if (!result.activated) {
        activatedBtn.innerHTML = 'activate';
    }
    else {
        activatedBtn.innerHTML = 'deactivate';
    }
})

activatedBtn.onclick = () => {
    if (activatedBtn.innerHTML === 'activate') {
        chrome.storage.sync.set({'activated': true});
        activatedBtn.innerHTML = 'deactivate';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'activation'});
          });
        chrome.runtime.sendMessage({type: 'authorize', origin: 'popup'});  
    }
    else {
        chrome.storage.sync.set({'activated': false});
        activatedBtn.innerHTML = 'activate';

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'activation'});
          });
    }
}