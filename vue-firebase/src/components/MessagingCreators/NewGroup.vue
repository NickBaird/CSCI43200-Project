<template>
<div id="new-group-container" class="flex flex-col items-center justify-between bg-[#db9b52] p-10  text-[#51291E] gap-6 z-0">
    <h3 class="self-start text-xl font-semibold flex items-center gap-2">Start a group chat <vue-feather type="users"></vue-feather>
    </h3>
    <input type="text" autocomplete="off" id="new-group-name" class="text-zinc-800 px-4 py-2" placeholder="Group chat name" v-model="groupName">
    <button @click="newGroupVue(groupName);" class="bg-blue-500 hover:bg-blue-700 transition-colors  rounded-md px-4 py-2 flex items-center justify-center gap-2 text-[#EDF4ED]">Start Group <vue-feather size="15" type="users"></vue-feather></button>
</div>
</template>

  
<script>
import VueFeather from "vue-feather";
import {
    new_group
} from '../../../js.js';

export default {
    components: {
        VueFeather
    },
    data() {
        return {
            groupName: ''
        }
    },
    methods: {
        newGroupVue(name) {
            if (name != '') {
                new_group(name);
            }
            this.groupName = '';
        }
    }
}
</script>
