<template>
  <div class="welcome-section">
    <div class="welcome-left">
      <h1 class="welcome-title">{{ greeting }}，{{ nickname }}</h1>
      <p class="welcome-date">{{ todayText }} · {{ weekdayText }}</p>
      <div class="rank-badge" :style="{ '--rank-color': rankInfo.tier.color }">
        <span class="rank-icon">{{ rankInfo.tier.icon }}</span>
        <span class="rank-name">{{ rankInfo.tier.name }}</span>
        <span class="rank-xp">{{ rankInfo.xp }} XP</span>
        <div v-if="rankInfo.nextTier" class="rank-progress-bar">
          <div class="rank-progress-fill" :style="{ width: (rankInfo.progress * 100) + '%', background: rankInfo.nextTier.color }"></div>
        </div>
        <span v-if="rankInfo.nextTier" class="rank-next">距 {{ rankInfo.nextTier.name }} 还需 {{ rankInfo.nextTier.minXP - rankInfo.xp }} XP</span>
      </div>
    </div>
    <div class="welcome-right">
      <div class="welcome-quote">
        <span class="welcome-quote-text">"{{ quote.text }}"</span>
        <span class="welcome-quote-author">—— {{ quote.author }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nickname: { type: String, default: '' },
  greeting: { type: String, default: '' },
  todayText: { type: String, default: '' },
  weekdayText: { type: String, default: '' },
  rankInfo: { type: Object, default: () => ({ tier: { color: '#6366f1', icon: '⭐', name: '新手' }, xp: 0 }) },
  quote: { type: Object, default: () => ({ text: '科学是把双刃剑', author: '佚名' }) },
})
</script>

<style scoped>
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px;
  text-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
}

.welcome-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.rank-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.rank-icon { font-size: 18px; }

.rank-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--rank-color);
}

.rank-xp {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.rank-progress-bar {
  width: 120px;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.rank-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.rank-next {
  font-size: 11px;
  color: var(--text-muted);
}

.welcome-quote {
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  max-width: 320px;
}

.welcome-quote-text {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 4px;
}

.welcome-quote-author {
  font-size: 11px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .welcome-section { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
