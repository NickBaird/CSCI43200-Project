<template>
<!-- <messaging-creators></messaging-creators>
<invites-container></invites-container> -->
<div class="h-screen w-full  grid grid-cols-[.3fr_.7fr] pt-20 overflow-clip">

    <div class="bg-[#f9f1ef]  w-full flex flex-col ">
        <!-- <messaging-creators></messaging-creators> -->
        <!-- <chats-container></chats-container> -->

        <conversations-container 
        @load-conversation="loadConversation" 
        @loaded-messages="loadedMessages"
        :left="left"></conversations-container>
        <!-- <groups0c -->
    </div>
    <div class="bg-[#f8e9e5] flex flex-col h-screen">
        <div class="sticky top-0 bg-zinc-600 z-10  text-[#f8e9e5] flex flex-row">
        <div class="sticky top-0 bg-zinc-600 z-10  text-[#f8e9e5] p-8 flex flex-col">
            <p class="text-2xl font-semibold">{{ otherDisplay }}</p>
            <p class="text-sm">{{ otherUID }}</p>
        </div>
        <div class="flex mr-0 ml-auto mr-8 mt-auto mb-auto p-2 bg-zinc-200 flex flex-row rounded-md cursor-pointer text-black"
        v-if="type=='group'"
        @click="leaveGroup(otherUID)">
            <div class="mr-2">Leave Group</div>
            <vue-feather type="log-out"> </vue-feather>
        </div>
    </div>
        <chat-container ref="chatContainer" class="overflow-y-scroll h-full "
        :conversationLoad="conversation" 
        :update="updateMessages"
        :type="type"></chat-container>
        <message-sender class="sticky bottom-0"
        :otherUID="otherUID" 
        :type="type" 
        @message-sent="scrollToBottom" 
        @update-messages="updateMessages"></message-sender>
    </div>
</div>
</template>

<script>
import {
    getOtherUserDisplayInfo,
    get_group_name,
    leave_group
} from "../../js.js";
import VueFeather from "vue-feather";

export default {
    components: {
        VueFeather
    },

    data() {
        return {
            conversation: [],
            messages: [],
            otherUID: '',
            updatedMessages: [],
            user: null,
            otherDisplay: '',
            type: '',
            left: []
        }
    },
    methods: {
        async loadConversation(conversationData, uid, type) {
            this.conversation = conversationData;
            this.otherUID = uid;
            this.type = type;
            this.updateOtherDisplay(uid, type); // Fetch and update display information
        },
        loadedMessages(loaded) {
            this.messages = loaded;
        },
        updateMessages(update) {
            this.conversation = update;
            //console.log(update);
        },
        async updateOtherDisplay(uid, type) {
            if (type == 'convo') {
                try {
                    const displayInfo = await getOtherUserDisplayInfo(uid); // Fetch display info for the given UID
                    this.otherDisplay = displayInfo;
                } catch (error) {
                    console.error('Failed to fetch user display info:', error);
                    this.otherDisplay = ''; // Clear or manage display info appropriately on error
                }
            }
            else if (type == 'group') {
                try {
                    const displayInfo = await get_group_name(uid); // Fetch display info for the given UID
                    this.otherDisplay = displayInfo;
                } catch (error) {
                    console.error('Failed to fetch user display info:', error);
                    this.otherDisplay = ''; // Clear or manage display info appropriately on error
                }
            }
        },
        leaveGroup(otherUID) {
            leave_group(otherUID);
            this.conversation = [],
            this.messages = [],
            this.otherUID = '',
            this.updatedMessages = [],
            this.otherDisplay = '',
            this.type = ''
            this.left.push(otherUID);
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
