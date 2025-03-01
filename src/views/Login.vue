<template>
    <div style="max-width:300px; margin:50px auto;">
      <h3>管理员登录</h3>
      <el-form @submit.prevent="login">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { defineComponent, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    setup() {
      const router = useRouter();
      const username = ref('');
      const password = ref('');
      
      const login = () => {
        if (!username.value || !password.value) {
          ElMessage.warning('请输入用户名和密码');
          return;
        }
        axios.post('/api/admin/login', { username: username.value, password: password.value })
          .then(res => {
            ElMessage.success('登录成功');
            const token = res.data.token;
            // 保存令牌并设置 Axios 请求头
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            // 跳转到赛程页面
            router.push('/schedule');
          })
          .catch(err => {
            ElMessage.error(err.response?.data?.error || '登录失败');
          });
      };
      
      return { username, password, login };
    }
  });
  </script>
  