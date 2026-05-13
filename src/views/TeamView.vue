<template>
  <div class="team-page">
    <h1 class="page-title">团队排行榜</h1>

    <TeamStatsGrid :stats="statsCards" />

    <TeamRankList
      :list="rankedList"
      :rank-by="rankBy"
      :unit="rankUnit"
      :current-user="currentUser"
      :tabs="rankTabs"
      @update:rankBy="rankBy = $event"
    />

    <TeamMembers
      :members="rankedList"
      :online-count="onlineCount"
      :current-user="currentUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCheckinsStore } from '../stores/checkins'
import { useRecordsStore } from '../stores/records'
import { useExperimentsStore } from '../stores/experiments'
import { useLitNotesStore } from '../stores/litNotes'
import { useMeetingsStore } from '../stores/meetings'
import { useInspirationsStore } from '../stores/inspirations'
import { usePomodoroStore } from '../stores/pomodoro'
import { useWritingStore } from '../stores/writing'
import { useMilestonesStore } from '../stores/milestones'
import { getCurrentUser } from '../utils/auth'
import { calculateXP, getTier } from '../utils/rank'
import { getAllPresence } from '../utils/presence'
import { formatDate as formatDateUtil } from '../utils/date'
import TeamStatsGrid from '../components/team/TeamStatsGrid.vue'
import TeamRankList from '../components/team/TeamRankList.vue'
import TeamMembers from '../components/team/TeamMembers.vue'

const checkinsStore = useCheckinsStore()
const recordsStore = useRecordsStore()
const experimentsStore = useExperimentsStore()
const litNotesStore = useLitNotesStore()
const meetingsStore = useMeetingsStore()
const inspirationsStore = useInspirationsStore()
const pomodoroStore = usePomodoroStore()
const writingStore = useWritingStore()
const milestonesStore = useMilestonesStore()

const rankBy = ref('xp')
const rankTabs = [
  { key: 'xp', label: '综合排名' },
  { key: 'streak', label: '连续打卡' },
  { key: 'total', label: '累计打卡' },
  { key: 'records', label: '科研记录' },
  { key: 'experiments', label: '实验记录' },
  { key: 'litNotes', label: '文献笔记' },
  { key: 'pomodoro', label: '番茄钟' },
  { key: 'inspirations', label: '灵感' },
]
const currentUser = ref('')
const myStats = ref({ streak: 0, totalCheckins: 0, records: 0, experiments: 0, litNotes: 0, pomodoro: 0, inspirations: 0, meetings: 0 })
const members = ref([])
const allStats = ref({})
const presenceData = ref({})

let refreshTimer = null

const statsCards = computed(() => [
  { label: '连续打卡天数', value: myStats.value.streak, icon: '🔥', color: 'var(--primary)' },
  { label: '累计打卡', value: myStats.value.totalCheckins, icon: '📅', color: 'var(--success)' },
  { label: '科研记录', value: myStats.value.records, icon: '📝', color: 'var(--warning)' },
  { label: '实验记录', value: myStats.value.experiments, icon: '🔬', color: 'var(--info)' },
  { label: '文献笔记', value: myStats.value.litNotes, icon: '📖', color: '#ec4899' },
  { label: '番茄钟数', value: myStats.value.pomodoro, icon: '🍅', color: '#8b5cf6' },
  { label: '灵感记录', value: myStats.value.inspirations, icon: '💡', color: '#06b6d4' },
  { label: '会议记录', value: myStats.value.meetings, icon: '🗣️', color: '#f97316' },
])

const rankUnit = computed(() => {
  const units = { xp: 'XP', streak: '天', total: '次', records: '条', experiments: '条', litNotes: '篇', pomodoro: '个', inspirations: '条', meetings: '次' }
  return units[rankBy.value] || ''
})

const rankedList = computed(() => {
  const presence = presenceData.value
  const list = members.value.map(m => {
    const p = presence[m.username]
    const online = p ? p.online === true : false
    const lastSeen = p ? (p.online ? '在线' : formatDiff(p.lastSeen)) : '从未活跃'
    const stats = allStats.value[m.username] || {}
    return { ...m, ...stats, online, lastSeen }
  })
  list.sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1
    return (b[rankBy.value] || 0) - (a[rankBy.value] || 0)
  })
  return list
})

const onlineCount = computed(() => {
  const presence = presenceData.value
  return members.value.filter(m => presence[m.username]?.online === true).length
})

function formatDiff(ts) {
  if (!ts) return '从未活跃'
  const diff = Date.now() - ts
  if (diff < 120000) return '在线'
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

function loadData() {
  const user = getCurrentUser()
  if (user) currentUser.value = user.username

  presenceData.value = getAllPresence()

  try {
    const localUsers = JSON.parse(localStorage.getItem('research_hub_users') || '{}')
    const presence = presenceData.value
    const allUsers = new Map()

    for (const [username, data] of Object.entries(localUsers)) {
      allUsers.set(username, { username, nickname: data.nickname || username, createdAt: data.createdAt })
    }

    for (const [username, data] of Object.entries(presence)) {
      if (!allUsers.has(username)) {
        allUsers.set(username, { username, nickname: data.nickname || username, createdAt: null })
      }
    }

    members.value = Array.from(allUsers.values())
  } catch {
    members.value = []
  }

  checkinsStore.load()
  recordsStore.load()
  experimentsStore.load()
  litNotesStore.load()
  pomodoroStore.load()
  inspirationsStore.load()
  meetingsStore.load()
  milestonesStore.load()

  const myData = {
    streak: checkinsStore.streak.current,
    total: Object.keys(checkinsStore.checkins).length,
    records: recordsStore.recordCount,
    experiments: experimentsStore.experimentCount,
    litNotes: litNotesStore.noteCount,
    pomodoro: pomodoroStore.total || 0,
    inspirations: inspirationsStore.inspirationCount,
    meetings: meetingsStore.meetingCount
  }
  myData.xp = calculateXP({
    checkinDays: myData.total,
    maxStreak: checkinsStore.streak.longest,
    currentStreak: myData.streak,
    pomodoroCount: myData.pomodoro,
    recordsCount: myData.records,
    litNotesCount: myData.litNotes,
    experimentsCount: myData.experiments,
    milestonesCount: milestonesStore.doneCount,
    meetingsCount: myData.meetings,
    inspirationsCount: myData.inspirations,
  })
  myData.tier = getTier(myData.xp).tier
  myStats.value = { ...myData, totalCheckins: myData.total }

  const stats = {}
  members.value.forEach(m => {
    if (m.username === currentUser.value) {
      stats[m.username] = myData
    } else {
      stats[m.username] = { streak: 0, total: 0, records: 0, experiments: 0, litNotes: 0, pomodoro: 0, inspirations: 0, meetings: 0, xp: 0, tier: getTier(0).tier }
    }
  })
  allStats.value = stats
}

onMounted(() => {
  loadData()
  refreshTimer = setInterval(() => loadData(), 15000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.team-page { max-width: 900px; }
</style>
