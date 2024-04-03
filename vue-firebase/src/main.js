import router from './router/index.js';

import { createApp } from 'vue';
import App from './App.vue';
import SessionButton from './components/SessionButton.vue';
import RegisterLogin from './components/RegisterLogin.vue';

const appVue = createApp(App);

appVue.component('session-button', SessionButton);
appVue.component('register-login', RegisterLogin);

appVue.use(router);
appVue.mount('#app');