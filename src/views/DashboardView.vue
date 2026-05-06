<template>
  <div class="dashboard">
    <!-- 顶部欢迎区 -->
    <div class="welcome-section">
      <div class="welcome-left">
        <h1 class="welcome-title">{{ greeting }}，{{ nickname }}</h1>
        <p class="welcome-date">{{ todayText }} · {{ weekdayText }}</p>
        <div class="rank-badge" :style="{ '--rank-color': rankInfo.tier.color }">
          <span class="rank-icon">{{ rankInfo.tier.icon }}</span>
          <span class="rank-name">{{ rankInfo.tier.name }}</span>
          <span class="rank-xp">{{ rankInfo.xp }} XP</span>
          <div v-if="rankInfo.nextTier" class="rank-progress-bar">
            <div class="rank-progress-fill" :style="{ width: (rankInfo.progress * 100) + '%', background: rankInfo.nextTier.color }"></div>
          </div>
          <span v-if="rankInfo.nextTier" class="rank-next">距 {{ rankInfo.nextTier.name }} 还需 {{ rankInfo.nextTier.minXP - rankInfo.xp }} XP</span>
        </div>
      </div>
      <div class="welcome-right">
        <div class="clock-display">
          <span class="clock-time">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 左列 -->
      <div class="dashboard-main">
        <!-- 快捷入口 -->
        <div class="quick-actions">
          <router-link to="/checkin" class="quick-btn" style="--color: #6366f1">
            <span class="quick-icon">⏰</span>
            <span>{{ clockStatus.clockedIn ? '去下班' : '上班打卡' }}</span>
          </router-link>
          <router-link to="/records" class="quick-btn" style="--color: #10b981">
            <span class="quick-icon">📝</span>
            <span>写记录</span>
          </router-link>
          <router-link to="/experiment" class="quick-btn" style="--color: #f59e0b">
            <span class="quick-icon">🔬</span>
            <span>实验</span>
          </router-link>
          <router-link to="/pomodoro" class="quick-btn" style="--color: #ef4444">
            <span class="quick-icon">🍅</span>
            <span>番茄钟</span>
          </router-link>
          <router-link to="/writing" class="quick-btn" style="--color: #06b6d4">
            <span class="quick-icon">📄</span>
            <span>论文</span>
          </router-link>
          <router-link to="/lit-notes" class="quick-btn" style="--color: #8b5cf6">
            <span class="quick-icon">📖</span>
            <span>文献笔记</span>
          </router-link>
          <router-link to="/translate" class="quick-btn" style="--color: #3b82f6">
            <span class="quick-icon">🌐</span>
            <span>翻译</span>
          </router-link>
          <router-link to="/inspiration" class="quick-btn" style="--color: #f97316">
            <span class="quick-icon">💡</span>
            <span>灵感</span>
          </router-link>
        </div>

        <!-- 打卡统计 -->
        <div class="stats-row">
          <div class="stat-chip">
            <span class="stat-chip-icon">🔥</span>
            <span class="stat-chip-value">{{ streak.current }}</span>
            <span class="stat-chip-label">连续打卡</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-icon">📊</span>
            <span class="stat-chip-value">{{ streak.total }}</span>
            <span class="stat-chip-label">累计打卡</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-icon">📝</span>
            <span class="stat-chip-value">{{ records.length }}</span>
            <span class="stat-chip-label">科研记录</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-icon">🏆</span>
            <span class="stat-chip-value">{{ streak.longest }}</span>
            <span class="stat-chip-label">最长连续</span>
          </div>
        </div>

        <!-- 今日考勤 -->
        <div class="card">
          <h3 class="card-title">📋 今日考勤</h3>
          <div v-if="clockStatus.clockedOut" class="attendance-done">
            <div class="att-item"><span class="att-label">上班</span><span class="att-value">{{ clockStatus.clockInTime }}</span></div>
            <div class="att-divider"></div>
            <div class="att-item"><span class="att-label">下班</span><span class="att-value">{{ clockStatus.clockOutTime }}</span></div>
            <div class="att-divider"></div>
            <div class="att-item"><span class="att-label">工时</span><span class="att-value highlight">{{ clockStatus.duration }}</span></div>
          </div>
          <div v-else-if="clockStatus.clockedIn" class="attendance-active">
            <span class="att-status on">● 上班中</span>
            <span class="att-since">{{ clockStatus.clockInTime }} 签到</span>
            <router-link to="/checkin" class="btn btn-primary btn-sm">去下班打卡</router-link>
          </div>
          <div v-else class="attendance-none">
            <span class="att-status off">○ 未签到</span>
            <router-link to="/checkin" class="btn btn-primary btn-sm">上班打卡</router-link>
          </div>
        </div>

        <!-- 待办事项 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin-bottom:0">✅ 待办事项</h3>
            <router-link to="/plan" class="view-all-link">全部 →</router-link>
          </div>
          <div v-if="todos.length === 0" class="empty-sm">暂无待办</div>
          <div v-else class="todo-list">
            <div v-for="todo in todos" :key="todo.id" class="todo-item" :class="{ done: todo.done }">
              <span class="todo-check">{{ todo.done ? '☑' : '☐' }}</span>
              <span class="todo-text">{{ todo.text }}</span>
            </div>
          </div>
        </div>

        <!-- 最近记录 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin-bottom:0">📝 最近记录</h3>
            <router-link to="/records" class="view-all-link">全部 →</router-link>
          </div>
          <div v-if="recentRecords.length === 0" class="empty-sm">暂无记录</div>
          <div v-else class="record-list">
            <router-link v-for="record in recentRecords" :key="record.id" :to="`/records/${record.id}`" class="record-item-link">
              <div class="record-title">{{ record.title }}</div>
              <div class="record-meta">
                <span>{{ formatDate(record.createdAt) }}</span>
                <span v-for="tag in (record.tags || []).slice(0, 2)" :key="tag" class="tag tag-primary tag-sm">{{ tag }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 右列 -->
      <div class="dashboard-side">
        <!-- 迷你日历 -->
        <div class="card">
          <div class="mini-cal-header">
            <button class="mini-nav" @click="miniPrev">◀</button>
            <span class="mini-title">{{ miniYear }}年{{ miniMonth }}月</span>
            <button class="mini-nav" @click="miniNext">▶</button>
          </div>
          <div class="mini-weekdays">
            <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</span>
          </div>
          <div class="mini-days">
            <div
              v-for="(day, i) in miniCalendarDays"
              :key="i"
              class="mini-day"
              :class="{
                'other': !day.currentMonth,
                'today': day.isToday,
                'checked': day.isChecked,
                'has-event': day.hasEvent,
                'weekend': day.isWeekend && day.currentMonth
              }"
            >
              {{ day.date }}
            </div>
          </div>
        </div>

        <!-- 近期事件 -->
        <div class="card">
          <h3 class="card-title">📅 近期事件</h3>
          <div v-if="upcomingEvents.length === 0" class="empty-sm">暂无事件</div>
          <div v-else class="event-list">
            <div v-for="ev in upcomingEvents" :key="ev.date + ev.text" class="event-row">
              <span class="event-dot" :style="{ background: ev.color || '#6366f1' }"></span>
              <div>
                <div class="event-text">{{ ev.text }}</div>
                <div class="event-date">{{ ev.dateLabel }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近灵感 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin-bottom:0">💡 最近灵感</h3>
            <router-link to="/inspiration" class="view-all-link">全部 →</router-link>
          </div>
          <div v-if="recentInspirations.length === 0" class="empty-sm">暂无灵感</div>
          <div v-else class="inspiration-list">
            <div v-for="insp in recentInspirations" :key="insp.id" class="inspiration-item" :style="{ borderLeft: `3px solid ${insp.color || '#6366f1'}` }">
              <div class="inspiration-title">{{ insp.title }}</div>
              <div v-if="insp.content" class="inspiration-content">{{ insp.content.slice(0, 60) }}{{ insp.content.length > 60 ? '...' : '' }}</div>
            </div>
          </div>
        </div>

        <!-- 最近文献笔记 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin-bottom:0">📖 最近笔记</h3>
            <router-link to="/lit-notes" class="view-all-link">全部 →</router-link>
          </div>
          <div v-if="recentLitNotes.length === 0" class="empty-sm">暂无笔记</div>
          <div v-else class="lit-notes-list">
            <div v-for="note in recentLitNotes" :key="note.id" class="lit-note-item">
              <div class="lit-note-title">{{ note.title }}</div>
              <div class="lit-note-meta">
                <span v-if="note.journal">{{ note.journal }}</span>
                <span v-if="note.year">{{ note.year }}</span>
                <span v-if="note.rating" class="rating-stars">{{ '★'.repeat(note.rating) }}{{ '☆'.repeat(5 - note.rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 激励语录 -->
        <div class="card quote-card">
          <div class="quote-mark">"</div>
          <div class="quote-text">{{ quote.text }}</div>
          <div class="quote-author">—— {{ quote.author }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, toDateString } from '../utils/date'
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
import { calculateFromStores } from '../utils/rank'

export default {
  name: 'DashboardView',
  data() {
    const now = new Date()
    return {
      _profileStore: useProfileStore(),
      _checkinsStore: useCheckinsStore(),
      _recordsStore: useRecordsStore(),
      _inspirationsStore: useInspirationsStore(),
      _litNotesStore: useLitNotesStore(),
      _plansStore: usePlansStore(),
      _pomodoroStore: usePomodoroStore(),
      _experimentsStore: useExperimentsStore(),
      _meetingsStore: useMeetingsStore(),
      _milestonesStore: useMilestonesStore(),
      quote: getRandomQuote(),
      currentTime: now.toLocaleTimeString('zh-CN'),
      miniYear: now.getFullYear(),
      miniMonth: now.getMonth() + 1,
      calendarEventsStore: useCalendarEventsStore(),
      events: {},
      _clockTimer: null
    }
  },
  computed: {
    nickname() {
      return this._profileStore.profile.nickname
    },
    streak() {
      return this._checkinsStore.streak
    },
    clockStatus() {
      return this._checkinsStore.clockStatus
    },
    records() {
      return this._recordsStore.records
    },
    recentRecords() {
      return this._recordsStore.recentRecords
    },
    inspirations() {
      return this._inspirationsStore.inspirations
    },
    recentInspirations() {
      return this._inspirationsStore.recentInspirations
    },
    litNotes() {
      return this._litNotesStore.notes
    },
    recentLitNotes() {
      return this._litNotesStore.recentNotes
    },
    todos() {
      return this._plansStore.todos
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
    greeting() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了'
      if (h < 12) return '早上好'
      if (h < 14) return '中午好'
      if (h < 18) return '下午好'
      return '晚上好'
    },
    todayText() {
      const d = new Date()
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    },
    weekdayText() {
      return '星期' + ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]
    },
    miniCalendarDays() {
      return generateCalendarDays(this.miniYear, this.miniMonth - 1, this._checkinsStore.checkins, this.events)
    },
    upcomingEvents() {
      const today = new Date()
      const result = []
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const ds = toDateString(d)
        const evs = this.events[ds]
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
    }
  },
  methods: {
    formatDate,
    miniPrev() {
      if (this.miniMonth === 1) { this.miniMonth = 12; this.miniYear-- }
      else this.miniMonth--
    },
    miniNext() {
      if (this.miniMonth === 12) { this.miniMonth = 1; this.miniYear++ }
      else this.miniMonth++
    },
    loadData() {
      this.calendarEventsStore.load()
      this.events = this.calendarEventsStore.events
    },
    startClock() {
      this._clockTimer = setInterval(() => {
        this.currentTime = new Date().toLocaleTimeString('zh-CN')
      }, 1000)
    }
  },
  created() {
    this._profileStore.load()
    this._checkinsStore.load()
    this._recordsStore.load()
    this._inspirationsStore.load()
    this._litNotesStore.load()
    this._plansStore.load()
    this._pomodoroStore.load()
    this._experimentsStore.load()
    this._meetingsStore.load()
    this._milestonesStore.load()
  },
  mounted() {
    this.loadData()
    this.startClock()
  },
  beforeUnmount() {
    if (this._clockTimer) clearInterval(this._clockTimer)
  }
}
</script>

<style scoped>
.dashboard { max-width: 1200px; }

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px;
  text-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
}

.welcome-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.rank-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.rank-icon { font-size: 18px; }

.rank-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--rank-color);
}

.rank-xp {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.rank-progress-bar {
  width: 120px;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.rank-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.rank-next {
  font-size: 11px;
  color: var(--text-muted);
}

.clock-time {
  font-size: 28px;
  font-weight: 300;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-variant-numeric: tabular-nums;
}

/* 快捷入口 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.quick-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--refraction);
  opacity: 0;
  transition: opacity var(--transition);
  pointer-events: none;
}

.quick-btn:hover::before {
  opacity: 1;
}

.quick-btn:hover {
  border-color: var(--color);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color) 25%, transparent);
  transform: translateY(-3px);
  background: color-mix(in srgb, var(--color) 6%, white);
}

.dark .quick-btn:hover {
  background: color-mix(in srgb, var(--color) 12%, var(--bg-primary));
}

.quick-icon { font-size: 24px; }

/* 统计条 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
}

.stat-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px 0 0 3px;
}

.stat-chip-icon { font-size: 18px; }

.stat-chip-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-chip-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 双栏布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}

.dashboard-main, .dashboard-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.view-all-link {
  font-size: 13px;
  color: var(--primary);
}

/* 考勤 */
.attendance-done {
  display: flex;
  align-items: center;
  gap: 20px;
}

.att-item { text-align: center; }
.att-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 2px; }
.att-value { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.att-value.highlight { color: var(--primary); font-size: 20px; }
.att-divider { width: 1px; height: 32px; background: var(--border); }

.attendance-active, .attendance-none {
  display: flex;
  align-items: center;
  gap: 12px;
}

.att-status.on { color: var(--success); font-weight: 600; animation: pulse-glow 2s ease-in-out infinite; }
.att-status.off { color: var(--text-muted); }
.att-since { font-size: 13px; color: var(--text-secondary); }

/* 待办 */
.todo-list { display: flex; flex-direction: column; gap: 8px; }

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  font-size: 14px;
}

.todo-item.done .todo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-check { font-size: 16px; }

/* 记录 */
.record-list { display: flex; flex-direction: column; gap: 8px; }

.record-item-link {
  display: block;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  text-decoration: none;
  transition: all 0.2s;
}

.record-item-link:hover { background: var(--bg-hover); transform: translateX(4px); }

.record-item-link .record-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.tag-sm { padding: 2px 6px; font-size: 11px; }

.empty-sm {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 20px;
}

/* 迷你日历 */
.mini-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mini-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }

.mini-nav {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 10px;
  border-radius: 4px;
}

.mini-nav:hover { background: var(--bg-hover); color: var(--text-primary); }

.mini-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.mini-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-day {
  text-align: center;
  font-size: 12px;
  padding: 4px 0;
  border-radius: 4px;
  color: var(--text-primary);
  position: relative;
}

.mini-day.other { color: var(--text-muted); opacity: 0.4; }
.mini-day.today { background: var(--gradient-primary); color: white; font-weight: 700; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3); }
.mini-day.checked { color: var(--success); font-weight: 600; }
.mini-day.weekend { color: #ef4444; }
.mini-day.weekend.other { color: var(--text-muted); }
.mini-day.has-event::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}

/* 事件列表 */
.event-list { display: flex; flex-direction: column; gap: 10px; }

.event-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
  animation: pulse-glow 2s ease-in-out infinite;
}

.event-row .event-text { font-size: 14px; color: var(--text-primary); }
.event-row .event-date { font-size: 12px; color: var(--text-muted); }

/* 灵感 */
.inspiration-list { display: flex; flex-direction: column; gap: 8px; }
.inspiration-item { padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); }
.inspiration-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
.inspiration-content { font-size: 12px; color: var(--text-muted); }

/* 文献笔记 */
.lit-notes-list { display: flex; flex-direction: column; gap: 8px; }
.lit-note-item { padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); }
.lit-note-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
.lit-note-meta { display: flex; gap: 8px; font-size: 12px; color: var(--text-muted); }
.rating-stars { color: #f59e0b; }

/* 语录 */
.quote-card {
  background: var(--gradient-primary);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.1);
}

.quote-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.quote-mark {
  font-size: 48px;
  line-height: 1;
  opacity: 0.3;
  font-family: Georgia, serif;
  margin-bottom: -12px;
}

.quote-text {
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 8px;
}

.quote-author {
  font-size: 13px;
  opacity: 0.7;
}

@media (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .quick-actions { grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .welcome-section { flex-direction: column; align-items: flex-start; gap: 8px; }
}

@media (max-width: 480px) {
  .quick-actions { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .quick-btn { padding: 10px 6px; }
  .quick-icon { font-size: 20px; }
}
</style>
