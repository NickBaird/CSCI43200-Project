<template>
<div class="bg-zinc-400 flex justify-evenly py-10">
    <div>
        <h1 class="cursor-pointer flex items-center"><vue-feather type="message-square" class="text-black"></vue-feather>Conversations</h1>
        <div id="conversations-container"></div>
    </div>
    <div>
        <h1 class="cursor-pointer">Groups</h1>
        <div id="groups-container"> </div>
    </div>
    <div >
        <vue-feather type="edit" class="text-black"></vue-feather>
    </div>
</div>
</template>

<script>

import VueFeather from 'vue-feather';

export default {
    components: {
	        VueFeather,
	    },
    data() {
        return {
            
        }
    },
    methods: {}
}
</script>
