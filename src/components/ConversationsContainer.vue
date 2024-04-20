<template>
<div class="flex flex-col h-[90vh]">
    <div class="bg-zinc-400  flex justify-evenly py-10 items-center text-[#423937]">
        <div :class="{'bg-white px-4 py-2 rounded-md bg-opacity-40': clicked === 'convo'}">
            <div class="cursor-pointer flex items-center" @click="buttonClicked('convo')">
                <vue-feather type="message-square" class=""></vue-feather>Conversations
            </div>

            <div id="conversations-container"></div>
        </div>
        <div :class="{'bg-white px-4 py-2 rounded-md bg-opacity-40': clicked === 'group'}">
            <div class="cursor-pointer flex items-center" @click="buttonClicked('group')">
                <vue-feather type="users" class=""></vue-feather>Groups
            </div>
            <div id="groups-container"></div>
        </div>
        <div class="cursor-pointer flex items-center" @click="toggleNewConversation">
            <vue-feather type="edit" class=" flex items-center"></vue-feather>
        </div>
    </div>

    <button @click="loadData()" class=" top-20">
        <vue-feather type="rotate-cw" class="m-4" v-if="!dataLoaded"></vue-feather>
    </button>

    <div v-if="dataLoaded" class="flex flex-col items-start w-full h-full custom-scrollbar overflow-y-scroll  ">
        <div v-for="conversation in conversations" :key="conversation.id" class="w-full ">
            <conversation-container 
            :display="conversation.display" 
            :uid="conversation.uid" 
            :loadedMessages="conversation.messages" 
            :type="this.clicked" 
            :left="left"
            @load-conversation="loadConversation"></conversation-container>
        </div>
        <div v-if="conversations.length === 0">No conversations</div>
    </div>
</div>
<message-creator v-if="isShowingNewConversation" @close="toggleNewConversation" class="absolute left-1/3" />
</template>

<script>
import VueFeather from 'vue-feather';
import {
    update_conversations,
    load_conversation,
    update_groups
} from '../../js.js';
import ConversationContainer from './ConversationContainer.vue';
import MessageCreator from './MessageCreator.vue';
import {
    onMounted
} from 'vue';

  export default {
      components: {
          ConversationContainer,
          VueFeather,
          MessageCreator,
      },
      
      data() {
          return {
              conversations: [],
              dataLoaded: false,
              loadedMessages: [],
              isShowingNewConversation: false,
              clicked: 'convo'
          };
      },
      methods: {
          async loadData() {
            if (this.clicked == 'convo') {
                try {
                    const data = await update_conversations();
                    if (data && Array.isArray(data) && data.length > 0) {
                        await this.seeData(data);
                        this.dataLoaded = true;
                    } else {
                        this.dataLoaded = false;
                        console.log('No data received or empty data array.');
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                    this.dataLoaded = false; // Properly update state on error
                }
            } else if (this.clicked == 'group') {
                try {
                    const data = await update_groups();
                    if (data && Array.isArray(data) && data.length > 0) {
                        await this.seeData(data);
                        this.dataLoaded = true;
                    } else {
                        this.dataLoaded = false;
                        console.log('No data received or empty data array.');
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                    this.dataLoaded = false; // Properly update state on error
                }
            }
        },
        async seeData(data) {
            try {
                //   const promises = data.map(item => load_conversation(item.uid).then(messages => ({
                //       ...item,
                //       messages
                //   })));
                //   this.conversations = await Promise.all(promises);
                this.conversations = data;
            } catch (error) {
                console.error('Error processing data:', error);
            }
        },
        loadConversation(conversationData, uid, type) {
            this.$emit('load-conversation', conversationData, uid, type);
        },
        toggleNewConversation() {
            this.isShowingNewConversation = !this.isShowingNewConversation;
        },
        buttonClicked(type) {
            this.dataLoaded = false;
            this.conversations = [];
            if (type == 'convo') {
                this.clicked = 'convo';
            } else if (type == 'group') {
                this.clicked = 'group';
            }
        }
    },
    mounted() {
        this.loadData(); // Ensure loadData is called automatically when the component mounts
    },
    props: ['left']
}
</script>

<style scoped>

</style>
