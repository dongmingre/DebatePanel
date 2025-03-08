import { createRouter, createWebHistory } from 'vue-router';
import Schedule from '../views/Schedule.vue';
import Vote from '../views/Vote.vue';
import Login from '../views/Login.vue';
import Admin from '../views/Admin.vue';
import MessageBoard from '../views/MessageBoard.vue';
import Home from '../views/Home.vue';  // 直接导入
import NotFound from '../views/NotFound.vue';

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },  // 修改为直接使用组件
  { path: '/schedule', component: Schedule },
  { path: '/vote', component: Vote },
  { path: '/login', component: Login },
  { path: '/admin', component: Admin },
  { path: '/message', component: MessageBoard },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  {
    path: '/timer',
    name: 'Timer',
    component: () => import('../views/Timer.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin-token')
  if (to.path === '/admin' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router;
