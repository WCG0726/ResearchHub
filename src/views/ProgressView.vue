<template>
  <div class="progress-page">
    <h1 class="page-title">科研进度</h1>

    <!-- 总览环形图 -->
    <div class="overview-row">
      <div v-for="m in modules" :key="m.key" class="overview-card card">
        <div class="ring-wrapper">
          <svg class="ring" viewBox="0 0 36 36">
            <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="ring-fg" :style="{ stroke: m.color, strokeDasharray: `${m.percent}, 100` }" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span class="ring-value">{{ m.percent }}%</span>
        </div>
        <div class="overview-info">
          <span class="overview-icon">{{ m.icon }}</span>
          <span class="overview-label">{{ m.label }}</span>
          <span class="overview-count">{{ m.count }} 条</span>
        </div>
      </div>
    </div>

    <!-- 时间轴视图切换 -->
    <div class="timeline-controls">
      <h3 class="section-title">活动时间轴</h3>
      <div class="view-toggle">
        <button class="toggle-btn" :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">本周</button>
        <button class="toggle-btn" :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">本月</button>
      </div>
    </div>

    <!-- 时间轴 -->
    <div class="timeline">
      <div v-if="timelineItems.length === 0" class="empty-sm">该时段暂无活动记录</div>
      <div v-for="group in timelineGroups" :key="group.date" class="timeline-group">
        <div class="timeline-date">{{ group.label }}</div>
        <div class="timeline-items">
          <div v-for="item in group.items" :key="item.id" class="timeline-item">
            <span class="timeline-dot" :style="{ background: item.color }"></span>
            <div class="timeline-content">
              <span class="timeline-icon">{{ item.icon }}</span>
              <span class="timeline-title">{{ item.title }}</span>
              <span class="timeline-type">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRecordsStore } from '../stores/records'
import { useLitNotesStore } from '../stores/litNotes'
import { useExperimentsStore } from '../stores/experiments'
import { useInspirationsStore } from '../stores/inspirations'
import { useMeetingsStore } from '../stores/meetings'
import { usePlansStore } from '../stores/plans'

export default {
  name: 'ProgressView',
  data() {
    return {
      _recordsStore: useRecordsStore(),
      _litNotesStore: useLitNotesStore(),
      _experimentsStore: useExperimentsStore(),
      _inspirationsStore: useInspirationsStore(),
      _meetingsStore: useMeetingsStore(),
      _plansStore: usePlansStore(),
      viewMode: 'week'
    }
  },
  computed: {
    modules() {
      const recordsStore = this._recordsStore
      const litNotesStore = this._litNotesStore
      const experimentsStore = this._experimentsStore
      const inspirationsStore = this._inspirationsStore
      const meetingsStore = this._meetingsStore
      const plansStore = this._plansStore

      const total = recordsStore.recordCount + litNotesStore.noteCount + experimentsStore.experimentCount + inspirationsStore.inspirationCount + meetingsStore.meetingCount + plansStore.planCount
      const pct = (count) => total > 0 ? Math.round(count / total * 100) : 0

      return [
        { key: 'records', icon: '📝', label: '科研记录', count: recordsStore.recordCount, percent: pct(recordsStore.recordCount), color: '#6366f1' },
        { key: 'litNotes', icon: '📖', label: '文献笔记', count: litNotesStore.noteCount, percent: pct(litNotesStore.noteCount), color: '#8b5cf6' },
        { key: 'experiments', icon: '🔬', label: '实验记录', count: experimentsStore.experimentCount, percent: pct(experimentsStore.experimentCount), color: '#f59e0b' },
        { key: 'inspirations', icon: '💡', label: '灵感', count: inspirationsStore.inspirationCount, percent: pct(inspirationsStore.inspirationCount), color: '#10b981' },
        { key: 'meetings', icon: '🗣️', label: '会议', count: meetingsStore.meetingCount, percent: pct(meetingsStore.meetingCount), color: '#ec4899' },
        { key: 'plans', icon: '📋', label: '待办', count: plansStore.planCount, percent: pct(plansStore.planCount), color: '#3b82f6' }
      ]
    },
    timelineItems() {
      const now = new Date()
      const cutoff = new Date()
      if (this.viewMode === 'week') {
        cutoff.setDate(now.getDate() - 7)
      } else {
        cutoff.setMonth(now.getMonth() - 1)
      }

      const items = []
      const recordsStore = this._recordsStore
      const litNotesStore = this._litNotesStore
      const experimentsStore = this._experimentsStore
      const inspirationsStore = this._inspirationsStore
      const meetingsStore = this._meetingsStore

      for (const r of recordsStore.records) {
        const d = new Date(r.createdAt)
        if (d >= cutoff) items.push({ id: 'r-' + r.id, title: r.title, type: '记录', icon: '📝', color: '#6366f1', date: r.createdAt })
      }
      for (const n of litNotesStore.notes) {
        const d = new Date(n.createdAt)
        if (d >= cutoff) items.push({ id: 'n-' + n.id, title: n.title, type: '文献', icon: '📖', color: '#8b5cf6', date: n.createdAt })
      }
      for (const e of experimentsStore.experiments) {
        const d = new Date(e.createdAt)
        if (d >= cutoff) items.push({ id: 'e-' + e.id, title: e.title, type: '实验', icon: '🔬', color: '#f59e0b', date: e.createdAt })
      }
      for (const i of inspirationsStore.inspirations) {
        const d = new Date(i.createdAt)
        if (d >= cutoff) items.push({ id: 'i-' + i.id, title: i.title, type: '灵感', icon: '💡', color: '#10b981', date: i.createdAt })
      }
      for (const m of meetingsStore.meetings) {
        const d = new Date(m.createdAt)
        if (d >= cutoff) items.push({ id: 'm-' + m.id, title: m.date + ' ' + (m.type || ''), type: '会议', icon: '🗣️', color: '#ec4899', date: m.createdAt })
      }

      items.sort((a, b) => new Date(b.date) - new Date(a.date))
      return items
    },
    timelineGroups() {
      const groups = {}
      for (const item of this.timelineItems) {
        const d = new Date(item.date)
        const key = d.toISOString().split('T')[0]
        if (!groups[key]) {
          const today = new Date().toISOString().split('T')[0]
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          let label = `${d.getMonth() + 1}月${d.getDate()}日`
          if (key === today) label = '今天'
          else if (key === yesterday) label = '昨天'
          groups[key] = { date: key, label, items: [] }
        }
        groups[key].items.push(item)
      }
      return Object.values(groups)
    }
  },
  created() {
    this._recordsStore.load()
    this._litNotesStore.load()
    this._experimentsStore.load()
    this._inspirationsStore.load()
    this._meetingsStore.load()
    this._plansStore.load()
  }
}
</script>

<style scoped>
.progress-page { max-width: 1000px; }

.overview-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 30px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  text-align: center;
  gap: 8px;
}

.ring-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
}

.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--bg-hover);
  stroke-width: 3;
}

.ring-fg {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}

.ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.overview-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.overview-icon { font-size: 18px; }
.overview-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.overview-count { font-size: 12px; color: var(--text-muted); }

.timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  margin: 0;
  color: var(--text-primary);
}

.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 14px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--primary);
  color: white;
}

.timeline { display: flex; flex-direction: column; gap: 20px; }

.timeline-group {}

.timeline-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 12px;
  border-left: 2px solid var(--border);
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  position: relative;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  position: absolute;
  left: -17px;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.timeline-icon { font-size: 16px; }
.timeline-title { font-size: 14px; color: var(--text-primary); flex: 1; }
.timeline-type { font-size: 11px; color: var(--text-muted); background: var(--bg-secondary); padding: 2px 8px; border-radius: 10px; }

.empty-sm {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px;
}

@media (max-width: 768px) {
  .overview-row { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 480px) {
  .overview-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
