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
            @load-conversation="loadConversation"></conversation-container>
        </div>
        <div v-if="responseData.length == 0">No conversations</div>
    </div>
    <div id="conversations-container"></div>
    <h1>Groups:</h1>
    <div id="groups-container"></div>
</div>
</template>

<script>
import { 
    update_conversations
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
            responseData: []
        }
    },
    methods: {
        async loadData() {
            try {
                this.responseData = await update_conversations();
                //console.log(this.responseData);
            } catch (e) {
                console.log(e);
            }
            // const invitesGot = get_conversation_invites().then((response) => {
            //     console.log(response);
            //     return response});
        },
        seeData(data) {
            this.dataLoaded = true;
            this.conversations = data;
        },
        loadConversation(conversationData) {
            this.$emit('load-conversation', conversationData);
        }
    }
}
</script>