function login2(email, password) {
	auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
		console.log(userCredential);
	});
}