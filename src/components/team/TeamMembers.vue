<template>
  <div class="card">
    <h3 class="card-title">团队成员 <span class="online-count">{{ onlineCount }} 人在线</span></h3>
    <div class="member-list">
      <div v-for="member in members" :key="member.username" class="member-item">
        <div class="member-avatar-wrap">
          <div class="member-avatar">{{ member.nickname.charAt(0) }}</div>
          <span class="online-dot" :class="{ online: member.online }"></span>
        </div>
        <div class="member-info">
          <span class="member-name">{{ member.nickname }}</span>
          <span class="member-join">加入于 {{ formatDate(member.createdAt) }} · <span :class="{ 'text-online': member.online }">{{ member.online ? '在线' : member.lastSeen }}</span></span>
        </div>
        <span v-if="member.username === currentUser" class="tag tag-primary">当前用户</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate as formatDateUtil } from '../../utils/date'

defineProps({
  members: { type: Array, default: () => [] },
  onlineCount: { type: Number, default: 0 },
  currentUser: { type: String, default: '' },
})

function formatDate(dateStr) {
  return dateStr ? formatDateUtil(dateStr) : ''
}
</script>

<style scoped>
.online-count {
  font-size: 13px;
  font-weight: 400;
  color: #22c55e;
  margin-left: 8px;
}

.member-list { display: flex; flex-direction: column; gap: 8px; }

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.member-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.member-avatar {
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

.member-info { flex: 1; }
.member-name { display: block; font-weight: 500; color: var(--text-primary); font-size: 14px; }
.member-join { font-size: 12px; color: var(--text-muted); }
.text-online { color: #22c55e; font-weight: 500; }
</style>
