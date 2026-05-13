<template>
  <div class="checkin-page">
    <!-- 周日历条 -->
    <CheckinWeekBar :week-days="weekDays" />

    <!-- 主打卡区 -->
    <CheckinMain
      :clock-status="clockStatus"
      :working-duration="workingDuration"
      @clock-in="doClockIn"
      @clock-out="doClockOut"
    />

    <!-- 统计条 -->
    <CheckinStats
      :streak="streak"
      :rank-icon="rankInfo.tier.icon"
      :rank-name="rankInfo.tier.name"
      :rank-xp="rankInfo.xp"
    />

    <!-- 打卡日历 -->
    <CheckinCalendar
      :year="currentYear"
      :month="currentMonth"
      :calendar-days="calendarDays"
      :selected-day="selectedDay"
      :checkins="checkins"
      :day-events="dayEvents"
      :new-event-text="newEventText"
      :new-event-color="newEventColor"
      :new-event-recurring="newEventRecurring"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @go-today="goToday"
      @day-click="onDayClick"
      @close-detail="selectedDay = null"
      @remove-event="removeEvent"
      @add-event="addEvent"
      @update:newEventText="newEventText = $event"
      @update:newEventColor="newEventColor = $event"
      @update:newEventRecurring="newEventRecurring = $event"
    />

    <!-- 学术段位 -->
    <CheckinRank :rank-info="rankInfo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CheckinWeekBar from '../components/checkin/CheckinWeekBar.vue'
import CheckinMain from '../components/checkin/CheckinMain.vue'
import CheckinCalendar from '../components/checkin/CheckinCalendar.vue'
import CheckinStats from '../components/checkin/CheckinStats.vue'
import CheckinRank from '../components/checkin/CheckinRank.vue'
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

onUnmounted(() => {
  if (_durationTimer) clearInterval(_durationTimer)
})
</script>

<style scoped>
.checkin-page {
  max-width: 800px;
}
</style>
