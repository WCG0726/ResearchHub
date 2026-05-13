<template>
  <div class="pomodoro-page">
    <h1 class="page-title">番茄钟</h1>

    <div class="timer-card card">
      <div class="timer-display" :class="{ running: running, break: isBreak }">
        {{ displayTime }}
      </div>
      <div class="timer-label">{{ isBreak ? '休息时间' : '专注时间' }}</div>

      <div class="timer-settings">
        <div class="setting">
          <label>专注 (分钟)</label>
          <input v-model.number="workMin" type="number" min="1" max="120" class="input input-sm" :disabled="running" />
        </div>
        <div class="setting">
          <label>休息 (分钟)</label>
          <input v-model.number="breakMin" type="number" min="1" max="60" class="input input-sm" :disabled="running" />
        </div>
      </div>

      <div class="timer-controls">
        <button v-if="!running" class="btn btn-primary btn-lg" @click="start">{{ paused ? '继续' : '开始专注' }}</button>
        <button v-else class="btn btn-outline btn-lg" @click="pause">暂停</button>
        <button class="btn btn-outline btn-lg" @click="reset">重置</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-value">{{ stats.today }}</div>
        <div class="stat-label">今日番茄</div>
      </div>
      <div class="stat-card card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">累计番茄</div>
      </div>
      <div class="stat-card card">
        <div class="stat-value">{{ todayMinutes }}</div>
        <div class="stat-label">今日专注(分)</div>
      </div>
    </div>

    <!-- 最近记录 -->
    <div v-if="recentHistory.length > 0" class="card history-card">
      <h3 class="card-title">最近记录</h3>
      <div class="history-list">
        <div v-for="(h, i) in recentHistory" :key="i" class="history-item">
          <span class="history-dot"></span>
          <span class="history-time">{{ h.minutes }} 分钟</span>
          <span class="history-date">{{ formatTime(h.time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro'
import { formatDateTime } from '../utils/date'

const pomodoroStore = usePomodoroStore()

const workMin = ref(25)
const breakMin = ref(5)
const remaining = ref(25 * 60)
const running = ref(false)
const paused = ref(false)
const isBreak = ref(false)
const timer = ref(null)
const stats = ref({ total: 0, today: 0, todayDate: '', history: [] })

const displayTime = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const todayMinutes = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return stats.value.history.filter(h => h.date === today).reduce((sum, h) => sum + h.minutes, 0)
})

const recentHistory = computed(() => {
  return [...stats.value.history].reverse().slice(0, 20)
})

function start() {
  if (paused.value) {
    paused.value = false
  }
  running.value = true
  timer.value = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
    } else {
      finishSession()
    }
  }, 1000)
}

function pause() {
  running.value = false
  paused.value = true
  clearInterval(timer.value)
}

function reset() {
  running.value = false
  paused.value = false
  isBreak.value = false
  clearInterval(timer.value)
  remaining.value = workMin.value * 60
}

function finishSession() {
  clearInterval(timer.value)
  running.value = false
  paused.value = false
  if (!isBreak.value) {
    pomodoroStore.addSession(workMin.value)
    stats.value = pomodoroStore.stats
    isBreak.value = true
    remaining.value = breakMin.value * 60
    notify('专注完成！休息一下吧 🎉')
  } else {
    isBreak.value = false
    remaining.value = workMin.value * 60
    notify('休息结束，继续加油！💪')
  }
}

function notify(msg) {
  if (Notification.permission === 'granted') {
    new Notification('番茄钟', { body: msg })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission()
  }
  alert(msg)
}

function formatTime(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  pomodoroStore.load()
  stats.value = pomodoroStore.stats
  remaining.value = workMin.value * 60
})

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<style scoped>
.pomodoro-page { max-width: 500px; }
.timer-card { text-align: center; padding: 32px 20px; margin-bottom: 24px; }
.timer-display {
  font-size: 64px;
  font-weight: 700;
  font-family: 'Consolas', 'SF Mono', monospace;
  color: var(--text-primary);
  letter-spacing: 3px;
  transition: color 0.3s;
}
.timer-display.running { color: var(--primary); }
.timer-display.break { color: var(--success); }
.timer-label { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }
.timer-settings { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
.setting { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.setting label { font-size: 12px; color: var(--text-muted); }
.input-sm { width: 64px; text-align: center; padding: 6px 8px; font-size: 13px; }
.timer-controls { display: flex; justify-content: center; gap: 10px; }
.btn-lg { padding: 10px 28px; font-size: 15px; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.stat-card { text-align: center; padding: 16px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.history-card { padding: 16px; }
.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.history-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); flex-shrink: 0; }
.history-time { font-weight: 600; color: var(--text-primary); }
.history-date { color: var(--text-muted); font-size: 12px; }
</style>
