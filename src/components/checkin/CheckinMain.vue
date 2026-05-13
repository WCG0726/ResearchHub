<template>
  <div class="checkin-main">
    <div class="checkin-status">
      <div v-if="clockStatus.clockedOut" class="status-done">
        <span class="status-icon">🏠</span>
        <span class="status-text">今日已下班</span>
      </div>
      <div v-else-if="clockStatus.clockedIn" class="status-working">
        <span class="status-icon pulse">💼</span>
        <span class="status-text">上班中 · {{ clockStatus.clockInTime }}</span>
      </div>
      <div v-else class="status-waiting">
        <span class="status-icon">🌅</span>
        <span class="status-text">今日尚未打卡</span>
      </div>
    </div>

    <!-- 大圆按钮 -->
    <button
      class="clock-btn"
      :class="{ 'clocked-in': clockStatus.clockedIn, 'clocked-out': clockStatus.clockedOut }"
      @click="clockStatus.clockedOut ? null : clockStatus.clockedIn ? $emit('clock-out') : $emit('clock-in')"
      :disabled="clockStatus.clockedOut"
    >
      <span class="clock-btn-icon">{{ clockStatus.clockedOut ? '✓' : clockStatus.clockedIn ? '🏠' : '⏰' }}</span>
      <span class="clock-btn-text">{{ clockStatus.clockedOut ? '已完成' : clockStatus.clockedIn ? '下班打卡' : '上班打卡' }}</span>
    </button>

    <!-- 工时统计 -->
    <div class="time-info">
      <div v-if="clockStatus.clockedOut" class="time-row">
        <span class="time-label">上班 {{ clockStatus.clockInTime }}</span>
        <span class="time-sep">→</span>
        <span class="time-label">下班 {{ clockStatus.clockOutTime }}</span>
        <span class="time-sep">·</span>
        <span class="time-highlight">{{ clockStatus.duration }}</span>
      </div>
      <div v-else-if="clockStatus.clockedIn" class="time-row">
        <span class="time-label">已工作</span>
        <span class="time-highlight">{{ workingDuration }}</span>
      </div>
      <div v-else class="time-row">
        <span class="time-label">签到后开始计时</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  clockStatus: { type: Object, default: () => ({ clockedIn: false, clockedOut: false }) },
  workingDuration: { type: String, default: '0:00' },
})

defineEmits(['clock-in', 'clock-out'])
</script>

<style scoped>
.checkin-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  margin-bottom: 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
}

.checkin-status {
  margin-bottom: 24px;
}

.status-icon {
  font-size: 24px;
  margin-right: 8px;
}

.status-icon.pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
}

.status-working .status-text {
  color: var(--success);
}

/* 大圆按钮 */
.clock-btn {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: none;
  background: var(--gradient-primary);
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.clock-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--refraction);
  pointer-events: none;
}

.clock-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45);
}

.clock-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.clock-btn:disabled {
  opacity: 0.6;
  cursor: default;
  background: var(--bg-surface);
  box-shadow: none;
}

.clock-btn.clocked-out {
  background: var(--success);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.35);
}

.clock-btn.clocked-in {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.35);
}

.clock-btn-icon {
  font-size: 48px;
  line-height: 1;
}

.clock-btn-text {
  font-size: 16px;
  font-weight: 600;
}

/* 工时信息 */
.time-info {
  margin-top: 24px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.time-sep {
  color: var(--text-muted);
}

.time-highlight {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 600px) {
  .clock-btn { width: 130px; height: 130px; }
  .clock-btn-icon { font-size: 36px; }
}
</style>
