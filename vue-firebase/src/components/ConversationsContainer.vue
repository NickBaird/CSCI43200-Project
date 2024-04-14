<template>
<div class="con">
    <h1>Conversations:</h1>
    <button @click="loadData()">Click to load conversations</button>
    <button @click="seeData(responseData)">Click to see data</button>
    <div v-if="dataLoaded">
        <div v-for="conversation in conversations">
            <conversation-container
            :display="conversation.display"
            :uid="conversation.uid"
            :loadedMessages="this.loadedMessages"
            @load-conversation="loadConversation"></conversation-container>
        </div>
        <div v-if="responseData.length == 0">No conversations</div>
    </div>
    <h1>Groups:</h1>
    <div id="groups-container"></div>
</div>
</template>

<script>
import { 
    update_conversations,
    load_conversation
} from '../../js.js';
import ConversationContainer from './ConversationContainer.vue';

export default {
    components: {
        ConversationContainer
    },
    data() {
        return {
            conversations: [],
            dataLoaded: false,
            responseData: [],
            loadedMessages: []
        }
    },
    methods: {
        async loadData() {
            try {
                this.responseData = await update_conversations();
            } catch (e) {
                console.log(e);
            }
            // const invitesGot = get_conversation_invites().then((response) => {
            //     console.log(response);
            //     return response});
        },
        async loadMessages(data) {
            for (let i = 0; i < data.length; i++) {
                const result = await load_conversation(data[i].uid);
                //console.log(result);
            }
        },
        seeData(data) {
            this.dataLoaded = true;
            this.conversations = data;
            // for (let i = 0; i < data.length; i++) {
            //     let result = load_conversation(data[i].uid);
            //     result.uid = data[i].uid;
            //     this.loadedMessages.push(result);
            // }
            // console.log(this.loadedMessages);
            // this.$emit('loaded-messages', this.loadedMessages);
        },
        loadConversation(conversationData, uid) {
            this.$emit('load-conversation', conversationData, uid);
        }
    }
}
</script>