<template>
<div class="h-screen flex items-center mx-auto max-w-screen-sm">
    <div class="bg-[#51291E] w-full p-10 grid grid-cols-1 grid-rows-4 text-[#EDF4ED] gap-8 rounded-lg">
        <div>
            <h1 class="justify-self-center text-3xl font-semibold">
                Login
            </h1>
            <h2 class="justify-self-center text-lg font-extralight">
                Login with your email here.
            </h2>
        </div>

        <input type="text" id="login-email" v-model="loginEmail" class="text-gray-600 px-4 py-2 border-2 border-gray-200 rounded-md" placeholder="Email" />

        <input type="password" id="login-password" v-model="loginPassword" :class="{'border-red-500': passwordError}" class="text-gray-600 px-4  border-2 rounded-md" placeholder="Password" />
        <p v-if="passwordError" class="text-red-500 text-sm px-4">
            Wrong password. Please try again.
        </p>

        <button @click="LoginVue" class="bg-blue-500 hover:bg-blue-700 transition-colors w-fit text-xl justify-self-center px-10 rounded-md py-2">
            Login
        </button>

        <div class="justify-self-center border-t-2 border-gray-300 w-full border-opacity-40 flex items-center justify-center pt-4 gap-2">
            <p class="text-lg font-extralight">Don't have an account?</p>
            <button class="text-lg font-extralight text-blue-500" @click="$emit('switch')">
                Sign Up
            </button>
        </div>
    </div>
</div>
</template>

<script>
import {
    login2
} from '../../js.js';

export default {
    data() {
        return {
            loginEmail: '',
            loginPassword: '',
            passwordError: false // New data property to track password error
        }
    },
    methods: {
        LoginVue() {
            login2(this.loginEmail, this.loginPassword)
                .then((userCredential) => {
                    // Handle success, redirect to another route/page
                    this.$router.push({
                        name: 'home'
                    }); // Redirect to 'Dashboard' page
                })
                .catch((error) => {
                    // Handle failure, possibly by updating UI with the error message
                    this.passwordError = true; // Set the passwordError to true to show error UI
                    console.error(error.message);
                });
        },
    }
}
</script>
