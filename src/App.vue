<template>
  <div class="app" :class="{ 'dark': isDark }">
    <template v-if="!isLoginPage">
      <HeaderNav :is-dark="isDark" @toggle-theme="toggleTheme" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="layout">
        <SidebarNav :open="sidebarOpen" @close="sidebarOpen = false" />
        <main class="main" @click="sidebarOpen = false">
          <ErrorBoundary>
            <router-view v-slot="{ Component }">
              <transition name="page" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </ErrorBoundary>
        </main>
      </div>
    </template>
    <router-view v-else />
    <QuickNote v-if="!isLoginPage" :show="showQuickNote" @close="showQuickNote = false" />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import QuickNote from './components/QuickNote.vue'
import { useProfileStore } from './stores/profile'
import { getCurrentUser } from './utils/auth'
import { initPresence, stopPresence } from './utils/presence'

export default {
  name: 'App',
  components: { HeaderNav, SidebarNav, ErrorBoundary, QuickNote },
  data() {
    return {
      _profileStore: useProfileStore(),
      isDark: false,
      sidebarOpen: false,
      showQuickNote: false
    }
  },
  computed: {
    isLoginPage() {
      return this.$route.name === 'login'
    }
  },
  watch: {
    '$route'() {
      this.manageHeartbeat()
      this.sidebarOpen = false
    }
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark
      this._profileStore.toggleTheme()
    },
    manageHeartbeat() {
      const user = getCurrentUser()
      if (user) {
        initPresence(user.username, user.nickname)
      } else {
        stopPresence()
      }
    },
    handleKeydown(e) {
      // Ctrl+K: 全局搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('.search-trigger')?.click()
      }
      // Ctrl+N: 新建记录
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (this.$route.name === 'records') {
          document.querySelector('.btn-primary')?.click()
        } else {
          this.$router.push('/records')
        }
      }
      // Ctrl+Shift+D: 切换主题
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        this.toggleTheme()
      }
      // Ctrl+Shift+N: 快捷笔记
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        this.showQuickNote = !this.showQuickNote
      }
    }
  },
  created() {
    this._profileStore.load()
    this.isDark = this._profileStore.theme === 'dark'
    this._profileStore.setTheme(this._profileStore.theme)
  },
  mounted() {
    this.manageHeartbeat()
    document.addEventListener('keydown', this.handleKeydown)
  },
  unmounted() {
    const user = getCurrentUser()
    if (user) stopPresence(user.username, user.nickname)
    document.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style>
@import './assets/styles/variables.css';
@import './assets/styles/main.css';

.app {
  min-height: 100vh;
}

.layout {
  display: flex;
  padding-top: var(--header-h);
}

.main {
  flex: 1;
  margin-left: var(--sidebar-w);
  padding: 30px 40px;
  min-height: calc(100vh - var(--header-h));
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .main {
    margin-left: 0;
    padding: 20px;
  }
}
</style>
