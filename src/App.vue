<template>
  <el-container style="min-height: 100vh;">
    <!-- 顶部导航栏 -->
    <el-header>
      <el-row type="flex" justify="space-between" align="middle">
        <h2>辩论赛管理系统</h2>
        <div>
          <router-link to="/schedule" style="margin-right:15px;">赛程</router-link>
          <router-link to="/vote" style="margin-right:15px;">投票</router-link>
          <template v-if="!isAdmin">
            <router-link to="/login">管理员登录</router-link>
          </template>
          <template v-else>
            管理员 
            <el-button type="warning" size="small" @click="logout">退出</el-button>
          </template>
        </div>
      </el-row>
    </el-header>
    <!-- 主内容区域 -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import { computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    // 通过是否存在 token 判断当前是否为管理员登录状态
    const isAdmin = computed(() => !!window.localStorage.getItem('token'));
    const logout = () => {
      // 清除登录令牌并取消全局请求头
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      // 跳转回登录页面（或刷新页面）
      router.push('/login');
    };
    return { isAdmin, logout };
  }
}
</script>
