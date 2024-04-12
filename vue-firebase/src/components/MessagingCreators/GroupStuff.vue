<template>
<div class="con" id="group-things">
    <new-group></new-group>
    <group-invite></group-invite>
</div>
</template>

<script>
import NewGroup from './NewGroup.vue';
import GroupInvite from './GroupInvite.vue';

export default {
    components: {
        NewGroup,
        GroupInvite
    },
    data() {
        return {

        }
    },
    methods: {
    }
}
</script>