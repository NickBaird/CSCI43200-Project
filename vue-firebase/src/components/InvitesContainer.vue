<template>
  <div class="w-fit text-nowrap flex flex-col items-start gap-2">
    <h1 class="text-2xl font-semibold mb-2 w-full">Invites</h1>
    <button @click="loadData()" v-if="!showRotateIcon" class="text-blue-400">Load</button>
    <button @click="seeData(responseData)" v-if="showRotateIcon" class="w-full text-blue-400" ><vue-feather type="rotate-cw"/></button>
    <div v-if="dataLoaded">
      <div v-for="invite in invites">
        <incomming-invite
            :display="invite.display"
            :convKey="invite.key"></incomming-invite>
      </div>
      <div v-if="responseData.length == 0">No incomming invites</div>
    </div>
  </div>
</template>

<script>
import {
  accept_conversation_invite,
  reject_conversation_invite,
  get_conversation_invites,
  database,
  auth
} from '../../js.js';
import IncommingInvite from './IncommingInvite.vue';
import VueFeather from 'vue-feather';

export default {
  components: {
    IncommingInvite,
    VueFeather
  },
  data() {
    return {
      invites: [],
      dataLoaded: false,
      responseData: [],
      showRotateIcon: false
    }
  },
  methods: {
    async loadDatabase() {
      let conversation_invites = [];
      await database
          .ref("/invites/" + auth.currentUser.uid + "/conversations/")
          .on("value", (conversations) => {
            conversations.forEach((conversation) => {
              database
                  .ref("/users/" + conversation.key + "/display")
                  .get()
                  .then((display) => {
                    let invite_obj = {
                      display: display.val(),
                      key: conversation.key
                    }
                    conversation_invites.push(invite_obj);
                  });
            });
            console.log(conversation_invites);
            this.invites = conversation_invites;
            this.dataLoaded = true;
          });

      return conversation_invites;
    },
    async loadData() {
      try {
        this.responseData = await get_conversation_invites();
        this.showRotateIcon = true;
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
      this.invites = data;
    },
    accept_conversation_invite_vue(invite) {
      accept_conversation_invite(invite);
    },
    reject_conversation_invite_vue(invite) {
      reject_conversation_invite(invite);
    }
  },
  watch: {
    invites(newValue, oldValue) {
      console.log(`Value changed from ${oldValue} to ${newValue}`);
    }
  }
}
</script>