<template>
<div class="p-10 mb-20 flex flex-col  w-full">
    <div v-for="messages in conversationLoad" class="flex flex-col w-full">
        <Message
        :message="messages.message"
        :id="messages.dbid"
        :uid="messages.uid"
        :me="messages.me"
        :type="messages.type"
        :typeChat="type"
        :otherUID="otherUID"></Message>
    </div>
</div>
</template>

<script>
import { public_key } from '../../js.js';
import Message from './Message.vue';

export default {
    components: {
        Message
    },
    data() {
        return {
            sentMessages: [],
            receivedMessages: [],
            messages: [],
            myKey: public_key
        }
    },
    methods: {
    },
    computed: {
    },
    props: ['conversationLoad', 'update', 'type', 'otherUID'],
}
</script>

<style scoped>

</style>