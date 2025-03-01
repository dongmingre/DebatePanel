import { createRouter, createWebHistory } from 'vue-router';
import Schedule from '../views/Schedule.vue';
import Vote from '../views/Vote.vue';
import Login from '../views/Login.vue';

const routes = [
  { path: '/', redirect: '/schedule' },
  { path: '/schedule', component: Schedule },
  { path: '/vote', component: Vote },
  { path: '/login', component: Login }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
