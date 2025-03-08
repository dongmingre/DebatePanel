<template>
  <div class="admin-panel">
    <h2 class="cyber-title">管理员控制台</h2>
    
    <!-- 比赛管理部分 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-header">
          <h3>比赛管理</h3>
          <el-button type="primary" @click="openNewMatch">新建赛程</el-button>
        </div>
      </template>
      
      <el-table :data="matches" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="场次" width="60" />
        <el-table-column label="队伍">
          <template #default="{ row }">
            {{ row.team1 }} <b>VS</b> {{ row.team2 }}
          </template>
        </el-table-column>
        <el-table-column prop="topic" label="辩题" />
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="location" label="地点" width="100" />
        <el-table-column label="胜者" width="140">
          <template #default="{ row }">
            <div v-if="row.winner">{{ row.winner }}</div>
            <div v-else>
              <el-select v-model="selectedWinners[row.id]" placeholder="选择胜者" size="small" style="width: 80px;">
                <el-option :label="row.team1" :value="row.team1" />
                <el-option :label="row.team2" :value="row.team2" />
              </el-select>
              <el-button size="small" @click="confirmWinner(row)">确定</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMatch(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 留言审核部分 -->
    <el-card class="section-card message-section">
      <template #header>
        <div class="section-header">
          <h3>留言审核</h3>
          <el-tag type="warning">{{ pendingMessages.length }} 条待审核</el-tag>
        </div>
      </template>
      
      <el-table :data="pendingMessages" style="width: 100%">
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="content" label="留言内容" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="time" label="发布时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="approveMessage(row.id)">通过</el-button>
            <el-button type="danger" size="small" @click="rejectMessage(row.id)">拒绝</el-button>
            <el-button type="warning" size="small" @click="deleteMessage(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加已审核留言列表 -->
    <el-card class="section-card message-section">
      <template #header>
        <div class="section-header">
          <h3>已审核留言</h3>
          <el-tag type="success">{{ approvedMessages.length }} 条</el-tag>
        </div>
      </template>
      
      <el-table :data="approvedMessages" style="width: 100%">
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="content" label="留言内容" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="time" label="发布时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteMessage(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑比赛对话框 -->
    <el-dialog :title="editMatch.id ? '编辑比赛' : '新建比赛'" v-model="dialogVisible" width="500px">
      <el-form ref="matchForm" :model="editMatch" :rules="matchRules" label-width="100px">
        <el-form-item label="轮次" prop="round">
          <el-select v-model="editMatch.round" placeholder="选择轮次">
            <el-option :label="formatRoundName(1)" :value="1" />
            <el-option :label="formatRoundName(2)" :value="2" />
            <el-option :label="formatRoundName(3)" :value="3" />
            <el-option :label="formatRoundName(4)" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="场次顺序" prop="order">
          <el-input-number v-model="editMatch.order" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="队伍1" prop="team1_id">
          <el-select v-model="editMatch.team1_id" placeholder="选择队伍1">
            <el-option
              v-for="team in teams"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="队伍2" prop="team2_id">
          <el-select v-model="editMatch.team2_id" placeholder="选择队伍2">
            <el-option
              v-for="team in teams"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="比赛时间" prop="start_time">
          <el-date-picker
            v-model="editMatch.start_time"
            type="datetime"
            placeholder="选择日期时间"
          />
        </el-form-item>
        <el-form-item label="比赛地点" prop="location">
          <el-input v-model="editMatch.location" />
        </el-form-item>
        <el-form-item label="辩题" prop="topic">
          <el-input v-model="editMatch.topic" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMatch">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { matchesApi, messageApi } from '../api'  // 修正导入

const matches = ref([]);          
const loading = ref(false);              
const selectedWinners = reactive({}); 
const dialogVisible = ref(false);   
const editMatch = reactive({});  

const fetchAllMatches = async () => {
  loading.value = true
  try {
    const res = await matchesApi.getAllMatches()
    if (res.data && Array.isArray(res.data.data)) {
      matches.value = res.data.data.map(match => ({
        ...match,
        team1: match.team1_name,
        team2: match.team2_name
      }))
    } else {
      matches.value = []
    }
    // 设置胜者选项
    matches.value.forEach(m => {
      if (!m.winner_id) {
        selectedWinners[m.id] = ''
      }
    })
  } catch (error) {
    console.error('加载比赛列表失败', error)
    ElMessage.error('加载比赛列表失败')
  } finally {
    loading.value = false
  }
}

const openEdit = (match) => {
  Object.assign(editMatch, match); 
  dialogVisible.value = true;
};
const openNewMatch = () => {
  editMatch.id = undefined // 移除id表示新建
  editMatch.round = 1
  editMatch.order = 1
  editMatch.team1_id = null
  editMatch.team2_id = null
  editMatch.start_time = null
  editMatch.location = ''
  editMatch.topic = ''
  dialogVisible.value = true
}

const validateForm = () => {
  const rules = {
    team1_id: '请选择队伍1',
    team2_id: '请选择队伍2',
    round: '请选择轮次',
    order: '请输入场次顺序',
    topic: '请输入辩题'
  }

  for (const [field, message] of Object.entries(rules)) {
    if (!editMatch[field]) {
      ElMessage.warning(message)
      return false
    }
  }
  return true
}

const saveMatch = async () => {
  if (!validateForm()) return
  try {
    const matchData = {
      team1_id: Number(editMatch.team1_id),
      team2_id: Number(editMatch.team2_id),
      round: Number(editMatch.round),
      order: Number(editMatch.order),
      start_time: editMatch.start_time,
      location: editMatch.location || '',
      topic: editMatch.topic || ''
    }

    console.log('Saving match data:', matchData) // Debug log

    if (editMatch.id) {
      await matchesApi.updateMatch(editMatch.id, matchData)
    } else {
      await matchesApi.createMatch(matchData)
    }

    await fetchAllMatches() // 刷新列表
    dialogVisible.value = false
    ElMessage.success(editMatch.id ? '更新成功' : '创建成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.error || '操作失败')
  }
}

const deleteMatch = async (match) => {
  if (!match?.id) {
    ElMessage.error('无效的比赛记录')
    return
  }

  try {
    loading.value = true
    
    await ElMessageBox.confirm(
      `确定要删除第${match.round}轮第${match.order}场比赛吗？\n${match.team1} VS ${match.team2}`, 
      '警告', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await matchesApi.deleteMatch(match.id)
    matches.value = matches.value.filter(m => m.id !== match.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const confirmWinner = async (match) => {
  const winnerTeam = selectedWinners[match.id]
  if (!winnerTeam) return
  
  try {
    // Get winner team ID from the match data
    const winnerId = match[winnerTeam === match.team1 ? 'team1_id' : 'team2_id']
    await matchesApi.setWinner(match.id, winnerId)
    match.winner = winnerTeam
    selectedWinners[match.id] = ''
    
    if (match.next_match_id) {
      await fetchAllMatches() // 重新加载所有比赛以更新状态
    }
    
    ElMessage.success('设置胜者成功')
  } catch (error) {
    console.error('设置胜者失败:', error)
    ElMessage.error(error.response?.data?.error || '设置胜者失败')
  }
}

const messages = ref([])
const pendingMessages = computed(() => messages.value.filter(msg => !msg.approved))
const approvedMessages = computed(() => messages.value.filter(msg => msg.approved))

const loadMessages = async () => {
  try {
    const data = await messageApi.getAllMessages()
    messages.value = data || []
  } catch (error) {
    console.error('加载留言失败:', error)
    ElMessage.error('加载留言失败')
  }
}

const approveMessage = async (id) => {
  try {
    messages.value = await messageApi.approveMessage(id)
    ElMessage.success('审核通过')
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

const rejectMessage = async (id) => {
  try {
    await ElMessageBox.confirm('确定要拒绝这条留言吗？', '提示', {
      type: 'warning'
    })
    messages.value = messages.value.filter(msg => msg.id !== id)
    await saveMessages()
    ElMessage.success('留言已拒绝')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const deleteMessage = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条留言吗？', '提示', {
      type: 'warning'
    })
    messages.value = await messageApi.deleteMessage(id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const saveMessages = async () => {
  await messageApi.saveMessages(messages.value)
}

const matchRules = {
  round: [{ required: true, message: '请选择轮次' }],
  order: [{ required: true, message: '请输入场次顺序' }],
  team1_id: [{ required: true, message: '请选择队伍1' }],
  team2_id: [{ required: true, message: '请选择队伍2' }],
  topic: [{ required: true, message: '请输入辩题' }]
};

const teams = ref([]);
const fetchTeams = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/teams')
    teams.value = data
  } catch (error) {
    console.error('获取队伍列表失败:', error)
    ElMessage.error('获取队伍列表失败')
  }
};

const formatRoundName = (round) => {
  const names = ['初赛', '淘汰赛', '半决赛', '决赛']
  return names[round - 1] || `第${round}轮`
}

const resetEditMatch = () => {
  editMatch.value = {
    round: 1,
    order: 1,
    team1_id: null,
    team2_id: null,
    start_time: null,
    location: '',
    topic: ''
  };
};

onMounted(() => {
  fetchTeams();
  Promise.all([
    fetchAllMatches(),
    loadMessages()
  ]).catch(error => {
    console.error('初始化数据失败:', error);
    ElMessage.error('加载数据失败');
  });
})
</script>

<style scoped>
.admin-panel {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cyber-title {
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
  margin-bottom: 30px;
  text-align: center;
}

.section-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.section-header h3 {
  color: #0ff;
  margin: 0;
}

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

.message-section {
  margin-top: 20px;
}

.el-dialog .edit-dialog {
  margin-top: 10px;
}
</style>
