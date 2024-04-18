<template>
    <div class="w-fit text-nowrap flex flex-col items-start gap-2">
        <h1 class="text-2xl font-semibold mb-2 w-full">Invites</h1>
        <button @click="loadData()" class="text-blue-400" v-if="!dataLoaded"><vue-feather type="rotate-cw" ></vue-feather></button>
        <div v-if="dataLoaded">
            <div v-for="invite in invites" :key="invite.key">
                <incomming-invite :display="invite.display" :convKey="invite.key"></incomming-invite>
            </div>
            <div v-if="invites.length === 0">No incoming invites</div>
        </div>
    </div>
    </template>
    
    <script>
    import {
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
                dataLoaded: false
            }
        },
        methods: {
            async loadData() {
                try {
                    this.invites = [];
                    const uid = auth.currentUser.uid;
                    const invitesRef = database.ref("/invites/" + uid + "/conversations/");
                    const snapshot = await invitesRef.once('value');
                    if (snapshot.exists()) {
                        const inviteKeys = snapshot.val();
                        const userDisplays = await Promise.all(Object.keys(inviteKeys).map(key => 
                            database.ref("/users/" + key + "/display").once('value').then(res => ({
                                display: res.val(),
                                key: key
                            }))
                        ));
                        this.invites = userDisplays;
                    }
                    this.dataLoaded = true;
                } catch (error) {
                    console.error('Failed to load invites:', error);
                    this.dataLoaded = false; // Ensure state is accurate on error
                }
            }
        }
    }
    </script>
    