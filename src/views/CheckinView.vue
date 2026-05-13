<template>
  <div class="checkin-page">
    <!-- 周日历条 -->
    <div class="week-bar">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="week-day"
        :class="{ today: day.isToday, checked: day.isChecked, weekend: day.isWeekend }"
      >
        <span class="week-day-label">{{ day.weekday }}</span>
        <span class="week-day-num">{{ day.date }}</span>
        <span v-if="day.isChecked" class="week-check">✓</span>
      </div>
    </div>

    <!-- 主打卡区 -->
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
        @click="clockStatus.clockedOut ? null : clockStatus.clockedIn ? doClockOut() : doClockIn()"
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

    <!-- 统计条 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-val">{{ streak.current }}</span>
        <span class="stat-lbl">🔥 连续打卡</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">{{ streak.longest }}</span>
        <span class="stat-lbl">🏆 最长连续</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">{{ streak.total }}</span>
        <span class="stat-lbl">📊 累计打卡</span>
      </div>
      <div class="stat-item">
        <span class="stat-val">{{ rankInfo.tier.icon }}</span>
        <span class="stat-lbl">{{ rankInfo.tier.name }} · {{ rankInfo.xp }} XP</span>
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
          <span v-for="day in ['日','一','二','三','四','五','六']" :key="day" class="weekday">{{ day }}</span>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCheckinsStore } from '../stores/checkins'
import { useCalendarEventsStore } from '../stores/calendarEvents'
import { usePomodoroStore } from '../stores/pomodoro'
import { useRecordsStore } from '../stores/records'
import { useLitNotesStore } from '../stores/litNotes'
import { useExperimentsStore } from '../stores/experiments'
import { useMilestonesStore } from '../stores/milestones'
import { useMeetingsStore } from '../stores/meetings'
import { useInspirationsStore } from '../stores/inspirations'
import { calculateXP, getTier } from '../utils/rank'
import { toDateString, formatTime } from '../utils/date'

const checkinsStore = useCheckinsStore()
const calendarEventsStore = useCalendarEventsStore()
const pomodoroStore = usePomodoroStore()
const recordsStore = useRecordsStore()
const litNotesStore = useLitNotesStore()
const experimentsStore = useExperimentsStore()
const milestonesStore = useMilestonesStore()
const meetingsStore = useMeetingsStore()
const inspirationsStore = useInspirationsStore()

const clockStatus = ref({ clockedIn: false, clockedOut: false })
const streak = ref({ current: 0, longest: 0, total: 0 })
const checkins = ref({})
const events = ref({})
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const selectedDay = ref(null)
const newEventText = ref('')
const newEventColor = ref('#6366f1')
const newEventRecurring = ref(false)
const _workingDuration = ref('0:00')

let _durationTimer = null

// 周日历条
const weekDays = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    const dateStr = toDateString(d)
    result.push({
      date: d.getDate(),
      weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      dateStr,
      isToday: i === dayOfWeek,
      isChecked: !!checkins.value[dateStr],
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    })
  }
  return result
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date().toISOString().split('T')[0]
  const days = []

  const startWeekday = firstDay.getDay()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const dateStr = toDateString(d)
    days.push(makeDay(d.getDate(), dateStr, false, today))
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const dateStr = toDateString(d)
    days.push(makeDay(i, dateStr, true, today))
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dateStr = toDateString(d)
    days.push(makeDay(i, dateStr, false, today))
  }

  return days
})

const dayEvents = computed(() => {
  if (!selectedDay.value) return []
  return calendarEventsStore.eventsForDate(selectedDay.value.fullDate)
})

const rankInfo = computed(() => {
  const s = checkinsStore.streak
  const xp = calculateXP({
    checkinDays: s.total,
    maxStreak: s.longest,
    currentStreak: s.current,
    pomodoroCount: pomodoroStore.total,
    recordsCount: recordsStore.records.length,
    litNotesCount: litNotesStore.notes.length,
    experimentsCount: experimentsStore.experiments.length,
    milestonesCount: milestonesStore.milestones.filter(m => m.done).length,
    meetingsCount: meetingsStore.meetings.length,
    inspirationsCount: inspirationsStore.inspirations.length,
  })
  return getTier(xp)
})

const workingDuration = computed(() => _workingDuration.value)

function makeDay(date, dateStr, isCurrentMonth, today) {
  const d = new Date(dateStr)
  const weekday = d.getDay()
  return {
    date,
    fullDate: dateStr,
    currentMonth: isCurrentMonth,
    isToday: dateStr === today,
    isWeekend: weekday === 0 || weekday === 6,
    isChecked: !!checkins.value[dateStr],
    hasEvent: !!(events.value[dateStr] && events.value[dateStr].length),
    eventText: (events.value[dateStr] || []).map(e => e.text).join(', ')
  }
}

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
}

function goToday() {
  const n = new Date()
  currentYear.value = n.getFullYear()
  currentMonth.value = n.getMonth() + 1
}

function onDayClick(day) {
  selectedDay.value = day
}

function addEvent() {
  if (!newEventText.value.trim() || !selectedDay.value) return
  calendarEventsStore.add(selectedDay.value.fullDate, {
    text: newEventText.value.trim(),
    color: newEventColor.value,
    recurring: newEventRecurring.value
  })
  events.value = calendarEventsStore.events
  newEventText.value = ''
  newEventRecurring.value = false
}

function removeEvent(eventId, originalDate) {
  if (!selectedDay.value) return
  const date = originalDate || selectedDay.value.fullDate
  calendarEventsStore.remove(date, eventId)
  events.value = calendarEventsStore.events
}

function doClockIn() {
  if (checkinsStore.clockIn()) loadData()
}

function doClockOut() {
  if (checkinsStore.clockOut()) loadData()
}

function updateWorkingDuration() {
  if (clockStatus.value.clockedIn && clockStatus.value.clockInTime) {
    const [h, m] = clockStatus.value.clockInTime.split(':').map(Number)
    const now = new Date()
    const diff = (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m)
    if (diff >= 0) {
      const hrs = Math.floor(diff / 60)
      const mins = diff % 60
      _workingDuration.value = `${hrs}:${String(mins).padStart(2, '0')}`
    }
  }
}

function loadData() {
  checkinsStore.forceLoad()
  calendarEventsStore.forceLoad()
  checkins.value = checkinsStore.checkins
  streak.value = checkinsStore.streak
  clockStatus.value = checkinsStore.clockStatus
  events.value = calendarEventsStore.events
  updateWorkingDuration()
}

onMounted(() => {
  loadData()
  _durationTimer = setInterval(updateWorkingDuration, 60000)
})
</script>

<style scoped>
.checkin-page {
  max-width: 800px;
}

/* 周日历条 */
.week-bar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius);
  position: relative;
  transition: all 0.2s;
}

.week-day.today {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.week-day.checked:not(.today) {
  background: rgba(16, 185, 129, 0.1);
}

.week-day-label {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
}

.week-day.today .week-day-label {
  opacity: 0.9;
}

.week-day-num {
  font-size: 16px;
  font-weight: 600;
}

.week-day.weekend:not(.today) {
  color: var(--danger);
}

.week-check {
  font-size: 10px;
  color: var(--success);
  font-weight: 700;
}

.week-day.today .week-check {
  color: white;
}

/* 主打卡区 */
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
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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

/* 统计条 */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-val {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-lbl {
  font-size: 12px;
  color: var(--text-muted);
}

/* 日历卡片 */
.calendar-card {
  margin-bottom: 24px;
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

/* 段位卡片 */
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

@media (max-width: 600px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .clock-btn { width: 130px; height: 130px; }
  .clock-btn-icon { font-size: 36px; }
  .week-bar { gap: 3px; padding: 8px 10px; }
}
</style>
