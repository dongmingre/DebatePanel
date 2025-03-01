import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000'; 

const app = createApp(App);
app.use(ElementPlus);
app.use(router);

// 如果本地存储有登录令牌，则在全局 Axios 请求头中加入 Authorization
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

app.mount('#app');
