<template>
<div class="con">
    <h1>Invites:</h1>
    <div id="invites-container"></div>
</div>
</template>

<script>
import { accept_conversation_invite } from '../../js.js';
import { reject_conversation_invite } from '../../js.js';

export default {
    data() {
        return {

        }
    },
    methods: {
        accept_conversation_invite_vue(invite) {
            console.log(invite);
            accept_conversation_invite(invite);
        },
        reject_conversation_invite_vue(invite) {
            reject_conversation_invite(invite);
        }
    }
}
</script>