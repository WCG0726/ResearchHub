<template>
  <aside class="sidebar" :class="{ open }">
    <div v-if="open" class="sidebar-backdrop" @click="$emit('close')"></div>
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
        <span class="nav-icon">📊</span>
        <span class="nav-text">工作台</span>
      </router-link>

      <template v-for="section in sections" :key="section.key">
        <!-- 单项目分组：直链 -->
        <router-link
          v-if="section.items.length === 1"
          :to="section.items[0].to"
          class="nav-item"
          :class="{ active: $route.name === section.items[0].name }"
        >
          <span class="nav-icon">{{ section.items[0].icon }}</span>
          <span class="nav-text">{{ section.items[0].text }}</span>
        </router-link>
        <!-- 多项目分组：折叠 -->
        <div v-else class="nav-group">
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
      </template>

      <div class="nav-divider"></div>

      <router-link
        v-for="link in directLinks"
        :key="link.to"
        :to="link.to"
        class="nav-item"
        :class="{ active: $route.name === link.name }"
      >
        <span class="nav-icon">{{ link.icon }}</span>
        <span class="nav-text">{{ link.text }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
      <div class="version">v2.5.0</div>
    </div>
  </aside>
</template>

<script>
import { getCurrentUser, logout } from '../utils/auth'
import { stopPresence } from '../utils/presence'

const SECTIONS = [
  {
    key: 'daily', label: '日常工作', defaultOpen: true,
    items: [
      { to: '/checkin', name: 'checkin', icon: '✅', text: '打卡' },
      { to: '/pomodoro', name: 'pomodoro', icon: '🍅', text: '番茄钟' },
      { to: '/records', name: 'records', icon: '📝', text: '科研记录' },
      { to: '/experiment', name: 'experiment', icon: '🔬', text: '实验记录' },
      { to: '/writing', name: 'writing', icon: '📄', text: '论文写作' },
      { to: '/lit-notes', name: 'lit-notes', icon: '📖', text: '文献笔记' },
      { to: '/inspiration', name: 'inspiration', icon: '💡', text: '灵感板' },
    ]
  },
  {
    key: 'project', label: '项目与团队',
    items: [
      { to: '/plan', name: 'plan', icon: '📋', text: '计划表' },
      { to: '/milestone', name: 'milestone', icon: '🎯', text: '里程碑' },
      { to: '/meeting', name: 'meeting', icon: '🗣️', text: '组会记录' },
      { to: '/progress', name: 'progress', icon: '📈', text: '科研进度' },
    ]
  },
  {
    key: 'tools', label: '工具箱',
    items: [
      { to: '/translate', name: 'translate', icon: '🌐', text: '翻译' },
      { to: '/polish', name: 'polish', icon: '✨', text: '润色' },
      { to: '/format-rewrite', name: 'format-rewrite', icon: '🔄', text: '格式改写' },
      { to: '/latex-snippets', name: 'latex-snippets', icon: 'Σ', text: 'LaTeX' },
      { to: '/email-templates', name: 'email-templates', icon: '📧', text: '邮件模板' },
      { to: '/links', name: 'links', icon: '🔗', text: '学术导航' },
      { to: '/zotero', name: 'zotero', icon: '📚', text: 'Zotero' },
      { to: '/bug-scanner', name: 'bug-scanner', icon: '🔍', text: 'Bug 检测' },
    ]
  },
]

const DIRECT_LINKS = [
  { to: '/team', name: 'team', icon: '🏆', text: '排行榜' },
  { to: '/guide', name: 'guide', icon: '📘', text: '写作指南' },
  { to: '/water', name: 'water', icon: '💧', text: '喝水' },
  { to: '/meal', name: 'meal', icon: '🍜', text: '吃什么' },
  { to: '/settings', name: 'settings', icon: '⚙️', text: '设置' },
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
      directLinks: DIRECT_LINKS,
      openSections: this.getInitialOpen()
    }
  },
  methods: {
    getInitialOpen() {
      const routeName = this.$route?.name
      const open = {}
      for (const s of SECTIONS) {
        open[s.key] = s.defaultOpen || s.items.some(i => i.name === routeName)
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
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.78);
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.12), transparent 50%, rgba(139, 92, 246, 0.08));
}

.dark .sidebar {
  background: rgba(15, 23, 42, 0.76);
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

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 12px;
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
  box-shadow: inset 3px 0 0 var(--primary), 0 0 12px rgba(99, 102, 241, 0.08);
  font-weight: 600;
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
