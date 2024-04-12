import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Auth from "../views/Auth.vue";
const routes = [
	{
		path: "/login",
		name: "auth",
		component: Auth,
	},
	{
		path: "/",
		name: "home",
		component: Home,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
