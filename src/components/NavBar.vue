<template>
  <nav class="nav-bar">
    <router-link to="/home">首页</router-link>
    <router-link to="/schedule">赛程</router-link>
    <router-link to="/vote">投票</router-link>
    <router-link to="/message">留言板</router-link>
    <router-link to="/profile">个人中心</router-link>
    <router-link to="/login">登录</router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.nav-bar {
  padding: 1rem;
  background-color: #f8f9fa;
}

.nav-bar a {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
}

.nav-bar a.router-link-active {
  color: #007bff;
}
</style>
