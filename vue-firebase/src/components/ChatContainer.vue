<template>
<div class="p-10 mb-20 flex flex-col  w-full">
    <div v-for="messages in conversationLoad" class="flex flex-col w-full">
        <Message :class="{ 
            'bg-sky-300 p-4 self-end rounded-t-lg rounded-l-lg m-2': (messages.me == 'yes'),
            'bg-zinc-300 p-4 self-start rounded-t-lg rounded-r-lg m-2': (messages.me != 'yes')
        } "
        :message="messages.message"
        :id="messages.dbid"
        :uid="messages.uid"
        :me="messages.me"
        :type="messages.type"></Message>
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
    props: ['conversationLoad', 'update'],
}
</script>

<style scoped>

</style>