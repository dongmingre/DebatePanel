<template>
  <div class="message-board">
    <h2 class="title">留言板</h2>
    
    <!-- 发表留言表单 -->
    <el-card class="message-form">
      <el-form :model="messageForm" ref="formRef">
        <el-form-item prop="nickname" :rules="[{ required: true, message: '请输入昵称' }]">
          <el-input
            v-model="messageForm.nickname"
            placeholder="请输入昵称..."
            maxlength="20"
          />
        </el-form-item>
        <el-form-item prop="content" :rules="[{ required: true, message: '请输入留言内容' }]">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入你的留言..."
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitMessage">发表留言</el-button>
        </el-form-item>
      </el-form>
      <div class="form-tip">留言将在管理员审核后显示</div>
    </el-card>

    <!-- 留言列表 -->
    <div class="message-list">
      <el-card v-for="msg in displayMessages" :key="msg.id" class="message-item">
        <div class="message-header">
          <el-avatar :size="40" :src="msg.avatar">{{ msg.nickname?.charAt(0) }}</el-avatar>
          <div class="message-info">
            <span class="username">{{ msg.nickname }}</span>
            <span class="time">{{ formatTime(msg.time) }}</span>
          </div>
        </div>
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-footer">
          <span class="ip-address">IP: {{ msg.ip }}</span>
          <template v-if="isAdmin">
            <div class="admin-actions" v-if="!msg.approved">
              <el-button type="success" size="small" @click="approveMessage(msg.id)">审核通过</el-button>
              <el-button type="danger" size="small" @click="rejectMessage(msg.id)">拒绝</el-button>
            </div>
            <span v-else class="approved-tag">已审核</span>
          </template>
          <span v-else-if="!msg.approved" class="pending-tag">审核中</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'debate-messages'
const messageForm = ref({
  nickname: localStorage.getItem('lastNickname') || '',
  content: ''
})

const formRef = ref()
const userIp = ref('')
const messages = ref([])

// 从localStorage加载留言数据
const loadMessages = () => {
  const savedMessages = localStorage.getItem(STORAGE_KEY)
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }
}

// 保存留言数据到localStorage
const saveMessages = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
}

// 监听留言数据变化，自动保存
watch(messages, saveMessages, { deep: true })

// 获取用户IP地址
const fetchUserIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    userIp.value = data.ip
  } catch (error) {
    userIp.value = '未知IP'
  }
}

onMounted(() => {
  loadMessages()
  fetchUserIp()
})

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  }
})

// 根据用户角色显示不同的留言列表
const displayMessages = computed(() => {
  if (props.isAdmin) {
    return messages.value
  }
  return messages.value.filter(msg => msg.approved)
})

const approveMessage = (id) => {
  const message = messages.value.find(msg => msg.id === id)
  if (message) {
    message.approved = true
    saveMessages()
    ElMessage.success('留言已审核通过')
  }
}

const rejectMessage = (id) => {
  messages.value = messages.value.filter(msg => msg.id !== id)
  saveMessages()
  ElMessage.success('留言已拒绝')
}

const submitMessage = async () => {
  if (!messageForm.value.content.trim() || !messageForm.value.nickname.trim()) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  localStorage.setItem('lastNickname', messageForm.value.nickname)
  
  messages.value.unshift({
    id: Date.now(),
    nickname: messageForm.value.nickname,
    avatar: '',
    content: messageForm.value.content,
    time: new Date().toLocaleString(),
    ip: userIp.value,
    approved: false // 新增审核状态字段
  })
  
  messageForm.value.content = ''
  ElMessage.success('留言发布成功，等待管理员审核')
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}
</script>

<style scoped>
.message-board {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.message-form {
  margin-bottom: 30px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  margin-bottom: 15px;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.message-info {
  margin-left: 10px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.time {
  color: #999;
  font-size: 12px;
}

.message-content {
  margin-left: 50px;
  color: #333;
  line-height: 1.6;
}

.comment-form {
  margin-bottom: 20px;
}
.comment-input {
  width: 100%;
  margin-bottom: 10px;
}
.admin-section {
  margin-bottom: 20px;
  padding: 10px;
  background: #f0f2f5;
  border-radius: 4px;
}
.admin-login .admin-input {
  width: 180px;
  margin-right: 5px;
}
.error-msg {
  color: red;
  margin-left: 10px;
}
.admin-logged {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.comments-list {
}
.comment-item {
  margin-bottom: 15px;
}
.comment-card {
  transition: background-color 0.3s;
}
.comment-text {
  margin: 0 0 10px;
}
.comment-actions {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}
.like-btn {
  cursor: pointer;
  margin-right: 15px;
  user-select: none;
  display: inline-flex;
  align-items: center;
}
.like-btn.liked {
  animation: like-pop 0.3s;
}
@keyframes like-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); color: #409eff; }
  100% { transform: scale(1); }
}
.delete-btn, .approve-btn {
  font-size: 12px;
  margin: 0 5px;
  color: #909399;
}
.delete-btn:hover, .approve-btn:hover {
  color: #606266;
}
.pending-label {
  font-size: 12px;
  color: #e6a23c;
  margin-left: 5px;
}
.comment-item:hover .comment-card {
  background-color: #f5f7fa;
}
.comment-input ::v-deep .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 5px rgba(64,158,255,0.3);
}
.comment-input.inputting ::v-deep .el-textarea__inner {
  background: linear-gradient(to right, #eef1f5, #fff);
}

.message-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #999;
}

.ip-address {
  margin-left: 50px;
}

.form-tip {
  color: #e6a23c;
  font-size: 12px;
  margin-top: 10px;
  text-align: center;
}

.admin-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.approved-tag {
  color: #67c23a;
  margin-left: auto;
}

.pending-tag {
  color: #e6a23c;
  margin-left: auto;
}

/* 适配深色主题 */
.message-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-content, .username {
  color: #fff;
}

.time, .ip-address {
  color: rgba(255, 255, 255, 0.6);
}

/* 更新深色主题样式 */
.form-tip {
  color: rgba(230, 162, 60, 0.8);
}

.approved-tag {
  color: rgba(103, 194, 58, 0.8);
}

.pending-tag {
  color: rgba(230, 162, 60, 0.8);
}
</style>
