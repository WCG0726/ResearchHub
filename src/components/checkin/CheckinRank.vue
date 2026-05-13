<template>
  <div class="card rank-card">
    <div class="rank-display">
      <span class="rank-big-icon">{{ rankInfo.tier.icon }}</span>
      <div class="rank-info">
        <div class="rank-tier-name" :style="{ color: rankInfo.tier.color }">{{ rankInfo.tier.name }}</div>
        <div class="rank-xp-text">{{ rankInfo.xp }} XP</div>
        <div v-if="rankInfo.nextTier" class="rank-progress-wrap">
          <div class="rank-progress-bar-lg">
            <div class="rank-progress-fill-lg" :style="{ width: (rankInfo.progress * 100) + '%', background: rankInfo.nextTier.color }"></div>
          </div>
          <span class="rank-progress-label">距 {{ rankInfo.nextTier.name }} 还需 {{ rankInfo.nextTier.minXP - rankInfo.xp }} XP</span>
        </div>
        <div v-else class="rank-max-text">已达到最高段位！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rankInfo: { type: Object, default: () => ({ tier: { icon: '⭐', color: '#6366f1', name: '新手' }, xp: 0 }) },
})
</script>

<style scoped>
.rank-card {
  padding: 24px;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 20px;
}

.rank-big-icon { font-size: 48px; }

.rank-info { flex: 1; }

.rank-tier-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.rank-xp-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.rank-progress-wrap { display: flex; flex-direction: column; gap: 4px; }

.rank-progress-bar-lg {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.rank-progress-fill-lg {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.rank-progress-label {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-max-text {
  font-size: 14px;
  color: var(--warning);
  font-weight: 500;
}
</style>
