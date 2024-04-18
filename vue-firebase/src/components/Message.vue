<template>
<div v-if="!deleted || this.deletedID != id" class="flex flex-col w-full relative">
    <!-- i want this to be the display name -->
    <div :class="{ 
            'bg-sky-300 p-4 self-end rounded-t-lg rounded-l-lg m-2 max-w-96': (me == 'yes'),
            'bg-zinc-300 p-4 self-start rounded-t-lg rounded-r-lg m-2 max-w-96': (me != 'yes')
        } ">
        <div v-if="message.startsWith('blob:') " class="group text-lg min-w-32">
            <div class="text-sm mb-2 text-gray-500 group-hover:text-gray-900" v-if="typeChat == 'group' && me != 'yes'">{{ fetchDisplayName(uid) }}</div> 
            <div v-if="type.startsWith('image')" class=" relative flex border-0">
                <img :src="message" class="" />
                <a :href="message" class="absolute m-0 left-0 top-0 w-full h-full  hover:bg-black/20 z-20 flex items-center justify-center" target="_blank" rel="noopener noreferrer">
                    <vue-feather type="search" class="group-hover:block hidden "></vue-feather>
                </a>
            </div>
            <div v-else>
                <a :href="message" target="_blank" class="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors hover:underline " rel="noopener noreferrer">
                    <vue-feather type="file-text"></vue-feather>Open File
                </a>
            </div>

            <!--  -->
            <!-- {{ type }} -->
        </div>
        <div v-else class="text-lg min-w-32 group">
            <div class="text-sm mb-2 text-gray-500 group-hover:text-gray-900" v-if="typeChat == 'group' && me != 'yes'">{{ fetchDisplayName(uid) }}</div> 
           <div>{{ message }}</div>
        </div>
        <button v-if="me == 'yes'" @click="deleteMessageVue(uid, id, typeChat, otherUID)" class="absolute right-0 translate-x-8 -translate-y-4 cursor-pointer hover:text-red-500 text-gray-400 transition-colors">
            <vue-feather type="trash-2" size="22" class=""></vue-feather>
        </button>
    </div>
</div>
</template>

<script>
import {
    delete_conversation_message,
    getOtherUserDisplayInfo,
    delete_group_message
} from '../../js';
import VueFeather from 'vue-feather';

export default {
    components: {
        VueFeather
    },
    data() {
        return {
            deleted: false,
            otherDisplay: '',
            deletedID: ''
        }
    },
    computed: {
        displayName() {
            // Return cached display name or fetch if needed
            if(this.otherDisplay == '') {
                return this.typeChat == 'group' ? this.fetchDisplayName() : '';
            }
            else {
                return this.otherDisplay
            }
            //return this.otherDisplay || (this.typeChat == 'group' ? this.fetchDisplayName() : '');
        }
    },
    methods: {
        deleteMessageVue(uid, id, typeChat, otherUID) {
            // Deletion logic here
            if (typeChat == 'convo') {
                delete_conversation_message(uid, id);
            } else if (typeChat == 'group') {
                //console.log(otherUID + " " + id);
                delete_group_message(otherUID, id);
            }
            this.deleted = true;
            this.deletedID = id;
        },
        fetchDisplayName(uid) {
            getOtherUserDisplayInfo(uid).then(displayName => {
                this.otherDisplay = displayName;
            }).catch(error => {
                console.error('Failed to fetch display name:', error);
                this.otherDisplay = 'Unknown'; // Fallback display name
            });
            return this.otherDisplay;
        }
    },
    props: ['message', 'id', 'uid', 'me', 'type', 'typeChat', 'otherUID'],
    mounted() {
        if (this.typeChat == 'group' && this.me != 'yes') {
            this.fetchDisplayName();
        }
    }
}
</script>

