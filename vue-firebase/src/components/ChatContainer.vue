<template>
<div>
    <p>{{ display }}</p>
    <p>{{ " [" + uid + "]"}}</p>
    <button @click="load_conversation_vue(uid)">Accept</button>
</div>
</template>

<script>
import { load_conversation } from '../../js.js';

export default {
    data() {
        return {
        }
    },
    methods: {
        load_conversation_vue(uid) {
            load_conversation(uid);
        },
    },
    props: ['display', 'uid'],
    computed: {
    }
}
</script>