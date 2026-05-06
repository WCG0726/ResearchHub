<template>
  <div class="checkin-page">
    <h1 class="page-title">打卡</h1>

    <!-- 上班/下班打卡 -->
    <div class="card checkin-card">
      <!-- 已下班 -->
      <div v-if="clockStatus.clockedOut" class="checkin-success">
        <div class="success-icon">🏠</div>
        <h2>今日已下班</h2>
        <div class="clock-detail">
          <div class="clock-row">
            <span class="clock-label">上班时间</span>
            <span class="clock-value">{{ clockStatus.clockInTime }}</span>
          </div>
          <div class="clock-row">
            <span class="clock-label">下班时间</span>
            <span class="clock-value">{{ clockStatus.clockOutTime }}</span>
          </div>
          <div class="clock-row highlight">
            <span class="clock-label">工作时长</span>
            <span class="clock-value">{{ clockStatus.duration }}</span>
          </div>
        </div>
      </div>
      <!-- 已上班未下班 -->
      <div v-else-if="clockStatus.clockedIn" class="checkin-success">
        <div class="success-icon">💼</div>
        <h2>上班打卡成功</h2>
        <p>上班时间：{{ clockStatus.clockInTime }}</p>
        <button class="btn btn-primary btn-xl" @click="doClockOut">下班打卡</button>
      </div>
      <!-- 未打卡 -->
      <div v-else class="checkin-prompt">
        <div class="prompt-icon">🌅</div>
        <h2>今日尚未打卡</h2>
        <p>开始新的一天，加油！</p>
        <button class="btn btn-primary btn-xl" @click="doClockIn">上班打卡</button>
      </div>
    </div>

    <!-- 打卡日历 -->
    <div class="card calendar-card">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">◀</button>
        <h3 class="card-title" style="margin:0">{{ currentYear }} 年 {{ currentMonth }} 月</h3>
        <button class="nav-btn" @click="nextMonth">▶</button>
        <button class="nav-btn today-btn" @click="goToday">今天</button>
      </div>
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
              'is-checked': day.isChecked,
              'has-event': day.hasEvent,
              'is-weekend': day.isWeekend
            }"
            @click="onDayClick(day)"
          >
            <span class="day-number">{{ day.date }}</span>
            <span v-if="day.isChecked" class="check-mark">✓</span>
            <span v-if="day.hasEvent" class="event-dot" :title="day.eventText"></span>
          </div>
        </div>
      </div>
      <!-- 选中日期的事件列表 -->
      <div v-if="selectedDay" class="day-detail">
        <div class="day-detail-header">
          <h4>{{ selectedDay.fullDate }} {{ selectedDay.isToday ? '(今天)' : '' }}</h4>
          <button class="btn-close" @click="selectedDay = null">×</button>
        </div>
        <div v-if="selectedDay.isChecked" class="day-checkin-info">
          <span class="tag tag-success">已打卡</span>
          <span v-if="checkins[selectedDay.fullDate]?.clockIn" class="checkin-time-detail">
            上班 {{ formatTime(checkins[selectedDay.fullDate].clockIn) }}
            <template v-if="checkins[selectedDay.fullDate]?.clockOut">
              · 下班 {{ formatTime(checkins[selectedDay.fullDate].clockOut) }}
            </template>
          </span>
        </div>
        <div v-if="dayEvents.length" class="day-events">
          <div v-for="ev in dayEvents" :key="ev.id + (ev.isAnniversary ? '-anniv' : '')" class="event-item">
            <span class="event-color" :style="{ background: ev.color || '#6366f1' }"></span>
            <span class="event-text">{{ ev.text }}</span>
            <span v-if="ev.isAnniversary" class="anniversary-badge">纪念日</span>
            <button class="btn-del-event" @click="removeEvent(ev.id, ev.originalDate)">×</button>
          </div>
        </div>
        <div class="add-event">
          <input v-model="newEventText" type="text" placeholder="添加事件..." @keyup.enter="addEvent" />
          <input v-model="newEventColor" type="color" class="color-pick" />
          <label class="recurring-check">
            <input type="checkbox" v-model="newEventRecurring" />
            <span>每年重复</span>
          </label>
          <button class="btn btn-primary btn-sm" @click="addEvent">添加</button>
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

    <!-- 学术段位 -->
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
  </div>
</template>

<script>
import { useCheckinsStore } from '../stores/checkins'
import { useCalendarEventsStore } from '../stores/calendarEvents'
import { usePomodoroStore } from '../stores/pomodoro'
import { useRecordsStore } from '../stores/records'
import { useLitNotesStore } from '../stores/litNotes'
import { useExperimentsStore } from '../stores/experiments'
import { useMilestonesStore } from '../stores/milestones'
import { useMeetingsStore } from '../stores/meetings'
import { useInspirationsStore } from '../stores/inspirations'
import { calculateFromStores } from '../utils/rank'
import { toDateString, formatTime } from '../utils/date'

export default {
  name: 'CheckinView',
  data() {
    const now = new Date()
    return {
      _checkinsStore: useCheckinsStore(),
      _calendarEventsStore: useCalendarEventsStore(),
      _pomodoroStore: usePomodoroStore(),
      _recordsStore: useRecordsStore(),
      _litNotesStore: useLitNotesStore(),
      _experimentsStore: useExperimentsStore(),
      _milestonesStore: useMilestonesStore(),
      _meetingsStore: useMeetingsStore(),
      _inspirationsStore: useInspirationsStore(),
      clockStatus: { clockedIn: false, clockedOut: false },
      streak: { current: 0, longest: 0, total: 0 },
      checkins: {},
      events: {},
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      selectedDay: null,
      newEventText: '',
      newEventColor: '#6366f1',
      newEventRecurring: false
    }
  },
  computed: {
    calendarDays() {
      const year = this.currentYear
      const month = this.currentMonth - 1
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date().toISOString().split('T')[0]
      const days = []

      // 上月填充
      const startWeekday = firstDay.getDay()
      for (let i = startWeekday - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        const dateStr = this.formatDate(d)
        days.push(this.makeDay(d.getDate(), dateStr, false, today))
      }

      // 本月
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i)
        const dateStr = this.formatDate(d)
        days.push(this.makeDay(i, dateStr, true, today))
      }

      // 下月填充
      const remaining = 42 - days.length
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i)
        const dateStr = this.formatDate(d)
        days.push(this.makeDay(i, dateStr, false, today))
      }

      return days
    },
    dayEvents() {
      if (!this.selectedDay) return []
      return this._calendarEventsStore.eventsForDate(this.selectedDay.fullDate)
    },
    rankInfo() {
      return calculateFromStores({
        checkinsStore: this._checkinsStore,
        pomodoroStore: this._pomodoroStore,
        recordsStore: this._recordsStore,
        litNotesStore: this._litNotesStore,
        experimentsStore: this._experimentsStore,
        milestonesStore: this._milestonesStore,
        meetingsStore: this._meetingsStore,
        inspirationsStore: this._inspirationsStore,
      })
    },
  },
  methods: {
    formatDate(d) {
      return toDateString(d)
    },
    makeDay(date, dateStr, currentMonth, today) {
      const d = new Date(dateStr)
      const weekday = d.getDay()
      return {
        date,
        fullDate: dateStr,
        currentMonth,
        isToday: dateStr === today,
        isWeekend: weekday === 0 || weekday === 6,
        isChecked: !!this.checkins[dateStr],
        hasEvent: !!(this.events[dateStr] && this.events[dateStr].length),
        eventText: (this.events[dateStr] || []).map(e => e.text).join(', ')
      }
    },
    formatTime,
    prevMonth() {
      if (this.currentMonth === 1) {
        this.currentMonth = 12
        this.currentYear--
      } else {
        this.currentMonth--
      }
    },
    nextMonth() {
      if (this.currentMonth === 12) {
        this.currentMonth = 1
        this.currentYear++
      } else {
        this.currentMonth++
      }
    },
    goToday() {
      const now = new Date()
      this.currentYear = now.getFullYear()
      this.currentMonth = now.getMonth() + 1
    },
    onDayClick(day) {
      this.selectedDay = day
    },
    addEvent() {
      if (!this.newEventText.trim() || !this.selectedDay) return
      this._calendarEventsStore.add(this.selectedDay.fullDate, {
        text: this.newEventText.trim(),
        color: this.newEventColor,
        recurring: this.newEventRecurring
      })
      this.events = this._calendarEventsStore.events
      this.newEventText = ''
      this.newEventRecurring = false
    },
    removeEvent(eventId, originalDate) {
      if (!this.selectedDay) return
      const date = originalDate || this.selectedDay.fullDate
      this._calendarEventsStore.remove(date, eventId)
      this.events = this._calendarEventsStore.events
    },
    doClockIn() {
      if (this._checkinsStore.clockIn()) this.loadData()
    },
    doClockOut() {
      if (this._checkinsStore.clockOut()) this.loadData()
    },
    loadData() {
      this._checkinsStore.forceLoad()
      this._calendarEventsStore.forceLoad()
      this.checkins = this._checkinsStore.checkins
      this.streak = this._checkinsStore.streak
      this.clockStatus = this._checkinsStore.clockStatus
      this.events = this._calendarEventsStore.events
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

.clock-detail {
  max-width: 320px;
  margin: 0 auto;
}

.clock-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
}

.clock-row:last-child {
  border-bottom: none;
}

.clock-row.highlight {
  margin-top: 8px;
  padding: 12px 0;
  border-top: 2px solid var(--primary);
  border-bottom: none;
}

.clock-label {
  color: var(--text-secondary);
}

.clock-value {
  font-weight: 600;
  color: var(--text-primary);
}

.clock-row.highlight .clock-value {
  color: var(--primary);
  font-size: 18px;
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

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.today-btn {
  width: auto;
  padding: 0 12px;
  font-size: 13px;
  margin-left: auto;
}

.calendar {
  margin-top: 0;
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

.calendar-day.is-weekend {
  color: var(--danger);
}

.calendar-day.other-month.is-weekend {
  color: var(--text-muted);
}

.calendar-day.has-event {
  cursor: pointer;
}

.check-mark {
  font-size: 10px;
  position: absolute;
  bottom: 4px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  position: absolute;
  top: 4px;
  right: 4px;
}

.day-detail {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.day-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-detail-header h4 {
  font-size: 15px;
  margin: 0;
  color: var(--text-primary);
}

.btn-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.day-checkin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.checkin-time-detail {
  font-size: 13px;
  color: var(--text-secondary);
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--bg-primary);
  border-radius: var(--radius);
}

.event-item .anniversary-badge {
  font-size: 11px;
  padding: 1px 5px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  border-radius: 4px;
  flex-shrink: 0;
}

.event-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.btn-del-event {
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
}

.btn-del-event:hover {
  color: var(--danger);
}

.add-event {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-event input[type="text"] {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.add-event input[type="text"]:focus {
  outline: none;
  border-color: var(--primary);
}

.color-pick {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  padding: 2px;
}

.recurring-check {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

.recurring-check input {
  width: 14px;
  height: 14px;
  accent-color: var(--primary);
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

/* 段位卡片 */
.rank-card {
  margin-top: 20px;
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
