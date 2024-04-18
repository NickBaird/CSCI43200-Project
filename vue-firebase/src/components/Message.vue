<template>
<div v-if="!deleted" class="flex flex-col w-full relative">
    <div class="font-bold "
    v-if="typeChat == 'group' && me != 'yes'">{{ uid }}:</div>
    <div :class="{ 
            'bg-sky-300 p-4 self-end rounded-t-lg rounded-l-lg m-2 max-w-96': (me == 'yes'),
            'bg-zinc-300 p-4 self-start rounded-t-lg rounded-r-lg m-2 max-w-96': (me != 'yes')
        } ">
    <div v-if="message.startsWith('blob:') ">
        <div v-if="type.startsWith('image')">
            <img :src="message" class=""/>
        </div>
        <div v-else>
            <a :href="message" target="_blank" class="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors hover:underline "><vue-feather type="file-text"></vue-feather>Open File</a>
        </div>

        <!--  -->
        <!-- {{ type }} -->
    </div>
    <div v-else class="">
        {{ message }}
    </div>
    <button v-if="me == 'yes'" @click="deleteMessageVue(uid, id, typeChat)" class="absolute right-0 translate-x-8 -translate-y-4 cursor-pointer hover:text-red-500 text-gray-400 transition-colors">
        <vue-feather type="trash-2" size="22" class=""></vue-feather>
    </button>
</div>
</div>
</template>

<script>
import {
    delete_conversation_message,
    delete_group_message
} from '../../js';
import VueFeather from 'vue-feather';

export default {
    components: {
        VueFeather
    },
    data() {
        return {
            deleted: false
        }
    },
    methods: {
        deleteMessageVue(uid, id, typeChat) {
            if (typeChat == 'convo') {
                delete_conversation_message(uid, id);
            }
            else if (typeChat == 'group') {
                delete_group_message(uid, id);
            }
            this.deleted = true;
        }
    },
    props: ['message', 'id', 'uid', 'me', 'type', 'typeChat']
}
</script>
