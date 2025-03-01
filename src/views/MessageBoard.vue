<template>
  <div class="message-board">
    <h2>留言板</h2>
    <div class="comment-form">
      <el-input
        class="comment-input"
        :class="{ inputting: newContent && newContent.length > 0 }"
        type="textarea"
        v-model="newContent"
        placeholder="请输入留言..."
        autosize />
      <el-button type="primary" @click="submitComment" :disabled="!canSubmit">提交</el-button>
    </div>
    <div class="admin-section">
      <div v-if="!adminStore.loggedIn" class="admin-login">
        <el-input v-model="adminUser" placeholder="管理员账号" class="admin-input" />
        <el-input v-model="adminPass" placeholder="密码" class="admin-input" show-password />
        <el-button type="success" @click="adminLogin">登录</el-button>
        <span v-if="loginError" class="error-msg">账号或密码错误</span>
      </div>
      <div v-else class="admin-logged">
        <span>管理员已登录</span>
        <el-button type="warning" @click="adminLogout">退出</el-button>
      </div>
    </div>
    <div class="comments-list">
      <div v-for="comment in displayedComments" :key="comment.id" class="comment-item">
        <el-card class="comment-card" :shadow="'always'">
          <p class="comment-text">{{ comment.content }}</p>
          <div class="comment-actions">
            <span class="like-btn" @click="onLike(comment.id, $event)">👍 {{ comment.likes }}</span>
            <el-button v-if="adminStore.loggedIn" type="text" size="small" @click="deleteComment(comment.id)" class="delete-btn">删除</el-button>
            <el-button v-if="adminStore.loggedIn && !comment.approved" type="text" size="small" @click="approveComment(comment.id)" class="approve-btn">审核</el-button>
            <span v-if="adminStore.loggedIn && !comment.approved" class="pending-label">待审核</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCommentStore } from '../store/commentStore';
import { useAdminStore } from '../store/adminStore';

const commentStore = useCommentStore();
const adminStore = useAdminStore();

const newContent = ref('');
const adminUser = ref('');
const adminPass = ref('');
const loginError = ref(false);

const displayedComments = computed(() => {
  if (adminStore.loggedIn) {
    return commentStore.comments;
  } else {
    return commentStore.comments.filter(c => c.approved);
  }
});

const canSubmit = computed(() => newContent.value.trim().length > 0);

function submitComment() {
  if (!canSubmit.value) return;
  commentStore.addComment(newContent.value, adminStore.loggedIn);
  newContent.value = '';
}

function adminLogin() {
  loginError.value = false;
  const success = adminStore.login(adminUser.value.trim(), adminPass.value.trim());
  if (!success) {
    loginError.value = true;
  } else {
    adminUser.value = '';
    adminPass.value = '';
  }
}

function adminLogout() {
  adminStore.logout();
}

function onLike(id, event) {
  commentStore.likeComment(id);
  const el = event.currentTarget;
  el.classList.add('liked');
  setTimeout(() => {
    el.classList.remove('liked');
  }, 300);
}

function deleteComment(id) {
  commentStore.deleteComment(id);
}

function approveComment(id) {
  commentStore.approveComment(id);
}
</script>

<style scoped>
.message-board {
  max-width: 600px;
  margin: 20px auto;
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
</style>
