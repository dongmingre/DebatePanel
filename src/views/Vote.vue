<template>
  <div>
    <h3>最佳人气奖投票</h3>
    <el-radio-group v-model="selectedTeam">
      <el-radio v-for="team in teams" :label="team.id" :key="team.id">{{ team.name }}</el-radio>
    </el-radio-group>
    <br />
    <el-button type="primary" @click="submitVote" :disabled="!selectedTeam">提交投票</el-button>
    <div style="margin-top: 30px;">
      <h4>投票排行榜</h4>
      <el-table :data="results" style="width: 400px;">
        <el-table-column type="index" label="名次" width="60" />
        <el-table-column prop="name" label="队伍名称" />
        <el-table-column prop="votes" label="票数" width="80" />
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
          if (err.response && err.response.status === 403) {
            ElMessage.error('每个IP只能投一次，您已投过票。');
          } else {
            ElMessage.error('投票失败，请稍后重试。');
          }
        });
    };
    
    onMounted(() => {
      fetchTeamsAndResults();
    });
    
    return { teams, results, selectedTeam, submitVote };
  }
});
</script>
