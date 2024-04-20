import router from "./router/index.js";
import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
import MessagingCreators from "./components/MessagingCreators.vue";
import InvitesContainer from "./components/InvitesContainer.vue";
import ConversationsContainer from "./components/ConversationsContainer.vue";
import ChatContainer from "./components/ChatContainer.vue";
import MessageSender from "./components/MessageSender.vue";
import Message from "./components/Message.vue";


const appVue = createApp(App);

appVue.component("register", Register);
appVue.component("login", Login);
appVue.component("messaging-creators", MessagingCreators);
appVue.component("invites-container", InvitesContainer);
appVue.component("conversations-container", ConversationsContainer);
appVue.component("chat-container", ChatContainer);
appVue.component("message-sender", MessageSender);
appVue.component("message", Message);

appVue.use(router);
appVue.mount("#app");
