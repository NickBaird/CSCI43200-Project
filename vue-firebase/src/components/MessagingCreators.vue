<template>
<div class="con" id="messaging-creator">
    <new-conversation></new-conversation>
    <group-stuff></group-stuff>
</div>
</template>

<script>
import GroupStuff from './MessagingCreators/GroupStuff.vue';
import NewConversation from './MessagingCreators/NewConversation.vue';

export default {
    components: {
        GroupStuff,
        NewConversation
    },
    data() {
        return {

        }
    },
    methods: {
    }
}
</script>