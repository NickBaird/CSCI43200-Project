<template>
	<div class="h-screen flex items-center mx-auto max-w-screen-sm">
		<div
			class="bg-[#51291E] w-full p-10 grid grid-cols-1 grid-rows-4 text-[#EDF4ED] gap-8 rounded-lg"
		>
			<div>
				<h1 class="justify-self-center text-3xl font-semibold">
					Sign Up
				</h1>
				<h2 class="justify-self-center text-lg font-extralight">
					Create a free account with your email.
				</h2>
			</div>

			<input
				type="text"
				id="register-name"
				v-model="registerName"
				placeholder="Display Name"
				class="text-gray-600 px-4 py-2 border-2 border-gray-200 rounded-md "
			/>

			<input
				type="text"
				id="register-email"
				v-model="registerEmail"
				:class="{'border-red-500': emailInUse}" 
				class="text-gray-600 px-4 py-2 border-2 border-gray-200 rounded-md "
				placeholder="Email"
			/>
			<p v-if="emailInUse" class="text-red-500">Email in use</p>
			<input
				type="password"
				id="register-password"
				v-model="registerPassword"
				placeholder="Password"
				class="text-gray-600 px-4 py-2 border-2 border-gray-200 rounded-md "
			/>

			<button
				@click="RegisterVue()"
				class="bg-blue-500 hover:bg-blue-700 transition-colors w-fit text-xl justify-self-center px-10 rounded-md py-2"
			>
				Create your account
			</button>

			<div
				class="justify-self-center border-t-2 border-gray-300 w-full border-opacity-40 flex items-center justify-center pt-4 gap-2"
			>
				<p class="text-lg font-extralight">Already have an account?</p>

				<button
					class="text-lg font-extralight text-blue-500"
					@click="$emit('switch')"
				>
					Login
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	import { register2 } from '../../js.js';

	export default {
	    data() {
	        return {
	            registerName: '',
	            registerEmail: '',
	            registerPassword: '',
				emailInUse: false
	        }
	    },
	    props: {},
	    methods: {
	        RegisterVue() {
	            register2(this.registerEmail, this.registerPassword, this.registerName)
	                .then((message) => {
	                    // If the registration is successful, you can redirect or show a success message
	                    console.log(message); // "Registration and key storage successful"
	                    this.$router.push({ name: 'home' }); // Redirect to home page
	                })
	                .catch((error) => {
	                    // If there's an error, you can handle it here (e.g., show an error message)
						this.emailInUse=true;
	                    console.error(error); // Log or display the error message to the user
	                });
	        }
	    }
	}
</script>

<style scoped></style>
