import router from "./router/index.js";
import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import SessionButton from "./components/SessionButton.vue";
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
const appVue = createApp(App);

appVue.component("session-button", SessionButton);
appVue.component("register", Register);
appVue.component("login", Login);

appVue.use(router);
appVue.mount("#app");
