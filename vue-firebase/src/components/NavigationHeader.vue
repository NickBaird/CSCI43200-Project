<template>
<nav class="bg-[#301014] w-full h-20 px-10 py-5 flex items-center justify-between top-0 fixed z-20">
    <div v-if="!user && $route.name !== 'auth'" class="absolute w-full h-screen left-0 top-0 bg-black/50 z-30 backdrop-blur-md flex items-center justify-center" @click="reloadPage">
        <div class=" flex flex-col gap-4 items-center p-10 rounded-md max-w-screen-sm font-bold bg-white" v-if="$route.name !== 'auth' && !user">
            <div class="self-start ">
                <h1 class="text-4xl">Hello 👋</h1>
                <h2 class=" text-base font-normal ">Welcome to the E2EE messaging app. We offer the most secure End-to-end encrypted system for your messages. <a href="https://docs.google.com/document/d/1e-a225eE729Kk_LTB1nHZXcBR8lcD_H0VmyULs0UtH0/edit?usp=sharing" target="_blank" rel="noopener noreferrer" class="text-blue-500 cursor-pointer">Read more.</a> </h2>
              
                <h2 class=" text-lg font-normal mt-2">Happy secure messaging 😃</h2>
            </div>

            <router-link :to="{ name: 'auth' }" class="w-full">
                <button type="button" class="cursor-pointer text-[#EDF4ED] bg-blue-500 hover:bg-blue-600 transition-colors rounded-lg px-8 py-10 w-full text-xl">Login or Signup</button>
            </router-link>
        </div>
    </div>
    <!-- Conditional rendering for menu/back icon -->
    <router-link :to="{ name: 'home' }" v-if="$route.name === 'auth'">
        <vue-feather type="arrow-left" class="h-full cursor-pointer text-[#EDF4ED]"></vue-feather>
    </router-link>
    <!-- <vue-feather type="menu" class="h-full cursor-pointer text-[#EDF4ED]" v-else></vue-feather> -->

    <!-- Conditional rendering for user icon -->
    <div @click="toggleProfile" class="flex items-center justify-center" v-if="$route.name !== 'auth'">
        <vue-feather type="user" class="h-full cursor-pointer text-[#EDF4ED]"></vue-feather>
    </div>

    <div v-if="isDropdownVisible" class="z-20 absolute p-5 left-0 rounded-md drop-shadow-md text-xl gap-2 flex items-center justify-center">
        <div class="flex flex-col items-start justify-start bg-white  translate-y-20 rounded-md px-5 pb-5 pt-2">
            <button @click="toggleProfile" class="">
                <vue-feather type="chevron-up" class=""></vue-feather>
            </button>
            <p class="">Welcome, {{ userDisplay }}</p>
            <p class="text-sm  cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-all" @click="copyToClipboard(user.uid)" ref="userIdText">
                User ID <span class="font-semibold text-gray-800 hover:text-blue-500">{{ user.uid }}</span>
            </p>
            <transition name="fade" class="self-center">
                <p v-if="copySuccess" class="text-green-500 text-xs">Copied!</p>
            </transition>
            <div class="h-full flex items-center text-xl font-bold pt-2" v-if="$route.name !== 'auth'">
                <router-link :to="{ name: 'auth' }" @click.native="toggleProfile">
                    <button type="button" class="cursor-pointer text-white bg-blue-500 rounded-md px-4 py-2">Create new account</button>
                </router-link>
            </div>

        </div>
    </div>
    <div class="relative flex justify-end" v-if="$route.name !== 'auth' && user">
        <vue-feather type="bell" class="text-white cursor-pointer " @click="toggleNotification"></vue-feather>
        <div v-if="isNotifDropdownVisible" class="z-20 absolute pt-2 px-5 pb-5 rounded-md drop-shadow-md text-xl gap-2 flex flex-col items-end justify-end bg-white w-fit translate-y-6">
            <button @click="toggleNotification" class="">
                <vue-feather type="chevron-up" class=""></vue-feather>
            </button>
            <invites-container></invites-container>

        </div>
    </div>
    <!-- Conditional rendering for login/signup button -->
    <div class="h-full flex items-center text-xl font-bold" v-if="$route.name !== 'auth' && !user">
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
import InvitesContainer from "./InvitesContainer.vue";

export default {
    components: {
        VueFeather,
        InvitesContainer
    },
    data() {
        return {
            user: null,
            userDisplay: '',
            isDropdownVisible: false,
            copySuccess: false,
            isNotifDropdownVisible: false
        };
    },
    methods: {
        toggleProfile() {
            this.isDropdownVisible = !this.isDropdownVisible;
        },
        toggleNotification() {
            this.isNotifDropdownVisible = !this.isNotifDropdownVisible;
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.copySuccess = true;
                setTimeout(() => {
                    this.copySuccess = false;
                }, 2000); // Message disappears after 2 seconds
            }, (err) => {
                console.error('Failed to copy: ', err);
            });
        },
        reloadPage() {
            window.location.reload();
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
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
    {
    opacity: 0;
}
</style>
