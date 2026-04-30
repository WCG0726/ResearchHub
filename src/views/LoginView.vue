<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">ResearchHub</h1>
        <p class="login-subtitle">科研管理平台</p>
      </div>

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
</template>

<script>
import { login, register } from '../utils/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      mode: 'login',
      username: '',
      password: '',
      nickname: '',
      error: ''
    }
  },
  methods: {
    handleSubmit() {
      this.error = ''
      if (!this.username || !this.password) {
        this.error = '请填写用户名和密码'
        return
      }

      if (this.mode === 'login') {
        const result = login(this.username, this.password)
        if (result.success) {
          this.$router.push('/')
        } else {
          this.error = result.message
        }
      } else {
        const result = register(this.username, this.password, this.nickname)
        if (result.success) {
          this.$router.push('/')
        } else {
          this.error = result.message
        }
      }
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
  background: var(--bg-secondary);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.login-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
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
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: var(--primary);
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
</style>
