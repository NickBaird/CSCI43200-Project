<template>
<div class="con" id="new-conversation-container">
    <h1>Start Conversation:</h1> <br>
    <p>User ID:</p><input 
    type="text" 
    id="new-conversation-uid" 
    v-model="newID"> <br>
    <p>Message:</p><input 
    type="text" 
    id="new-conversation-message" 
    v-model="newMessage"> <br>
    <button @click="newConversationVue()">Start Conversation</button>
</div>
</template>

<script>
import { new_conversation } from '../../../js.js';

export default {
    data() {
        return {
            newID: '',
            newMessage: ''
        }
    },
    methods: {
        newConversationVue() {
            console.log(this.newID);
            console.log(this.newMessage);
            new_conversation();
        }
    }
}
</script>