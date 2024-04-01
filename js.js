
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
const dbVersion = 4;

var public = null;
var publicSignature = null;
var display = null;
var map = {};

var conversations = [];
var groups = [];

var loaded = null;
var isGroup = false;
var otherdisplay = null;
var received_messages = [];
var sent_messages = [];
var conversation_invites = [];
var group_invites = [];

var refs = [];


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
        var signing = sodium.crypto_sign_keypair();

        var userData = {
            display : display.value,
            public : sodium.to_hex(keys.publicKey),
            signature : sodium.to_hex(signing.publicKey)
        };
        database.ref('/users/' + auth.currentUser.uid).set(userData);

        // TEMP
        localStorage.setItem("private", sodium.to_hex(keys.privateKey));
        localStorage.setItem("signature", sodium.to_hex(signing.privateKey));

        const indexed = window.indexedDB.open(dbName, dbVersion);

        indexed.onupgradeneeded = function(event) {

            console.log("UPGRADE")
            const db = event.target.result;
            // Check if the object store 'keys' exists
            if (!db.objectStoreNames.contains('keys')) {
                const objectStore = db.createObjectStore('keys', { keyPath: 'uid' });
            }

            if(!db.objectStoreNames.contains('signature')) {
                const objectStore = db.createObjectStore('signature', { keyPath: 'uid' });
            }
        };

        indexed.onsuccess = function(event) {
            console.log("SUCCESS");

            const db = event.target.result;

            var transaction = db.transaction(['keys'], 'readwrite');
            var objectStore = transaction.objectStore('keys');
            var keyData = { uid: auth.currentUser.uid, privateKey: sodium.to_hex(keys.privateKey) };
            var request = objectStore.put(keyData);

            var transaction = db.transaction(['signature'], 'readwrite');
            var objectStore = transaction.objectStore('signature');
            var keyData = { uid: auth.currentUser.uid, privateKey: sodium.to_hex(signing.privateKey) };
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


async function initialize() {
    console.log("INIT");

    public = (await database.ref("/users/" + auth.currentUser.uid + "/public").get()).val();
    publicSignature = (await database.ref("/users/" + auth.currentUser.uid + "/signature").get()).val();
    display = (await database.ref("/users/" + auth.currentUser.uid + "/display").get()).val();

    document.getElementById('user-container').innerHTML = "<h1>Welcome " + display + "!</h1> <br><p>User ID: " + auth.currentUser.uid + "</p>";
    get_invites();

    /*
    database.ref("/users/" + auth.currentUser.uid + "/public").get().then((pub) => {
        public = pub.val();
        database.ref("/users/" + auth.currentUser.uid + "/signature").get().then((sig) => {
            publicSignature = sig.val();
            database.ref("/users/" + auth.currentUser.uid + "/display").get().then((dis) => {
                display = dis.val();
                document.getElementById('user-container').innerHTML = "<h1>Welcome " + display + "!</h1> <br><p>User ID: " + auth.currentUser.uid + "</p>";
                get_invites();
            });
        });
    });*/

    database.ref("/users/" + auth.currentUser.uid + "/conversations").on('child_added', (conversation) => {
        add_to_conversations(conversation.key);
    });

    database.ref("/users/" + auth.currentUser.uid + "/groups").on('child_added', (group) => {
        add_to_groups(group.key);
        console.log("Added Group", group.key);
    });
}

async function add_to_map(uid) {
    if(!map.hasOwnProperty(uid)) {
        const otherPublic = (await database.ref("/users/" + uid + "/public").get()).val();
        const otherSignature = (await database.ref("/users/" + uid + "/signature").get()).val();
        const otherDisplay = (await database.ref("/users/" + uid + "/display").get()).val();
        const privateKey = await get_private();
        const clientkeys = sodium.crypto_kx_client_session_keys(sodium.from_hex(public), sodium.from_hex(privateKey), sodium.from_hex(otherPublic));
        const serverkeys = sodium.crypto_kx_server_session_keys(sodium.from_hex(public), sodium.from_hex(privateKey), sodium.from_hex(otherPublic));
        map[uid] = {
            hex : otherPublic,
            signature : otherSignature,
            display : otherDisplay,
            crx : clientkeys.sharedRx,
            ctx : clientkeys.sharedTx,
            srx : serverkeys.sharedRx,
            stx : serverkeys.sharedTx
        };
    }
}


async function add_to_conversations(uid) {
    await add_to_map(uid);
    conversations.push(uid);
    update_conversations();
}

async function add_to_groups(groupId) {
    database.ref("/groups/" + groupId + "/members").on('child_added', (member) => {
        add_to_map(member.key);
        console.log("Added Member", member.key);
    });        
    groups.push(groupId);
    update_groups();
}


async function send_conversation_invite(uid) {
    if (!(await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).get()).exists()) {
        await database.ref("/invites/" + uid + "/conversations/" + auth.currentUser.uid).set(true);
        await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(true);
    }
}

async function send_group_invite(groupId, uid) {
    if (!(await database.ref("/groups/" + groupId + "/members/" + uid).get()).exists()) {
        await database.ref("/invites/" + uid + "/groups/" + groupId).set(true);
        await database.ref("/groups/" + groupId + "/members/" + uid).set(true);
    }
}

async function accept_conversation_invite(uid) {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
    await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(true);
}

async function accept_group_invite(groupId) {
    await database.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId).set(null);
    await database.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId).set(true);
}

async function reject_conversation_invite(uid) {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
}

async function reject_group_invite(groupId) {
    await database.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId).set(null);
    await database.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid).set(null);
}



async function leave_conversation(uid) {
    await delete_conversation_messages(uid);
    await database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(null);
}

async function leave_group(groupId) {
    await delete_group_messages(groupId);
    await database.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid).set(null);
    if (is_admin(groupId)) {
        await database.ref("/groups/" + groupId + "/admins/" + auth.currentUser.uid).set(null);
        // Add assigning another admin if there is only one admin
    }
    await database.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId).set(null);
}

async function delete_conversation_messages(uid) {
    await database.ref("/messages/" + uid + "/" + auth.currentUser.uid).set(null);
}


async function delete_group_messages(groupId) {
    for (member of await get_group_members(groupId)) {
        database.ref("/group_messages/" + groupId + "/" + member + "/" + auth.currentUser.uid).set(null);
    }
}



async function get_admins(groupId) {
    return Object.keys((await database.ref("/groups/" + groupId + "/admins").get()).val()); 
}

async function is_admin(groupId) {
    return (await get_admins(groupId)).includes(auth.currentUser.uid);
}

async function promote_admin(groupId, uid) {
    if (await is_admin()) {
        database.ref("/groups/" + groupId + "/admins/" + uid).set(true);
    }
}

async function kick_user(groupId, uid) {
    if (await is_admin()) {
        // Kick user
    }
}






async function get_invites() {
    await database.ref("/invites/" + auth.currentUser.uid + "/conversations/").on("value", (conversations) => {
        conversation_invites = [];
        conversations.forEach((conversation) => {
            database.ref("/users/" + conversation.key + "/display").get().then((display) => {
                conversation_invites.push("<h3>" + display.val() + " is wanting to message you! </h3><br><h5>UID: " + conversation.key + "</h5><br><button onclick=\"accept_conversation_invite('" + conversation.key + "')\">Accept</button><button onclick=\"reject_conversation_invite('" + conversation.key + "')\">Reject</button>") ;    
                update_invites(); // I don't like this
            });
        });
        update_invites();
    });

    await database.ref("/invites/" + auth.currentUser.uid + "/groups/").on("value", (groups) => {
        group_invites = [];
        groups.forEach((group) => {
            group_invites.push("<h3>You have been invited to a group chat!</h3><br><h5>GroupId: " + group.key + "</h5><br><button onclick=\"accept_group_invite('" + group.key + "')\">Accept</button><button onclick=\"reject_group_invite('" + group.key + "')\">Reject</button>") ;    
            update_invites(); // I don't like this
        });
        update_invites();
    });
}




async function new_group() {
    var groupId = sodium.to_hex(sodium.crypto_generichash(16, sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)))
    await database.ref("/groups/" + groupId + "/admins/" + auth.currentUser.uid).set(true);
    await database.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid).set(true);
    await database.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId).set(true);
}



async function send_message(uid, message) {
    await add_to_map(uid);
    msg = await sign_message(message);
    nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[uid].ctx);

    var payload = {
        timestamp : new Date().getTime(),
        payload : sodium.to_hex(encrypted),
        nonce : sodium.to_hex(nonce)
    };

    await send_conversation_invite(uid);
    await database.ref("/messages/" + uid + "/" + auth.currentUser.uid).push(payload);
    
    // OLD
    //await database.ref("/users/" + uid + "/messages/" + auth.currentUser.uid).push(payload);
    //database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(1);
    //database.ref("/users/" + uid + "/conversations/" + auth.currentUser.uid).set(1);
}

async function send_file(uid, file) {
    if (file.size <= 100000) {
        await add_to_map(uid);
        var contents = await sign_message(new Uint8Array(await file.arrayBuffer()));
        nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        encrypted = sodium.crypto_secretbox_easy(await pako.gzip(contents), nonce, map[uid].ctx);

        var payload = {
            timestamp : new Date().getTime(),
            payload : sodium.to_hex(encrypted),
            nonce : sodium.to_hex(nonce),
            type : file.type
        }

        await send_conversation_invite(uid);
        await database.ref("/messages/" + uid + "/" + auth.currentUser.uid).push(payload);

        // OLD
        //database.ref("/users/" + uid + "/messages/" + auth.currentUser.uid).push(payload);
        //database.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid).set(1);
        //database.ref("/users/" + uid + "/conversations/" + auth.currentUser.uid).set(1);
    } else {
        alert("Size of file is too big!");
    }
}

async function get_group_members(groupId) {
    var members = (await database.ref("/groups/" + groupId + "/members").get()).val();
    return Object.keys(members);
}

async function send_group_message(groupId, message) {
    for (uid of await get_group_members(groupId)) {
        await add_to_map(uid);
        msg = await sign_message(message);
        nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[uid].ctx);

        var payload = {
            timestamp : new Date().getTime(),
            payload : sodium.to_hex(encrypted),
            nonce : sodium.to_hex(nonce)
        };

        await send_group_invite(groupId, uid);
        await database.ref("/group_messages/" + groupId + "/" + uid + "/" + auth.currentUser.uid).push(payload);
    }
}

async function send_group_file(groupId, file) {
    if (file.size <= 100000) {

        var fileKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
        var fileNonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        var fileContents = await sign_message(new Uint8Array(await file.arrayBuffer()));
        var encryptedFile = sodium.crypto_secretbox_easy(await pako.gzip(fileContents), fileNonce, fileKey)

        var payload = {
                timestamp : new Date().getTime(),
                payload : sodium.to_hex(encryptedFile),
                nonce : sodium.to_hex(fileNonce),
                type : file.type
            }

        await database.ref("/group_messages/" + groupId + "/" + auth.currentUser.uid + "/files/" + sodium.to_hex(fileNonce)).set(payload);

        for (uid of await get_group_members(groupId)) {
            await add_to_map(uid);
            msg = await sign_message(fileKey);
            nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
            encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[uid].ctx);

            var payload = {
                timestamp : new Date().getTime(),
                payload : sodium.to_hex(encrypted),
                nonce : sodium.to_hex(nonce),
                id: sodium.to_hex(fileNonce)
            };

            await send_group_invite(groupId, uid);
            await database.ref("/group_messages/" + groupId + "/" + uid + "/" + auth.currentUser.uid).push(payload);
        }
    } else {
        alert("Size of file is too big!");
    }
}

async function get_received_messages(uid) {
    received_messages = [];
    ref = database.ref("/messages/" + auth.currentUser.uid + "/" + uid);
    refs.push(ref);
    ref.on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        type = message.child('type').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[uid].srx);

        if(type == null) {
            output = {
                dbid: message.key,
                message: sodium.to_string(verify_message(decrypted, map[uid].signature)),
                timestamp: timestamp,
                uid: uid
            }
        } else {

            decrypted = verify_message(pako.inflate(decrypted), map[uid].signature);

            if(type.indexOf('image') >= 0){
                output = {
                    dbid: message.key,
                    message: "<img src=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" />",
                    type: type,
                    timestamp: timestamp,
                    uid: uid
                }
            } else {
                output = {
                    dbid: message.key,
                    message: "<a href=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" >Download File</a><br><h6>Filetype: " + type + "</h6>",
                    type: type,
                    timestamp: timestamp,
                    uid: uid
                }
            }
        }

        received_messages.push(output);
        update_messages();
    });

    ref.on('child_removed', (message) => {
        for (i in received_messages) {
          if(received_messages[i].dbid == message.key) {
            received_messages.splice(i, 1);
            update_messages();    
            break;
          }
        }
    });
}



async function get_sent_messages(uid) {
    sent_messages = [];
    ref = database.ref("/messages/" + uid + "/" + auth.currentUser.uid);
    refs.push(ref);
    ref.on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        type = message.child('type').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[uid].ctx);

        if(type == null) {
            output = {
                dbid: message.key,
                message: sodium.to_string(verify_message(decrypted, publicSignature)),
                timestamp: timestamp,
                uid: uid
            }
        } else {

            decrypted = verify_message(pako.inflate(decrypted), publicSignature);

            if(type.indexOf('image') >= 0){
                output = {
                    dbid: message.key,
                    message: "<img src=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" />",
                    type: type,
                    timestamp: timestamp,
                    uid: uid
                }
            } else {
                output = {
                    dbid: message.key,
                    message: "<a href=\"" + URL.createObjectURL(new Blob([decrypted], { type: type })) + "\" >Download File</a><br><h6>Filetype: " + type + "</h6>",
                    type: type,
                    timestamp: timestamp,
                    uid: uid
                }
            }
        }

        sent_messages.push(output);
        update_messages();
    });

    ref.on('child_removed', (message) => {
        for (i in sent_messages) {
          if(sent_messages[i].dbid == message.key) {
            sent_messages.splice(i, 1);
            update_messages();    
            break;
          }
        }
    });
}


async function get_received_group_messages(groupId) {
    received_messages = [];

    ref = database.ref("/groups/" + groupId + "/members");
    refs.push(ref);
    ref.on("child_added", (member) => {
        if (member.key != auth.currentUser.uid) {
            add_to_map(member.key);
            get_received_group_messages_from_uid(groupId, member.key);
        }
    });
}

async function get_received_group_messages_from_uid(groupId, uid) {
    ref = database.ref("/group_messages/" + groupId + "/" + auth.currentUser.uid + "/" + uid);
    refs.push(ref);
    ref.on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        id = message.child('id').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[uid].srx);

        if(id == null) {
            output = {
                dbid: message.key,
                message: sodium.to_string(verify_message(decrypted, map[uid].signature)),
                timestamp: timestamp,
                uid: uid
            };
            received_messages.push(output);
            update_messages();
        } else {
            get_group_file_from_id(groupId, uid, id, decrypted, timestamp, message.key, true);
        }
    });

    ref.on('child_removed', (message) => {
        for (i in received_messages) {
          if(received_messages[i].dbid == message.key) {
            received_messages.splice(i, 1);
            update_messages();    
            break;
          }
        }
    });
}

async function get_group_file_from_id(groupId, uid, fileId, key, timestamp, dbid, received) {
    file = (await database.ref("/group_messages/" + groupId + "/" + uid + "/files/" + fileId).get()).val();
    decrypted = sodium.crypto_secretbox_open_easy(sodium.from_hex(file['payload']), sodium.from_hex(file['nonce']), verify_message(key, map[uid].signature));
    decrypted = verify_message(pako.inflate(decrypted), map[uid].signature);

    if(file['type'].indexOf('image') >= 0){
        output = {
            dbid: dbid,
            message: "<img src=\"" + URL.createObjectURL(new Blob([decrypted], { type: file['type'] })) + "\" />",
            type: file['type'],
            timestamp: timestamp,
            uid: uid
        }
    } else {
        output = {
            dbid: dbid,
            message: "<a href=\"" + URL.createObjectURL(new Blob([decrypted], { type: file['type'] })) + "\" >Download File</a><br><h6>Filetype: " + file['type'] + "</h6>",
            type: file['type'],
            timestamp: timestamp,
            uid: uid
        }
    }

    if (received) {
        received_messages.push(output);
    } else {
        sent_messages.push(output);
    }
    update_messages();
}

async function get_sent_group_messages(groupId) {
    sent_messages = [];
    ref = database.ref("/group_messages/" + groupId + "/" + auth.currentUser.uid + "/" + auth.currentUser.uid);
    refs.push(ref);
    ref.on('child_added', (message) => {
        nonce = sodium.from_hex(message.child('nonce').val());
        payload = sodium.from_hex(message.child('payload').val());
        timestamp = message.child('timestamp').val();
        id = message.child('id').val();

        decrypted = sodium.crypto_secretbox_open_easy(payload, nonce, map[auth.currentUser.uid].ctx);

        if(id == null) {
            output = {
                dbid: message.key,
                message: sodium.to_string(verify_message(decrypted, publicSignature)),
                timestamp: timestamp,
                uid: auth.currentUser.uid
            }
            sent_messages.push(output);
            update_messages();
            console.log("SENT MESSAGE:", output);
        } else {
            get_group_file_from_id(groupId, auth.currentUser.uid, id, decrypted, timestamp, message.key, false);
        }
    });

    ref.on('child_removed', (message) => {
        for (i in sent_messages) {
          if(sent_messages[i].dbid == message.key) {
            sent_messages.splice(i, 1);
            update_messages();    
            break;
          }
        }
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
    unload();
    loaded = uid;
    otherdisplay = map[uid].display;
    get_received_messages(uid);
    get_sent_messages(uid);

    var container = document.getElementById('message-container');
    container.innerHTML = "<input type=\"text\" id=\"message-box\"><button onclick=\"send_message(\'" + uid+ "\', " + "document.getElementById('message-box').value);\">Send</button><input type='file' id='file-upload' /><button onclick=\"send_file(\'" + uid + "\', document.getElementById('file-upload').files[0]);\">Send File</button>";
}

function unload_conversation() {
    if(loaded != null) {
        //database.ref("/users/" + loaded + "/messages/" + auth.currentUser.uid).off();
        //database.ref("/users/" + auth.currentUser.uid + "/messages/" + loaded).off();
        loaded = null;
        otherdisplay = null;
        received_messages = [];
        sent_messages = [];
        update_messages();
        document.getElementById('message-container').innerHTML = "";
    }
}

function load_group(groupId) {
    unload()
    loaded = groupId; 
    isGroup = true;
    get_received_group_messages(groupId);
    get_sent_group_messages(groupId);

    var container = document.getElementById('message-container');
    container.innerHTML = "<input type=\"text\" id=\"message-box\"><button onclick=\"send_group_message(\'" + groupId+ "\', " + "document.getElementById('message-box').value);\">Send</button><input type='file' id='file-upload' /><button onclick=\"send_group_file(\'" + groupId + "\', document.getElementById('file-upload').files[0]);\">Send File</button>";
}

function unload_group() {
    if(loaded != null && isGroup) {
        loaded = null;
        isGroup = false;
        otherdisplay = null;
        received_messages = [];
        sent_messages = [];
        update_messages();
        document.getElementById('message-container').innerHTML = "";
    }
}

function unload() {
    if (loaded != null) {
        if (isGroup) {
            unload_group();
        } else {
            unload_conversation();
        }

        refs.forEach((ref) => {
            ref.off();
        });
        refs = [];
    }
}

function update_messages() {
    var container = document.getElementById('messages-container');
    container.innerHTML = "";
    var rcount = 0, scount = 0;

    sent_messages.sort((a, b) => a.timestamp - b.timestamp);
    received_messages.sort((a, b) => a.timestamp - b.timestamp);

    while(true) {
        if (rcount < received_messages.length)
            if(scount < sent_messages.length)
                if (rcount < received_messages.length && received_messages[rcount].timestamp <= sent_messages[scount].timestamp){
                    container.innerHTML += "<div class=\"other\" id=\"" + received_messages[rcount].dbid + "\"><h2>" + map[received_messages[rcount].uid].display + ":  <h2><h3>" + received_messages[rcount].message + "</h3><br></div>"
                    rcount++;
                } else {
                    container.innerHTML += "<div class=\"you\" id=\"" + sent_messages[scount].dbid + "\"><h2>You:  <h2><h3>" + sent_messages[scount].message + "</h3><br></div>"
                    scount++;
                }
            else {
                container.innerHTML += "<div class=\"other\" id=\"" + received_messages[rcount].dbid + "\"><h2>" + map[received_messages[rcount].uid].display + ":  <h2><h3>" + received_messages[rcount].message + "</h3><br></div>"
                rcount++;
            }
        else {
            if(scount < sent_messages.length) {
                container.innerHTML += "<div class=\"you\" id=\"" + sent_messages[scount].dbid + "\"><h2>You:  <h2><h3>" + sent_messages[scount].message + "</h3><br></div>"
                scount++;
            } else break;
        }
    }
}



function update_conversations() {
    var container = document.getElementById('conversations-container');
    container.innerHTML = "";
    conversations.forEach((uid) => {
        container.innerHTML += "<div class=\"conversation\" onclick=\"load_conversation(\'" + uid + "\')\"><h3>" + map[uid].display + "</h3><br>" + uid + "</div> <br>"
    });
}

function update_groups() {
    var container = document.getElementById('groups-container');
    container.innerHTML = "";
    groups.forEach((groupId) => {
        container.innerHTML += "<div class=\"group\" onclick=\"load_group(\'" + groupId + "\')\"><h3>" + groupId + "</h3></div> <br>"
    });
}

function update_invites() {
    var container = document.getElementById('invites-container');

    container.innerHTML = "<h3>Conversation Invites:</h3>";
    if (conversation_invites.length > 0) {
        conversation_invites.forEach((invite) => {
            container.innerHTML += "<div class=\"invite\">" + invite + "</div>";
        });
    } else {
        container.innerHTML += "<p>None</p>"
    }

    container.innerHTML += "<br><h3>Group Invites:</h3>"
    if (group_invites.length > 0) {
        group_invites.forEach((invite) => {
            container.innerHTML += "<div class=\"invite\">" + invite + "</div>";
        });
    } else {
        container.innerHTML += "<p>None</p>"
    }
}



async function sign_message(message) {
    return sodium.crypto_sign(message, sodium.from_hex(await get_signature()));
}

function verify_message(message, public) {
    return sodium.crypto_sign_open(message, sodium.from_hex(public));
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


async function get_signature() {
    return new Promise((resolve, reject) => {
        const indexed = window.indexedDB.open(dbName, dbVersion);

        indexed.onsuccess = function(event) {

            const db = event.target.result;
            if (db.objectStoreNames.contains('signature')) {
                var transaction = db.transaction(['signature'], 'readonly');
                var objectStore = transaction.objectStore('signature');
                var request = objectStore.get(auth.currentUser.uid);

                request.onsuccess = function(event) {
                    const keyData = event.target.result;
                    if (keyData) {
                        console.log('Signing key retrieved successfully:', keyData.privateKey);
                        resolve(keyData.privateKey);
                    } else {
                        console.error('Signing key not found');
                        reject(new Error('Signing key not found'));
                    }
                };

                request.onerror = function(event) {
                    console.error('Error retrieving private key');
                    reject(event.target.error);
                };  
            } else {
                console.error('Signing key not found!');
                reject(new Error('Signing key not found'));
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