<template>
  <div class="dashboard">
    <!-- 顶部欢迎区 -->
    <div class="welcome-section">
      <div class="welcome-left">
        <h1 class="welcome-title">{{ greeting }}，{{ nickname }}</h1>
        <p class="welcome-date">{{ todayText }} · {{ weekdayText }}</p>
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
          <router-link to="/translate" class="quick-btn" style="--color: #3b82f6">
            <span class="quick-icon">🌐</span>
            <span>翻译</span>
          </router-link>
          <router-link to="/writing" class="quick-btn" style="--color: #06b6d4">
            <span class="quick-icon">📄</span>
            <span>论文</span>
          </router-link>
          <router-link to="/lit-notes" class="quick-btn" style="--color: #8b5cf6">
            <span class="quick-icon">📖</span>
            <span>文献笔记</span>
          </router-link>
          <router-link to="/meeting" class="quick-btn" style="--color: #ec4899">
            <span class="quick-icon">🗣️</span>
            <span>组会</span>
          </router-link>
          <router-link to="/inspiration" class="quick-btn" style="--color: #f97316">
            <span class="quick-icon">💡</span>
            <span>灵感</span>
          </router-link>
          <router-link to="/plan" class="quick-btn" style="--color: #14b8a6">
            <span class="quick-icon">📋</span>
            <span>计划</span>
          </router-link>
          <router-link to="/links" class="quick-btn" style="--color: #64748b">
            <span class="quick-icon">🔗</span>
            <span>导航</span>
          </router-link>
          <router-link to="/polish" class="quick-btn" style="--color: #a855f7">
            <span class="quick-icon">✨</span>
            <span>润色</span>
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
import { getStreak, getRecords, getProfile, getTodayClockStatus, getPlans, getCheckins, getCalendarEvents, getInspirations, getLitNotes } from '../utils/storage'
import { getCurrentUser } from '../utils/auth'
import { formatDate, toDateString, getToday } from '../utils/date'

const QUOTES = [
  { text: '科学是永无止境的，它是一个永恒之谜。', author: '爱因斯坦' },
  { text: '研究要有恒心，有志者事竟成。', author: '钱学森' },
  { text: '在科学上没有平坦的大道，只有不畏劳苦沿着陡峭山路攀登的人，才有希望达到光辉的顶点。', author: '马克思' },
  { text: '好奇心是科学工作者产生无穷毅力和耐心的源泉。', author: '爱因斯坦' },
  { text: '一切推理都必须从观察与实验中得来。', author: '伽利略' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
]

export default {
  name: 'DashboardView',
  data() {
    const now = new Date()
    return {
      nickname: getProfile().nickname,
      streak: { current: 0, longest: 0, total: 0 },
      records: [],
      inspirations: [],
      litNotes: [],
      todos: [],
      clockStatus: { clockedIn: false, clockedOut: false },
      quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
      currentTime: now.toLocaleTimeString('zh-CN'),
      miniYear: now.getFullYear(),
      miniMonth: now.getMonth() + 1,
      checkins: {},
      events: {}
    }
  },
  computed: {
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
    recentRecords() {
      return this.records.slice(0, 5)
    },
    recentInspirations() {
      return [...this.inspirations].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
    },
    recentLitNotes() {
      return this.litNotes.slice(0, 4)
    },
    miniCalendarDays() {
      const year = this.miniYear
      const month = this.miniMonth - 1
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const today = new Date().toISOString().split('T')[0]
      const days = []
      const start = firstDay.getDay()
      for (let i = start - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        const ds = this.fmtDate(d)
        days.push({ date: d.getDate(), currentMonth: false, isToday: ds === today, isChecked: !!this.checkins[ds], hasEvent: !!(this.events[ds]?.length), isWeekend: d.getDay() === 0 || d.getDay() === 6 })
      }
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i)
        const ds = this.fmtDate(d)
        days.push({ date: i, currentMonth: true, isToday: ds === today, isChecked: !!this.checkins[ds], hasEvent: !!(this.events[ds]?.length), isWeekend: d.getDay() === 0 || d.getDay() === 6 })
      }
      const rem = 42 - days.length
      for (let i = 1; i <= rem; i++) {
        const d = new Date(year, month + 1, i)
        const ds = this.fmtDate(d)
        days.push({ date: i, currentMonth: false, isToday: ds === today, isChecked: !!this.checkins[ds], hasEvent: !!(this.events[ds]?.length), isWeekend: d.getDay() === 0 || d.getDay() === 6 })
      }
      return days
    },
    upcomingEvents() {
      const today = new Date()
      const result = []
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const ds = this.fmtDate(d)
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
    fmtDate(d) {
      return toDateString(d)
    },
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
      this.streak = getStreak()
      this.records = getRecords()
      this.clockStatus = getTodayClockStatus()
      this.todos = getPlans().slice(0, 5)
      this.checkins = getCheckins()
      this.events = getCalendarEvents()
      this.inspirations = getInspirations()
      this.litNotes = getLitNotes()
    },
    startClock() {
      const update = () => {
        this.currentTime = new Date().toLocaleTimeString('zh-CN')
        this._clockRaf = requestAnimationFrame(update)
      }
      this._clockRaf = requestAnimationFrame(update)
    }
  },
  mounted() {
    this.loadData()
    this.startClock()
  },
  beforeUnmount() {
    if (this._clockRaf) cancelAnimationFrame(this._clockRaf)
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
}

.welcome-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
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
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
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
  background: var(--bg-primary);
  border: 1px solid var(--border);
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
