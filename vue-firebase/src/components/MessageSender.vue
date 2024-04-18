<template>
<div class="bg-pink-800 flex items-center gap-2 h-20 p-4" id="message-container" v-if="otherUID != (null || '')">
    <button @click="reloadChat(responseData, otherUID, type)" class="flex items-center bg-green-400 h-full hover:bg-green-500 transition-colors px-2 rounded-md">
        <vue-feather type="rotate-cw" class="text-white"></vue-feather>
    </button>
    <input type="text" autocomplete="off" id="message-box" v-model="message" class="w-full h-1/2 outline-0 px-4 py-6 rounded-md focus:border-sky-500 focus:ring-4 focus:ring-sky-500" placeholder="Enter your message..." @keyup.enter="handleEnterPress">
    <button @click="sendMessageVue(otherUID, type)" class="flex items-center bg-blue-500 hover:bg-blue-400 transition-colors h-full  rounded-md px-4">
        <vue-feather type="send" class="text-white"></vue-feather>
    </button>
    <input type='file' id='file-upload' class="hidden" @change="handleFileUpload" />
    <label for="file-upload" class="flex items-center bg-yellow-500 hover:bg-yellow-400 transition-colors h-full rounded-md px-4 cursor-pointer">
        <vue-feather type="paperclip" class="text-white"></vue-feather>
    </label>
    <!-- <button @click="">Send File</button> -->
</div>
</template>

<script>
import {
    send_message,
    load_conversation,
    send_group_message,
    load_group,
    send_file, // make sure to import send_file
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
            if (this.message.trim() != '') {
                //console.log("type " + type + " uid " + uid + " message " + this.message);
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
                    this.message = ''; // Clears the message input after sending
                    try {
                        this.responseData = await load_group(uid);
                        // Introduce a delay before reloading the chat
                        setTimeout(() => {
                            this.reloadChat(this.responseData, uid); // Passes the fetched data to reloadChat
                        }, 500);
                    } catch (e) {
                        console.log(e);
                    }
                }
                this.message = '';
            }
        },
        async handleFileUpload(event) {
            const files = event.target.files;
            if (!files.length) return;

            const file = files[0];
            try {
                await send_file(this.otherUID, file); // Assumes otherUID is the uid needed
                console.log("file sent successfully");
                setTimeout(() => {
                    this.reloadChat(this.responseData, this.otherUID); // Passes the fetched data to reloadChat
                    this.$emit('message-sent'); // Notify parent component
                }, 500);
            } catch (error) {
                console.error("Error sending file:", error);
            }
        },
        async reloadChat(data, uid, type) {
            if (type == 'convo') {
                try {
                    this.responseData = await load_conversation(uid); // Fetches new conversation data
                } catch (e) {
                    console.log(e); // Log any errors during fetching or processing
                }
            } else if (type == 'group') {
                try {
                    this.responseData = await load_group(uid);
                } catch (e) {
                    console.log(e); // Log any errors during fetching or processing
                }
            }

            if (data && data.sent && data.received) { // Checks if data is valid and has necessary properties
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
                this.$emit('update-messages', this.newMessages); // Emits an event to update the message list in the parent component
                this.$emit('message-sent');
            } else {
                console.log('Invalid or incomplete data received.');
            }
        },
        handleEnterPress() {
            if (this.message.trim() !== '') {
                this.sendMessageVue(this.otherUID, this.type);
            }
        },
    },
    props: ['otherUID', 'type'],
}
</script>
