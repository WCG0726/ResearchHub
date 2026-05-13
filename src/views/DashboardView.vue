<template>
  <div class="dashboard">
    <!-- 顶部欢迎区 -->
    <DashboardWelcome
      :nickname="nickname"
      :greeting="greeting"
      :today-text="todayText"
      :weekday-text="weekdayText"
      :rank-info="rankInfo"
      :quote="quote"
    />

    <!-- 统计卡片行 -->
    <DashboardStats
      :today-hours="todayHours"
      :pending-todos="pendingTodos"
      :milestone-progress="milestoneProgress"
      :streak="streak.current"
    />

    <div class="dashboard-grid">
      <!-- 左列 -->
      <DashboardMain
        :clocked-in="clockStatus.clockedIn"
        :clock-status="clockStatus"
        :todos="todos"
        :recent-records="recentRecords"
        :recent-inspirations="recentInspirations"
        :recent-lit-notes="recentLitNotes"
      />

      <!-- 右列 -->
      <DashboardSide
        :mini-year="miniYear"
        :mini-month="miniMonth"
        :calendar-days="miniCalendarDays"
        :water-data="waterData"
        :water-percent="waterPercent"
        :bug-counts="bugCounts"
        :runtime-error-count="runtimeErrorCount"
        :events="upcomingEvents"
        @mini-prev="miniPrev"
        @mini-next="miniNext"
        @water-add="waterAdd"
        @water-remove="waterRemove"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardStats from '../components/dashboard/DashboardStats.vue'
import DashboardMain from '../components/dashboard/DashboardMain.vue'
import DashboardSide from '../components/dashboard/DashboardSide.vue'
import DashboardWelcome from '../components/dashboard/DashboardWelcome.vue'
import { toDateString } from '../utils/date'
import { useCalendarEventsStore } from '../stores/calendarEvents'
import { generateCalendarDays } from '../utils/calendar'
import { getRandomQuote } from '../data/quotes'
import { useRecordsStore } from '../stores/records'
import { useLitNotesStore } from '../stores/litNotes'
import { useInspirationsStore } from '../stores/inspirations'
import { usePlansStore } from '../stores/plans'
import { useCheckinsStore } from '../stores/checkins'
import { useProfileStore } from '../stores/profile'
import { usePomodoroStore } from '../stores/pomodoro'
import { useExperimentsStore } from '../stores/experiments'
import { useMeetingsStore } from '../stores/meetings'
import { useMilestonesStore } from '../stores/milestones'
import { useWaterStore } from '../stores/water'
import { useBugScannerStore } from '../stores/bugScanner'
import { calculateXP, getTier } from '../utils/rank'

const profileStore = useProfileStore()
const checkinsStore = useCheckinsStore()
const recordsStore = useRecordsStore()
const inspirationsStore = useInspirationsStore()
const litNotesStore = useLitNotesStore()
const plansStore = usePlansStore()
const pomodoroStore = usePomodoroStore()
const experimentsStore = useExperimentsStore()
const meetingsStore = useMeetingsStore()
const milestonesStore = useMilestonesStore()
const waterStore = useWaterStore()
const bugScannerStore = useBugScannerStore()
const calendarEventsStore = useCalendarEventsStore()

const quote = getRandomQuote()
const now = new Date()
const miniYear = ref(now.getFullYear())
const miniMonth = ref(now.getMonth() + 1)
const events = ref({})

// Load all stores
profileStore.load()
checkinsStore.load()
recordsStore.load()
inspirationsStore.load()
litNotesStore.load()
plansStore.load()
pomodoroStore.load()
experimentsStore.load()
meetingsStore.load()
milestonesStore.load()
waterStore.load()

const nickname = computed(() => profileStore.profile.nickname)
const streak = computed(() => checkinsStore.streak)
const clockStatus = computed(() => checkinsStore.clockStatus)
const recentRecords = computed(() => recordsStore.recentRecords)
const recentInspirations = computed(() => inspirationsStore.recentInspirations)
const recentLitNotes = computed(() => litNotesStore.recentNotes)
const todos = computed(() => plansStore.todos)
const waterData = computed(() => waterStore.todayData)
const waterPercent = computed(() => {
  const d = waterStore.todayData
  return d.goal ? Math.round(d.cups / d.goal * 100) : 0
})
const bugCounts = computed(() => bugScannerStore.errorCounts)
const runtimeErrorCount = computed(() => bugScannerStore.runtimeErrors.length)

// Stats cards
const todayHours = computed(() => {
  const status = checkinsStore.clockStatus
  if (status.clockedOut) return status.duration || '0h'
  if (status.clockedIn && status.clockInTime) {
    const [h, m] = status.clockInTime.split(':').map(Number)
    const now = new Date()
    const diff = (now.getHours() - h) + (now.getMinutes() - m) / 60
    return diff > 0 ? diff.toFixed(1) + 'h' : '0h'
  }
  return '0h'
})

const pendingTodos = computed(() => plansStore.plans.filter(p => !p.done).length)

const milestoneProgress = computed(() => {
  const ms = milestonesStore.milestones
  if (ms.length === 0) return 0
  return Math.round(ms.filter(m => m.done).length / ms.length * 100)
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

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const todayText = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const weekdayText = computed(() => {
  return '星期' + ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]
})

const miniCalendarDays = computed(() => {
  return generateCalendarDays(miniYear.value, miniMonth.value - 1, checkinsStore.checkins, events.value)
})

const upcomingEvents = computed(() => {
  const today = new Date()
  const result = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const ds = toDateString(d)
    const evs = events.value[ds]
    if (evs) {
      for (const ev of evs) {
        result.push({
          ...ev,
          date: ds,
          dateLabel: i === 0 ? '今天' : i === 1 ? '明天' : `${d.getMonth() + 1}月${d.getDate()}日`
        })
      }
    }
  }
  return result.slice(0, 8)
})

function miniPrev() {
  if (miniMonth.value === 1) { miniMonth.value = 12; miniYear.value-- }
  else miniMonth.value--
}

function miniNext() {
  if (miniMonth.value === 12) { miniMonth.value = 1; miniYear.value++ }
  else miniMonth.value++
}

function waterAdd() { waterStore.addCup() }
function waterRemove() { waterStore.removeCup() }

onMounted(() => {
  calendarEventsStore.load()
  events.value = calendarEventsStore.events
})
</script>

<style scoped>
.dashboard { max-width: 1200px; }

/* 双栏布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
