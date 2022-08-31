const phoneInput = document.getElementById('phone');

phoneInput.onclick = () => {
    if (document.getElementById('phone').checked) {
        document.getElementById('numberfield').style.display = 'block';
    }
    else {
        document.getElementById('numberfield').style.display = 'none';
    }
}

function saveOptions() {
    chrome.storage.sync.set({
        sendToPhone: phoneInput.checked,
        sendToEmail: document.getElementById('email').checked,
        phoneNumber: document.getElementById('number').value,
        numWords: document.getElementById('num-words').value
    }, function() {
        // tell background.js to save new settings to database
        chrome.runtime.sendMessage({type: 'saveOptions'})
        // update status to let user know options were saved
        let status = document.getElementById('status');
        status.textContent = 'Preferences Saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    }); 
}

function restoreOptions() {
    chrome.storage.sync.get({
        sendToPhone: false,
        sendToEmail: false,
        phoneNumber: '',
        numWords: 5
    }, function(items) {
        phoneInput.checked = items.sendToPhone;
        document.getElementById('email').checked = items.sendToEmail;
        document.getElementById('num-words').value = items.numWords;
        if (phoneInput.checked) {
            document.getElementById('numberfield').style.display = 'block';
        }
        document.getElementById('number').value = items.phoneNumber;
    })
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// save settings
document.getElementById('save').addEventListener('click', function() {
    
    // in case user has not been authenticated by activate extension on a page,
    // we will authenticate and fetch their user info now
    chrome.runtime.sendMessage({type: 'authorize', origin: 'options'});  
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'auth_completed') {
            saveOptions();
        }
    }
)