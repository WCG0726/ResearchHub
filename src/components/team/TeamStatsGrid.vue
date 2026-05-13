<template>
  <div class="stats-grid">
    <div v-for="stat in stats" :key="stat.label" class="stat-card" :style="{ '--accent': stat.color }">
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
      <div class="stat-icon">{{ stat.icon }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Array, default: () => [] },
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
}

.stat-value { font-size: 32px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.stat-icon { position: absolute; top: 12px; right: 12px; font-size: 20px; opacity: 0.5; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
