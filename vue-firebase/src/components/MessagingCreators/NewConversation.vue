<template>
<div id="new-conversation-container" class="flex flex-col items-center justify-center bg-[#51291E] p-10 rounded-bl-md text-[#EDF4ED] gap-6 z-0">

    <h3 class="self-start text-xl font-semibold flex items-center gap-2">Start a conversation <vue-feather type="message-square"></vue-feather>
    </h3>
    <input type="text" autocomplete="off" id="new-conversation-uid" v-model="newID" class="text-zinc-800 px-4 py-2" placeholder="User ID">
    <input type="text" autocomplete="off" id="new-conversation-message" v-model="newMessage" placeholder="Write a Message" class="text-zinc-800 px-4 py-2 ">
    <button @click="newConversationVue()" class="bg-blue-500 hover:bg-blue-700 transition-colors  rounded-md px-4 py-2 flex items-center justify-center gap-2">Send <vue-feather type="send" size="15"></vue-feather></button>
</div>
</template>

  
<script>
import VueFeather from 'vue-feather';
import {
    new_conversation
} from '../../../js.js';

export default {
    components: {
        VueFeather,
    },
    data() {
        return {
            newID: '',
            newMessage: ''
        }
    },
    methods: {
        newConversationVue() {
            //console.log(this.newID);
            //console.log(this.newMessage);
            new_conversation(this.newID, this.newMessage);
            this.newID = '';
            this.newMessage = '';
        },

    }
}
</script>
