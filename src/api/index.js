import axios from 'axios'

const baseURL = 'http://localhost:3000'  // Remove /api as it's handled by proxy

const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add request interceptor to handle auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('admin-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Add request timeout and better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'))
    }
    return Promise.reject(error)
  }
)

export const matchesApi = {
  getAllMatches: () => api.get('/api/matches'),
  createMatch: (matchData) => api.post('/api/matches', matchData),
  updateMatch: (id, matchData) => api.put(`/api/matches/${id}`, matchData),
  deleteMatch: async (id) => {
    try {
      if (!id) throw new Error('无效的比赛ID')
      
      const response = await api.delete(`/api/matches/${id}`, {
        headers: { 'Accept': 'application/json' },
        validateStatus: status => (status >= 200 && status < 300) || status === 404
      })
      
      console.log('Delete response:', {
        status: response.status,
        data: response.data
      })
      
      // 如果返回404，说明后端没找到记录，请确认后端逻辑
      if (response.status === 404) {
        throw new Error('比赛不存在或已被删除')
      }
      
      return { success: true }
    } catch (error) {
      console.error('Delete error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('未授权操作，请重新登录')
        }
        throw new Error(error.response.data?.message || '删除失败')
      } else {
        throw error
      }
    }
  },
  setWinner: (id, winnerId) => api.put(`/api/matches/${id}/winner`, { winner_id: winnerId })
}

// 统一导出名称为 messageApi
export const messageApi = {
  getAllMessages: async () => {
    const messages = localStorage.getItem('debate-messages')
    return messages ? JSON.parse(messages) : []
  },
  
  getApprovedMessages: async () => {
    try {
      const messages = await messageApi.getAllMessages()
      return messages.filter(msg => msg.approved) || []
    } catch (error) {
      console.error('获取已审核留言失败:', error)
      return []
    }
  },
  
  deleteMessage: async (id) => {
    const messages = await messageApi.getAllMessages()
    const newMessages = messages.filter(msg => msg.id !== id)
    localStorage.setItem('debate-messages', JSON.stringify(newMessages))
    return newMessages
  },
  
  approveMessage: async (id) => {
    const messages = await messageApi.getAllMessages()
    const message = messages.find(msg => msg.id === id)
    if (message) {
      message.approved = true
      localStorage.setItem('debate-messages', JSON.stringify(messages))
    }
    return messages
  },
  
  // 添加消息保存方法
  saveMessages: async (messages) => {
    localStorage.setItem('debate-messages', JSON.stringify(messages))
    return messages
  }
}
