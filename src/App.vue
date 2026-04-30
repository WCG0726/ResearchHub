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
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark
      setTheme(this.isDark ? 'dark' : 'light')
    }
  },
  mounted() {
    setTheme(this.isDark ? 'dark' : 'light')
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
