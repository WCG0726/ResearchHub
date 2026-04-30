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
      <div class="global-search-wrapper">
        <button class="search-trigger" @click="openSearch" title="搜索 (Ctrl+K)">
          🔍 <span class="search-hint">Ctrl+K</span>
        </button>
      </div>
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

    <!-- 全局搜索 -->
    <Teleport to="body">
      <div v-if="showSearch" class="search-overlay" @click.self="showSearch = false">
        <div class="search-modal">
          <div class="search-input-row">
            <span class="search-icon">🔍</span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              class="search-input"
              placeholder="搜索记录、笔记、灵感、会议..."
              @keydown.esc="showSearch = false"
              @keydown.down.prevent="moveSelection(1)"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.enter.prevent="goToSelected"
            />
            <kbd class="search-esc">Esc</kbd>
          </div>
          <div v-if="searchQuery && searchResults.length" class="search-results">
            <div
              v-for="(r, i) in searchResults"
              :key="r.key"
              class="search-result-item"
              :class="{ selected: i === selectedIndex }"
              @click="goTo(r)"
              @mouseenter="selectedIndex = i"
            >
              <span class="result-icon">{{ r.icon }}</span>
              <div class="result-info">
                <div class="result-title">{{ r.title }}</div>
                <div class="result-meta">{{ r.meta }}</div>
              </div>
              <span class="result-type">{{ r.type }}</span>
            </div>
          </div>
          <div v-else-if="searchQuery" class="search-empty">未找到匹配结果</div>
          <div v-else class="search-tips">
            <div class="tip">输入关键词搜索所有数据</div>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script>
import { getProfile, setProfile, getRecords, getLitNotes, getInspirations, getMeetings, getExperiments } from '../utils/storage.js'
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
      avatarOptions: ['🧑‍🔬', '👩‍🔬', '👨‍🔬', '🧑‍💻', '👩‍💻', '👨‍💻', '📚', '🔬', '🧪', '🎯', '🌟', '⚡'],
      showSearch: false,
      searchQuery: '',
      selectedIndex: 0
    }
  },
  watch: {
    showEditor(val) {
      if (val) {
        this.editName = this.profile.nickname
        this.editAvatar = this.profile.avatar || ''
        this.editAvatarData = this.profile.avatarData || ''
      }
    },
    showSearch(val) {
      if (val) {
        this.searchQuery = ''
        this.selectedIndex = 0
        this.$nextTick(() => this.$refs.searchInput?.focus())
      }
    },
    searchQuery() {
      this.selectedIndex = 0
    }
  },
  computed: {
    searchResults() {
      const q = this.searchQuery.toLowerCase()
      if (!q) return []
      const results = []
      // 搜索科研记录
      for (const r of getRecords()) {
        if ((r.title && r.title.toLowerCase().includes(q)) || (r.content && r.content.toLowerCase().includes(q))) {
          results.push({ key: 'record-' + r.id, icon: '📝', title: r.title, meta: (r.content || '').slice(0, 60), type: '记录', to: '/records' })
        }
      }
      // 搜索文献笔记
      for (const n of getLitNotes()) {
        if ((n.title && n.title.toLowerCase().includes(q)) || (n.authors && n.authors.toLowerCase().includes(q))) {
          results.push({ key: 'lit-' + n.id, icon: '📖', title: n.title, meta: n.authors || '', type: '笔记', to: '/lit-notes' })
        }
      }
      // 搜索灵感
      for (const i of getInspirations()) {
        if ((i.title && i.title.toLowerCase().includes(q)) || (i.content && i.content.toLowerCase().includes(q))) {
          results.push({ key: 'insp-' + i.id, icon: '💡', title: i.title, meta: (i.content || '').slice(0, 60), type: '灵感', to: '/inspiration' })
        }
      }
      // 搜索会议
      for (const m of getMeetings()) {
        if ((m.topics && m.topics.toLowerCase().includes(q)) || (m.feedback && m.feedback.toLowerCase().includes(q))) {
          results.push({ key: 'meet-' + m.id, icon: '🗣️', title: m.date + ' ' + (m.type || ''), meta: (m.topics || '').slice(0, 60), type: '会议', to: '/meeting' })
        }
      }
      // 搜索实验
      for (const e of getExperiments()) {
        if ((e.title && e.title.toLowerCase().includes(q)) || (e.content && e.content.toLowerCase().includes(q))) {
          results.push({ key: 'exp-' + e.id, icon: '🔬', title: e.title, meta: (e.content || '').slice(0, 60), type: '实验', to: '/experiment' })
        }
      }
      return results.slice(0, 12)
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
    },
    openSearch() {
      this.showSearch = true
    },
    closeSearch() {
      this.showSearch = false
    },
    moveSelection(delta) {
      const max = this.searchResults.length - 1
      this.selectedIndex = Math.max(0, Math.min(max, this.selectedIndex + delta))
    },
    goToSelected() {
      if (this.searchResults.length) {
        this.goTo(this.searchResults[this.selectedIndex])
      }
    },
    goTo(r) {
      this.showSearch = false
      if (r.to && this.$route.path !== r.to) {
        this.$router.push(r.to)
      }
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
  .search-hint {
    display: none;
  }
}

/* 全局搜索 */
.search-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-trigger:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.search-hint {
  font-size: 11px;
  opacity: 0.6;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
}

.search-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 560px;
  max-width: 90vw;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.search-icon { font-size: 18px; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder { color: var(--text-muted); }

.search-esc {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.search-results {
  overflow-y: auto;
  padding: 6px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.1s;
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--bg-hover);
}

.result-icon { font-size: 18px; flex-shrink: 0; }
.result-info { flex: 1; min-width: 0; }
.result-title { font-size: 14px; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-meta { font-size: 12px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
.result-type { font-size: 11px; color: var(--text-muted); background: var(--bg-secondary); padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }

.search-empty, .search-tips {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
