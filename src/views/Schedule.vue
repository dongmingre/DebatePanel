<template>
  <div>
    <h3>赛程</h3>
    <!-- 图形化赛程树展示 -->
    <bracket v-if="rounds.length" :rounds="rounds" />
    <!-- 管理员胜者设置区域 -->
    <div v-if="isAdmin" class="admin-controls">
      <h4>设置比赛胜者</h4>
      <div v-for="match in matches" :key="match.id" v-if="!match.winner_id">
        <!-- 若队伍尚未确定（上一轮未完成），显示等待提示 -->
        <div v-if="!match.team1_id || !match.team2_id">
          第 {{ match.round }} 轮比赛 {{ match.id }}：等待上一场结果...
        </div>
        <!-- 当两队伍就绪且胜者未确定时，管理员可点击按钮选择胜者 -->
        <div v-else>
          比赛 {{ match.id }}： 
          <strong>{{ match.team1_name }}</strong>
          <el-button size="small" type="success" @click="setWinner(match.id, match.team1_id)">晋级</el-button>
          VS 
          <strong>{{ match.team2_name }}</strong>
          <el-button size="small" type="success" @click="setWinner(match.id, match.team2_id)">晋级</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { defineComponent, ref, computed, onMounted } from 'vue';
import Bracket from 'vue-tournament-bracket';  // 引入赛程树组件
import { ElMessage } from 'element-plus';

export default defineComponent({
  components: { Bracket },
  setup() {
    const matches = ref([]);
    const isAdmin = computed(() => !!window.localStorage.getItem('token'));
    
    // 从后台获取赛程数据
    const fetchMatches = () => {
      axios.get('/api/matches').then(res => {
        matches.value = res.data;
      });
    };
    // 管理员设置胜者
    const setWinner = (matchId, winnerId) => {
      axios.put(`/api/matches/${matchId}`, { winner: winnerId })
        .then(res => {
          ElMessage.success('胜者已更新');
          fetchMatches();  // 更新赛程数据，自动反映在赛程树上
        })
        .catch(err => {
          ElMessage.error(err.response?.data?.error || '设置胜者失败');
        });
    };
    // 计算属性：按轮次分组赛程数据，生成 Bracket 组件所需的 rounds 结构
    const rounds = computed(() => {
      const grouped = {};
      for (let m of matches.value) {
        if (!grouped[m.round]) grouped[m.round] = [];
        // 定义每场比赛的两个选手对象
        const player1 = {
          id: m.team1_id ? String(m.team1_id) : null,
          name: m.team1_name || '待定',
          winner: m.winner_id && m.team1_id === m.winner_id
        };
        const player2 = {
          id: m.team2_id ? String(m.team2_id) : null,
          name: m.team2_name || '待定',
          winner: m.winner_id && m.team2_id === m.winner_id
        };
        grouped[m.round].push({ player1, player2 });
      }
      // 按轮次顺序排序生成rounds数组
      return Object.keys(grouped).sort((a,b) => a - b).map(r => ({
        games: grouped[r]
      }));
    });
    
    onMounted(() => {
      fetchMatches();
    });
    
    return { matches, rounds, isAdmin, setWinner };
  }
});
</script>

<style scoped>
.admin-controls { margin-top: 20px; }
.admin-controls > div { margin: 5px 0; }
</style>
