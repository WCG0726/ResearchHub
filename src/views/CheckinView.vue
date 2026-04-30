<template>
  <div class="checkin-page">
    <h1 class="page-title">打卡</h1>

    <!-- 打卡按钮 -->
    <div class="card checkin-card">
      <div v-if="isCheckedIn" class="checkin-success">
        <div class="success-icon">✅</div>
        <h2>今日已打卡</h2>
        <p>打卡时间：{{ checkinTime }}</p>
        <div class="streak-info">
          <div class="streak-item">
            <span class="streak-value">{{ streak.current }}</span>
            <span class="streak-label">连续天数</span>
          </div>
          <div class="streak-item">
            <span class="streak-value">{{ streak.total }}</span>
            <span class="streak-label">累计打卡</span>
          </div>
        </div>
      </div>
      <div v-else class="checkin-prompt">
        <div class="prompt-icon">📅</div>
        <h2>今日尚未打卡</h2>
        <p>坚持每天打卡，养成科研好习惯</p>
        <button class="btn btn-primary btn-xl" @click="doCheckin">立即打卡</button>
      </div>
    </div>

    <!-- 打卡日历 -->
    <div class="card calendar-card">
      <h3 class="card-title">{{ currentMonth }}</h3>
      <div class="calendar">
        <div class="calendar-header">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>
        <div class="calendar-body">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': !day.currentMonth,
              'is-today': day.isToday,
              'is-checked': day.isChecked
            }"
          >
            <span class="day-number">{{ day.date }}</span>
            <span v-if="day.isChecked" class="check-mark">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ streak.current }}</div>
        <div class="stat-label">🔥 当前连续</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ streak.longest }}</div>
        <div class="stat-label">🏆 最长连续</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ streak.total }}</div>
        <div class="stat-label">📊 累计打卡</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCheckins, getStreak, checkinToday } from '../utils/storage'

export default {
  name: 'CheckinView',
  data() {
    return {
      isCheckedIn: false,
      checkinTime: '',
      streak: { current: 0, longest: 0, total: 0 },
      checkins: {},
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    currentMonthText() {
      return `${this.currentYear} 年 ${this.currentMonth} 月`
    },
    calendarDays() {
      const year = this.currentYear
      const month = this.currentMonth - 1
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const days = []

      // 填充上月日期
      const startWeekday = firstDay.getDay()
      for (let i = startWeekday - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        days.push({
          date: d.getDate(),
          currentMonth: false,
          isToday: false,
          isChecked: false,
          fullDate: d.toISOString().split('T')[0]
        })
      }

      // 本月日期
      const today = new Date().toISOString().split('T')[0]
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i)
        const dateStr = d.toISOString().split('T')[0]
        days.push({
          date: i,
          currentMonth: true,
          isToday: dateStr === today,
          isChecked: !!this.checkins[dateStr],
          fullDate: dateStr
        })
      }

      // 填充下月日期
      const remaining = 42 - days.length
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i)
        days.push({
          date: i,
          currentMonth: false,
          isToday: false,
          isChecked: false,
          fullDate: d.toISOString().split('T')[0]
        })
      }

      return days
    }
  },
  methods: {
    doCheckin() {
      const result = checkinToday()
      if (result) {
        this.isCheckedIn = true
        this.checkinTime = new Date().toLocaleTimeString('zh-CN')
        this.loadData()
      }
    },
    loadData() {
      this.checkins = getCheckins()
      this.streak = getStreak()

      const today = new Date().toISOString().split('T')[0]
      if (this.checkins[today]) {
        this.isCheckedIn = true
        this.checkinTime = new Date(this.checkins[today].time).toLocaleTimeString('zh-CN')
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.checkin-page {
  max-width: 800px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
}

.checkin-card {
  text-align: center;
  padding: 40px;
  margin-bottom: 30px;
}

.checkin-success .success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.checkin-success h2 {
  color: var(--success);
  margin-bottom: 8px;
}

.checkin-success p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.streak-info {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.streak-item {
  display: flex;
  flex-direction: column;
}

.streak-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.streak-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.checkin-prompt .prompt-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.checkin-prompt h2 {
  margin-bottom: 8px;
}

.checkin-prompt p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-xl {
  padding: 16px 48px;
  font-size: 18px;
  border-radius: var(--radius-lg);
}

.calendar-card {
  margin-bottom: 30px;
}

.calendar {
  margin-top: 16px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-size: 14px;
  position: relative;
  cursor: default;
}

.calendar-day.other-month {
  color: var(--text-muted);
  opacity: 0.4;
}

.calendar-day.is-today {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.calendar-day.is-checked {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.calendar-day.is-today.is-checked {
  background: var(--success);
  color: white;
}

.check-mark {
  font-size: 10px;
  position: absolute;
  bottom: 4px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>
