<template>
  <div class="stats-cards">
    <div class="stats-card" style="--accent: #6366f1">
      <div class="stats-card-icon">⏱️</div>
      <div class="stats-card-body">
        <div class="stats-card-value">{{ todayHours }}</div>
        <div class="stats-card-label">今日工时</div>
      </div>
    </div>
    <div class="stats-card" style="--accent: #10b981">
      <div class="stats-card-icon">✅</div>
      <div class="stats-card-body">
        <div class="stats-card-value">{{ pendingTodos }}</div>
        <div class="stats-card-label">本周待办</div>
      </div>
    </div>
    <div class="stats-card" style="--accent: #f59e0b">
      <div class="stats-card-icon">🎯</div>
      <div class="stats-card-body">
        <div class="stats-card-value">{{ milestoneProgress }}%</div>
        <div class="stats-card-label">里程碑进度</div>
      </div>
    </div>
    <div class="stats-card" style="--accent: #ef4444">
      <div class="stats-card-icon">🔥</div>
      <div class="stats-card-body">
        <div class="stats-card-value">{{ streak }}</div>
        <div class="stats-card-label">连续打卡</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  todayHours: { type: String, default: '0h' },
  pendingTodos: { type: Number, default: 0 },
  milestoneProgress: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stats-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent, var(--primary));
}

.stats-card-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--accent, var(--primary)) 10%, transparent);
}

.stats-card-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent, var(--primary));
  line-height: 1.2;
}

.stats-card-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

@media (max-width: 768px) {
  .stats-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
