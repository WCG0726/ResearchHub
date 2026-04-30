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
      <div class="user-avatar">
        <span>R</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderNav',
  props: {
    isDark: Boolean
  },
  emits: ['toggle-theme', 'toggle-sidebar']
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
}

@media (max-width: 900px) {
  .menu-btn {
    display: block;
  }
}
</style>
