<template>
    <div class="admin-page">
      <h2>管理员面板</h2>
      <el-table :data="matches" v-loading="loading" style="width: 100%">
        <!-- 场次(ID)列 -->
        <el-table-column prop="id" label="场次" width="60" />
        <!-- 队伍对阵列 -->
        <el-table-column label="队伍">
          <template #default="{ row }">
            {{ row.team1 }} <b>VS</b> {{ row.team2 }}
          </template>
        </el-table-column>
        <!-- 辩题列 -->
        <el-table-column prop="topic" label="辩题" />
        <!-- 时间列 -->
        <el-table-column prop="time" label="时间" width="160" />
        <!-- 地点列 -->
        <el-table-column prop="location" label="地点" width="100" />
        <!-- 胜者/设置胜者列 -->
        <el-table-column label="胜者" width="140">
          <template #default="{ row }">
            <div v-if="row.winner">
              {{ row.winner }}
            </div>
            <div v-else>
              <el-select v-model="selectedWinners[row.id]" placeholder="选择胜者" size="small" style="width: 80px;">
                <el-option :label="row.team1" :value="row.team1" />
                <el-option :label="row.team2" :value="row.team2" />
              </el-select>
              <el-button size="small" @click="confirmWinner(row)">确定</el-button>
            </div>
          </template>
        </el-table-column>
        <!-- 操作列：编辑按钮 -->
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 编辑比赛信息的对话框 -->
      <el-dialog title="编辑比赛" :visible.sync="dialogVisible" width="400px">
        <el-form label-position="top" class="edit-dialog">
          <el-form-item label="队伍1">
            <el-input v-model="editMatch.team1" />
          </el-form-item>
          <el-form-item label="队伍2">
            <el-input v-model="editMatch.team2" />
          </el-form-item>
          <el-form-item label="时间">
            <el-input v-model="editMatch.time" />
          </el-form-item>
          <el-form-item label="地点">
            <el-input v-model="editMatch.location" />
          </el-form-item>
          <el-form-item label="辩题">
            <el-input v-model="editMatch.topic" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import axios from 'axios';
  
  const matches = ref([]);                       // 全部比赛列表
  const loading = ref(false);                    // 加载状态
  const selectedWinners = reactive({});          // 临时存储每场比赛选中的胜者
  const dialogVisible = ref(false);              // 编辑对话框显示状态
  const editMatch = reactive({});                // 当前编辑的比赛数据
  
  // 加载全部比赛信息
  const fetchAllMatches = async () => {
    loading.value = true;
    try {
      const res = await axios.get('http://localhost:3000/matches');
      matches.value = res.data;
      // 初始化 selectedWinners，对于未有胜者的比赛设为空
      matches.value.forEach(m => {
        if (!m.winner) {
          selectedWinners[m.id] = '';
        }
      });
    } catch (error) {
      console.error('加载比赛列表失败', error);
    } finally {
      loading.value = false;
    }
  };
  
  // 点击编辑按钮，打开编辑对话框并填充数据
  const openEdit = (match) => {
    Object.assign(editMatch, match);    // 复制选中比赛数据
    dialogVisible.value = true;
  };
  // 保存编辑后的比赛信息
  const saveEdit = async () => {
    try {
      await axios.post(`http://localhost:3000/match/${editMatch.id}/update`, {
        time: editMatch.time,
        location: editMatch.location,
        topic: editMatch.topic,
        team1: editMatch.team1,
        team2: editMatch.team2
      });
      // 更新本地 matches 列表中的对应项
      const idx = matches.value.findIndex(m => m.id === editMatch.id);
      if (idx !== -1) {
        matches.value[idx] = { ...matches.value[idx], ...editMatch };
      }
      dialogVisible.value = false;
    } catch (error) {
      console.error('更新比赛信息失败', error);
    }
  };
  // 设置胜者并晋级
  const confirmWinner = async (match) => {
    const winnerTeam = selectedWinners[match.id];
    if (!winnerTeam) return;
    try {
      await axios.post(`http://localhost:3000/match/${match.id}/setWinner`, { winnerTeam });
      // 更新本地数据：设置胜者
      match.winner = winnerTeam;
      // 更新界面上该场比赛的胜者显示，移除选择框
      selectedWinners[match.id] = '';
      // 如果有下一场比赛，将胜者填入下一场比赛的对应队伍位置
      if (match.next_match_id) {
        const nextMatch = matches.value.find(m => m.id === match.next_match_id);
        if (nextMatch) {
          if (match.next_match_slot === 1) {
            nextMatch.team1 = winnerTeam;
          } else if (match.next_match_slot === 2) {
            nextMatch.team2 = winnerTeam;
          }
        }
      }
    } catch (error) {
      console.error('设置胜者失败', error);
    }
  };
  
  onMounted(() => {
    fetchAllMatches();
  });
  </script>
  
  <style scoped>
  .admin-page {
    padding: 20px;
  }
  .el-dialog .edit-dialog {
    margin-top: 10px;
  }
  </style>
  