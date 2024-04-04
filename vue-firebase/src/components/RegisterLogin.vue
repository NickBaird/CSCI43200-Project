<template>
<h1>Register</h1>
<p id="email-label-register">Email:</p><input type="text" id="register-email" v-model="registerEmail">
<p id="password-label-register">Password:</p><input type="password" id="register-password" v-model="registerPassword">
<p id="name-label-register">Display Name:</p><input type="text" id="register-name" v-model="registerName">
<button @click="RegisterVue()">Register</button>

<h1>Login</h1>
<p id="email-label-login">Email:</p><input type="text" id="login-email" v-model="loginEmail">
<p id="password-label-login">Password:</p><input type="password" id="login-password" v-model="loginPassword">
<button @click="LoginVue()">Login</button>
</template>

<script>
import {register2} from '../../js.js';
import {login2} from '../../js.js';

export default {
    data() {
        return {
            registerName: '',
            registerEmail: '',
            registerPassword: '',
            loginEmail: '',
            loginPassword: ''
        }
    },
    props: {
    },
    methods: {
        RegisterVue() {
            register2(this.registerEmail, this.registerPassword, this.registerName);
        },
        LoginVue() {
            login2(this.loginEmail, this.loginPassword);
        }
    }
}
</script>

<style scoped>

</style>