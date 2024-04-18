<template>
<div class="h-20 flex items-center justify-between bg-white w-full px-4 hover:bg-slate-400 transition-colors cursor-pointer" 
@click="loadData(uid, type)"
v-if="!left.includes(uid)">
    <div class="flex flex-col">
        <h3 class="text-2xl font-semibold">{{ display }}</h3>
        <p class="font-light ">{{ uid  }}</p>
    </div>
    <div>
        <!-- <button >Load</button> -->
        <button v-if="isShowingSee" @click="seeData(responseData, uid, type)" >See</button>
    </div>

    <!-- <div v-if="dataLoaded">
        <div v-for="message in messages">
            <p>{{ message.message }}</p>
        </div>
    </div> -->
</div>
</template>

<script>
import {
    load_conversation,
    load_group
} from '../../js.js';

export default {
    data() {
        return {
            sentMessages: [],
            receivedMessages: [],
            messages: [],
            dataLoaded: false,
            responseData: [],
            isShowingSee: false
        }
    },
    methods: {
        async loadData(uid, type) {
            //console.log(type);
            if (type == 'convo') {
                try {
                    this.responseData = await load_conversation(uid);
                    this.isShowingSee = !this.isShowingSee;
                    //let arr = [...this.responseData[0], ...this.responseData[1]]
                    //console.log(this.responseData);
                    //this.$emit('load-conversation', this.responseData);
                } catch (e) {
                    console.log(e);
                }
            }
            else if (type == 'group') {
                try {
                    this.responseData = await load_group(uid);
                    this.isShowingSee = !this.isShowingSee;
                    //let arr = [...this.responseData[0], ...this.responseData[1]]
                    //console.log(this.responseData);
                    //this.$emit('load-conversation', this.responseData);
                } catch (e) {
                    console.log(e);
                }
            }
            // const invitesGot = get_conversation_invites().then((response) => {
            //     console.log(response);
            //     return response});
        },
        seeData(data, uid, type) {
            this.dataLoaded = true;

            // let messagesArr = null;
            // for (let i = 0; i < this.messagesObject.length; i++) {
            //     if (this.messagesObject[i].uid == this.thisUID) {
            //         messagesArr = this.messagesObject[i]
            //     }
            // }

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
            //console.log(data);
            this.$emit('load-conversation', this.messages, uid, type);
        },
      
    },
    props: ['display', 'uid', 'loadedMessages', 'type', 'left'],
}
</script>
