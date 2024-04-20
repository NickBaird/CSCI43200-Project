<template>
    <div class="bg-white z-30 shadow-xl rounded-lg ">
      <button @click="close" class="self-start p-4 ">
        <vue-feather type="x-square" class="text-red-500"></vue-feather>
      </button>
      <div class="flex flex-col lg:flex-row">
        <new-conversation />
        <new-group/>
        <group-invite/>
      </div>
  
    </div>
  </template>
  
  <script>
  import VueFeather from 'vue-feather';
  import NewConversation from './MessagingCreators/NewConversation.vue';
  import NewGroup from './MessagingCreators/NewGroup.vue';
  import GroupInvite from './MessagingCreators/GroupInvite.vue';
  import { new_conversation } from '../../js';
  
  export default {
    components: {
      NewConversation,
      VueFeather,
      NewGroup,
      GroupInvite
    },
    data() {
      return {}
    },
    methods: {
      close() {
        this.$emit('close');
      }
    }
  }
  </script>