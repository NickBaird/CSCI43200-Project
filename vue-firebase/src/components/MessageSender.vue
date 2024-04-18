<template>
<div class="bg-pink-800 flex items-center gap-2 h-20 p-4" id="message-container" v-if="otherUID != (null || '')">
    <button @click="reloadChat(responseData, otherUID)" class="flex items-center bg-green-400 h-full px-2 rounded-md">
        <vue-feather type="rotate-cw" class="text-white"></vue-feather>
    </button>
    <input autocomplete="false" type="text" id="message-box" v-model="message" class="w-1/2 h-1/2 outline-0 px-4 py-6 rounded-md" placeholder="Enter your message...">
    <button @click="sendMessageVue(otherUID, type)" class="flex items-center bg-blue-500 h-full  rounded-md px-4">
        <vue-feather type="send" class="text-white"></vue-feather>
    </button>
    <input type='file' id='file-upload' class="hidden" />
    <label for="file-upload" class="flex items-center bg-yellow-500 h-full  rounded-md px-4 cursor-pointer">
        <vue-feather type="paperclip" class="text-white"></vue-feather>
    </label>
    <button @click="">Send File</button>
</div>
</template>

<script>
import {
    send_message,
    load_conversation,
    send_group_message,
    load_group
} from '../../js.js';
import VueFeather from "vue-feather";

export default {
    components: {
        VueFeather
    },
    data() {
        return {
            message: '',
            responseData: [],
            newMessages: [],
        }
    },
    methods: {
        async sendMessageVue(uid, type) {
            if (this.message != '') {
                console.log("type " + type + " uid " + uid + " message " + this.message);
                if (type == 'convo') {
                    send_message(uid, this.message); // Sends the current message
                    this.message = ''; // Clears the message input after sending
                    try {
                        this.responseData = await load_conversation(uid); // Fetches new conversation data
                        setTimeout(() => {
                            this.reloadChat(this.responseData, uid); // Passes the fetched data to reloadChat
                            this.$emit('message-sent'); // Notify parent component
                        }, 500);
                    } catch (e) {
                        console.log(e);
                    }
                } else if (type == 'group') {
                    send_group_message(uid, this.message);
                    try {
                        this.responseData = await load_group(uid);
                        // Notify after group message processing as well
                        this.$emit('message-sent'); // Notify parent component
                    } catch (e) {
                        console.log(e);
                    }
                }
                this.message = '';
            }
        },
        reloadChat(data, uid) {
            
            if (data && data.sent && data.received) { // Checks if data is valid and has necessary properties
                console.log(data);
                let sentMessages = data.sent.map(obj => ({
                    ...obj,
                    me: "yes"
                })); // Processes sent messages
                let receivedMessages = data.received.map(obj => ({
                    ...obj,
                    me: uid
                })); // Processes received messages
                this.newMessages = [...sentMessages, ...receivedMessages]; // Combines sent and received messages
                this.newMessages.sort((a, b) => a.timestamp - b.timestamp); // Sorts messages by timestamp
                console.log(this.newMessages);
                this.$emit('update-messages', this.newMessages); // Emits an event to update the message list in the parent component
                this.$emit('message-sent');
            } else {
                console.log('Invalid or incomplete data received.');
            }
        }
    },
    props: ['otherUID', 'type'],
}
</script>
