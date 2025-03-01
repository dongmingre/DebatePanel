import { createRouter, createWebHistory } from 'vue-router';
import Schedule from '../views/Schedule.vue';
import Vote from '../views/Vote.vue';
import Login from '../views/Login.vue';

const routes = [
  { path: '/', redirect: '/schedule' },
  { path: '/schedule', component: Schedule },    // 赛程页面
  { path: '/vote', component: Vote },            // 投票页面
  { path: '/login', component: Login }           // 管理员登录页面
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
