<template>
<div class="con">
    <div v-for="messages in conversationLoad">
        <p :class="{ 
            'me': (messages.me == 'yes'),
            'other': (messages.me != 'yes')
        }">{{ messages.message }}</p>
    </div>
</div>
</template>

<script>
import { public_key } from '../../js.js';

export default {
    data() {
        return {
            sentMessages: [],
            receivedMessages: [],
            messages: [],
            myKey: public_key
        }
    },
    methods: {
        sortMessages(conversationLoad) {

        }
    },
    props: ['conversationLoad'],
}
</script>

<style scoped>
.me {
    color: #2ecc71;
    margin-bottom: 10px;
}

.other {
    color: #3498db;
    margin-bottom: 10px;
}
</style>