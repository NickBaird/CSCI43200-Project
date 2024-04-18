<template>
<div class="p-10 mb-20 flex flex-col  w-full gap-4">
    <div v-for="messages in conversationLoad" class="flex flex-col w-full ">

        <p :class="{ 
            'bg-sky-300 p-4 self-end rounded-t-lg rounded-l-lg': (messages.me == 'yes'),
            'bg-zinc-300 p-2 self-start rounded-t-lg rounded-r-lg': (messages.me != 'yes')
        } ">{{ messages.message }}</p>
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
    },
    computed: {
    },
    props: ['conversationLoad', 'update'],
}
</script>

<style scoped>

</style>