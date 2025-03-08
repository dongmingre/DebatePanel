<template>
  <div class="timer-container">
    <!-- Loading component -->
    <el-loading v-if="phases.length === 0" class="loading-overlay">
      <template #default>
        <el-progress type="circle" :percentage="70" />
        <div class="loading-text">正在加载辩论环节配置...</div>
      </template>
    </el-loading>

    <template v-else>
      <el-row class="top-info" :gutter="20">
        <el-col :span="24">
          <el-card class="debate-info-card" shadow="hover">
            <div class="debate-info">
              <el-avatar size="large" class="school-logo">
                <img src="D:/desktop/辩论赛/vue-debate/src/images/school-logo.jpg" />
              </el-avatar>
              <el-divider direction="vertical" />
              <div class="title-section">
                <el-text class="debate-title" type="primary">{{ debateInfo.title }}</el-text>
                <el-row class="teams-info">
                  <el-col :span="12">
                    <el-tag type="danger">正方</el-tag>
                    <el-text class="team-name">{{ debateInfo.affirmativeTeam }}</el-text>
                  </el-col>
                  <el-col :span="12">
                    <el-tag type="info">反方</el-tag>
                    <el-text class="team-name">{{ debateInfo.negativeTeam }}</el-text>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 主计时器面板 -->
      <el-card class="main-timer-panel" shadow="never">
        <div class="time-display">
          <div :class="['timer-number', { 'warning': currentTime <= 30 }]">
            {{ formatTime(currentTime) }}
          </div>
          <el-progress 
            :percentage="progressPercentage"
            :color="['#00f7ff', '#ff00e5']"
            :stroke-width="8"
            :show-text="false"
          />
        </div>

        <el-divider>
          <el-tag type="primary">{{ currentPhase.name }}</el-tag>
          <el-text class="total-time">总时长: {{ formatTime(currentPhase.duration) }}</el-text>
        </el-divider>

        <!-- 控制面板 -->
        <div class="control-panel">
          <el-button 
            class="control-btn"
            :type="isRunning ? 'danger' : 'primary'" 
            @click="toggleTimer"
            size="large"
          >
            <el-icon>
              <component :is="isRunning ? 'VideoPause' : 'VideoPlay'" />
            </el-icon>
            {{ isRunning ? '暂停' : '开始' }}
          </el-button>
          
          <el-button-group>
            <el-button @click="resetTimer" type="default" size="large">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button @click="nextPhase" type="info" size="large">
              <el-icon><ArrowRight /></el-icon>
              下一环节
            </el-button>
          </el-button-group>
        </div>
      </el-card>

      <!-- 环节导航 -->
      <el-row :gutter="20" class="phase-navigator">
        <el-col :span="8" v-for="(phase, index) in phases" :key="index">
          <el-card 
            class="phase-item"
            :class="{ 'active-phase': currentPhaseIndex === index }"
            @click="jumpToPhase(index)"
          >
            <el-tag v-if="currentPhaseIndex === index" type="primary">当前</el-tag>
            <div class="phase-name">{{ phase.name }}</div>
            <el-text class="phase-duration">{{ formatTime(phase.duration) }}</el-text>
          </el-card>
        </el-col>
      </el-row>

      <!-- 校庆标志 -->
      <div class="anniversary-badge">
        <el-alert
          title="◆ 安徽理工大学建校80周年 ◆"
          type="info"
          :closable="false"
          center
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  ElRow, ElCol, ElCard, ElDivider, ElAvatar,
  ElLoading, ElProgress, ElTag, ElText,
  ElButton, ElButtonGroup, ElIcon, ElAlert
} from 'element-plus'
import {
  VideoPlay,
  VideoPause,
  RefreshRight as Refresh,
  ArrowRightBold as ArrowRight
} from '@element-plus/icons-vue'

// 辩论赛信息
const debateInfo = {
  title: "人工智能是否会取代人类创造力",
  affirmativeTeam: "计算机学院宏辞辩论队",
  negativeTeam: "计算机学院辞宏辩论队"
}

const phases = ref([
  { name: '正方一辩陈词', duration: 180 },
  { name: '反方一辩陈词', duration: 180 },
  { name: '正方二辩质询反方一辩', duration: 120 },
  { name: '反方二辩质询正方一辩', duration: 120 },
  { name: '正方三辩陈词', duration: 180 },
  { name: '反方三辩陈词', duration: 180 },
  { name: '自由辩论', duration: 300 },
  { name: '反方四辩总结', duration: 180 },
  { name: '正方四辩总结', duration: 180 },
])

const currentPhaseIndex = ref(0)
const currentTime = ref(0)
const isRunning = ref(false)
let timerInterval = null

const currentPhase = computed(() => {
  return phases.value[currentPhaseIndex.value] || { name: '环节加载中...', duration: 0 }
})

const progressPercentage = computed(() => {
  const duration = currentPhase.value.duration || 1
  return ((duration - currentTime.value) / duration) * 100
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (phases.value.length > 0) {
    currentTime.value = phases.value[0].duration
  }
})
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval)
  } else {
    timerInterval = setInterval(() => {
      if (currentTime.value > 0) {
        currentTime.value--
      } else {
        clearInterval(timerInterval)
        isRunning.value = false
      }
    }, 1000)
  }
  isRunning.value = !isRunning.value
}

const resetTimer = () => {
  clearInterval(timerInterval)
  isRunning.value = false
  currentTime.value = currentPhase.value.duration || 0
}

const nextPhase = () => {
  clearInterval(timerInterval)
  isRunning.value = false
  if (phases.value.length > 0) {
    currentPhaseIndex.value = (currentPhaseIndex.value + 1) % phases.value.length
    currentTime.value = phases.value[currentPhaseIndex.value]?.duration || 0
  }
}

const jumpToPhase = (index) => {
  if (index >= 0 && index < phases.value.length) {
    clearInterval(timerInterval)
    isRunning.value = false
    currentPhaseIndex.value = index
    currentTime.value = phases.value[index].duration
  }
}
</script>

<style lang="scss">
/* 优化后的样式 */
.timer-container {
  padding: 20px;
  background: linear-gradient(135deg, #000428 0%, #004e92 100%);
  min-height: 100vh;
  color: var(--text-primary);

  .loading-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    .loading-text {
      color: #00f7ff;
      margin-top: 10px;
    }
  }

  .debate-info-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(0, 247, 255, 0.3);
    .debate-info {
      display: flex;
      align-items: center;
      padding: 15px;
      .school-logo {
        border: 2px solid #00f7ff;
        border-radius: 50%;
        padding: 5px;
      }
      .title-section {
        margin-left: 20px;
        .debate-title {
          font-size: 24px;
          margin-bottom: 15px;
          background: linear-gradient(45deg, #00f7ff, #ff00e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .team-name {
          color: #fff;
          margin-left: 10px;
        }
      }
    }
  }

  .main-timer-panel {
    margin: 20px 0;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(0, 247, 255, 0.3);
    .timer-number {
      font-size: 72px;
      color: #00f7ff;
      text-align: center;
      text-shadow: 0 0 10px rgba(0,247,255,0.5);
      &.warning {
        color: #ff0066;
      }
    }
    .el-progress {
      margin: 20px 0;
    }
  }

  .control-panel {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    .control-btn {
      width: 120px;
      background: linear-gradient(45deg, #00f7ff, #ff00e5);
      border: none;
    }
  }

  .phase-navigator {
    margin: 20px 0;
    .phase-item {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(0, 247, 255, 0.3);
      margin: 5px;
      padding: 15px;
      transition: all 0.3s;
      &.active-phase {
        border-color: #ff00e5;
        background: rgba(255,0,229,0.1);
      }
      .phase-name {
        color: #fff;
        margin: 5px 0;
      }
      .phase-duration {
        color: #00f7ff;
      }
    }
  }

  .anniversary-badge {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    border-top: 1px solid #00f7ff;
  }
}
</style>
