let serverhost = 'http://127.0.0.1:8000';
let words_default = {};
let activated_default = false;
let userInfo;
let clientId = '271850698689-01761jqfpvaaq33640kohv5drfhbnq52.apps.googleusercontent.com';
let redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
let nonce = Math.random().toString(36).substring(2, 15);
// import { Buffer } from 'buffer';


// console.log('test1');
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.get({'activated': activated_default}, function(result) {
//             console.log(result.activated);
//             chrome.storage.sync.set({'activated': result.activated}, () => {
//                 console.log('activated stored')
//             })
//     });


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'authorize') {
            console.log('authorization triggered');
            const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

            authUrl.searchParams.set('client_id', clientId);
            authUrl.searchParams.set('response_type', 'id_token');
            authUrl.searchParams.set('redirect_uri', redirectUri);
            // Add the OpenID scope. Scopes allow you to access the user’s information.
            authUrl.searchParams.set('scope', 'openid profile email');
            authUrl.searchParams.set('nonce', nonce);
            // Show the consent screen after login.
            // authUrl.searchParams.set('prompt', 'consent');

            chrome.identity.launchWebAuthFlow(
                {
                    url: authUrl.href,
                    interactive: true,
                },
                (redirectUrl) => {
                    if (redirectUrl) {
                        // The ID token is in the URL hash
                        const urlHash = redirectUrl.split('#')[1];
                        const params = new URLSearchParams(urlHash);
                        const jwt = params.get('id_token');
            
                        // Parse the JSON Web Token
                        const base64Url = jwt.split('.')[1];
                        const base64 = base64Url.replace('-', '+').replace('_', '/');
                        const token = JSON.parse(atob(base64));
                        userInfo = token;
                        // notify options.js that it can save settings as user has been authenticated
                        if (request.origin === 'options') {
                            chrome.runtime.sendMessage({type:'auth_completed'});
                        }
                        console.log('token', token);
                    }
                },
            );
        }
        else if (request.type === 'save'){
            console.log('save ' + request.word + ' ' + request.translation);
            let url = serverhost + '/api/save'
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({word: request.word, translation: request.translation, userInfo: userInfo})
            })
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(error => console.log(error))

            return true
        }
        // delete word from db
        else if (request.type === 'delete') {
            console.log('delete ' + request.word + ' ' + request.translation)
            let url = serverhost + '/api/delete'
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({word: request.word, userInfo: userInfo})
            })
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(error => console.log(error))
            return true; 
        }
        else if (request.type === 'saveOptions') {
            // get saved options from chrome storage
            chrome.storage.sync.get({
                sendToPhone: false,
                sendToEmail: false,
                phoneNumber: '',
                numWords: 5
            }, function(items) {
                    console.log('function executed');
                    let url = serverhost + '/api/update';
                    // send data to backend
                    fetch(url, {
                        method: 'POST',
                        body: JSON.stringify({
                            userInfo: userInfo, 
                            sendToPhone: items.sendToPhone,
                            sendToEmail: items.sendToEmail, 
                            phoneNumber: items.phoneNumber,
                            numWords: items.numWords
                        })
                    })
                    .then((response) => {
                        console.log('first then executed');
                        console.log(response);
                    })
                    .catch(error => console.log(error))
        
                    return true
            })
        }
    }
)



    




    
