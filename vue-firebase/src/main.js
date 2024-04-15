import router from "./router/index.js";
import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import SessionButton from "./components/SessionButton.vue";
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
import MessagingCreators from "./components/MessagingCreators.vue";
import InvitesContainer from "./components/InvitesContainer.vue";
import ConversationsContainer from "./components/ConversationsContainer.vue";

const appVue = createApp(App);

appVue.component("session-button", SessionButton);
appVue.component("register", Register);
appVue.component("login", Login);
appVue.component("messaging-creators", MessagingCreators);
appVue.component("invites-container", InvitesContainer);
appVue.component("conversations-container", ConversationsContainer);

appVue.use(router);
appVue.mount("#app");
