export { 
	register2, 
	login2,
	send_group_invite,
	new_conversation,
	new_group,
	accept_conversation_invite,
	reject_conversation_invite,
	get_conversation_invites,
	get_group_invites,
	database,
	auth,
	update_conversations,
	load_conversation,
	update_messages,
	public_key,
	send_message,
	update_groups,
	get_group_members,
	load_group,
	send_group_message,
	accept_group_invite,
	reject_group_invite,
	add_to_map,
	map,
	verify_message,
	delete_conversation_message
};

const firebaseConfig = {
	apiKey: "AIzaSyCvGGb0NWirKcKX9P_krRogy5BdN1XUxww",
	authDomain: "e2ee-messengers.firebaseapp.com",
	projectId: "e2ee-messengers",
	storageBucket: "e2ee-messengers.appspot.com",
	messagingSenderId: "979623333154",
	appId: "1:979623333154:web:91a56de139f27fb365297b",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

var public_key = null;
var publicSignature = null;
var display = null;
var map = {};

var conversations = [];
var groups = [];
var groupNames = {};
var groupsInvalid = [];

var loaded = null;
var isGroup = false;
var otherdisplay = null;
var received_messages = [];
var sent_messages = [];
var conversation_invites = [];
var group_invites = [];

var refs = [];

var unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
	if (auth.currentUser != null) {
		initialize();
		unsubscribe();
	}
});

// Indexed DB name and version number
const dbName = "testdatabase4";
const dbVersion = 7;

// Opens the indexed DB
const indexed = window.indexedDB.open(dbName, dbVersion);
let indexedDB = null;

// Cannot open indexed DB
indexed.onerror = (event) => {
	console.error(
		"An error occurred with IndexedDB. This means private keys are not retreivable."
	);
	console.error(event);
};

// Used to update the database (if version number changes) to add/change object stores
indexed.onupgradeneeded = (event) => {
	const db = event.target.result;
	if (!db.objectStoreNames.contains("keys")) {
		db.createObjectStore("keys", { keyPath: "uid" });
	}
	if (!db.objectStoreNames.contains("signature")) {
		db.createObjectStore("signature", { keyPath: "uid" });
	}
};

// Opens indexed DB successfully allowing for transactions to be made
indexed.onsuccess = (event) => {
	indexedDB = event.target.result;
};

function register() {
	email = document.getElementById("register-email");
	password = document.getElementById("register-password");
	display = document.getElementById("register-display");

	auth.createUserWithEmailAndPassword(email.value, password.value).then(
		(userCredential) => {
			var user = userCredential;
			var keys = sodium.crypto_kx_keypair();
			var signing = sodium.crypto_sign_keypair();

			var userData = {
				display: display.value,
				public: sodium.to_hex(keys.publicKey),
				signature: sodium.to_hex(signing.publicKey),
			};
			database.ref("/users/" + auth.currentUser.uid).set(userData);

			set_private(sodium.to_hex(keys.privateKey));
			set_signature(sodium.to_hex(signing.privateKey));
		}
	);
}

function register2(email, password, display) {
	return new Promise((resolve, reject) => {
		auth.createUserWithEmailAndPassword(email, password)
			.then((userCredential) => {
				var user = userCredential.user;
				var keys = sodium.crypto_kx_keypair();
				var signing = sodium.crypto_sign_keypair();

				var userData = {
					display: display,
					public: sodium.to_hex(keys.publicKey),
					signature: sodium.to_hex(signing.publicKey),
				};
				database.ref("/users/" + user.uid).set(userData);

				// TEMP
				localStorage.setItem("private", sodium.to_hex(keys.privateKey));
				localStorage.setItem(
					"signature",
					sodium.to_hex(signing.privateKey)
				);

				const indexed = window.indexedDB.open(dbName, dbVersion);

				indexed.onupgradeneeded = function (event) {
					const db = event.target.result;
					if (!db.objectStoreNames.contains("keys")) {
						db.createObjectStore("keys", { keyPath: "uid" });
					}
					if (!db.objectStoreNames.contains("signature")) {
						db.createObjectStore("signature", { keyPath: "uid" });
					}
				};

				indexed.onsuccess = function (event) {
					const db = event.target.result;

					var transactionKeys = db.transaction(["keys"], "readwrite");
					var objectStoreKeys = transactionKeys.objectStore("keys");
					var keyDataKeys = {
						uid: user.uid,
						privateKey: sodium.to_hex(keys.privateKey),
					};
					var requestKeys = objectStoreKeys.put(keyDataKeys);

					var transactionSignature = db.transaction(
						["signature"],
						"readwrite"
					);
					var objectStoreSignature =
						transactionSignature.objectStore("signature");
					var keyDataSignature = {
						uid: user.uid,
						privateKey: sodium.to_hex(signing.privateKey),
					};
					var requestSignature =
						objectStoreSignature.put(keyDataSignature);

					requestKeys.onsuccess = function () {
						requestSignature.onsuccess = function () {
							console.log("Private key stored successfully");
							resolve("Registration and key storage successful");
						};
					};

					requestSignature.onerror = function (event) {
						console.error("Error storing signature private key");
						reject("Error storing signature private key");
					};

					requestKeys.onerror = function (event) {
						console.error("Error storing keys private key");
						reject("Error storing keys private key");
					};
				};

				indexed.onerror = function (event) {
					console.error("IndexedDB error");
					reject("IndexedDB error");
				};
			})
			.catch((error) => {
				reject(error.message);
			});
	});
}
function login() {
	email = document.getElementById("login-email");
	password = document.getElementById("login-password");

	auth.signInWithEmailAndPassword(email.value, password.value).then(
		(userCredential) => {
			console.log(userCredential);
		}
	);
}

function login2(email, password) {
	return new Promise((resolve, reject) => {
		auth.signInWithEmailAndPassword(email, password)
			.then((userCredential) => {
				// Resolve the promise when the login is successful
				resolve(userCredential);
			})
			.catch((error) => {
				// Reject the promise if there is an error
				reject(error);
			});
	});
}

async function change_display_name(name) {
	await database.ref("/users/" + auth.currentUser.uid + "/display").set(name);
}

async function initialize() {
	console.log("INIT");

	public_key = (
		await database
			.ref("/users/" + auth.currentUser.uid + "/public")
			.get()
	).val();
	console.log(public_key);
	publicSignature = (
		await database
			.ref("/users/" + auth.currentUser.uid + "/signature")
			.get()
	).val();

	database
		.ref("/users/" + auth.currentUser.uid + "/display")
		.on("value", (value) => {
			display = value.val();
			// document.getElementById("user-container").innerHTML =
			// 	"<h1>Welcome " +
			// 	display +
			// 	"!</h1> <br><p>User ID: " +
			// 	auth.currentUser.uid +
			// 	"</p>";
		});

	get_conversation_invites();
	get_group_invites();

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

	let conversationsRef = database.ref(
		"/users/" + auth.currentUser.uid + "/conversations"
	);
	conversationsRef.on("child_added", (conversation) => {
		add_to_conversations(conversation.key);
	});

	conversationsRef.on("child_removed", (conversation) => {
		remove_from_conversations(conversation.key);
	});

	let groupsRef = database.ref("/users/" + auth.currentUser.uid + "/groups");
	groupsRef.on("child_added", (group) => {
		add_to_groups(group.key);
	});

	groupsRef.on("child_removed", (group) => {
		console.log("REMOVE");
		remove_from_groups(group.key);
	});
}

export const getCurrentUser = () => {
	return new Promise((resolve, reject) => {
		auth.onAuthStateChanged((user) => {
			// unsubscribe();
			resolve(user);
		}, reject);
		// resolve(auth.currentUser);
	});
};

export const getUserDisplayInfo = () => {
	return new Promise((resolve, reject) => {
		const user = auth.currentUser;
		if (!user) {
			reject("No user signed in.");
			return;
		}
		database
			.ref("/users/" + user.uid + "/display")
			.get()
			.then((snapshot) => {
				resolve(snapshot.val()); // Resolves with the display information
			})
			.catch((error) => {
				console.error("Error fetching user display info: ", error);
				reject(error); // Rejects the promise if there's an error fetching the data
			});
	});
};
export const getOtherUserDisplayInfo = (uid) => {
    return new Promise((resolve, reject) => {
        if (!uid) {
            reject("No UID provided.");
            return;
        }
        database
            .ref("/users/" + uid + "/display")
            .get()
            .then((snapshot) => {
                if (snapshot.exists()) {
                    resolve(snapshot.val()); // Resolves with the display information
                } else {
                    reject("Display info not found.");
                }
            })
            .catch((error) => {
                console.error("Error fetching user display info: ", error);
                reject(error); // Rejects the promise if there's an error fetching the data
            });
    });
};

async function add_to_map(uid) {
	if (!map.hasOwnProperty(uid)) {
		const otherPublic = (
			await database.ref("/users/" + uid + "/public").get()
		).val();
		const otherSignature = (
			await database.ref("/users/" + uid + "/signature").get()
		).val();
		const otherDisplay = (
			await database.ref("/users/" + uid + "/display").get()
		).val();
		const privateKey = await get_private();
		const clientkeys = sodium.crypto_kx_client_session_keys(
			sodium.from_hex(public_key),
			sodium.from_hex(privateKey),
			sodium.from_hex(otherPublic)
		);
		const serverkeys = sodium.crypto_kx_server_session_keys(
			sodium.from_hex(public_key),
			sodium.from_hex(privateKey),
			sodium.from_hex(otherPublic)
		);
		map[uid] = {
			hex: otherPublic,
			signature: otherSignature,
			display: otherDisplay,
			crx: clientkeys.sharedRx,
			ctx: clientkeys.sharedTx,
			srx: serverkeys.sharedRx,
			stx: serverkeys.sharedTx,
		};
	}
}

async function add_to_conversations(uid) {
	await add_to_map(uid);
	conversations.push(uid);
	update_conversations();
}

async function remove_from_conversations(uid) {
	if (loaded == uid) {
		unload();
	}
	conversations.splice(conversations.indexOf(uid), 1);
	update_conversations();
}

async function add_to_groups(groupId) {
	database
		.ref("/groups/" + groupId + "/members")
		.on("child_added", (member) => {
			add_to_map(member.key);
			//console.log("Added Member", member.key);
		});
	groups.push(groupId);
	if (!(await user_has_access(groupId))) {
		groupsInvalid.push(groupId);
	}
	group_name_listener(groupId);
	update_groups();
}

async function remove_from_groups(groupId) {
	if (loaded == groupId) {
		unload();
	}
	groups.splice(groups.indexOf(groupId), 1);
	delete groupNames[groupId];
	groupsInvalid.splice(groupsInvalid.indexOf(groupId), 1);
	update_groups();
}

async function send_conversation_invite(uid) {
	if (!(await user_in_conversation(uid))) {
		await database
			.ref("/invites/" + uid + "/conversations/" + auth.currentUser.uid)
			.set(true);
		await database
			.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid)
			.set(true);
	}
}

async function send_group_invite(groupId, uid) {
	if ((await is_admin(groupId)) && !(await user_in_group(groupId, uid))) {
		await database.ref("/groups/" + groupId + "/members/" + uid).set(true);
		await set_group_name_for_uid(groupId, groupNames[groupId], uid);
		await database.ref("/invites/" + uid + "/groups/" + groupId).set(true);
	}
}

async function accept_conversation_invite(uid) {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid)
		.set(null);
	await database
		.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid)
		.set(true);
}

async function accept_group_invite(groupId) {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(null);
	await database
		.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(true);
}

async function reject_conversation_invite(uid) {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/conversations/" + uid)
		.set(null);
}

async function reject_group_invite(groupId) {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(null);
	await database
		.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid)
		.set(null);
}

async function leave_conversation(uid) {
	//await delete_conversation_messages(uid);
	await database
		.ref("/users/" + auth.currentUser.uid + "/conversations/" + uid)
		.set(null);
}

async function leave_group(groupId) {
	//await delete_group_messages(groupId);
	await database
		.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(null);
	if (is_admin(groupId)) {
		await database
			.ref("/groups/" + groupId + "/admins/" + auth.currentUser.uid)
			.set(null);
		// Add assigning another admin if there is only one admin
	}
	await database
		.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid)
		.set(null);
}

async function delete_conversation_message(uid, msgId) {
	database
		.ref("/messages/" + uid + "/" + auth.currentUser.uid + "/" + msgId)
		.set(null);
}

async function delete_all_conversation_messages(uid) {
	database.ref("/messages/" + uid + "/" + auth.currentUser.uid).set(null);
}

async function delete_group_message(groupId, msgId) {
	var msg = await database
		.ref(
			"/group_messages/" +
				groupId +
				"/" +
				auth.currentUser.uid +
				"/" +
				auth.currentUser.uid +
				"/" +
				msgId
		)
		.get();
	var sent = msg.child("sent").val();
	var fileId = msg.child("id").val();

	console.log(msg.val());

	if (sent != null) {
		for (uid of Object.keys(sent)) {
			database
				.ref(
					"/group_messages/" +
						groupId +
						"/" +
						uid +
						"/" +
						auth.currentUser.uid +
						"/" +
						sent[uid]
				)
				.set(null);
		}
	}
	database
		.ref(
			"/group_messages/" +
				groupId +
				"/" +
				auth.currentUser.uid +
				"/" +
				auth.currentUser.uid +
				"/" +
				msgId
		)
		.set(null);
	if (fileId != null) {
		database
			.ref(
				"/group_messages/" +
					groupId +
					"/" +
					auth.currentUser.uid +
					"/files/" +
					fileId
			)
			.set(null);
	}
}

async function delete_all_group_messages(groupId) {
	for (member of await get_group_members(groupId)) {
		database
			.ref(
				"/group_messages/" +
					groupId +
					"/" +
					member +
					"/" +
					auth.currentUser.uid
			)
			.set(null);
	}
}

async function get_admins(groupId) {
	return Object.keys(
		(await database.ref("/groups/" + groupId + "/admins").get()).val()
	);
}

async function is_admin(groupId) {
	try {
		return (await get_admins(groupId)).includes(auth.currentUser.uid);
	} catch (e) {
		console.error(e);
		return false;
	}
}

async function promote_admin(groupId, uid) {
	if (await is_admin()) {
		database.ref("/groups/" + groupId + "/admins/" + uid).set(true);
	}
}

async function kick_user(groupId, uid) {
	if (uid != auth.currentUser.uid && (await is_admin(groupId))) {
		database.ref("/groups/" + groupId + "/admins/" + uid).set(null);
		database.ref("/groups/" + groupId + "/members/" + uid).set(null);
	} else {
		// Prompt user is not admin
	}
}

async function block_conversation(uid) {
	await database
		.ref("/blocked/" + auth.currentUser.uid + "/conversations/" + uid)
		.set(true);
	await leave_conversation(uid);
}

async function block_group(groupId) {
	await database
		.ref("/blocked/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(true);
	await leave_group(groupId);
	update_groups();
}

async function is_blocked(uid) {
	return (
		await database
			.ref("/blocked/" + uid + "/conversations/" + auth.currentUser.uid)
			.get()
	).exists();
}

async function user_in_conversation(uid) {
	return (
		await database
			.ref("/users/" + uid + "/conversations/" + auth.currentUser.uid)
			.get()
	).exists();
}

async function user_in_group(groupId, uid) {
	return (
		(
			await database.ref("/groups/" + groupId + "/members/" + uid).get()
		).exists() &&
		(
			await database.ref("/users/" + uid + "/groups/" + groupId).get()
		).exists()
	);
}

async function user_has_access(groupId) {
	try {
		return (
			await database
				.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid)
				.get()
		).exists();
	} catch (error) {
		return false;
	}
}

async function get_group_name(groupId) {
	var message = await database
		.ref(
			"/group_messages/" + groupId + "/" + auth.currentUser.uid + "/name/"
		)
		.get();
	if (message.exists()) {
		var nonce = sodium.from_hex(message.child("nonce").val());
		var payload = sodium.from_hex(message.child("payload").val());
		var timestamp = message.child("timestamp").val();
		var from = message.child("from").val();

		await add_to_map(from);
		var decrypted = sodium.crypto_secretbox_open_easy(
			payload,
			nonce,
			map[from].srx
		);
		return sodium.to_string(verify_message(decrypted, map[from].signature));
	} else {
		return null;
	}
}

function group_name_listener(groupId) {
	database
		.ref(
			"/group_messages/" + groupId + "/" + auth.currentUser.uid + "/name/"
		)
		.on("value", (message) => {
			get_group_name(groupId).then((name) => {
				groupNames[groupId] = name;
				update_groups();
			});
		});
}

async function set_group_name(groupId, name) {
	let members = await get_group_members(groupId);
	console.log(members);
	if (await is_admin(groupId)) {
		for (let i = 0; i < members.length; i++) {
			set_group_name_for_uid(groupId, name, members[i]);
		}
	} else {
		// Prompt user is not admin
		console.log("NOT ADMIN");
	}
}

async function set_group_name_for_uid(groupId, name, uid) {
	if (await is_admin(groupId)) {
		await add_to_map(uid);
		let msg = await sign_message(name);
		let nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
		let encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[uid].ctx);

		var payload = {
			timestamp: new Date().getTime(),
			payload: sodium.to_hex(encrypted),
			nonce: sodium.to_hex(nonce),
			from: auth.currentUser.uid,
		};

		await database
			.ref("/group_messages/" + groupId + "/" + uid + "/name")
			.set(payload);
	} else {
		// Prompt user is not admin
	}
}

async function get_conversation_invites() {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/conversations/")
		.on("value", (conversations) => {
			conversation_invites = [];
			conversations.forEach((conversation) => {
				database
					.ref("/users/" + conversation.key + "/display")
					.get()
					.then((display) => {
						let invite_obj = {
							display: display.val(),
							key: conversation.key
						}
						conversation_invites.push(invite_obj);
						//update_invites(); // I don't like this
					});
			});
			//update_invites();
			//console.log(conversation_invites);
		});

	return conversation_invites;
}

async function get_group_invites() {
	await database
		.ref("/invites/" + auth.currentUser.uid + "/groups/")
		.on("value", (groups) => {
			group_invites = [];
			groups.forEach((group) => {
				get_group_name(group.key).then((name) => {
					group_invites.push(
						"<h3>You have been invited to a group chat!</h3><h4>Group Name: " +
							name +
							"</h4><h5>GroupId: " +
							group.key +
							"</h5><br><button onclick=\"accept_group_invite('" +
							group.key +
							"')\">Accept</button><button onclick=\"reject_group_invite('" +
							group.key +
							"')\">Reject</button>"
					);
					//update_invites(); // I don't like this
				});
			});
			//update_invites();
		});

	//console.log(conversation_invites);
}


async function new_group(name) {
	var groupId = sodium.to_hex(
		sodium.crypto_generichash(
			16,
			sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
		)
	);
	await database
		.ref("/groups/" + groupId + "/admins/" + auth.currentUser.uid)
		.set(true);
	await database
		.ref("/groups/" + groupId + "/members/" + auth.currentUser.uid)
		.set(true);
	await database
		.ref("/users/" + auth.currentUser.uid + "/groups/" + groupId)
		.set(true);
	console.log(groupId);
	await set_group_name(groupId, name);
}

async function send_message(uid, message) {
	await add_to_map(uid);
	var msg = await sign_message(message);
	var nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
	var encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[uid].ctx);

	var payload = {
		timestamp: new Date().getTime(),
		payload: sodium.to_hex(encrypted),
		nonce: sodium.to_hex(nonce),
	};

	await send_conversation_invite(uid);
	await database
		.ref("/messages/" + uid + "/" + auth.currentUser.uid)
		.push(payload);
}

async function send_file(uid, file) {
	if (file.size <= 100000) {
		await add_to_map(uid);
		var contents = await sign_message(
			new Uint8Array(await file.arrayBuffer())
		);
		var nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
		var encrypted = sodium.crypto_secretbox_easy(
			await pako.gzip(contents),
			nonce,
			map[uid].ctx
		);

		var payload = {
			timestamp: new Date().getTime(),
			payload: sodium.to_hex(encrypted),
			nonce: sodium.to_hex(nonce),
			type: file.type,
		};

		await send_conversation_invite(uid);
		await database
			.ref("/messages/" + uid + "/" + auth.currentUser.uid)
			.push(payload);
	} else {
		alert("Size of file is too big!");
	}
}

async function get_group_members(groupId) {
	var members = (
		await database.ref("/groups/" + groupId + "/members").get()
	).val();
	return Object.keys(members);
}

async function send_group_message(groupId, message) {
	var sent = {};
	var members = await get_group_members(groupId);
	members.splice(members.indexOf(auth.currentUser.uid), 1);
	members.push(auth.currentUser.uid);

	for (let i = 0; i < members.length; i++) {
		await add_to_map(members[i]);
		var msg = await sign_message(message);
		var nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
		var encrypted = sodium.crypto_secretbox_easy(msg, nonce, map[members[i]].ctx);

		var payload = null;
		if (members[i] == auth.currentUser.uid) {
			var payload = {
				timestamp: new Date().getTime(),
				payload: sodium.to_hex(encrypted),
				nonce: sodium.to_hex(nonce),
				sent: sent,
			};
		} else {
			var payload = {
				timestamp: new Date().getTime(),
				payload: sodium.to_hex(encrypted),
				nonce: sodium.to_hex(nonce),
			};
		}
		await send_group_invite(groupId, members[i]);
		sent[members[i]] = await database
			.ref(
				"/group_messages/" +
					groupId +
					"/" +
					members[i] +
					"/" +
					auth.currentUser.uid
			)
			.push(payload).key;
	}
}

async function send_group_file(groupId, file) {
	if (file.size <= 100000) {
		var fileKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
		var fileNonce = sodium.randombytes_buf(
			sodium.crypto_secretbox_NONCEBYTES
		);
		var fileContents = await sign_message(
			new Uint8Array(await file.arrayBuffer())
		);
		var encryptedFile = sodium.crypto_secretbox_easy(
			await pako.gzip(fileContents),
			fileNonce,
			fileKey
		);

		var payload = {
			timestamp: new Date().getTime(),
			payload: sodium.to_hex(encryptedFile),
			nonce: sodium.to_hex(fileNonce),
			type: file.type,
		};

		await database
			.ref(
				"/group_messages/" +
					groupId +
					"/" +
					auth.currentUser.uid +
					"/files/" +
					sodium.to_hex(fileNonce)
			)
			.set(payload);

		var sent = {};
		var members = await get_group_members(groupId);
		members.splice(members.indexOf(auth.currentUser.uid), 1);
		members.push(auth.currentUser.uid);

		for (uid of members) {
			await add_to_map(uid);
			var msg = await sign_message(fileKey);
			var nonce = sodium.randombytes_buf(
				sodium.crypto_secretbox_NONCEBYTES
			);
			var encrypted = sodium.crypto_secretbox_easy(
				msg,
				nonce,
				map[uid].ctx
			);

			var payload = null;
			if (uid == auth.currentUser.uid) {
				var payload = {
					timestamp: new Date().getTime(),
					payload: sodium.to_hex(encrypted),
					nonce: sodium.to_hex(nonce),
					id: sodium.to_hex(fileNonce),
					sent: sent,
				};
			} else {
				var payload = {
					timestamp: new Date().getTime(),
					payload: sodium.to_hex(encrypted),
					nonce: sodium.to_hex(nonce),
					id: sodium.to_hex(fileNonce),
				};
			}

			await send_group_invite(groupId, uid);
			sent[uid] = await database
				.ref(
					"/group_messages/" +
						groupId +
						"/" +
						uid +
						"/" +
						auth.currentUser.uid
				)
				.push(payload).key;
		}
	} else {
		alert("Size of file is too big!");
	}
}

async function get_received_messages(uid) {
	received_messages = [];
	let ref = database.ref("/messages/" + auth.currentUser.uid + "/" + uid);
	refs.push(ref);
	ref.on("child_added", (message) => {
		var nonce = sodium.from_hex(message.child("nonce").val());
		var payload = sodium.from_hex(message.child("payload").val());
		var timestamp = message.child("timestamp").val();
		var type = message.child("type").val();
		var decrypted = sodium.crypto_secretbox_open_easy(
			payload,
			nonce,
			map[uid].srx
		);

		if (type == null) {
			var output = {
				dbid: message.key,
				message: sodium.to_string(
					verify_message(decrypted, map[uid].signature)
				),
				timestamp: timestamp,
				uid: uid,
			};
		} else {
			decrypted = verify_message(
				pako.inflate(decrypted),
				map[uid].signature
			);

			if (type.indexOf("image") >= 0) {
				output = {
					dbid: message.key,
					message:
						'<img src="' +
						URL.createObjectURL(
							new Blob([decrypted], { type: type })
						) +
						'" />',
					type: type,
					timestamp: timestamp,
					uid: uid,
				};
			} else {
				output = {
					dbid: message.key,
					message:
						'<a href="' +
						URL.createObjectURL(
							new Blob([decrypted], { type: type })
						) +
						'" >Download File</a><br><h6>Filetype: ' +
						type +
						"</h6>",
					type: type,
					timestamp: timestamp,
					uid: uid,
				};
			}
		}

		received_messages.push(output);
		//update_messages();
	});

	ref.on("child_removed", (message) => {
		for (i in received_messages) {
			if (received_messages[i].dbid == message.key) {
				received_messages.splice(i, 1);
				update_messages();
				break;
			}
		}
	});
}

async function get_sent_messages(uid) {
	sent_messages = [];
	let ref = database.ref("/messages/" + uid + "/" + auth.currentUser.uid);
	refs.push(ref);
	ref.on("child_added", (message) => {
		var nonce = sodium.from_hex(message.child("nonce").val());
		var payload = sodium.from_hex(message.child("payload").val());
		var timestamp = message.child("timestamp").val();
		var type = message.child("type").val();
		var decrypted = sodium.crypto_secretbox_open_easy(
			payload,
			nonce,
			map[uid].ctx
		);

		if (type == null) {
			var output = {
				dbid: message.key,
				message: sodium.to_string(
					verify_message(decrypted, publicSignature)
				),
				timestamp: timestamp,
				uid: uid,
			};
		} else {
			decrypted = verify_message(
				pako.inflate(decrypted),
				publicSignature
			);

			if (type.indexOf("image") >= 0) {
				var output = {
					dbid: message.key,
					message:
						'<img src="' +
						URL.createObjectURL(
							new Blob([decrypted], { type: type })
						) +
						'" />',
					type: type,
					timestamp: timestamp,
					uid: uid,
				};
			} else {
				var output = {
					dbid: message.key,
					message:
						'<a href="' +
						URL.createObjectURL(
							new Blob([decrypted], { type: type })
						) +
						'" >Download File</a><br><h6>Filetype: ' +
						type +
						"</h6>",
					type: type,
					timestamp: timestamp,
					uid: uid,
				};
			}
		}

		sent_messages.push(output);
		//update_messages();
	});

	ref.on("child_removed", (message) => {
		for (let i = 0; i < sent_messages; i++) {
			if (sent_messages[i].dbid == message.key) {
				sent_messages.splice(i, 1);
				//update_messages();
				break;
			}
		}
	});
}

async function get_received_group_messages(groupId) {
	received_messages = [];
	let ref = database.ref("/groups/" + groupId + "/members");
	refs.push(ref);
	ref.on("child_added", (member) => {
		if (member.key != auth.currentUser.uid) {
			add_to_map(member.key);
			get_received_group_messages_from_uid(groupId, member.key);
		}
	});
}

async function get_received_group_messages_from_uid(groupId, uid) {
	let ref = database.ref(
		"/group_messages/" + groupId + "/" + auth.currentUser.uid + "/" + uid
	);
	refs.push(ref);
	ref.on("child_added", (message) => {
		var nonce = sodium.from_hex(message.child("nonce").val());
		var payload = sodium.from_hex(message.child("payload").val());
		var timestamp = message.child("timestamp").val();
		var id = message.child("id").val();
		var decrypted = sodium.crypto_secretbox_open_easy(
			payload,
			nonce,
			map[uid].srx
		);

		if (id == null) {
			var output = {
				dbid: message.key,
				message: sodium.to_string(
					verify_message(decrypted, map[uid].signature)
				),
				timestamp: timestamp,
				uid: uid,
			};
			received_messages.push(output);
			//update_messages();
		} else {
			get_group_file_from_id(
				groupId,
				uid,
				id,
				decrypted,
				timestamp,
				message.key,
				true
			);
		}
	});

	ref.on("child_removed", (message) => {
		for (i in received_messages) {
			if (received_messages[i].dbid == message.key) {
				received_messages.splice(i, 1);
				//update_messages();
				break;
			}
		}
	});
}

async function get_group_file_from_id(
	groupId,
	uid,
	fileId,
	key,
	timestamp,
	dbid,
	received
) {
	var file = (
		await database
			.ref("/group_messages/" + groupId + "/" + uid + "/files/" + fileId)
			.get()
	).val();
	var decrypted = sodium.crypto_secretbox_open_easy(
		sodium.from_hex(file["payload"]),
		sodium.from_hex(file["nonce"]),
		verify_message(key, map[uid].signature)
	);
	var decrypted = verify_message(pako.inflate(decrypted), map[uid].signature);

	if (file["type"].indexOf("image") >= 0) {
		var output = {
			dbid: dbid,
			message:
				'<img src="' +
				URL.createObjectURL(
					new Blob([decrypted], { type: file["type"] })
				) +
				'" />',
			type: file["type"],
			timestamp: timestamp,
			uid: uid,
		};
	} else {
		var output = {
			dbid: dbid,
			message:
				'<a href="' +
				URL.createObjectURL(
					new Blob([decrypted], { type: file["type"] })
				) +
				'" >Download File</a><br><h6>Filetype: ' +
				file["type"] +
				"</h6>",
			type: file["type"],
			timestamp: timestamp,
			uid: uid,
		};
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
	let ref = database.ref(
		"/group_messages/" +
			groupId +
			"/" +
			auth.currentUser.uid +
			"/" +
			auth.currentUser.uid
	);
	refs.push(ref);
	ref.on("child_added", (message) => {
		var nonce = sodium.from_hex(message.child("nonce").val());
		var payload = sodium.from_hex(message.child("payload").val());
		var timestamp = message.child("timestamp").val();
		var id = message.child("id").val();
		var decrypted = sodium.crypto_secretbox_open_easy(
			payload,
			nonce,
			map[auth.currentUser.uid].ctx
		);

		if (id == null) {
			var output = {
				dbid: message.key,
				message: sodium.to_string(
					verify_message(decrypted, publicSignature)
				),
				timestamp: timestamp,
				uid: auth.currentUser.uid,
			};
			sent_messages.push(output);
			//update_messages();
			//console.log("SENT MESSAGE:", output);
		} else {
			get_group_file_from_id(
				groupId,
				auth.currentUser.uid,
				id,
				decrypted,
				timestamp,
				message.key,
				false
			);
		}
	});

	ref.on("child_removed", (message) => {
		for (i in sent_messages) {
			if (sent_messages[i].dbid == message.key) {
				sent_messages.splice(i, 1);
				//update_messages();
				break;
			}
		}
	});
}

async function new_conversation(uid, message) {
	unload_conversation();
	await send_message(uid, message);
	await load_conversation(uid);
}

async function load_conversation(uid) {
	unload();
	loaded = uid;
	otherdisplay = map[uid].display;
	await get_received_messages(uid);
	await get_sent_messages(uid);
	return {
		sent: sent_messages,
		received: received_messages};

	// var container = document.getElementById("message-container");
	// container.innerHTML =
	// 	'<input type="text" id="message-box"><button onclick="send_message(\'' +
	// 	uid +
	// 	"', " +
	// 	"document.getElementById('message-box').value);\">Send</button><input type='file' id='file-upload' /><button onclick=\"send_file('" +
	// 	uid +
	// 	"', document.getElementById('file-upload').files[0]);\">Send File</button>";
}

function unload_conversation() {
	if (loaded != null) {
		//database.ref("/users/" + loaded + "/messages/" + auth.currentUser.uid).off();
		//database.ref("/users/" + auth.currentUser.uid + "/messages/" + loaded).off();
		loaded = null;
		otherdisplay = null;
		received_messages = [];
		sent_messages = [];
		update_messages();
		//document.getElementById("message-container").innerHTML = "";
	}
}

function load_group(groupId) {
	unload();
	loaded = groupId;
	isGroup = true;
	get_received_group_messages(groupId);
	get_sent_group_messages(groupId);
	return {
		sent: sent_messages,
		received: received_messages};

	// var container = document.getElementById("message-container");
	// container.innerHTML =
	// 	'<input type="text" id="message-box"><button onclick="send_group_message(\'' +
	// 	groupId +
	// 	"', " +
	// 	"document.getElementById('message-box').value);\">Send</button><input type='file' id='file-upload' /><button onclick=\"send_group_file('" +
	// 	groupId +
	// 	"', document.getElementById('file-upload').files[0]);\">Send File</button>";
}

function unload_group() {
	if (loaded != null && isGroup) {
		loaded = null;
		isGroup = false;
		otherdisplay = null;
		received_messages = [];
		sent_messages = [];
		update_messages();
		//document.getElementById("message-container").innerHTML = "";
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
	// var container = document.getElementById("messages-container");
	// container.innerHTML = "";
	var rcount = 0,
		scount = 0;

	sent_messages.sort((a, b) => a.timestamp - b.timestamp);
	received_messages.sort((a, b) => a.timestamp - b.timestamp);

	var deleteBtn = "";
	if (isGroup) {
		deleteBtn = "<button onclick=\"delete_group_message('";
	} else {
		deleteBtn = "<button onclick=\"delete_conversation_message('";
	}

	let messages_array = [];

	while (true) {
		if (rcount < received_messages.length)
			if (scount < sent_messages.length)
				if (
					rcount < received_messages.length &&
					received_messages[rcount].timestamp <=
						sent_messages[scount].timestamp
				) {
					let message_object = {
						id: received_messages[rcount].dbid,
						display: map[received_messages[rcount].uid].display,
						message: received_messages[rcount].message
					}
					messages_array.push(message_object);
					// container.innerHTML +=
					// 	'<div class="other" id="' +
					// 	received_messages[rcount].dbid +
					// 	'"><h2>' +
					// 	map[received_messages[rcount].uid].display +
					// 	":  <h2><h3>" +
					// 	received_messages[rcount].message +
					// 	"</h3><br></div>";
					rcount++;
				} else {
					let message_object = {
						id: received_messages[scount].dbid,
						display: map[received_messages[scount].uid].display,
						message: received_messages[scount].message
					}
					messages_array.push(message_object);
					// container.innerHTML +=
					// 	'<div class="you" id="' +
					// 	sent_messages[scount].dbid +
					// 	'"><h2>You:  <h2><h3>' +
					// 	sent_messages[scount].message +
					// 	"</h3>" +
					// 	deleteBtn +
					// 	loaded +
					// 	"','" +
					// 	sent_messages[scount].dbid +
					// 	"')\">Delete</button><br></div>";
					scount++;
				}
			else {
				let message_object = {
					id: received_messages[rcount].dbid,
					display: map[received_messages[rcount].uid].display,
					message: received_messages[rcount].message
				}
				messages_array.push(message_object);
				// container.innerHTML +=
				// 	'<div class="other" id="' +
				// 	received_messages[rcount].dbid +
				// 	'"><h2>' +
				// 	map[received_messages[rcount].uid].display +
				// 	":  <h2><h3>" +
				// 	received_messages[rcount].message +
				// 	"</h3><br></div>";
				rcount++;
			}
		else {
			if (scount < sent_messages.length) {
				let message_object = {
					id: received_messages[scount].dbid,
					display: map[received_messages[scount].uid].display,
					message: received_messages[scount].message
				}
				messages_array.push(message_object);
				// container.innerHTML +=
				// 	'<div class="you" id="' +
				// 	sent_messages[scount].dbid +
				// 	'"><h2>You:  <h2><h3>' +
				// 	sent_messages[scount].message +
				// 	"</h3>" +
				// 	deleteBtn +
				// 	loaded +
				// 	"','" +
				// 	sent_messages[scount].dbid +
				// 	"')\">Delete</button><br></div>";
				scount++;
			} else break;
		}
	}
	//console.log(messages_array);
	return messages_array;
}

function update_conversations() {
	// var container = document.getElementById("conversations-container");
	// container.innerHTML = "";
	let conversations_array = [];
	conversations.forEach((uid) => {
		let conv_data = {
			uid: uid,
			display: map[uid].display
		}
		conversations_array.push(conv_data);
		// container.innerHTML +=
		// 	'<div class="conversation" onclick="load_conversation(\'' +
		// 	uid +
		// 	"')\"><h3>" +
		// 	map[uid].display +
		// 	"</h3><br>" +
		// 	uid +
		// 	"</div> <br>";
	});
	return conversations_array;
}

function update_groups() {
	// var container = document.getElementById("groups-container");
	// container.innerHTML = "";
	let groups_array = [];
	groups.forEach((groupId) => {
		if (!groupsInvalid.includes(groupId)) {
			let group_data = {
				uid: groupId,
				display: groupNames[groupId]
			}
			groups_array.push(group_data);
		}
	});
	return groups_array;
	// groups.forEach((groupId) => {
	// 	if (!groupsInvalid.includes(groupId)) {
	// 		container.innerHTML +=
	// 			'<div class="group" onclick="load_group(\'' +
	// 			groupId +
	// 			"')\"><h3>" +
	// 			groupNames[groupId] +
	// 			"</h3><br><p>" +
	// 			groupId +
	// 			"</p></div> <br>";
	// 	} else {
	// 		container.innerHTML +=
	// 			'<div class="group"><h3>You have been kicked from this group!</h3><br><p>' +
	// 			groupId +
	// 			"</p><br><button onclick=\"leave_group('" +
	// 			groupId +
	// 			"')\">Remove from groups</button></div><br>";
	// 	}
	// });
}

function update_invites() {
	var container = document.getElementById("invites-container");

	container.innerHTML = "<h3>Conversation Invites:</h3>";
	console.log(conversation_invites.length);
	if (conversation_invites.length > 0) {
		conversation_invites.forEach((invite) => {
			console.log(invite);
			container.innerHTML += 
			'<div class="invite">' + invite.display + 
			'<button onclick="accept_conversation_invite(' + invite.key + ')">Accept</button>'
			"</div>";
		});
	} else {
		container.innerHTML += "<p>None</p>";
	}

	container.innerHTML += "<br><h3>Group Invites:</h3>";
	if (group_invites.length > 0) {
		group_invites.forEach((invite) => {
			container.innerHTML += '<div class="invite">' + invite + "</div>";
		});
	} else {
		container.innerHTML += "<p>None</p>";
	}
}

async function sign_message(message) {
	return sodium.crypto_sign(message, sodium.from_hex(await get_signature()));
}

function verify_message(message, public_key) {
	return sodium.crypto_sign_open(message, sodium.from_hex(public_key));
}

async function get_private() {
	return new Promise((resolve, reject) => {
		var transaction = indexedDB.transaction(["keys"], "readonly");
		var objectStore = transaction.objectStore("keys");
		var request = objectStore.get(auth.currentUser.uid);

		request.onsuccess = (event) => {
			const key = event.target.result;
			if (key) {
				resolve(key.privateKey);
			} else {
				reject(Error("Signing Key Not Found"));
			}
		};

		request.onerror = (event) => {
			reject(event.target.error);
		};
	});
}

async function get_signature() {
	return new Promise((resolve, reject) => {
		var transaction = indexedDB.transaction(["signature"], "readonly");
		var objectStore = transaction.objectStore("signature");
		var request = objectStore.get(auth.currentUser.uid);

		request.onsuccess = (event) => {
			const key = event.target.result;
			if (key) {
				resolve(key.privateKey);
			} else {
				reject(Error("Signing Key Not Found"));
			}
		};

		request.onerror = (event) => {
			reject(event.target.error);
		};
	});
}

async function set_signature(key) {
	var transaction = indexedDB.transaction(["signature"], "readwrite");
	var objectStore = transaction.objectStore("signature");
	var keyData = { uid: auth.currentUser.uid, privateKey: key };
	var request = objectStore.put(keyData);

	request.onerror = (event) => {
		console.error("Error storing signing key");
	};
}

async function set_private(key) {
	var transaction = indexedDB.transaction(["keys"], "readwrite");
	var objectStore = transaction.objectStore("keys");
	var keyData = { uid: auth.currentUser.uid, privateKey: key };
	var request = objectStore.put(keyData);

	request.onerror = (event) => {
		console.error("Error storing private key");
	};
}
