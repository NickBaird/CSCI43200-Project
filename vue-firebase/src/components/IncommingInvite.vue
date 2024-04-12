<template>
<div v-if="notClicked">
    <h3>{{ display }}</h3>
    <button @click="accept_conversation_invite_vue(convKey)">Accept</button>
    <button @click="reject_conversation_invite_vue(convKey)">Reject</button>
</div>
</template>

<script>
import { accept_conversation_invite } from '../../js.js';
import { reject_conversation_invite } from '../../js.js';
import { get_conversation_invites } from '../../js.js';

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
    computed: {
        updateInvites() {
            if (this.invites.size != 0) {
                return this.invites[0];
            }
        }
    }
}
</script>