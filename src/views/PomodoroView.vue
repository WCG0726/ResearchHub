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

<script>
import { getPomodoroStats, addPomodoroSession } from '../utils/storage'
import { formatDateTime } from '../utils/date'

export default {
  name: 'PomodoroView',
  data() {
    return {
      workMin: 25,
      breakMin: 5,
      remaining: 25 * 60,
      running: false,
      paused: false,
      isBreak: false,
      timer: null,
      stats: { total: 0, today: 0, todayDate: '', history: [] }
    }
  },
  computed: {
    displayTime() {
      const m = Math.floor(this.remaining / 60)
      const s = this.remaining % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    },
    todayMinutes() {
      const today = new Date().toISOString().split('T')[0]
      return this.stats.history.filter(h => h.date === today).reduce((sum, h) => sum + h.minutes, 0)
    },
    recentHistory() {
      return [...this.stats.history].reverse().slice(0, 20)
    }
  },
  methods: {
    start() {
      if (this.paused) {
        this.paused = false
      }
      this.running = true
      this.timer = setInterval(() => {
        if (this.remaining > 0) {
          this.remaining--
        } else {
          this.finishSession()
        }
      }, 1000)
    },
    pause() {
      this.running = false
      this.paused = true
      clearInterval(this.timer)
    },
    reset() {
      this.running = false
      this.paused = false
      this.isBreak = false
      clearInterval(this.timer)
      this.remaining = this.workMin * 60
    },
    finishSession() {
      clearInterval(this.timer)
      this.running = false
      this.paused = false
      if (!this.isBreak) {
        this.stats = addPomodoroSession(this.workMin)
        this.isBreak = true
        this.remaining = this.breakMin * 60
        this.notify('专注完成！休息一下吧 🎉')
      } else {
        this.isBreak = false
        this.remaining = this.workMin * 60
        this.notify('休息结束，继续加油！💪')
      }
    },
    notify(msg) {
      if (Notification.permission === 'granted') {
        new Notification('番茄钟', { body: msg })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
      alert(msg)
    },
    formatTime(iso) {
      const d = new Date(iso)
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  },
  mounted() {
    this.stats = getPomodoroStats()
    this.remaining = this.workMin * 60
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.pomodoro-page { max-width: 600px; }
.timer-card { text-align: center; padding: 40px 24px; margin-bottom: 30px; }
.timer-display {
  font-size: 80px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  color: var(--text-primary);
  letter-spacing: 4px;
  transition: color 0.3s;
}
.timer-display.running { color: var(--primary); }
.timer-display.break { color: var(--success); }
.timer-label { font-size: 16px; color: var(--text-secondary); margin-bottom: 24px; }
.timer-settings { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; }
.setting { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.setting label { font-size: 12px; color: var(--text-muted); }
.input-sm { width: 70px; text-align: center; padding: 6px 8px; }
.timer-controls { display: flex; justify-content: center; gap: 12px; }
.btn-lg { padding: 12px 32px; font-size: 16px; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
.stat-card { text-align: center; padding: 20px; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.history-card { padding: 20px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.history-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0; }
.history-time { font-weight: 600; color: var(--text-primary); }
.history-date { color: var(--text-muted); font-size: 13px; }
</style>
