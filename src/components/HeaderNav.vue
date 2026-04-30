<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <span>☰</span>
      </button>
      <router-link to="/" class="logo">
        <span class="logo-icon">🔬</span>
        <span class="logo-text">ResearchHub</span>
      </router-link>
    </div>

    <div class="header-right">
      <button class="theme-btn" @click="$emit('toggle-theme')" :title="isDark ? '浅色模式' : '深色模式'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <div class="user-area" @click="showEditor = true">
        <div class="user-avatar">
          <img v-if="profile.avatarData" :src="profile.avatarData" alt="avatar" />
          <span v-else-if="profile.avatar">{{ profile.avatar }}</span>
          <span v-else>{{ profile.nickname.charAt(0) }}</span>
        </div>
        <span class="user-name">{{ profile.nickname }}</span>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showEditor" class="modal-overlay" @click.self="showEditor = false">
        <div class="modal">
          <h3>编辑资料</h3>
          <div class="form-group">
            <label>昵称</label>
            <input v-model="editName" type="text" maxlength="10" placeholder="输入昵称" />
          </div>
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload-area">
              <div class="avatar-preview-lg" @click="$refs.fileInput.click()">
                <img v-if="editAvatarData" :src="editAvatarData" alt="avatar" />
                <span v-else-if="editAvatar">{{ editAvatar }}</span>
                <span v-else>{{ editName.charAt(0) || '?' }}</span>
                <div class="avatar-overlay">📷</div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
              <span class="upload-hint">点击上传自定义头像</span>
            </div>
            <div class="avatar-options">
              <div
                v-for="emoji in avatarOptions"
                :key="emoji"
                class="avatar-option"
                :class="{ active: !editAvatarData && editAvatar === emoji }"
                @click="editAvatar = emoji; editAvatarData = ''"
              >
                {{ emoji }}
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showEditor = false">取消</button>
            <button class="btn-save" @click="saveProfile">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script>
import { getProfile, setProfile } from '../utils/storage.js'
import { getCurrentUser } from '../utils/auth.js'

export default {
  name: 'HeaderNav',
  props: {
    isDark: Boolean
  },
  emits: ['toggle-theme', 'toggle-sidebar'],
  data() {
    const user = getCurrentUser()
    const profile = getProfile()
    if (user && user.nickname) {
      profile.nickname = user.nickname
    }
    return {
      profile,
      showEditor: false,
      editName: '',
      editAvatar: '',
      editAvatarData: '',
      avatarOptions: ['🧑‍🔬', '👩‍🔬', '👨‍🔬', '🧑‍💻', '👩‍💻', '👨‍💻', '📚', '🔬', '🧪', '🎯', '🌟', '⚡']
    }
  },
  watch: {
    showEditor(val) {
      if (val) {
        this.editName = this.profile.nickname
        this.editAvatar = this.profile.avatar || ''
        this.editAvatarData = this.profile.avatarData || ''
      }
    }
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0]
      if (!file) return
      if (file.size > 500 * 1024) {
        alert('头像图片不能超过 500KB')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.editAvatarData = ev.target.result
        this.editAvatar = ''
      }
      reader.readAsDataURL(file)
    },
    saveProfile() {
      const nickname = this.editName.trim() || '科研人'
      this.profile = {
        nickname,
        avatar: this.editAvatar,
        avatarData: this.editAvatarData
      }
      setProfile(this.profile)
      this.showEditor = false
    }
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

.dark .header {
  background: rgba(15, 23, 42, 0.9);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
  transition: background 0.2s;
}

.theme-btn:hover {
  background: var(--bg-hover);
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
  transition: background 0.2s;
}

.user-area:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
}

.user-avatar.large {
  width: 64px;
  height: 64px;
  font-size: 28px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 380px;
  max-width: 90vw;
}

.modal h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.avatar-upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-preview-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-preview-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-preview-lg:hover .avatar-overlay {
  opacity: 1;
}

.upload-hint {
  font-size: 13px;
  color: var(--text-muted);
}

.avatar-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: var(--radius);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: var(--primary);
}

.avatar-option.active {
  border-color: var(--primary);
  background: var(--primary-light);
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
}

.btn-save {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.btn-save:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .menu-btn {
    display: block;
  }
  .user-name {
    display: none;
  }
}
</style>
