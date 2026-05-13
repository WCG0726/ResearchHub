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
      <span class="header-clock">{{ currentTime }}</span>
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

    <ProfileEditor
      :show="showEditor"
      :profile="profile"
      @close="showEditor = false"
      @save="onSaveProfile"
    />

    <GlobalSearch
      :show="showSearch"
      :query="searchQuery"
      :results="searchResults"
      :selected-index="selectedIndex"
      @close="showSearch = false"
      @update:query="onSearchInput"
      @move="moveSelection"
      @go="goToSelected"
      @go-to="goTo"
      @select="selectedIndex = $event"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCurrentUser } from '../utils/auth.js'
import { useProfileStore } from '../stores/profile.js'
import { useRecordsStore } from '../stores/records.js'
import { useLitNotesStore } from '../stores/litNotes.js'
import { useInspirationsStore } from '../stores/inspirations.js'
import { useMeetingsStore } from '../stores/meetings.js'
import { useExperimentsStore } from '../stores/experiments.js'
import { usePlansStore } from '../stores/plans.js'
import { useMilestonesStore } from '../stores/milestones.js'
import { useWritingStore } from '../stores/writing.js'
import ProfileEditor from './ProfileEditor.vue'
import GlobalSearch from './GlobalSearch.vue'

defineProps({
  isDark: { type: Boolean, default: false },
})

defineEmits(['toggle-theme', 'toggle-sidebar'])

const router = useRouter()
const route = useRoute()

const profileStore = useProfileStore()
const recordsStore = useRecordsStore()
const litNotesStore = useLitNotesStore()
const inspirationsStore = useInspirationsStore()
const meetingsStore = useMeetingsStore()
const experimentsStore = useExperimentsStore()
const plansStore = usePlansStore()
const milestonesStore = useMilestonesStore()
const writingStore = useWritingStore()

const showEditor = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const debouncedQuery = ref('')
const selectedIndex = ref(0)
const currentTime = ref('')
let _searchTimer = null
let _clockTimer = null

const profile = computed(() => {
  profileStore.load()
  const user = getCurrentUser()
  const p = { ...profileStore.profile }
  if (user && user.nickname) p.nickname = user.nickname
  return p
})

const searchResults = computed(() => {
  const q = debouncedQuery.value.toLowerCase()
  if (!q) return []
  const results = []

  const routeHints = [
    { to: '/', name: 'dashboard', icon: '📊', text: '工作台', keywords: ['工作台', 'dashboard', '首页', '主页'] },
    { to: '/checkin', name: 'checkin', icon: '✅', text: '打卡', keywords: ['打卡', 'checkin', '签到'] },
    { to: '/pomodoro', name: 'pomodoro', icon: '🍅', text: '番茄钟', keywords: ['番茄', 'pomodoro', '计时'] },
    { to: '/records', name: 'records', icon: '📝', text: '科研记录', keywords: ['记录', 'records'] },
    { to: '/experiment', name: 'experiment', icon: '🔬', text: '实验记录', keywords: ['实验', 'experiment'] },
    { to: '/writing', name: 'writing', icon: '📄', text: '论文写作', keywords: ['论文', 'writing', '写作'] },
    { to: '/lit-notes', name: 'lit-notes', icon: '📖', text: '文献笔记', keywords: ['文献', '笔记', 'lit', 'notes'] },
    { to: '/inspiration', name: 'inspiration', icon: '💡', text: '灵感板', keywords: ['灵感', 'inspiration'] },
    { to: '/plan', name: 'plan', icon: '📋', text: '计划表', keywords: ['计划', 'plan', 'todo'] },
    { to: '/milestone', name: 'milestone', icon: '🎯', text: '里程碑', keywords: ['里程碑', 'milestone'] },
    { to: '/meeting', name: 'meeting', icon: '🗣️', text: '组会记录', keywords: ['组会', 'meeting', '会议'] },
    { to: '/progress', name: 'progress', icon: '📈', text: '科研进度', keywords: ['进度', 'progress'] },
    { to: '/team', name: 'team', icon: '🏆', text: '排行榜', keywords: ['排行', 'team', '排名'] },
    { to: '/translate', name: 'translate', icon: '🌐', text: '翻译', keywords: ['翻译', 'translate'] },
    { to: '/polish', name: 'polish', icon: '✨', text: '润色', keywords: ['润色', 'polish'] },
    { to: '/latex-snippets', name: 'latex-snippets', icon: 'Σ', text: 'LaTeX', keywords: ['latex', '公式'] },
    { to: '/email-templates', name: 'email-templates', icon: '📧', text: '邮件模板', keywords: ['邮件', 'email', '模板'] },
    { to: '/links', name: 'links', icon: '🔗', text: '学术导航', keywords: ['导航', 'links', '学术网站'] },
    { to: '/zotero', name: 'zotero', icon: '📚', text: 'Zotero', keywords: ['zotero', '文献管理'] },
    { to: '/guide', name: 'guide', icon: '📘', text: '写作指南', keywords: ['指南', 'guide', '写作指南'] },
    { to: '/water', name: 'water', icon: '💧', text: '喝水', keywords: ['喝水', 'water'] },
    { to: '/meal', name: 'meal', icon: '🍜', text: '吃什么', keywords: ['吃', 'meal', '饭'] },
    { to: '/settings', name: 'settings', icon: '⚙️', text: '设置', keywords: ['设置', 'settings', '配置'] },
  ]

  for (const r of routeHints) {
    if (r.keywords.some(k => k.includes(q)) || r.text.toLowerCase().includes(q)) {
      results.push({ key: 'route-' + r.name, icon: r.icon, title: r.text, meta: '跳转到 ' + r.text, type: '页面', to: r.to })
    }
  }

  recordsStore.load()
  litNotesStore.load()
  inspirationsStore.load()
  meetingsStore.load()
  experimentsStore.load()
  plansStore.load()
  milestonesStore.load()
  writingStore.load()

  for (const r of recordsStore.records) {
    if ((r.title && r.title.toLowerCase().includes(q)) || (r.content && r.content.toLowerCase().includes(q))) {
      results.push({ key: 'record-' + r.id, icon: '📝', title: r.title, meta: (r.content || '').slice(0, 60), type: '记录', to: '/records' })
    }
  }
  for (const n of litNotesStore.notes) {
    if ((n.title && n.title.toLowerCase().includes(q)) || (n.authors && n.authors.toLowerCase().includes(q))) {
      results.push({ key: 'lit-' + n.id, icon: '📖', title: n.title, meta: n.authors || '', type: '笔记', to: '/lit-notes' })
    }
  }
  for (const i of inspirationsStore.inspirations) {
    if ((i.title && i.title.toLowerCase().includes(q)) || (i.content && i.content.toLowerCase().includes(q))) {
      results.push({ key: 'insp-' + i.id, icon: '💡', title: i.title, meta: (i.content || '').slice(0, 60), type: '灵感', to: '/inspiration' })
    }
  }
  for (const m of meetingsStore.meetings) {
    if ((m.topics && m.topics.toLowerCase().includes(q)) || (m.feedback && m.feedback.toLowerCase().includes(q))) {
      results.push({ key: 'meet-' + m.id, icon: '🗣️', title: m.date + ' ' + (m.type || ''), meta: (m.topics || '').slice(0, 60), type: '会议', to: '/meeting' })
    }
  }
  for (const e of experimentsStore.experiments) {
    if ((e.title && e.title.toLowerCase().includes(q)) || (e.content && e.content.toLowerCase().includes(q))) {
      results.push({ key: 'exp-' + e.id, icon: '🔬', title: e.title, meta: (e.content || '').slice(0, 60), type: '实验', to: '/experiment' })
    }
  }
  for (const p of plansStore.plans) {
    if (p.title && p.title.toLowerCase().includes(q)) {
      results.push({ key: 'plan-' + p.id, icon: '📋', title: p.title, meta: p.done ? '已完成' : '进行中', type: '计划', to: '/plan' })
    }
  }
  for (const m of milestonesStore.milestones) {
    if (m.title && m.title.toLowerCase().includes(q)) {
      results.push({ key: 'ms-' + m.id, icon: '🎯', title: m.title, meta: m.done ? '已完成' : '进行中', type: '里程碑', to: '/milestone' })
    }
  }
  for (const w of writingStore.papers) {
    if (w.title && w.title.toLowerCase().includes(q)) {
      results.push({ key: 'paper-' + (w.id || w.title), icon: '📄', title: w.title, meta: w.status || '', type: '论文', to: '/writing' })
    }
  }
  return results.slice(0, 12)
})

function onSearchInput(val) {
  searchQuery.value = val
  selectedIndex.value = 0
  clearTimeout(_searchTimer)
  _searchTimer = setTimeout(() => { debouncedQuery.value = val }, 300)
}

function openSearch() {
  showSearch.value = true
  searchQuery.value = ''
  debouncedQuery.value = ''
  selectedIndex.value = 0
}

function moveSelection(delta) {
  const max = searchResults.value.length - 1
  selectedIndex.value = Math.max(0, Math.min(max, selectedIndex.value + delta))
}

function goToSelected() {
  if (searchResults.value.length) {
    goTo(searchResults.value[selectedIndex.value])
  }
}

function goTo(r) {
  showSearch.value = false
  if (r.to && route.path !== r.to) {
    router.push(r.to)
  }
}

function onSaveProfile(data) {
  profileStore.updateProfile(data)
  showEditor.value = false
}

onMounted(() => {
  const updateClock = () => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  updateClock()
  _clockTimer = setInterval(updateClock, 1000)

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
  })
})

onUnmounted(() => {
  clearTimeout(_searchTimer)
  clearInterval(_clockTimer)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.72);
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1), transparent);
}

.dark .header {
  background: rgba(15, 23, 42, 0.70);
  border-bottom-color: rgba(51, 65, 85, 0.6);
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
  font-weight: 800;
  letter-spacing: -0.02em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 24px;
  -webkit-text-fill-color: initial;
  animation: float 4s ease-in-out infinite;
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
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  transition: transform var(--transition), box-shadow var(--transition);
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
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

.header-clock {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: var(--radius);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  min-width: 80px;
  text-align: center;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-surface);
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
}

.search-trigger:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
  background: var(--bg-primary);
}

.search-hint {
  font-size: 11px;
  opacity: 0.6;
}

@media (max-width: 900px) {
  .menu-btn { display: block; }
  .user-name { display: none; }
  .search-hint { display: none; }
  .header-clock { display: none; }
}
</style>
