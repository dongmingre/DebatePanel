<template>
  <div class="cyber-tournament">
    <h1 class="neon-title">2025年安徽理工大学&quot;校庆杯&quot;校辩论赛OnlinePanel</h1>
    
    <div class="bracket-wrapper">
      <div class="bracket-grid">
        <!-- 轮次列 -->
        <div 
          v-for="(round, roundIndex) in processedRounds"
          :key="round.round"
          class="round-column"
          :style="columnStyle(roundIndex)"
        >
          <div class="round-header">
            <div class="round-title">第{{ chineseNumbers[round.round] }}轮</div>
            <div class="round-status">{{ getRoundStatus(round) }}</div>
          </div>

          <!-- 比赛节点 -->
          <div
            v-for="(match, matchIndex) in round.matches"
            :key="match.id"
            class="match-node"
            :id="'match-' + match.id"
            :style="nodeStyle(roundIndex, matchIndex, round.matches.length)"
          >
            <el-popover
              :visible="hoveredMatch === match.id"
              placement="right"
              trigger="hover"
              :show-after="100"
            >
              <template #default>
                <div class="match-detail">
                  <h4>{{ formatRoundName(match.round) }} - 第{{ match.order_num }}场</h4>
                  <p class="topic">{{ match.topic }}</p>
                  <p class="time">时间：{{ formatTime(match.start_time) }}</p>
                  <p class="location">地点：{{ match.location }}</p>
                </div>
              </template>
              <template #reference>
                <div 
                  class="cyber-card"
                  @mouseenter="hoveredMatch = match.id"
                  @mouseleave="hoveredMatch = null"
                >
                  <div class="card-glows"></div>
                  
                  <div class="card-body">
                    <div class="debate-topic">
                      <span class="hologram-icon">🗲</span>
                      {{ match.topic }}
                    </div>

                    <!-- 队伍对战信息 -->
                    <div class="versus-container">
                      <div class="team-display" :class="{ 'victory': isWinner(match, 1) }">
                        <div class="team-name">{{ getTeam(match.team1_id) }}</div>
                        <div class="team-score">{{ match.scores?.[0] || '—' }}</div>
                      </div>
                      
                      <div class="vs-core">
                        <div class="vs-bar"></div>
                        <div class="vs-text">VS</div>
                        <div class="vs-bar"></div>
                      </div>

                      <div class="team-display" :class="{ 'victory': isWinner(match, 2) }">
                        <div class="team-name">{{ getTeam(match.team2_id) }}</div>
                        <div class="team-score">{{ match.scores?.[1] || '—' }}</div>
                      </div>
                    </div>

                    <!-- 比赛元信息 -->
                    <div class="match-meta">
                      <div class="meta-item">
                        <span class="icon">⌛</span>
                        <!-- {{ formatTime(match.start) }} -->
                          {{ match.start || '2025年'}}
                      </div>
                      <div class="meta-item">
                        <span class="icon">📍</span>
                        {{ match.venue || 'AUST' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-popover>

            <!-- 连接线锚点 -->
            <div class="line-anchor prev" v-if="roundIndex > 0"></div>
            <div class="line-anchor next" v-if="roundIndex < totalRounds - 1"></div>
          </div>
        </div>
      </div>

      <!-- 动态连接线 -->
      <svg class="connection-canvas">
        <path 
          v-for="(path, index) in connectionPaths" 
          :key="index"
          :d="path"
          class="cyber-path"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, nextTick, onUnmounted } from 'vue'
import { matchesApi } from '../api'
import axios from 'axios'

const matches = ref([])
const loading = ref(false)
const hoveredMatch = ref(null)
const processedRounds = ref([])  // 添加这个响应式变量
const connectionPaths = ref([])
const containerWidth = ref(1200)
// 修改基础间距为更小的值
const baseSpacing = 80  // 从 200 改为 120
const teams = ref([])

// 配置参数
const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八']
const totalRounds = computed(() => {
  const maxRound = Math.max(...(processedRounds.value?.map(r => r.round) || [0]))
  return maxRound || 0
})

const fetchMatches = async () => {
  loading.value = true
  try {
    const res = await matchesApi.getAllMatches()
    matches.value = res.data.data // 修正数据结构访问
    processedRounds.value = processMatches(matches.value) // 初始处理数据
  } catch (error) {
    console.error('加载赛程失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchTeams = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/teams')
    teams.value = data
  } catch (error) {
    console.error('获取队伍列表失败:', error)
  }
}

const processMatches = (matchesData) => {
  if (!Array.isArray(matchesData)) return []
  
  const rounds = {}
  matchesData.forEach(match => {
    const round = match.round || 1
    if (!rounds[round]) rounds[round] = []
    rounds[round].push({
      ...match,
      id: match.id,
      round: match.round,
      order_num: match.order_num,
      team1: match.team1_name || '待定',
      team2: match.team2_name || '待定',
      start: match.start_time,
      venue: match.location,
      topic: match.topic || '待定'
    })
  })

  return Object.entries(rounds)
    .map(([round, matches]) => ({
      round: parseInt(round),
      matches: matches.sort((a, b) => (a.order_num || 0) - (b.order_num || 0))
    }))
    .sort((a, b) => a.round - b.round)
}

// 修改列布局样式计算
const columnStyle = (index) => {
  const totalWidth = Math.min(1000, containerWidth.value)  // 限制最大宽度
  const offset = (totalWidth - baseSpacing) / (totalRounds.value - 1) * index
  return {
    left: `${baseSpacing / 2 + offset}px`,
    width: `${baseSpacing}px`,
    // 添加最小宽度确保内容不会太挤
    minWidth: '100px'
  }
}

// 节点定位
const nodeStyle = (roundIndex, matchIndex, total) => {
  const baseGap = 100 / (total + 1)
  const adjustedGap = baseGap * 2.2
  return {
    top: `${adjustedGap * (matchIndex + 1)}%`,
    height: `${baseGap}%`
  }
}

// 添加获取比赛状态的方法
const getRoundStatus = (round) => {
  const total = totalRounds.value
  return `晋级进度 ${Math.round((round.round / total) * 100)}%`
}

// 添加格式化时间的方法
const formatTime = (time) => {
  if (!time) return '待定'
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 判断胜者
const isWinner = (match, teamNum) => {
  if (!match.winner_id) return false
  return match.winner_id === (teamNum === 1 ? match.team1_id : match.team2_id)
}

// 添加获取队伍函数
const getTeam = (teamId) => {
  const team = teams.value.find(t => t.id === teamId)
  return team ? team.name : `队伍${teamId}`
}

// 添加格式化轮次名称的函数
const formatRoundName = (round) => {
  const names = ['初赛', '淘汰赛', '半决赛', '决赛']
  return names[round - 1] || `第${round}轮`
}

// 生成连接线
const generateConnections = async () => {
  if (!processedRounds.value?.length) return
  
  await nextTick()
  const paths = []
  
  processedRounds.value.forEach((round, roundIndex) => {
    if (roundIndex === 0) return
    
    round.matches.forEach((match, matchIndex) => {
      const prevRound = processedRounds.value[roundIndex - 1]?.matches
      if (!prevRound) return
      
      const sourceIndex = matchIndex * 2
      const sources = [prevRound[sourceIndex], prevRound[sourceIndex + 1]]
      
      sources.forEach(sourceMatch => {
        if (!sourceMatch || !match) return
        
        const sourceEl = document.getElementById(`match-${sourceMatch.id}`)
        const targetEl = document.getElementById(`match-${match.id}`)
        if (!sourceEl || !targetEl) return
        
        const sourceRect = sourceEl.getBoundingClientRect()
        const targetRect = targetEl.getBoundingClientRect()
        const containerRect = document.querySelector('.bracket-grid').getBoundingClientRect()
        
        const path = `
          M ${sourceRect.right - containerRect.left} ${sourceRect.top + sourceRect.height / 2}
          C ${sourceRect.right - containerRect.left + 50} ${sourceRect.top + sourceRect.height / 2},
            ${targetRect.left - containerRect.left - 50} ${targetRect.top + targetRect.height / 2},
            ${targetRect.left - containerRect.left} ${targetRect.top + targetRect.height / 2}
        `
        paths.push(path)
      })
    })
  })
  
  connectionPaths.value = paths
}

watchEffect(() => {
  if (matches.value?.length > 0) {
    processedRounds.value = processMatches(matches.value)
    nextTick(() => {
      generateConnections()
    })
  }
})

onMounted(async () => {
  try {
    await fetchTeams()
    await fetchMatches()
    window.addEventListener('resize', () => {
      containerWidth.value = document.querySelector('.bracket-grid')?.offsetWidth || 1200
      nextTick(() => {
        generateConnections()
      })
    })
  } catch (error) {
    console.error('初始化失败:', error)
  }
})

// 添加 onUnmounted 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', generateConnections)
})
</script>

<style scoped>
.cyber-tournament {
  /* background options */
  background: url('@/images/bg.jpg') no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  padding: 2rem;
  overflow-x: auto;
}

.neon-title {
  text-align: center;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #ff0202, #02cff8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(125, 74, 255, 0.3);
  margin: 2rem 0 4rem;
  position: sticky;
  left: 0;
}

/* Adjust bracket wrapper spacing */
.bracket-wrapper {
  position: relative;
  min-width: 1000px; 
  margin: 0 auto;
}

.bracket-grid {
  position: relative;
  height: 100vh;
  min-height: 800px;
}

.round-column {
  position: absolute;
  height: 100%;
  width: 200px;
  transition: left 0.5s ease;
}

.round-header {
  position: relative; 
  top: 0px;
  width: 200%;
  text-align: center;
}

.round-title {
  color: #54eb03;
  font-size: 3.2rem;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(125, 74, 255, 0.3);
}

.round-status {
  color: #f212af;
  font-size: 1.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

.match-node {
  position: absolute;
  width: 100%;
  transform: translateY(-50%);
  will-change: transform;
}

.cyber-card {
  background: rgba(18, 20, 32, 0.95);
  border: 1px solid rgba(125, 74, 255, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 0 30px rgba(0, 247, 255, 0.1);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 10cm;
}

.cyber-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 50px rgba(0, 247, 255, 0.3);
}

.card-glows {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(125, 74, 255, 0.1) 50%,
    transparent 100%
  );
  animation: hologram 4s linear infinite;
}

.debate-topic {
  color: #00f7ff;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hologram-icon {
  filter: drop-shadow(0 0 5px #00f7ff);
}

/* Column spacing adjustments */
.versus-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  /* min-width: cm; */
}

.team-display {
  flex: 1;
  min-width: 100px;
  background: rgba(12, 14, 26, 0.8);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.team-display.victory {
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid #2ed573;
  box-shadow: 0 0 20px rgba(46, 213, 115, 0.3);
}

.team-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
}

.team-score {
  font-size: 16px;
  font-weight: bold;
  color: #7d4aff;
}

.vs-core {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.vs-text {
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  color: white;
  padding: 0.2rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.vs-bar {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, 
    transparent 0%,
    rgba(125, 74, 255, 0.6) 50%,
    transparent 100%);
}

.match-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #a0aec0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.connection-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cyber-path {
  stroke: url(#cyber-gradient);
  stroke-width: 2;
  stroke-linecap: round;
  fill: none;
  filter: drop-shadow(0 0 5px rgba(0, 247, 255, 0.3));
  stroke-dasharray: 1000;
  animation: lineFlow 3s linear infinite;
}

.match-detail {
  padding: 15px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 8px;
  color: #fff;
}

.match-detail h4 {
  color: #0ff;
  margin: 0 0 10px;
}

.match-detail .topic {
  font-size: 1.1em;
  margin: 10px 0;
  color: #fff;
}

.match-detail .time,
.match-detail .location {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  margin: 5px 0;
}

@keyframes hologram {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}

@keyframes lineFlow {
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
}

@media (max-width: 768px) {
  .bracket-wrapper {
    min-width: 100%;
    padding: 1rem;
  }

  .bracket-grid {
    height: auto;
    min-height: auto;
  }

  .round-column {
    position: relative !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 2rem 0;
  }

  .match-node {
    position: static !important;
    transform: none !important;
    margin: 1.5rem 0;
  }

  .connection-canvas {
    display: none;
  }

  .cyber-card {
    transform: scale(0.95);
  }
}

/* Deep selector fixes */
:deep(.el-table) {
  background: transparent;
  color: #fff;
}

:deep(.el-table th),
:deep(.el-table tr) {
  background: transparent;
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

/* 其他样式保持不变 */
</style>
