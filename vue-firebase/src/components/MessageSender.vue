<template>
<div 
class="con" 
id="message-container" 
v-if="otherUID != (null || '')">
    <button @click="reloadChat(responseData, otherUID)">Click To Reload Chat</button>
    <input type="text" 
    id="message-box"
    v-model="message">
    <button @click="sendMessageVue(otherUID)">Send</button>
    <input type='file' id='file-upload'/>
    <button @click="">Send File</button>
</div>
</template>

<script>
import { 
    send_message,
    load_conversation 
} from '../../js.js';

export default {
    data() {
        return {
            message: '',
            responseData: [],
            newMessages: []
        }
    },
    methods: {
        async sendMessageVue(uid) {
            console.log("uid " + uid + " message " + this.message);
            send_message(uid, this.message);

            try {
                this.responseData = await load_conversation(uid);
                //let arr = [...this.responseData[0], ...this.responseData[1]]
                //console.log(this.responseData);
                //this.$emit('load-conversation', this.responseData);
            } catch (e) {
                console.log(e);
            }

            //this.reloadChat(this.responseData);
        },
        reloadChat(data, uid) {
            if (data.length == 0) {}
            else {
                console.log(data);
                let sentMessages = data.sent;
                sentMessages.forEach(obj => {
                    obj.me = "yes";
                });
                let receivedMessages = data.received;
                receivedMessages.forEach(obj => {
                    obj.me = uid;
                });
                this.newMessages = sentMessages.concat(receivedMessages);
                this.newMessages.sort((a, b) => a.timestamp - b.timestamp);
                console.log(this.newMessages);
                this.$emit('update-messages', this.newMessages);
            }
        }
    },
    props: ['otherUID'],
}
</script>