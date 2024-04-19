<template>
<!-- <messaging-creators></messaging-creators>
<invites-container></invites-container> -->
<div class="h-screen w-full  grid grid-cols-[.3fr_.7fr] pt-20 overflow-clip">
    

    <div class="bg-[#f9f1ef]  w-full flex flex-col ">
        <!-- <messaging-creators></messaging-creators> -->
        <!-- <chats-container></chats-container> -->

        <conversations-container @load-conversation="loadConversation" @loaded-messages="loadedMessages" :left="left" @message-sent="scrollToBottom"></conversations-container>
        <!-- <groups0c -->
    </div>
    <div class="bg-[#f8e9e5] flex flex-col h-screen ">
        <div class="sticky top-0 p-8 bg-zinc-600 z-10  text-[#f8e9e5] flex flex-row items-center justify-between">
            <div class=" flex flex-col relative">
                <p class="text-2xl font-semibold">{{ otherDisplay }}</p>
                <p @click="copyToClipboard(otherUID)" class="text-sm  hover:bg-zinc-700 bg-opacity-5 hover:px-2 py-1 rounded-md transition-all cursor-pointer hover:text-blue-500 ">{{ otherUID }}</p>
                <transition name="fade" class="self-center">
                <p v-if="copySuccess" class="px-1 text-green-500 text-xs absolute bottom-0 left-0 translate-y-4">Copied!</p>
            </transition>
            </div>
            <div class="bg-zinc-200 flex flex-row gap-2 p-4 rounded-md cursor-pointer text-black hover:bg-red-500 hover:text-white transition-colors" v-if="type=='group'" @click="leaveGroup(otherUID)">
                <div class="">Leave Group</div>
                <vue-feather type="log-out"> </vue-feather>
            </div>
        </div>
        <chat-container ref="chatContainer" class="overflow-y-scroll h-full custom-scrollbar" 
        :conversationLoad="conversation" 
        :update="updateMessages" 
        :type="type"
        :otherUID="otherUID"></chat-container>
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
            left: [],
            copySuccess: false,
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
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.copySuccess = true;
                setTimeout(() => {
                    this.copySuccess = false;
                }, 2000); // Message disappears after 2 seconds
            }, (err) => {
                console.error('Failed to copy: ', err);
            });
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
            } else if (type == 'group') {
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
    overflow-y: auto;
    /* Ensure this is set correctly */
    height: 100%;
    /* Make sure the height is constrained */
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
    {
    opacity: 0;
}

</style>
