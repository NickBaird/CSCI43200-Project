<template>
<!-- <messaging-creators></messaging-creators>
<invites-container></invites-container> -->
<div class="h-screen w-full  grid grid-cols-[.3fr_.7fr] pt-20 overflow-clip">

    <div class="bg-[#f9f1ef]  w-full flex flex-col ">
        <!-- <messaging-creators></messaging-creators> -->
        <!-- <chats-container></chats-container> -->

        <conversations-container @load-conversation="loadConversation" @loaded-messages="loadedMessages"></conversations-container>
        <!-- <groups0c -->
    </div>
    <div class="bg-[#f8e9e5] flex flex-col h-screen    ">
        <div class="sticky top-0 bg-zinc-600 z-10  text-[#f8e9e5] p-8 flex flex-col">
            <p class="text-2xl font-semibold">{{ otherDisplay }}</p>
            <p class="text-sm">{{ otherUID }}</p>
        </div>
        <chat-container ref="chatContainer" :conversationLoad="conversation" :update="updateMessages" class="overflow-y-scroll h-full "></chat-container>
        <message-sender :otherUID="otherUID" :type="type" @message-sent="scrollToBottom" @update-messages="updateMessages" class="sticky bottom-0"></message-sender>
    </div>
</div>
</template>

<script>
import {
    getOtherUserDisplayInfo
} from "../../js.js";

export default {
    data() {
        return {
            conversation: [],
            messages: [],
            otherUID: '',
            updatedMessages: [],
            user: null,
            otherDisplay: '',
            type: ''
        }
    },
    methods: {
        async loadConversation(conversationData, uid, type) {
            this.conversation = conversationData;
            this.otherUID = uid;
            this.type = type;
            this.updateOtherDisplay(uid); // Fetch and update display information
        },
        loadedMessages(loaded) {
            this.messages = loaded;
        },
        updateMessages(update) {
            this.conversation = update;
            console.log(update);
        },
        async updateOtherDisplay(uid) {
            try {
                const displayInfo = await getOtherUserDisplayInfo(uid); // Fetch display info for the given UID
                this.otherDisplay = displayInfo;
            } catch (error) {
                console.error('Failed to fetch user display info:', error);
                this.otherDisplay = ''; // Clear or manage display info appropriately on error
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                setTimeout(() => { // Add a small delay
                    
                    const chatContainerElement = this.$refs.chatContainer.$el;
                    if (chatContainerElement) {
                        chatContainerElement.scrollTop = chatContainerElement.scrollHeight;
                    } else {
                     
                    }
                }, 100); // Adjust delay as necessary
            });
        }

    },

    inheritAttrs: false
}
</script>

<style scoped>
.chat-container {
    overflow-y: auto; /* Ensure this is set correctly */
    height: 100%; /* Make sure the height is constrained */
}
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
