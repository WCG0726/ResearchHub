<template>
  <div class="card">
    <div class="rank-header">
      <h3 class="card-title" style="margin-bottom:0">排行榜</h3>
      <div class="rank-tabs">
        <button v-for="tab in tabs" :key="tab.key" class="rank-tab" :class="{ active: rankBy === tab.key }" @click="$emit('update:rankBy', tab.key)">{{ tab.label }}</button>
      </div>
    </div>

    <div class="rank-list">
      <div
        v-for="(entry, idx) in list"
        :key="entry.username"
        class="rank-item"
        :class="{ 'is-me': entry.username === currentUser }"
      >
        <div class="rank-pos">
          <span v-if="idx === 0" class="rank-medal">🥇</span>
          <span v-else-if="idx === 1" class="rank-medal">🥈</span>
          <span v-else-if="idx === 2" class="rank-medal">🥉</span>
          <span v-else class="rank-num">{{ idx + 1 }}</span>
        </div>
        <div class="rank-avatar-wrap">
          <div class="rank-avatar">{{ entry.nickname.charAt(0) }}</div>
          <span class="online-dot" :class="{ online: entry.online }"></span>
        </div>
        <div class="rank-info">
          <div class="rank-name-row">
            <span class="rank-name">{{ entry.nickname }}</span>
            <span v-if="entry.tier" class="rank-tier-badge" :style="{ color: entry.tier.color }">{{ entry.tier.icon }}</span>
            <span v-if="entry.username === currentUser" class="rank-me-tag">我</span>
          </div>
          <span class="rank-status" :class="{ online: entry.online }">{{ entry.online ? '在线' : entry.lastSeen }}</span>
        </div>
        <div class="rank-value">
          {{ entry[rankBy] || 0 }}
          <span class="rank-unit">{{ unit }}</span>
        </div>
      </div>

      <div v-if="list.length === 0" class="empty">
        <div class="empty-text">暂无数据，快去打卡吧！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  list: { type: Array, default: () => [] },
  rankBy: { type: String, default: 'xp' },
  unit: { type: String, default: '' },
  currentUser: { type: String, default: '' },
  tabs: { type: Array, default: () => [] },
})

defineEmits(['update:rankBy'])
</script>

<style scoped>
.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rank-tabs { display: flex; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }

.rank-tab {
  padding: 6px 14px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.rank-tab.active {
  background: var(--primary);
  color: white;
}

.rank-list { display: flex; flex-direction: column; gap: 8px; }

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  transition: all 0.2s;
}

.rank-item.is-me {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.rank-pos { width: 32px; text-align: center; flex-shrink: 0; }
.rank-medal { font-size: 24px; }
.rank-num { font-size: 16px; font-weight: 600; color: var(--text-muted); }

.rank-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.rank-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  background: var(--text-muted);
}

.online-dot.online {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.rank-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.rank-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-name { font-weight: 500; color: var(--text-primary); font-size: 15px; }

.rank-status {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-status.online {
  color: #22c55e;
  font-weight: 500;
}

.rank-me-tag {
  padding: 1px 6px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  border-radius: 4px;
}

.rank-tier-badge {
  font-size: 16px;
  flex-shrink: 0;
}

.rank-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.rank-unit {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}
</style>
