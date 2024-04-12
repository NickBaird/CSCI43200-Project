<template>
<div class="con">
    <h1>Invites:</h1>
    <button @click="loadData()">Click to load the invite data</button>
    <button @click="seeData()">Click to see data</button>
    <div id="invites-container">
        <div v-if="dataLoaded">
            <div v-for="invite in invites">
                <h3>{{ invite.display }}</h3>
                <button @click="accept_conversation_invite_vue(invite.key)">Accept</button>
                <button @click="reject_conversation_invite_vue(invite.key)">Reject</button>
            </div>
        </div>
        <div v-else>
            <p>data not loaded</p>
        </div>
    </div>
</div>
</template>

<script>
import { accept_conversation_invite } from '../../js.js';
import { reject_conversation_invite } from '../../js.js';
import { get_conversation_invites } from '../../js.js';

export default {
    data() {
        return {
            invites: [],
            dataLoaded: false,
            responseData: [12]
        }
    },
    methods: {
        async loadData() {
            try {
                this.invites = await get_conversation_invites();
                this.dataLoaded = true;
                console.log(this.responseData);
                //this.$forceUpdate();
            } catch (e) {
                console.log(e);
            }

            // const invitesGot = get_conversation_invites().then((response) => {
            //     console.log(response);
            //     return response});
        },
        seeData() {
            console.log(this.invites);
        },
        accept_conversation_invite_vue(invite) {
            console.log(invite);
            accept_conversation_invite(invite);
        },
        reject_conversation_invite_vue(invite) {
            reject_conversation_invite(invite);
        }
    },
    computed: {
        updateInvites() {
            if (this.invites.size != 0) {
                return this.invites[0];
            }
        }
    }
}
</script>