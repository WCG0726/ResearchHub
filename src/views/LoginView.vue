<template>
  <div class="login-page">
    <div class="login-content">
      <!-- 左栏：品牌区 -->
      <div class="login-branding">
        <div class="brand-icon">🔬</div>
        <h1 class="brand-title">ResearchHub</h1>
        <p class="brand-tagline">科研管理平台</p>
        <div class="brand-features">
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>高效科研记录管理</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>文献笔记与灵感捕捉</span>
          </div>
          <div class="feature-item">
            <span class="feature-dot"></span>
            <span>团队协作与进度追踪</span>
          </div>
        </div>
      </div>

      <!-- 右栏：登录卡 -->
      <div class="login-card-container">
        <div class="login-card">
          <div class="tabs">
            <button class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
            <button class="tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">注册</button>
          </div>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="username" />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
            </div>
            <div v-if="mode === 'register'" class="form-group">
              <label>昵称</label>
              <input v-model="nickname" type="text" placeholder="显示昵称（可选）" />
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <button type="submit" class="btn btn-primary btn-block">
              {{ mode === 'login' ? '登录' : '注册' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../utils/auth'

const router = useRouter()

const mode = ref('login')
const username = ref('')
const password = ref('')
const nickname = ref('')
const error = ref('')

function handleSubmit() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }

  if (mode.value === 'login') {
    const result = login(username.value, password.value)
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.message
    }
  } else {
    const result = register(username.value, password.value, nickname.value)
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.message
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  display: flex;
  align-items: center;
  gap: 80px;
  max-width: 960px;
  width: 100%;
  padding: 40px;
  animation: fade-in-up 0.6s ease both;
}

.login-branding {
  flex: 1;
}

.brand-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: float 4s ease-in-out infinite;
}

.brand-title {
  font-size: 42px;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  letter-spacing: -0.03em;
}

.brand-tagline {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 32px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
}

.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gradient-primary);
  flex-shrink: 0;
}

.login-card-container {
  flex-shrink: 0;
  width: 380px;
}

.login-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 36px;
  box-shadow: var(--shadow-xl), 0 0 60px rgba(99, 102, 241, 0.08);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: edge-shimmer 4s linear infinite;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.error-msg {
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .login-branding { display: none; }
  .login-content { justify-content: center; gap: 0; }
  .login-card-container { width: 100%; max-width: 380px; }
}
</style>
