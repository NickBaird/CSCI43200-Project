import router from './router/index.js';

import { createApp } from 'vue';
import App from './App.vue';
import MainButton from './components/MainButton.vue';

const app = createApp(App);

app.component('main-button', MainButton);

app.use(router);
app.mount('#app');