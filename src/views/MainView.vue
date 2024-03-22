<template>
<main>
    <h1>Messaging Information</h1>
    <!-- <div class="row">
        <h2>{{ updateCount }}</h2>
    </div> -->
</main>
</template>

<script>
export default {
    data() {
        return {
            // chatCount: ,
        }
    },
    computed: {
        // updateCount() {
        //     return `${this.sessions.length} Chats:`;
        // }
    },
    watch: {
    },
    methods: {
    },
    inheritAttrs: false
}
</script>

<style scoped>
main {
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
}

</style>