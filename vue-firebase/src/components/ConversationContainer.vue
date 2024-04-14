<template>
<div>
    <p>{{ display }}</p>
    <p>{{ " [" + uid + "]"}}</p>
    <button @click="loadData(uid)">Load</button>
    <button @click="seeData(responseData, uid)">See</button>
    <!-- <div v-if="dataLoaded">
        <div v-for="message in messages">
            <p>{{ message.message }}</p>
        </div>
    </div> -->
</div>
</template>

<script>
import { load_conversation } from '../../js.js';

export default {
    data() {
        return {
            sentMessages: [],
            receivedMessages: [],
            messages: [],
            dataLoaded: false,
            responseData: []
        }
    },
    methods: {
        async loadData(uid) {
            //console.log(uid);
            try {
                this.responseData = await load_conversation(uid);
                //let arr = [...this.responseData[0], ...this.responseData[1]]
                //console.log(this.responseData);
                //this.$emit('load-conversation', this.responseData);
            } catch (e) {
                console.log(e);
            }
            // const invitesGot = get_conversation_invites().then((response) => {
            //     console.log(response);
            //     return response});
        },
        seeData(data, uid) {
            this.dataLoaded = true;
            this.sentMessages = data.sent;
            this.sentMessages.forEach(obj => {
                obj.me = "yes";
            });
            this.receivedMessages = data.received;
            this.receivedMessages.forEach(obj => {
                obj.me = uid;
            });
            this.messages = this.sentMessages.concat(this.receivedMessages);
            this.messages.sort((a, b) => a.timestamp - b.timestamp);
            this.$emit('load-conversation', this.messages);
        }
    },
    props: ['display', 'uid'],
}
</script>