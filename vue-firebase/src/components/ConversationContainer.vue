<template>
  <div>
    <p>{{ display }}</p>
    <p>{{ " [" + uid + "]"}}</p>
    <button @click="loadData(uid)">Load</button>
    <button @click="seeData(responseData)">See</button>
    <div v-if="dataLoaded">
      <!-- <div v-for="message in messages">
          <p>{{ message.message }}</p>
      </div> -->


    </div>
  </div>
</template>

<script>
import { load_conversation } from '../../js.js';

export default {

  data() {
    return {
      sentMessages: [],
      receivedMessages: [],
      messages: [],
      dataLoaded: false,
      responseData: []
    }
  },
  methods: {
    async loadData(uid) {
      console.log(uid);
      try {
        this.responseData = await load_conversation(uid);
        //let arr = [...this.responseData[0], ...this.responseData[1]]
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
      this.sentMessages = data.sent;
      this.receivedMessages = data.received;
      this.messages = this.sentMessages.concat(this.receivedMessages);
      this.messages.sort((a, b) => a.timestamp - b.timestamp);
      console.log(this.messages);
    }
  },
  props: ['display', 'uid'],
}
</script>