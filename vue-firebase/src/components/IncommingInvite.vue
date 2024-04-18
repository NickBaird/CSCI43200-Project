<template>
<div v-if="notClicked" class="flex flex-col items-start gap-2">
    <div >
        <h3 class="text-2xl ">{{ display }}</h3>
        <p class="text-base ">wants to invite you to a conversation</p>
    </div>
    
    <div class="flex flex-row gap-4 text-base">
        <button v-if="type == 'convo'" @click="accept_conversation_invite_vue(convKey)" class="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-400 transition-colors font-semibold">Accept</button>
        <button v-if="type == 'convo'" @click="reject_conversation_invite_vue(convKey)" class="bg-rose-500 px-4 py-2 rounded-md text-white hover:bg-rose-400 transition-colors font-semibold">Reject</button>
        <button v-if="type == 'group'" @click="accept_group_invite_vue(convKey)" class="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-400 transition-colors font-semibold">Accept</button>
        <button v-if="type == 'group'" @click="reject_group_invite_vue(convKey)" class="bg-rose-500 px-4 py-2 rounded-md text-white hover:bg-rose-400 transition-colors font-semibold">Reject</button></div>

</div>
</template>

<script>
import {
    accept_conversation_invite,
    reject_conversation_invite,
    get_conversation_invites,
    accept_group_invite,
	reject_group_invite

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
        },
        accept_group_invite_vue(invite) {
            this.notClicked = false;
            accept_group_invite(invite);
        },
        reject_group_invite_vue(invite) {
            this.notClicked = false;
            reject_group_invite(invite);
        }
    },
    props: ['display', 'convKey', 'type'],
    computed: {}
}
</script>
