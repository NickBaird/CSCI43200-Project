<template>
<nav class="bg-[#301014] w-full h-20 p-5 flex items-center justify-between">

    <vue-feather type="menu" class="h-full cursor-pointer text-[#EDF4ED]"></vue-feather>
    <!-- <vue-feather type="user" class="h-full cursor-pointer text-[#EDF4ED]"></vue-feather>
     -->
    <div @click="toggleDropdown" class="relative flex items-center justify-center">
        <vue-feather type="user" class="h-full cursor-pointer text-[#EDF4ED]"></vue-feather>
        <div v-if="isDropdownVisible" class="z-20 absolute top-full bg-white  p-5 m-2 rounded-md drop-shadow-md flex flex-col items-center justify-center text-xl  gap-2 ">
            <p class="w-full">Welcome, {{ userDisplay }}</p>
            <p class="text-sm w-full text-nowrap">User ID {{ user.uid }}</p>

               
        </div>
   
    </div>

    <div class="h-full flex items-center text-xl font-bold">
        <router-link :to="{ name: 'auth' }">
            <button type="button" class="cursor-pointer text-[#EDF4ED] bg-blue-500 rounded-md px-4 py-2">Login or Signup</button>
        </router-link>
    </div>
</nav>
</template>

<script>
import VueFeather from 'vue-feather';
import {
    getCurrentUser,
    getUserDisplayInfo
} from "../../js.js";

export default {
    // Step 2: Register it locally
    components: {
        VueFeather,
    },
    data() {
        return {
            user: null,
            userDisplay: '',
            isDropdownVisible: false,
        };
    },
    methods: {
        toggleDropdown() {
            this.isDropdownVisible = !this.isDropdownVisible;
        }
    },
    created() {
        getCurrentUser()
            .then(user => {
                if (user) {
                    this.user = user;
                    return getUserDisplayInfo();
                } else {
                    throw new Error('No user signed in.');
                }
            })
            .then(displayInfo => {
                this.userDisplay = displayInfo;
            })
            .catch(error => {
                console.error("Error: ", error);
            });
    }
};
</script>

<style scoped>

</style>
