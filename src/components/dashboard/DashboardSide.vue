<template>
  <div class="dashboard-side">
    <!-- 迷你日历 -->
    <div class="card">
      <div class="mini-cal-header">
        <button class="mini-nav" @click="$emit('mini-prev')">◀</button>
        <span class="mini-title">{{ miniYear }}年{{ miniMonth }}月</span>
        <button class="mini-nav" @click="$emit('mini-next')">▶</button>
      </div>
      <div class="mini-weekdays">
        <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</span>
      </div>
      <div class="mini-days">
        <div
          v-for="(day, i) in calendarDays"
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

    <!-- 喝水提醒 -->
    <div class="card water-card">
      <div class="card-header">
        <h3 class="card-title" style="margin-bottom:0">💧 今日喝水</h3>
        <router-link to="/life" class="view-all-link">详情 →</router-link>
      </div>
      <div class="water-mini">
        <div class="water-cups-row">
          <span
            v-for="i in waterData.goal"
            :key="i"
            class="water-cup-mini"
            :class="{ filled: i <= waterData.cups }"
            @click="i <= waterData.cups ? $emit('water-remove') : $emit('water-add')"
          >💧</span>
        </div>
        <div class="water-info-row">
          <span class="water-count-mini">{{ waterData.cups }}/{{ waterData.goal }} 杯</span>
          <div class="water-progress-mini">
            <div class="water-progress-fill-mini" :style="{ width: Math.min(100, waterPercent) + '%' }"></div>
          </div>
          <span class="water-percent-mini">{{ waterPercent }}%</span>
        </div>
        <button class="btn-water-add" @click="$emit('water-add')">💧 喝一杯</button>
      </div>
    </div>

    <!-- 项目健康度 -->
    <div class="card health-card">
      <div class="card-header">
        <h3 class="card-title" style="margin-bottom:0">🔍 项目健康度</h3>
        <router-link to="/bug-scanner" class="view-all-link">详情 →</router-link>
      </div>
      <div v-if="bugCounts.total === 0" class="health-good">
        <span class="health-icon">✨</span>
        <span class="health-text">未检测到问题</span>
      </div>
      <div v-else class="health-summary">
        <div class="health-counts">
          <span v-if="bugCounts.fatal" class="health-badge fatal">{{ bugCounts.fatal }} 致命</span>
          <span v-if="bugCounts.warning" class="health-badge warning">{{ bugCounts.warning }} 警告</span>
          <span v-if="bugCounts.info" class="health-badge info">{{ bugCounts.info }} 提示</span>
        </div>
      </div>
      <div v-if="runtimeErrorCount > 0" class="health-runtime">
        <span class="runtime-dot"></span>
        {{ runtimeErrorCount }} 个运行时错误
      </div>
    </div>

    <!-- 近期事件 -->
    <div class="card">
      <h3 class="card-title">📅 近期事件</h3>
      <div v-if="events.length === 0" class="empty-sm">暂无事件</div>
      <div v-else class="event-list">
        <div v-for="ev in events" :key="ev.date + ev.text" class="event-row">
          <span class="event-dot" :style="{ background: ev.color || '#6366f1' }"></span>
          <div>
            <div class="event-text">{{ ev.text }}</div>
            <div class="event-date">{{ ev.dateLabel }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  miniYear: { type: Number, required: true },
  miniMonth: { type: Number, required: true },
  calendarDays: { type: Array, default: () => [] },
  waterData: { type: Object, default: () => ({ cups: 0, goal: 8 }) },
  waterPercent: { type: Number, default: 0 },
  bugCounts: { type: Object, default: () => ({ total: 0 }) },
  runtimeErrorCount: { type: Number, default: 0 },
  events: { type: Array, default: () => [] },
})

defineEmits(['mini-prev', 'mini-next', 'water-add', 'water-remove'])
</script>

<style scoped>
.mini-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.mini-nav { background: none; border: none; cursor: pointer; font-size: 12px; color: var(--text-muted); padding: 4px 8px; border-radius: var(--radius); }
.mini-nav:hover { background: var(--bg-hover); color: var(--primary); }
.mini-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.mini-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.mini-days { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; }
.mini-day { font-size: 12px; padding: 4px 0; border-radius: 50%; color: var(--text-secondary); }
.mini-day.other { color: var(--text-muted); opacity: 0.4; }
.mini-day.today { background: var(--primary); color: white; font-weight: 700; }
.mini-day.checked { position: relative; }
.mini-day.checked::after { content: ''; position: absolute; bottom: 1px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }
.mini-day.has-event::before { content: ''; position: absolute; top: 1px; right: 2px; width: 4px; height: 4px; border-radius: 50%; background: var(--warning); }
.mini-day.weekend { color: var(--danger); }

.water-mini { text-align: center; }
.water-cups-row { display: flex; justify-content: center; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.water-cup-mini { font-size: 18px; cursor: pointer; transition: transform 0.2s; }
.water-cup-mini:hover { transform: scale(1.2); }
.water-info-row { display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 10px; }
.water-count-mini { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
.water-progress-mini { flex: 1; max-width: 120px; height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; }
.water-progress-fill-mini { height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); border-radius: 3px; transition: width 0.3s; }
.water-percent-mini { font-size: 12px; color: var(--primary); font-weight: 600; min-width: 32px; }
.btn-water-add { width: 100%; padding: 6px; border: 1px dashed var(--border); border-radius: var(--radius); background: none; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.btn-water-add:hover { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.05); }

.health-good { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
.health-icon { font-size: 18px; }
.health-text { font-size: 13px; color: var(--success); }
.health-counts { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0; }
.health-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.health-badge.fatal { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
.health-badge.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
.health-badge.info { background: rgba(59, 130, 246, 0.1); color: var(--info); }
.health-runtime { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--danger); padding-top: 8px; border-top: 1px solid var(--border); }
.runtime-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--danger); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.event-list { display: flex; flex-direction: column; gap: 10px; }
.event-row { display: flex; gap: 10px; align-items: flex-start; }
.event-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.event-text { font-size: 13px; color: var(--text-primary); }
.event-date { font-size: 11px; color: var(--text-muted); }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.view-all-link { font-size: 12px; color: var(--primary); text-decoration: none; }
.view-all-link:hover { text-decoration: underline; }
.empty-sm { text-align: center; padding: 16px 0; font-size: 13px; color: var(--text-muted); }
</style>
