<template>
  <div class="vote-container">
    <div class="header">
      <div class="title-box">
        <h1 class="gradient-title">最佳人气奖投票</h1>
        <div class="decorative-line"></div>
      </div>
      <p class="sub-title">为您支持的队伍投上宝贵一票</p>
    </div>

    <div class="selection-card">
      <div class="card-content">
        <h4 class="select-title">🏅 请选择参赛队伍</h4>
        <el-radio-group v-model="selectedTeam" class="custom-radio-group">
          <el-radio 
            v-for="team in teams" 
            :label="team.id" 
            :key="team.id"
            class="custom-radio"
          >
            <div class="team-card">
              <span class="team-emoji">🚩</span>
              <span class="team-name">{{ team.name }}</span>
            </div>
          </el-radio>
        </el-radio-group>
        
        <el-button 
          type="primary" 
          @click="submitVote" 
          :disabled="!selectedTeam"
          class="vote-button"
        >
          ✨ 立即投票
          <span class="button-glow"></span>
        </el-button>
      </div>
    </div>

    <div class="ranking-card">
      <h4 class="ranking-title">📊 实时排行榜</h4>
      <el-table 
        :data="results" 
        class="custom-table"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="名次" width="100">
          <template #default="{ $index }">
            <div class="rank-badge">
              {{ $index + 1 }}
              <span v-if="$index < 3" class="medal">
                {{ ['🥇', '🥈', '🥉'][$index] }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="队伍名称">
          <template #default="{ row }">
            <div class="team-info">
              <span class="team-icon">🏅</span>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="votes" label="票数" width="120">
          <template #default="{ row }">
            <div class="vote-count">
              <span class="fire-icon">🔥</span>
              {{ row.votes }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  setup() {
    const teams = ref([]);
    const results = ref([]);
    const selectedTeam = ref(null);
    
    const fetchTeamsAndResults = () => {
      axios.get('/api/teams').then(res => {
        teams.value = res.data;
      });
      axios.get('/api/votes/popularity').then(res => {
        results.value = res.data;
      });
    };

    const submitVote = () => {
      if (!selectedTeam.value) return;
      axios.post('/api/votes/popularity', { teamId: selectedTeam.value })
        .then(res => {
          ElMessage.success('投票成功！');
          fetchTeamsAndResults();
        })
        .catch(err => {
          if (err.response?.status === 403) {
            ElMessage.error('每个IP只能投一次，您已投过票。');
          } else {
            ElMessage.error('投票失败，请稍后重试。');
          }
        });
    };

    const tableRowClassName = ({ rowIndex }) => {
      return rowIndex % 2 === 0 ? '' : 'striped-row';
    };

    onMounted(() => {
      fetchTeamsAndResults();
    });

    return { 
      teams,
      results,
      selectedTeam,
      submitVote,
      tableRowClassName 
    };
  }
});
</script>

<style scoped>
.vote-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.title-box {
  position: relative;
  display: inline-block;
}

.gradient-title {
  font-size: 2.5rem;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  font-weight: 700;
  letter-spacing: 2px;
}

.decorative-line {
  height: 4px;
  background: linear-gradient(90deg, transparent 0%, #6a11cb 50%, transparent 100%);
  margin-top: 0.5rem;
}

.sub-title {
  color: #6c757d;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.selection-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-content {
  padding: 2rem;
}

.select-title {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.custom-radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.custom-radio {
  margin: 0 !important;
}

.team-card {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

:deep(.el-radio__input.is-checked + .el-radio__label .team-card) {
  border-color: #6a11cb;
  background: linear-gradient(135deg, rgba(106,17,203,0.1) 0%, rgba(37,117,252,0.1) 100%);
}

.team-emoji {
  font-size: 1.2rem;
  margin-right: 0.8rem;
}

.vote-button {
  position: relative;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.vote-button:hover {
  transform: translateY(-2px);
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.3) 50%,
    rgba(255,255,255,0) 100%
  );
  animation: buttonGlow 2s infinite;
}

@keyframes buttonGlow {
  0% { left: -100%; }
  100% { left: 100%; }
}

.ranking-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  padding: 2rem;
}

.ranking-title {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.custom-table {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.custom-table th) {
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%) !important;
  color: white !important;
  font-weight: 600;
}

:deep(.custom-table tr) {
  transition: all 0.3s ease;
}

:deep(.custom-table tr:hover) {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #6a11cb;
}

.medal {
  margin-left: 0.5rem;
}

.team-info {
  display: flex;
  align-items: center;
}

.team-icon {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.vote-count {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #e63946;
}

.fire-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

:deep(.el-table__row--striped) {
  background: #f8f9fa !important;
}
</style>