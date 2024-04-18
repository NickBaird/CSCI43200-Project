<template>
    <div v-if="!deleted" class="">
        {{ message }}
        <button v-if="me == 'yes'" @click="deleteMessageVue(uid, id)">Delete</button>
    </div>
</template>

<script>
import { delete_conversation_message } from '../../js';

export default {
    components: {
    },
    data() {
        return {
            deleted: false
        }
    },
    methods: {
        deleteMessageVue(uid, id) {
            delete_conversation_message(uid, id);
            this.deleted = true;
        }
    },
    props: ['message', 'id', 'uid', 'me']
}
</script>