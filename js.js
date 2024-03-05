
const firebaseConfig = {
    apiKey: "AIzaSyCvGGb0NWirKcKX9P_krRogy5BdN1XUxww",
    authDomain: "e2ee-messengers.firebaseapp.com",
    projectId: "e2ee-messengers",
    storageBucket: "e2ee-messengers.appspot.com",
    messagingSenderId: "979623333154",
    appId: "1:979623333154:web:91a56de139f27fb365297b"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const dbName = 'testdatabase3';
const dbVersion = 2;

var public = null;
var display = null;
var map = {};

var loaded = null;
var otherdisplay = null;
var received_messages = [];
var sent_messages = [];
var invites = [];



var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
    if(auth.currentUser != null) {
        initialize();
        unsubscribe();
    }
});





function register() {
    email = document.getElementById('register-email');
    password = document.getElementById('register-password');
    display = document.getElementById('register-display');

    auth.createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {
        var user = userCredential;
        var keys = sodium.crypto_kx_keypair();
        var userData = {
            display : display.value,
            public : sodium.to_hex(keys.publicKey)
        };
        database.ref('/users/' + auth.currentUser.uid).set(userData);
        localStorage.setItem("private", sodium.to_hex(keys.privateKey));

        const indexed = window.indexedDB.open(dbName, dbVersion);

        indexed.onupgradeneeded = function(event) {

            console.log("UPGRADE")
            const db = event.target.result;
            // Check if the object store 'keys' exists
            if (!db.objectStoreNames.contains('keys')) {
                const objectStore = db.createObjectStore('keys', { keyPath: 'uid' });
            }
        };

        indexed.onsuccess = function(event) {
            console.log("SUCCESS");
            var key = get_private_local()
            const db = event.target.result;

            var transaction = db.transaction(['keys'], 'readwrite');
            var objectStore = transaction.objectStore('keys');
            var keyData = { uid: auth.currentUser.uid, privateKey: key };
            var request = objectStore.put(keyData);

            request.onsuccess = function(event) {
                console.log('Private key stored successfully');
            };

            request.onerror = function(event) {
                console.error('Error storing private key');
            };
        };      
    });
}

function login() {
    email = document.getElementById('login-email');
    password = document.getElementById('login-password');

    auth.signInWithEmailAndPassword(email.value, password.value).then((userCredential) => {
        console.log(userCredential);
    });

}


function initialize() {
    console.log("INIT");
    database.ref("/users/" + auth.currentUser.uid + "/public").get().then((pub) => {
        public = pub.val();
        database.ref("/users/" + auth.currentUser.uid + "/display").get().then((dis) => {
            display = dis.val();
            document.getElementById('user-container').innerHTML = "<h1>Welcome " + display + "!</h1> <br><p>User ID: " + auth.currentUser.uid + "</p>";
            get_invites();
        });
    });

    database.ref("/users/" + auth.currentUser.uid + "/conversations").on('child_added', (sent) => {
        add_to_map(sent.key)
    }); 
}

async function add_to_map(uid) {
    if(!map.hasOwnProperty(uid)) {
        const otherPublic = (await database.ref("/users/" + uid + "/public").get()).val();
        const otherDisplay = (await database.ref("/users/" + uid + "/display").get()).val();
        const privateKey = await get_private();
        const clientkeys = sodium.crypto_kx_client_session_keys(sodium.from_hex(public), sodium.from_hex(privateKey), sodium.from_hex(otherPublic));
        const serverkeys = sodium.crypto_kx_server_session_keys(sodium.from_hex(public), sodium.from_hex(privateKey), sodium.from_hex(otherPublic));
        map[uid] = {
            hex : otherPublic,
            display : otherDisplay,
            crx : clientkeys.sharedRx,
            ctx : clientkeys.sharedTx,
            srx : serverkeys.sharedRx,
            stx : serverkeys.sharedTx
        };
        update_conversations();
    }
}

async function send_conversation_invite(uid) {
    await database.ref("/invites/" + uid + "/conversations/" + auth.currentUser.uid).set(true);
    await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(true);
}

async function send_group_invite(groupId, uid) {
    await database.ref("/invites/" + uid + "/groups/" + groupId).set(true);
    await database.ref("/groups/" + groupId + "/members/" + uid).set(true);
}

async function accept_conversation_invite(uid) {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
    await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(true);
}

async function accept_group_invite(groupId) {
    await database.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId).set(null);
    await database.ref("/users/" + auth.currentUser.uid + "/groups/" + uid).set(true);
}

async function reject_conversation_invite(uid) {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
    // await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
}

async function reject_group_invite(groupId) {
    await database.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId).set(null);
    // await database.ref("/users/" + auth.currentUser.uid + "/groups/" + uid).set(null);
}


async function get_invites() {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/").on("value", (conversations) => {
        invites = []
        update_invites();
        conversations.forEach((conversation) => {
            database.ref("/users/" + conversation.key + "/display").get().then((display) => {
                invites.push("<h3>" + display.val() + " is wanting to message you! </h3><br><h5>UID: " + conversation.key + "</h5><br><button onclick=\"accept_conversation_invite('" + conversation.key + "')\">Accept</button><button onclick=\"reject_conversation_invite('" + conversation.key + "')\">Reject</button>") ;    
                update_invites();
            });
        });
    });

   
}



async function send_message(uid, message) {
    await add_to_map(uid);
    nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    encrypted = sodium.crypto_secretbox_easy(message, nonce, map[uid].ctx);

    var payload = {
        timestamp : new Date().getTime(),
        payload : sodium.to_hex(encrypted),
        nonce : sodium.to_hex(nonce)
    };

    await database.ref("/messages/" + uid + "/" + auth.currentUser.uid).push(payload);
    
    // OLD
    //await database.ref("/users/" + uid + "/messages/" + auth.currentUser.uid).push(payload);
    //database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(1);
    //database.ref("/users/" + uid + "/conversations/" + auth.currentUser.uid).set(1);
}

async function send_file(uid, file) {
    if (file.size <= 100000) {
        await add_to_map(uid);
        nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        encrypted = sodium.crypto_secretbox_easy(await pako.gzip(await file.arrayBuffer()), nonce, map[uid].ctx);

        var payload = {
            timestamp : new Date().getTime(),
            payload : sodium.to_hex(encrypted),
            nonce : sodium.to_hex(nonce),
            type : file.type
        }

        await database.ref("/messages/" + uid + "/" + auth.currentUser.uid).push(payload);

        // OLD
        //database.ref("/users/" + uid + "/messages/" + auth.currentUser.uid).push(payload);
        //database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(1);
        //database.ref("/users/" + uid + "/conversations/" + auth.currentUser.uid).set(1);
    } else {
        console.err("Size of file is too big!");
    }
}

async function get_received_messages(uid) {
    received_messages = [];
    return database.ref("/messages/" + auth.currentUser.uid + "/" + uid).on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        type = message.child('type').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[uid].srx);

        if(type == null) {
            output = {
                message: sodium.to_string(decrypted),
                timestamp: timestamp
            }
        } else {

            decrypted = pako.inflate(decrypted);

            if(type.indexOf('image') >= 0){
                output = {
                    message: "<img src=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" />",
                    type: type,
                    timestamp: timestamp
                }
            } else {
                output = {
                    message: "<a href=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" >Download File</a><br><h6>Filetype: " + type + "</h6>",
                    type: type,
                    timestamp: timestamp
                }
            }
        }

        received_messages.push(output);
        update_messages();
    });
}



async function get_sent_messages(uid) {
    sent_messages = [];
    return database.ref("/messages/" + uid + "/" + auth.currentUser.uid).on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        type = message.child('type').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[uid].ctx);

        if(type == null) {
            output = {
                message: sodium.to_string(decrypted),
                timestamp: timestamp
            }
        } else {

            decrypted = pako.inflate(decrypted);

            if(type.indexOf('image') >= 0){
                output = {
                    message: "<img src=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" />",
                    type: type,
                    timestamp: timestamp
                }
            } else {
                output = {
                    message: "<a href=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" >Download File</a><br><h6>Filetype: " + type + "</h6>",
                    type: type,
                    timestamp: timestamp
                }
            }
        }

        sent_messages.push(output);
        update_messages();
    });
}

function new_conversation() {
    unload_conversation();
    var uid = document.getElementById('new-conversation-uid').value;
    var message = document.getElementById('new-conversation-message').value;
    console.log(uid + " " + message);
    send_message(uid, message)
    load_conversation(uid);
}

function load_conversation(uid) {
    unload_conversation();
    loaded = uid;
    otherdisplay = map[uid].display;
    get_received_messages(uid);
    get_sent_messages(uid);

    var container = document.getElementById('message-container');
    container.innerHTML = "<input type=\"text\" id=\"message-box\"><button onclick=\"send_message(\'" + uid+ "\', " + "document.getElementById('message-box').value);\">Send</button><input type='file' id='file-upload' /><button onclick=\"send_file(\'" + uid + "\', document.getElementById('file-upload').files[0]);\">Send File</button>";
}

function unload_conversation() {
    if(loaded != null) {
        database.ref("/users/" + loaded + "/messages/" + auth.currentUser.uid).off();
        database.ref("/users/" + auth.currentUser.uid + "/messages/" + loaded).off();
        loaded = null;
        otherdisplay = null;
        received_messages = [];
        sent_messages = [];
        update_messages();
        document.getElementById('message-container').innerHTML = "";
    }
}

function update_messages() {
    var container = document.getElementById('messages-container');
    container.innerHTML = "";
    var rcount = 0, scount = 0;
    while(true) {
        if (rcount < received_messages.length)
            if(scount < sent_messages.length)
                if (rcount < received_messages.length && received_messages[rcount].timestamp <= sent_messages[scount].timestamp){
                    container.innerHTML += "<div class=\"other\"><h2>" + otherdisplay + ":  <h2><h3>" + received_messages[rcount].message + "</h3><br></div>"
                    rcount++;
                } else {
                    container.innerHTML += "<div class=\"you\"><h2>You:  <h2><h3>" + sent_messages[scount].message + "</h3><br></div>"
                    scount++;
                }
            else {
                container.innerHTML += "<div class=\"other\"><h2>" + otherdisplay + ":  <h2><h3>" + received_messages[rcount].message + "</h3><br></div>"
                rcount++;
            }
        else {
            if(scount < sent_messages.length) {
                container.innerHTML += "<div class=\"you\"><h2>You:  <h2><h3>" + sent_messages[scount].message + "</h3><br></div>"
                scount++;
            } else break;
        }
    }
}

function update_conversations() {
    var container = document.getElementById('conversations-container');
    container.innerHTML = "";
    Object.keys(map).forEach((key) => {
      container.innerHTML += "<div class=\"conversation\" onclick=\"load_conversation(\'" + key + "\')\"><h3>" + map[key].display + "</h3><br>" + key + "</div> <br>"
    });
}

function update_invites() {
    var container = document.getElementById('invites-container');
    container.innerHTML = "";
    invites.forEach((invite) => {
        container.innerHTML += "<div class=\"invite\">" + invite + "</div>";
    });
}




async function get_private() {
    return new Promise((resolve, reject) => {
        const indexed = window.indexedDB.open(dbName, dbVersion);

        indexed.onsuccess = function(event) {

            const db = event.target.result;
            if (db.objectStoreNames.contains('keys')) {
                var transaction = db.transaction(['keys'], 'readonly');
                var objectStore = transaction.objectStore('keys');
                var request = objectStore.get(auth.currentUser.uid);

                request.onsuccess = function(event) {
                    const keyData = event.target.result;
                    if (keyData) {
                        console.log('Private key retrieved successfully:', keyData.privateKey);
                        resolve(keyData.privateKey);
                    } else {
                        console.error('Private key not found');
                        reject(new Error('Private key not found'));
                    }
                };

                request.onerror = function(event) {
                    console.error('Error retrieving private key');
                    reject(event.target.error);
                };  
            } else {
                console.error('Private key not found!');
                reject(new Error('Private key not found'));
            }
        };
    });
}





// OLD FUNCTIONS
function get_private_local() {
    return localStorage.getItem("private");
}

function transfer_private() {
    const indexed = window.indexedDB.open(dbName, dbVersion);

    indexed.onupgradeneeded = function(event) {
        const db = event.target.result;
        // Check if the object store 'keys' exists
        if (!db.objectStoreNames.contains('keys')) {
            const objectStore = db.createObjectStore('keys', { keyPath: 'uid' });
        }
    };

    indexed.onsuccess = function(event) {
        var key = get_private_local()
        const db = event.target.result;

        var transaction = db.transaction(['keys'], 'readwrite');
        var objectStore = transaction.objectStore('keys');
        var keyData = { uid: auth.currentUser.uid, privateKey: key };
        var request = objectStore.put(keyData);

        request.onsuccess = function(event) {
            console.log('Private key stored successfully');
        };

        request.onerror = function(event) {
            console.error('Error storing private key');
        };
    }
}



/*
setTimeout(() => {
    //initialize()
    
    a = sodium.crypto_kx_keypair();
    b = sodium.crypto_kx_keypair();

    c = sodium.crypto_kx_client_session_keys(a.publicKey, a.privateKey, b.publicKey)
    d = sodium.crypto_kx_server_session_keys(b.publicKey, b.privateKey, a.publicKey)

    console.log(a)
    console.log(b)
    console.log(c)
    console.log(d)

    message = "Hello, server!";
    nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    ciphertext = sodium.crypto_secretbox_easy(message, nonce, c.sharedTx);
    console.log("Encrypted message:", ciphertext);
    console.log("Nonce:", nonce);

    decryptedMessage = sodium.crypto_secretbox_open_easy(ciphertext, nonce, d.sharedRx);
    console.log("Decrypted message:", sodium.to_string(decryptedMessage));

    
}, "1000");*/