<template>
<div class="h-screen w-full grid grid-cols-[.3fr_.7fr] pt-20">

    <div class="w-full flex flex-col">
        <messaging-creators></messaging-creators>
        <chats-container></chats-container>
    </div>
    <div></div>
</div>
<!-- <invites-container></invites-container>
 -->
</template>

<script>
export default {
    data() {
        return {}
    },
    computed: {},
    methods: {},
    inheritAttrs: false
}
</script>

<style scoped>
/* main {
    margin-top: 100px;
}

h1 {
    font-weight: normal;
    color: var(--pink);
    padding: 40px;
    padding-bottom: 0;
}

.row {
    margin: 40px;
    margin-top: 20px;
    margin-bottom: 0px;
    display: flex;
    height: 35px;
}

.clear {
    margin-left: auto;
    background-color: var(--pink);
    color: white;
    font-size: 18px;
} */
</style>
