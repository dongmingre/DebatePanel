<template>
    <div class="match-detail-page">
      <h2>比赛详情</h2>
      <div v-if="matchData">
        <h3>{{ matchData.team1 }} <span>VS</span> {{ matchData.team2 }}</h3>
        <!-- 比赛基本信息 -->
        <ul class="info-list">
          <li><strong>时间:</strong> {{ matchData.time }}</li>
          <li><strong>地点:</strong> {{ matchData.location }}</li>
          <li><strong>辩题:</strong> {{ matchData.topic }}</li>
          <li v-if="matchData.winner"><strong>胜者:</strong> {{ matchData.winner }}</li>
        </ul>
        <!-- 若比赛尚未结束，显示当前票数进度 -->
        <div v-if="!matchData.winner">
          <p><strong>当前投票:</strong> 
             {{ matchData.team1 }} - {{ matchData.votes_team1 || 0 }} 票， 
             {{ matchData.team2 }} - {{ matchData.votes_team2 || 0 }} 票
          </p>
        </div>
        <!-- 管理员编辑功能 -->
        <div v-if="isAdmin">
          <el-button v-if="!editing" type="primary" @click="startEdit">编辑比赛信息</el-button>
          <div v-else class="edit-form">
            <el-form label-position="top" class="edit-form">
              <el-form-item label="队伍1">
                <el-input v-model="editMatch.team1" />
              </el-form-item>
              <el-form-item label="队伍2">
                <el-input v-model="editMatch.team2" />
              </el-form-item>
              <el-form-item label="时间">
                <el-input v-model="editMatch.time" placeholder="YYYY-MM-DD HH:mm" />
              </el-form-item>
              <el-form-item label="地点">
                <el-input v-model="editMatch.location" />
              </el-form-item>
              <el-form-item label="辩题">
                <el-input v-model="editMatch.topic" />
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="saveEdit">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>正在加载比赛详情...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const matchId = route.params.id;      // 从路由参数获取比赛ID
  const matchData = reactive({});       // 存储比赛详情数据
  const editMatch = reactive({});       // 编辑表单数据
  const editing = ref(false);           // 是否处于编辑模式
  const isAdmin = ref(false);           // 是否管理员模式
  
  // 获取比赛详情数据
  const fetchMatchDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/match/${matchId}`);
      Object.assign(matchData, res.data);
    } catch (error) {
      console.error('加载比赛详情失败', error);
    }
  };
  
  // 进入编辑模式
  const startEdit = () => {
    editing.value = true;
    // 将当前比赛数据复制到编辑表单对象
    Object.assign(editMatch, matchData);
  };
  // 保存编辑
  const saveEdit = async () => {
    try {
      await axios.post(`http://localhost:3000/match/${matchId}/update`, {
        time: editMatch.time,
        location: editMatch.location,
        topic: editMatch.topic,
        team1: editMatch.team1,
        team2: editMatch.team2
      });
      // 本地更新 matchData 并退出编辑模式
      Object.assign(matchData, editMatch);
      editing.value = false;
    } catch (error) {
      console.error('更新比赛信息失败', error);
    }
  };
  // 取消编辑
  const cancelEdit = () => {
    editing.value = false;
  };
  
  // 检查管理员标志并加载比赛详情
  onMounted(async () => {
    isAdmin.value = localStorage.getItem('isAdmin') === 'true';
    await fetchMatchDetail();
  });
  </script>
  
  <style scoped>
  .match-detail-page {
    padding: 20px;
    max-width: 600px;
  }
  .match-detail-page h3 span {
    margin: 0 10px;
  }
  .info-list {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }
  .info-list li {
    margin: 5px 0;
  }
  .edit-form {
    margin: 20px 0;
  }
  </style>
  