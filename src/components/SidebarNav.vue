<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <div class="nav-section">科研</div>
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
        <span class="nav-icon">📊</span>
        <span class="nav-text">工作台</span>
      </router-link>
      <router-link to="/records" class="nav-item" :class="{ active: $route.name === 'records' }">
        <span class="nav-icon">📝</span>
        <span class="nav-text">科研记录</span>
      </router-link>
      <router-link to="/writing" class="nav-item" :class="{ active: $route.name === 'writing' }">
        <span class="nav-icon">📄</span>
        <span class="nav-text">论文写作</span>
      </router-link>
      <router-link to="/guide" class="nav-item" :class="{ active: $route.name === 'guide' }">
        <span class="nav-icon">📚</span>
        <span class="nav-text">写作指南</span>
      </router-link>

      <div class="nav-section">工具</div>
      <router-link to="/translate" class="nav-item" :class="{ active: $route.name === 'translate' }">
        <span class="nav-icon">🌐</span>
        <span class="nav-text">翻译工具</span>
      </router-link>
      <router-link to="/polish" class="nav-item" :class="{ active: $route.name === 'polish' }">
        <span class="nav-icon">✨</span>
        <span class="nav-text">润色提示词</span>
      </router-link>

      <div class="nav-section">生活</div>
      <router-link to="/checkin" class="nav-item" :class="{ active: $route.name === 'checkin' }">
        <span class="nav-icon">✅</span>
        <span class="nav-text">打卡</span>
      </router-link>
      <router-link to="/plan" class="nav-item" :class="{ active: $route.name === 'plan' }">
        <span class="nav-icon">📋</span>
        <span class="nav-text">计划表</span>
      </router-link>
      <router-link to="/water" class="nav-item" :class="{ active: $route.name === 'water' }">
        <span class="nav-icon">💧</span>
        <span class="nav-text">喝水</span>
      </router-link>
      <router-link to="/meal" class="nav-item" :class="{ active: $route.name === 'meal' }">
        <span class="nav-icon">🍜</span>
        <span class="nav-text">吃什么</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="version">v1.1.0</div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'SidebarNav'
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
  padding: 16px 12px;
  z-index: 90;
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 12px 16px 4px;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
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
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.version {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
}
</style>
