<template>
  <div class="bg-zinc-400 flex justify-evenly py-10">
    <div>
      <div class="cursor-pointer flex items-center">
        <vue-feather type="message-square" class="text-black"></vue-feather>Conversations
      </div>

      <div id="conversations-container"></div>
    </div>
    <div id="conversations-container"></div>
    <div>
      <div class="cursor-pointer flex items-center">
        <vue-feather type="users" class="text-black"></vue-feather>Groups
      </div>
      <div id="groups-container"> </div>
    </div>
    <div class="cursor-pointer" @click="toggleNewConversation">
      <vue-feather type="edit" class="text-black"></vue-feather>
    </div>
  </div>

  <button @click="loadData()">Click to load conversations</button>
  <button @click="seeData(responseData)">Click to see data</button>
  <div v-if="dataLoaded">
    <div v-for="conversation in conversations">
      <conversation-container :display="conversation.display" :uid="conversation.uid"></conversation-container>
    </div>
    <div v-if="responseData.length == 0">No conversations</div>
  </div>

  <message-creator v-if="isShowingNewConversation" @close="toggleNewConversation" class="absolute left-1/3" />


</template>

<script>
import VueFeather from 'vue-feather';
import {
  update_conversations
} from '../../js.js';
import ConversationContainer from './ConversationContainer.vue';
import MessageCreator from './MessageCreator.vue';


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
      responseData: [],
      isShowingNewConversation: false
    }
  },
  methods: {
    async loadData() {
      try {
        this.responseData = await update_conversations();
        console.log(this.responseData);
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
    toggleNewConversation() {
      this.isShowingNewConversation = !this.isShowingNewConversation;
    }
  }
}
</script>
