import {createRouter, createWebHistory} from 'vue-router';
import SessionsView from '../views/SessionsView.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: SessionsView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;