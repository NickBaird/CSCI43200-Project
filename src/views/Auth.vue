<template>
    <main>
        <!-- Conditionally render components based on isRegistering -->
        <register v-if="isRegistering" @switch="toggleRegistering"></register>
        <login v-else @switch="toggleRegistering"></login>
    </main>
</template>
    
<script>
export default {
    data() {
        return {
            isRegistering: false // Start with the login form
        }
    },
    methods: {
        toggleRegistering() {
            // Toggle the state between registering and logging in
            this.isRegistering = !this.isRegistering;
        }
    }
}
</script>
