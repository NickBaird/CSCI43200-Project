<template>
<h1>Register</h1>
<p id="email-label">Email:</p><input type="text" id="email" v-model="enteredEmail">
<p id="password-label">Password:</p><input type="password" id="password" v-model="enteredPassword">
<p id="name-label">Display Name:</p><input type="text" id="name" v-model="enteredName">
<button @click="RegisterVue()">Register</button>
</template>

<script>
import {register2} from '../../js.js';

export default {
    data() {
        return {
            enteredName: '',
            enteredEmail: '',
            enteredPassword: ''
        }
    },
    props: {
    },
    methods: {
        RegisterVue() {
            console.log(this.enteredEmail);
            register2(this.enteredEmail, this.enteredPassword, this.enteredName);
        },
    }
}
</script>

<style scoped>

</style>