<template>
  <aside class="sidebar" :class="{ open }">
    <div v-if="open" class="sidebar-backdrop" @click="$emit('close')"></div>
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
        <span class="nav-icon">📊</span>
        <span class="nav-text">工作台</span>
      </router-link>

      <div v-for="section in sections" :key="section.key" class="nav-group">
        <div class="nav-section" @click="toggleSection(section.key)">
          <span class="section-arrow" :class="{ open: isOpen(section.key) }">▶</span>
          {{ section.label }}
        </div>
        <div v-show="isOpen(section.key)" class="nav-group-body">
          <router-link
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ active: $route.name === item.name }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.text }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
      <div class="version">v2.3.0</div>
    </div>
  </aside>
</template>

<script>
import { getCurrentUser, logout } from '../utils/auth'
import { stopPresence } from '../utils/presence'

const SECTIONS = [
  {
    key: 'research', label: '科研',
    items: [
      { to: '/records', name: 'records', icon: '📝', text: '科研记录' },
      { to: '/lit-notes', name: 'lit-notes', icon: '📖', text: '文献笔记' },
      { to: '/experiment', name: 'experiment', icon: '🔬', text: '实验记录' },
      { to: '/writing', name: 'writing', icon: '📄', text: '论文写作' },
      { to: '/guide', name: 'guide', icon: '📚', text: '写作指南' },
    ]
  },
  {
    key: 'tools', label: '工具',
    items: [
      { to: '/translate', name: 'translate', icon: '🌐', text: '翻译' },
      { to: '/polish', name: 'polish', icon: '✨', text: '润色提示词' },
      { to: '/plot-tips', name: 'plot-tips', icon: '📐', text: '绘图技巧' },
      { to: '/latex-snippets', name: 'latex-snippets', icon: 'Σ', text: 'LaTeX 片段' },
      { to: '/latex-editor', name: 'latex-editor', icon: '🖊️', text: 'LaTeX 编辑' },
      { to: '/email-templates', name: 'email-templates', icon: '📧', text: '邮件模板' },
    ]
  },
  {
    key: 'literature', label: '文献',
    items: [
      { to: '/zotero', name: 'zotero', icon: '📚', text: 'Zotero' },
      { to: '/links', name: 'links', icon: '🔗', text: '学术导航' },
      { to: '/academic-calendar', name: 'academic-calendar', icon: '📅', text: '学术日历' },
    ]
  },
  {
    key: 'project', label: '项目',
    items: [
      { to: '/plan', name: 'plan', icon: '📋', text: '计划表' },
      { to: '/milestone', name: 'milestone', icon: '🎯', text: '里程碑' },
      { to: '/meeting', name: 'meeting', icon: '🗣️', text: '组会记录' },
      { to: '/inspiration', name: 'inspiration', icon: '💡', text: '灵感板' },
    ]
  },
  {
    key: 'team', label: '团队',
    items: [
      { to: '/team', name: 'team', icon: '🏆', text: '排行榜' },
    ]
  },
  {
    key: 'life', label: '生活',
    items: [
      { to: '/checkin', name: 'checkin', icon: '✅', text: '打卡' },
      { to: '/pomodoro', name: 'pomodoro', icon: '🍅', text: '番茄钟' },
      { to: '/water', name: 'water', icon: '💧', text: '喝水' },
      { to: '/meal', name: 'meal', icon: '🍜', text: '吃什么' },
    ]
  },
]

export default {
  name: 'SidebarNav',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['close'],
  data() {
    return {
      user: getCurrentUser(),
      sections: SECTIONS,
      openSections: this.getInitialOpen()
    }
  },
  methods: {
    getInitialOpen() {
      const routeName = this.$route?.name
      const open = {}
      for (const s of SECTIONS) {
        open[s.key] = s.items.some(i => i.name === routeName)
      }
      return open
    },
    isOpen(key) { return !!this.openSections[key] },
    toggleSection(key) { this.openSections = { ...this.openSections, [key]: !this.openSections[key] } },
    handleLogout() {
      const user = getCurrentUser()
      if (user) stopPresence(user.username, user.nickname)
      logout()
      this.$router.push('/login')
    }
  },
  watch: {
    '$route'(to) {
      this.user = getCurrentUser()
      for (const s of this.sections) {
        if (s.items.some(i => i.name === to.name)) {
          this.openSections = { ...this.openSections, [s.key]: true }
        }
      }
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--header-h);
  left: 0;
  width: var(--sidebar-w);
  height: calc(100vh - var(--header-h));
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  z-index: 90;
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-group {
  margin-bottom: 2px;
}

.nav-section {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 8px 12px 4px;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  transition: color 0.15s;
}

.nav-section:hover {
  color: var(--text-secondary);
}

.section-arrow {
  font-size: 8px;
  transition: transform 0.2s;
  display: inline-block;
  width: 10px;
}

.section-arrow.open {
  transform: rotate(90deg);
}

.nav-group-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.nav-icon {
  font-size: 14px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.external-links {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.ext-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.ext-link:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.ext-icon { font-size: 14px; }

.btn-logout {
  width: 100%;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.btn-logout:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.version {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
}
</style>
