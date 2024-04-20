<template>
    <div  id="invite-group-container" class="flex flex-col items-center justify-center bg-[#dc825c] p-10 rounded-br-md text-[#51291E] gap-6 z-0">
      <h3 class="self-start text-xl font-semibold flex items-center gap-2">Invite to group <vue-feather type="user-plus"></vue-feather></h3>
      <input type="text" autocomplete="off" v-model="newGroupID" id="new-group-id" placeholder="Group ID" class="text-zinc-800 px-4 py-2">
      <input type="text" autocomplete="off" v-model="newGroupUID" id="new-group-uid" class="text-zinc-800 px-4 py-2 " placeholder="User ID">
      <button @click="sendGroupInviteVue()" class="bg-blue-500 hover:bg-blue-700 transition-colors  rounded-md px-4 py-2 flex items-center justify-center gap-2 text-[#EDF4ED]">Invite to Group <vue-feather size="15" type="user-plus"></vue-feather></button>
    </div>
  </template>
  
  <script>
  import VueFeather from "vue-feather";
  import { send_group_invite } from '../../../js.js';
  
  export default {
    components: {
      VueFeather
    },
    data() {
      return {
        newGroupID: '',
        newGroupUID: ''
      }
    },
    methods: {
      sendGroupInviteVue() {
        send_group_invite(this.newGroupID, this.newGroupUID);
        this.newGroupID = '';
        this.newGroupUID = '';
      }
    }
  }
  </script>