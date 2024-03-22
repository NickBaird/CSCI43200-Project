<template>
<button>
    <b><slot></slot></b>
</button>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
    }
}
</script>

<style scoped>
button {
    width: auto;
    height: 2.5em;
    padding: 0.4em;
    text-align: center;
    justify-content: center;
    background-color: var(--teal);
    color: black;
    opacity: 100%;
    border-radius: 10px;
    border-width: 2px;
    border-color: black;
    border-style: solid;
    transition: 0.2s ease-in-out;
    font-size: 14px;
}

button:hover {
    background-color: var(--yellow);
    color: black;
    opacity: 80%;
    cursor: pointer;
}

</style>