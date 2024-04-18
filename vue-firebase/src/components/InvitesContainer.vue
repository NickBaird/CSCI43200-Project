<template>
    <div class="w-fit text-nowrap flex flex-col items-start gap-2">
        <h1 class="text-2xl font-semibold mb-2 w-full underline">Invites</h1>
        <button @click="loadData()" class="text-blue-400 justify-center ml-auto mr-auto" v-if="!dataLoaded"><vue-feather type="rotate-cw" ></vue-feather></button>
        <div v-if="dataLoaded" class="flex flex-col gap-4  ">
            <h2 class="font-bold">Conversation</h2>
            <div v-for="invite in invites" :key="invite.key" class="border-y-2 py-2 ">
                <incomming-invite :display="invite.display" 
                :convKey="invite.key"
                :type="'convo'"></incomming-invite>
            </div>
            <div v-if="invites.length === 0">No incoming conversation invites</div>
            <h2 class="font-bold">Group</h2>
            <div v-for="inviteGroup in invitesGroup" :key="inviteGroup.key" class="border-y-2 py-2 ">
                <incomming-invite :display="inviteGroup.display" 
                :convKey="inviteGroup.key"
                :type="'group'"></incomming-invite>
            </div>
            <div v-if="invitesGroup.length === 0">No incoming group invites</div>
        </div>
    </div>
    </template>
    
    <script>
    import {
        get_conversation_invites,
        database,
        auth,
        add_to_map,
        map,
        verify_message
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
                invitesGroup: [],
                dataLoaded: false
            }
        },
        methods: {
            async loadData() {
                try {
                    this.invites = [];
                    this.invitesGroup = [];
                    const uid = auth.currentUser.uid;
                    const invitesRef = database.ref("/invites/" + uid + "/conversations/");
                    const invitesGroupRef = database.ref("/invites/" + uid + "/groups/");
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
                    const snapshotGroup = await invitesGroupRef.once('value');
                    if (snapshotGroup.exists()) {
                        const inviteKeys = snapshotGroup.val();
                        const groupDisplays = await Promise.all(Object.keys(inviteKeys).map(async key => {
                            const res = await database.ref("/group_messages/" + key + "/" + auth.currentUser.uid + "/name/").get();
                            const nonce = sodium.from_hex(res.child("nonce").val());
                            const payload = sodium.from_hex(res.child("payload").val());
                            const timestamp = res.child("timestamp").val();
                            const from = res.child("from").val();

                            await add_to_map(from);
                            const decrypted = sodium.crypto_secretbox_open_easy(
                                payload,
                                nonce,
                                map[from].srx
                            );

                            return {
                                display: await sodium.to_string(await verify_message(decrypted, map[from].signature)),
                                key: key
                            }
                        }));
                        this.invitesGroup = groupDisplays;
                        console.log(this.invitesGroup);
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
    