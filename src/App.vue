<template>
  <div class="app" :class="{ 'dark': isDark }">
    <template v-if="!isLoginPage">
      <HeaderNav :is-dark="isDark" @toggle-theme="toggleTheme" />
      <div class="layout">
        <SidebarNav />
        <main class="main">
          <router-view />
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
      isDark: getTheme() === 'dark'
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

@media (max-width: 900px) {
  .main {
    margin-left: 0;
    padding: 20px;
  }
}
</style>
