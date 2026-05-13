<template>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-val">{{ streak.current }}</span>
      <span class="stat-lbl">🔥 连续打卡</span>
    </div>
    <div class="stat-item">
      <span class="stat-val">{{ streak.longest }}</span>
      <span class="stat-lbl">🏆 最长连续</span>
    </div>
    <div class="stat-item">
      <span class="stat-val">{{ streak.total }}</span>
      <span class="stat-lbl">📊 累计打卡</span>
    </div>
    <div class="stat-item">
      <span class="stat-val">{{ rankIcon }}</span>
      <span class="stat-lbl">{{ rankName }} · {{ rankXp }} XP</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  streak: { type: Object, default: () => ({ current: 0, longest: 0, total: 0 }) },
  rankIcon: { type: String, default: '⭐' },
  rankName: { type: String, default: '新手' },
  rankXp: { type: Number, default: 0 },
})
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-val {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-lbl {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 600px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
}
</style>
