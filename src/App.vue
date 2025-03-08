<template>
  <el-container style="min-height: 100vh;">
    <el-header class="cyber-header">
      <el-row type="flex" justify="space-between" align="middle" class="header-content">
        <h2 class="neon-title">
          <span class="flicker">2025</span>
          安徽理工大学
          <span class="glitch" data-text="&quot;校庆杯&quot;">&quot;校庆杯&quot;</span>
          校辩论赛<span class="cyberpunk">OnlinePanel</span>
        </h2>
        <div class="nav-links">
          <router-link to="/home">首页</router-link>
          <router-link to="/schedule">赛程</router-link>
          <router-link to="/vote" class="hologram-btn">投票</router-link>
          <router-link to="/message">留言板</router-link>
          <template v-if="!isAdmin">
            <router-link to="/login" class="admin-portal">
              <span class="scanline"></span>
              管理员入口
            </router-link>
          </template>
          <template v-else>
            <div class="admin-panel">
              <span class="cyber-admin">ADMIN#ROOT</span>
              <el-button type="danger" size="small" class="cyber-logout" @click="logout">
                <span class="pulse"></span>
                安全登出
              </el-button>
            </div>
          </template>
        </div>
      </el-row>
      <div class="header-grid"></div>
    </el-header>
    <el-main class="cyber-main">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAdmin = ref(false)

const login = () => {
  isAdmin.value = true
  router.push('/admin')
}

const logout = () => {
  isAdmin.value = false
  router.push('/home')
}
</script>

<style scoped>
.cyber-header {
  background: linear-gradient(
    135deg,
    rgba(16, 24, 39, 0.98) 0%,
    rgba(9, 14, 26, 0.98) 100%
  );
  border-bottom: 2px solid #0ff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 0 50px;
}

.neon-title {
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  text-shadow: 0 0 10px #0ff;
  letter-spacing: 2px;
  position: relative;
}

.glitch::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 2px 0 #0ff;
  clip: rect(0, 900px, 0, 0);
  animation: glitch 3s infinite linear alternate-reverse;
}

@keyframes glitch {
  2% { clip: rect(65px, 9999px, 76px, 0) }
  4% { clip: rect(33px, 9999px, 44px, 0) }
  5% { clip: rect(45px, 9999px, 66px, 0) }
  6% { clip: rect(2px, 9999px, 80px, 0) }
  7% { clip: rect(25px, 9999px, 30px, 0) }
  8% { clip: rect(5px, 9999px, 20px, 0) }
}

.hologram-btn {
  position: relative;
  color: #0ff!important;
  margin: 0 20px;
  padding: 12px 25px;
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 4px;
  background: rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
  text-decoration: none!important;
}

.hologram-btn::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(0, 255, 255, 0.2);
  z-index: -1;
  transform: translate(4px, 4px);
}

.hologram-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 15px #0ff;
  transform: translateY(-2px);
}

.admin-portal {
  position: relative;
  padding: 12px 25px;
  background: linear-gradient(45deg, #ff003c, #ff0062);
  border: 1px solid #ff003c;
  color: #fff!important;
  clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
  transition: all 0.3s ease;
}

.scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    0deg,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-100%) }
  100% { transform: translateY(100%) }
}

.cyber-logout {
  background: transparent!important;
  border: 1px solid #ff003c!important;
  color: #ff003c!important;
  position: relative;
  transition: all 0.3s ease;
}

.cyber-logout:hover {
  background: rgba(255, 0, 60, 0.1)!important;
  box-shadow: 0 0 15px #ff003c;
}

.header-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 1;
}

.cyber-main {
  background: radial-gradient(
    ellipse at center,
    rgba(16, 24, 39, 0.9) 0%,
    rgba(9, 14, 26, 0.9) 100%
  )!important;
  min-height: calc(100vh - 60px);  /* 添加最小高度 */
  color: #fff;  /* 添加文字颜色 */
  padding: 20px;  /* 添加内边距 */
}

/* 添加原NavBar的样式 */
.nav-links {
  display: flex;  /* 添加flex布局 */
  align-items: center;  /* 垂直居中 */
  gap: 20px;  /* 添加间距 */
}

.nav-links a {
  margin-right: 1rem;
  text-decoration: none;
  color: #fff;
  transition: all 0.3s ease;  /* 修改过渡效果 */
  padding: 8px 15px;  /* 添加内边距 */
}

.nav-links a.router-link-active {
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
}

.nav-links a:hover {
  color: #0ff;
}
</style>