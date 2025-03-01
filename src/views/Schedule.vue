<template>
  <div class="cyber-tournament">
    <h1 class="neon-title">2025年安徽理工大学"校庆杯"校辩论赛OnlinePanel</h1>
    
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
            <div class="cyber-card" :class="{ 'final-node': isFinalRound(round) }">
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
                    {{ formatTime(match.start) }}
                  </div>
                  <div class="meta-item">
                    <span class="icon">📍</span>
                    {{ match.venue || '元宇宙竞技场' }}
                  </div>
                </div>
              </div>
            </div>

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

<script>
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'CyberBracket',
  setup() {
    // 核心数据
    const matches = ref([]);
    const teams = ref([]);
    const connectionPaths = ref([]);
    const containerWidth = ref(1200);
    const baseSpacing = 200;

    // 配置参数
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八'];
    const totalRounds = computed(() => Math.max(...processedRounds.value.map(r => r.round)) || 0);

    // 处理后的轮次数据
    const processedRounds = computed(() => {
      const rounds = {};
      matches.value.forEach(match => {
        const round = match.round || 1;
        if (!rounds[round]) rounds[round] = [];
        rounds[round].push(match);
      });
      return Object.entries(rounds)
        .map(([round, matches]) => ({
          round: parseInt(round),
          matches: matches.sort((a, b) => a.order - b.order)
        }))
        .sort((a, b) => a.round - b.round);
    });

    // 列布局样式
    const columnStyle = (index) => {
      const offset = (containerWidth.value - baseSpacing) / (totalRounds.value - 1) * index;
      return {
        left: `${baseSpacing / 2 + offset}px`,
        width: `${baseSpacing}px`
      };
    };

    // 节点定位
    const nodeStyle = (roundIndex, matchIndex, total) => {
      const baseGap = 100 / (total + 1);
      // 增加一个放大系数，例如 1.2 倍
      const adjustedGap = baseGap * 2.2;
      return {
        top: `${adjustedGap * (matchIndex + 1)}%`,
        height: `${baseGap}%`
      };
    };

    // 队伍信息
    const getTeam = (teamId) => {
      return teams.value.find(t => t.id === teamId)?.name || `战队${teamId}`;
    };

    // 胜负判定
    const isWinner = (match, team) => {
      return match.winner_id === (team === 1 ? match.team1_id : match.team2_id);
    };

    // 连接线生成
    const generateConnections = async () => {
      await nextTick();
      const paths = [];
      
      processedRounds.value.forEach((round, roundIndex) => {
        if (roundIndex === 0) return;

        round.matches.forEach((match, matchIndex) => {
          const prevRound = processedRounds.value[roundIndex - 1].matches;
          const sourceIndex = matchIndex * 2;
          
          [prevRound[sourceIndex], prevRound[sourceIndex + 1]].forEach((sourceMatch, i) => {
            if (!sourceMatch) return;

            const sourceNode = document.getElementById(`match-${sourceMatch.id}`);
            const targetNode = document.getElementById(`match-${match.id}`);
            if (!sourceNode || !targetNode) return;

            const sourceRect = sourceNode.getBoundingClientRect();
            const targetRect = targetNode.getBoundingClientRect();
            const offsetX = containerWidth.value / 2 - window.innerWidth / 2;

            const path = `
              M ${sourceRect.right - offsetX} ${sourceRect.top + sourceRect.height / 2}
              C ${sourceRect.right - offsetX + 150} ${sourceRect.top + sourceRect.height / 2},
                ${targetRect.left - offsetX - 150} ${targetRect.top + targetRect.height / 2},
                ${targetRect.left - offsetX} ${targetRect.top + targetRect.height / 2}
            `;
            paths.push(path);
          });
        });
      });

      connectionPaths.value = paths;
    };

    // 初始化数据
    const initialize = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          axios.get('/api/matches'),
          axios.get('/api/teams')
        ]);
        matches.value = matchesRes.data;
        teams.value = teamsRes.data;
        containerWidth.value = document.querySelector('.bracket-grid')?.offsetWidth || 1200;
        generateConnections();
      } catch (error) {
        console.error('数据初始化失败:', error);
      }
    };

    // 生命周期
    onMounted(() => {
      initialize();
      window.addEventListener('resize', () => {
        containerWidth.value = document.querySelector('.bracket-grid')?.offsetWidth || 1200;
        generateConnections();
      });
    });

    return {
      processedRounds,
      chineseNumbers,
      columnStyle,
      nodeStyle,
      getTeam,
      isWinner,
      connectionPaths,
      isFinalRound: (round) => round.round === totalRounds.value,
      getRoundStatus: (round) => {
        const total = totalRounds.value;
        return `晋级进度 ${Math.round((round.round / total) * 100)}%`;
      },
      formatTime: (date) => new Date(date).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }
});
</script>

<style scoped>
.cyber-tournament {
  /* background: radial-gradient(ellipse at center, #0a0c1a 0%, #020308 100%); */
  background: url('src/images/bg.jpg') no-repeat center center;
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

.bracket-wrapper {
  position: relative;
  min-width: 1200px;
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
  width: 100%;
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
  min-width: 9cm;
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
</style>
