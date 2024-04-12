<template>
<div class="bg-zinc-400 flex justify-evenly py-10">
    <div>
        <h1 class="cursor-pointer flex items-center"><vue-feather type="message-square" class="text-black"></vue-feather>Conversations</h1>
        <button @click="loadData()">Click to load conversations</button>
    <button @click="seeData(responseData)">Click to see data</button>
    <div v-if="dataLoaded">
        <div v-for="conversation in conversations">
            <chat-container
            :display="conversation.display"
            :uid="conversation.uid"></chat-container>
        </div>
        <div v-if="responseData.length == 0">No conversations</div>
    </div>
    <div id="conversations-container"></div>
    </div>
    <div>
        <h1 class="cursor-pointer">Groups</h1>
        <div id="groups-container"></div>
    </div>
    <div >
        <vue-feather type="edit" class="text-black"></vue-feather>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
    }
}
</script>
