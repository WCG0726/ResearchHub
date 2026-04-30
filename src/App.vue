<template>
  <div class="app" :class="{ 'dark': isDark }">
    <template v-if="!isLoginPage">
      <HeaderNav :is-dark="isDark" @toggle-theme="toggleTheme" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="layout">
        <SidebarNav :open="sidebarOpen" @close="sidebarOpen = false" />
        <main class="main" @click="sidebarOpen = false">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </template>
    <router-view v-else />
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue'
import SidebarNav from './components/SidebarNav.vue'
import { getTheme, setTheme } from './utils/storage'
import { getCurrentUser } from './utils/auth'
import { initPresence, stopPresence } from './utils/presence'

export default {
  name: 'App',
  components: { HeaderNav, SidebarNav },
  data() {
    return {
      isDark: getTheme() === 'dark',
      sidebarOpen: false
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
      setTheme(this.isDark ? 'dark' : 'light')
    },
    manageHeartbeat() {
      const user = getCurrentUser()
      if (user) {
        initPresence(user.username, user.nickname)
      } else {
        stopPresence()
      }
    }
  },
  mounted() {
    setTheme(this.isDark ? 'dark' : 'light')
    this.manageHeartbeat()
  },
  unmounted() {
    const user = getCurrentUser()
    if (user) stopPresence(user.username, user.nickname)
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
