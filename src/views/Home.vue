<template>
  <div class="home">
    <h1 class="cyber-title">AUSTDebate</h1>
    <div class="content cyber-grid">
      <el-row :gutter="20">
        <!-- 修改最新赛事卡片 -->
        <el-col :span="12">
          <el-card class="cyber-card latest-event-box" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
            <!-- 新增盒子结构 -->
            <div class="box">
              <div ref="vantaRef" style="width: 100%; height: 300px"></div>
              <div class="banner">
                <h1>最新赛事</h1>
                <h6>
                  2025年安徽理工大学"校庆杯"辩论赛校赛
                </h6>
                <p>活动时间：待定</p>
                <p>组织单位：待定</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- 修改参与投票卡片开始 -->
        <el-col :span="12">
          <el-card class="cyber-card vote-box" @mouseenter="voteHovered = true" @mouseleave="voteHovered = false">
            <div class="box">
              <div ref="voteVantaRef" style="width: 100%; height: 300px"></div>
              <div class="banner">
                <h1>参与人气奖投票</h1>
                <p>为你支持的队伍投上一票人气票吧！</p>
                <router-link to="/vote" class="cyber-link">立即前往</router-link>
                <!-- <router-link to="/vote" class="cyber-link>立即前往</router-link> -->
                <!-- <h6>
                  &ensp;&ensp;SHUI&ensp;&ensp;&ensp;XIANG&ensp;&ensp;&ensp;&ensp;MU&ensp;&ensp;&ensp;&ensp;&ensp;YU
                </h6> -->
                <!-- <p>活动时间：待定</p>
                <p>组织单位：待定</p> -->
              </div>
            </div>
          </el-card>
        </el-col>
        <!-- 修改参与投票卡片结束 -->
        <!-- 其他卡片保持不变 -->
        <el-col :span="12">
          <el-card class="cyber-card">
            <h3>辩论计时器</h3>
            <p>尚未投入开发流中的幼年计时器...</p>
            <router-link to="/timer" class="cyber-link">立即使用</router-link>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 留言轮播区域 -->
    <div class="message-carousel">
      <h2 class="cyber-title">实时留言</h2>
      <div class="carousel-container">
        <transition-group 
          name="float-message" 
          tag="div" 
          class="message-list"
        >
          <div 
            v-for="message in visibleMessages" 
            :key="message.id" 
            class="message-item floating"
            :style="{
              '--float-delay': `${message.delay}s`,
              '--item-width': `${Math.max(200, message.content.length * 10)}px`
            }"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-info">
              <span class="username">{{ message.nickname }}</span>
              <span class="time">{{ formatTime(message.time) }}</span>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { messageApi } from '../api'  // 修正导入

const allMessages = ref([])
const visibleMessages = ref([])
const currentIndex = ref(0)
let carouselTimer = null

// Add new reactive state
const isHovered = ref(false)

// 新增 vanta 相关引用
import * as THREE from 'three'
import NET from 'vanta/src/vanta.net'
import BIRDS from 'vanta/src/vanta.birds'
const vantaRef = ref(null)
let vantaEffect = null

// 新增参与投票特效状态与引用
const voteHovered = ref(false)
const voteVantaRef = ref(null)
let voteVantaEffect = null

const loadMessages = async () => {
  const messages = await messageApi.getApprovedMessages()
  allMessages.value = messages
  if (messages.length > 0) {
    updateVisibleMessages()
  }
}

const updateVisibleMessages = () => {
  if (allMessages.value.length === 0) return
  
  visibleMessages.value = allMessages.value
    .slice(currentIndex.value, currentIndex.value + 3)
    .map((msg, index) => ({
      ...msg,
      delay: index * 2,
      entering: true
    }))

  currentIndex.value = (currentIndex.value + 1) % allMessages.value.length
}

const startCarousel = () => {
  carouselTimer = setInterval(() => {
    updateVisibleMessages()
  }, 5000)
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(() => {
  loadMessages()
  startCarousel()
  if (vantaRef.value) {
    vantaEffect = NET({
      el: vantaRef.value,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0xc7d1e8,
      backgroundColor: 0x400bb1,
      points: 13.0,
      maxDistance: 21.0,
      spacing: 16.0,
    })
  }
  if (voteVantaRef.value) {
    voteVantaEffect = BIRDS({
      el: voteVantaRef.value,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      color1: 14381274,
      color2: 16443110,
    })
  }
})

onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer)
  if (vantaEffect) {
    vantaEffect.destroy()
  }
  if (voteVantaEffect) {
    voteVantaEffect.destroy()
  }
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --neon-primary: #0ff;
  --neon-secondary: #f0f;
  --cyber-bg: rgba(16, 24, 39, 0.8);
  --cyber-border: rgba(0, 255, 255, 0.2);
}

.home {
  color: #fff;
  padding: 20px;
  background: linear-gradient(180deg, var(--cyber-bg), rgba(16, 24, 39, 0.95));
}

.cyber-title {
  font-family: 'Orbitron', sans-serif;
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
  text-align: center;
  margin-bottom: 40px;
}

.cyber-card {
  background: rgba(16, 24, 39, 0.8);
  border: 1px solid #0ff;
  color: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  will-change: transform;
  position: relative;
  overflow: hidden;
}

.card-inner {
  position: relative;
  z-index: 1;
}

.hologram-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(0, 255, 255, 0.05) 50%,
    transparent 100%
  );
  pointer-events: none;
  transform: translateX(-100%);
  animation: hologram-slide 3s linear infinite;
}

@keyframes hologram-slide {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(100%) }
}

.glitch-effect {
  animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

.cyber-card h3 {
  color: #0ff;
  margin-bottom: 15px;
}

.cyber-link {
  color: #0ff;
  text-decoration: none;
  border: 1px solid #0ff;
  padding: 5px 15px;
  display: inline-block;
  margin-top: 10px;
  transition: all 0.3s;
}

.cyber-link:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px #0ff;
}

.message-carousel {
  position: relative;
  height: 200px;
  overflow: hidden;
  margin: 40px 0;
}

.message-list {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.message-item {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
  width: var(--item-width);
  min-width: 200px;
  max-width: 400px;
  animation: float-horizontal 15s linear forwards;
  animation-delay: var(--float-delay);
}

@keyframes float-horizontal {
  0% {
    opacity: 0;
    transform: translateX(100vw);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-100vw);
  }
}

.message-content {
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 8px;
  word-break: break-word;
}

.message-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

/* Remove old float-up animation */
.floating {
  animation: float-horizontal 15s linear forwards;
  animation-delay: var(--float-delay);
}

/* Update responsive styles */
@media (max-width: 768px) {
  .message-carousel {
    height: 150px;
  }
  
  .message-item {
    max-width: 80vw;
  }
}

/* 新增样式 */
.latest-event-box .box {
  position: relative;
  width: 100%;
  height: 100%; /* 使用整个卡片高度 */
  overflow: hidden; /* 隐藏超出部分 */
}

.latest-event-box div[ref="vantaRef"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.latest-event-box .banner {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  z-index: 999;
  color: #fff;
  width: 80%;
  word-wrap: break-word;
}

.latest-event-box .banner h1 {
  font-size: 48px;  /* 根据实际尺寸适量调整 */
  margin: 0;
}

.latest-event-box .banner h6 {
  font-size: 20px;
  margin: 10px 0;
}

.latest-event-box .banner p {
  font-size: 16px;
  margin: 5px 0;
}

/* 新增参与投票盒子样式 */
.vote-box .box {
  position: relative;
}
/* 新增参与投票盒子样式修改 */
.vote-box .banner {
  z-index: 999;
  position: absolute;
  top: 25%; /* remains the same */
  left: 10%;
  color: #fff;
  /* Shift the entire content upward by additional 10px */
  transform: translateY(calc(-20% - 5px));
}
.vote-box p {
  margin-top: 10px;  /* reduced from 60px */
  margin-bottom: 0;  /* remove extra margin */
  font-size: 18px;
}
.vote-box h1 {
  font-size: 48px;
}
.vote-box p {
  margin-top: 60px;
  font-size: 18px;
}
</style>
