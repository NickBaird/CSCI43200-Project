<template>
<messaging-creators></messaging-creators>
<invites-container></invites-container>
<conversations-container
@load-conversation="loadConversation"
@loaded-messages="loadedMessages"></conversations-container>
<chat-container
:conversationLoad="conversation"
:update="updateMessages"></chat-container>
<message-sender
:otherUID="otherUID"
@update-messages="updateMessages"></message-sender>
</template>

<script>
export default {
    data() {
        return {
            conversation: [],
            messages: [],
            otherUID: '',
            updatedMessages: []
        }
    },
    methods: {
        loadConversation(conversationData, uid) {
            this.conversation = conversationData;
            this.otherUID = uid;
            //console.log(conversationData);
        },
        loadedMessages(loaded) {
            this.messages = loaded;
        },
        updateMessages(update) {
            this.conversation = update;
            console.log(update);
        }
    },
    inheritAttrs: false
}
</script>

<style scoped>
/* main {
    margin-top: 100px;
}

h1 {
    font-weight: normal;
    color: var(--pink);
    padding: 40px;
    padding-bottom: 0;
}

.row {
    margin: 40px;
    margin-top: 20px;
    margin-bottom: 0px;
    display: flex;
    height: 35px;
}

.clear {
    margin-left: auto;
    background-color: var(--pink);
    color: white;
    font-size: 18px;
} */

</style>