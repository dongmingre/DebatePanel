<template>
  <div>
    <h3>赛程</h3>
    <bracket v-if="rounds.length" :rounds="rounds" />
    <div v-if="isAdmin" class="admin-controls">
      <h4>设置比赛胜者</h4>
      <div v-for="match in matches" :key="match.id" v-if="!match.winner_id">
        <div v-if="!match.team1_id || !match.team2_id">
          第 {{ match.round }} 轮比赛 {{ match.id }}：等待上一场结果...
        </div>
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
import Bracket from 'vue-tournament-bracket';
import { ElMessage } from 'element-plus';

export default defineComponent({
  components: { Bracket },
  setup() {
    const matches = ref([]);
    const isAdmin = computed(() => !!window.localStorage.getItem('token'));
    
    const fetchMatches = () => {
      axios.get('/api/matches').then(res => {
        matches.value = res.data;
      });
    };
    const setWinner = (matchId, winnerId) => {
      axios.put(`/api/matches/${matchId}`, { winner: winnerId })
        .then(res => {
          ElMessage.success('胜者已更新');
          fetchMatches();
        })
        .catch(err => {
          ElMessage.error(err.response?.data?.error || '设置胜者失败');
        });
    };
    const rounds = computed(() => {
      const grouped = {};
      for (let m of matches.value) {
        if (!grouped[m.round]) grouped[m.round] = [];
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
