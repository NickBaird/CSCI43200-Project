<template>
<div v-if="notClicked" class="flex flex-col items-start gap-2">
    <div >
        <h3 class="text-2xl ">{{ display }}</h3>
        <p class="text-base ">wants to invite you to a conversation</p>
    </div>
    
    <div class="flex flex-row gap-4 text-base">
        <button @click="accept_conversation_invite_vue(convKey)" class="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-400 transition-colors font-semibold">Accept</button>
        <button @click="reject_conversation_invite_vue(convKey)" class="bg-rose-500 px-4 py-2 rounded-md text-white hover:bg-rose-400 transition-colors font-semibold">Reject</button></div>

</div>
</template>

<script>
import {
    accept_conversation_invite
} from '../../js.js';
import {
    reject_conversation_invite
} from '../../js.js';
import {
    get_conversation_invites
} from '../../js.js';

export default {
    data() {
        return {
            notClicked: true
        }
    },
    methods: {
        accept_conversation_invite_vue(invite) {
            this.notClicked = false;
            accept_conversation_invite(invite);
        },
        reject_conversation_invite_vue(invite) {
            this.notClicked = false;
            reject_conversation_invite(invite);
        }
    },
    props: ['display', 'convKey'],
    computed: {}
}
</script>
