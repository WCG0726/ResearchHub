<template>
  <div class="app" :class="{ 'dark': isDark }">
    <AmbientBackground :is-login="isLoginPage" />
    <template v-if="!isLoginPage">
      <HeaderNav :is-dark="isDark" @toggle-theme="toggleTheme" @toggle-sidebar="sidebarOpen = !sidebarOpen" @toggle-collapse="sidebarCollapsed = !sidebarCollapsed" />
      <div class="layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <SidebarNav :open="sidebarOpen" :collapsed="sidebarCollapsed" @close="sidebarOpen = false" />
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
    <AIChatbot v-if="!isLoginPage && aiReady" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderNav from './components/HeaderNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import QuickNote from './components/QuickNote.vue'
import AmbientBackground from './components/AmbientBackground.vue'
import AIChatbot from './components/AIChatbot.vue'
import { useProfileStore } from './stores/profile'
import { getCurrentUser } from './utils/auth'
import { initPresence, stopPresence } from './utils/presence'
import { useBugScannerStore } from './stores/bugScanner'
import { isAIConfigured } from './utils/ai'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

const isDark = ref(false)
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const showQuickNote = ref(false)
const aiReady = ref(isAIConfigured())

const isLoginPage = computed(() => route.name === 'login')

// 初始化主题
profileStore.load()
isDark.value = profileStore.theme === 'dark'
profileStore.setTheme(profileStore.theme)

function toggleTheme() {
  isDark.value = !isDark.value
  profileStore.toggleTheme()
}

function manageHeartbeat() {
  const user = getCurrentUser()
  if (user) {
    initPresence(user.username, user.nickname)
  } else {
    stopPresence()
  }
}

// 错误处理
let onError, onUnhandled, vueErrorHandler

function initErrorHandlers() {
  const scanner = useBugScannerStore()
  onError = (event) => {
    scanner.addRuntimeError({
      type: 'error',
      message: event.message || 'Unknown error',
      filename: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0
    })
  }
  onUnhandled = (event) => {
    const msg = event.reason?.message || event.reason?.toString() || 'Unhandled rejection'
    scanner.addRuntimeError({ type: 'unhandledrejection', message: msg, filename: '', lineno: 0 })
  }
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onUnhandled)

  const { appContext } = getCurrentInstance()
  vueErrorHandler = (err, instance, info) => {
    scanner.addRuntimeError({
      type: 'vue',
      message: err.message || String(err),
      filename: instance?.$options?.name || 'UnknownComponent',
      lineno: 0,
      info
    })
  }
  appContext.app.config.errorHandler = vueErrorHandler
}

function removeErrorHandlers() {
  if (onError) window.removeEventListener('error', onError)
  if (onUnhandled) window.removeEventListener('unhandledrejection', onUnhandled)
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    document.querySelector('.search-trigger')?.click()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    if (route.name === 'records') {
      document.querySelector('.btn-primary')?.click()
    } else {
      router.push('/records')
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    toggleTheme()
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
    e.preventDefault()
    showQuickNote.value = !showQuickNote.value
  }
}

watch(() => route.name, () => {
  manageHeartbeat()
  sidebarOpen.value = false
})

onMounted(() => {
  manageHeartbeat()
  document.addEventListener('keydown', handleKeydown)
  initErrorHandlers()
})

onUnmounted(() => {
  const user = getCurrentUser()
  if (user) stopPresence(user.username, user.nickname)
  document.removeEventListener('keydown', handleKeydown)
  removeErrorHandlers()
})
</script>

<style>
@import './assets/styles/variables.css';
@import './assets/styles/main.css';

.app {
  min-height: 100vh;
  position: relative;
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
  transition: margin-left 0.25s ease;
}

.sidebar-collapsed .main {
  margin-left: var(--sidebar-w-collapsed);
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
