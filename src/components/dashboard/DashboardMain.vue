<template>
  <div class="dashboard-main">
    <!-- 快捷入口 -->
    <div class="quick-actions">
      <router-link to="/checkin" class="quick-btn" style="--color: #6366f1">
        <span class="quick-icon">⏰</span>
        <span>{{ clockedIn ? '去下班' : '上班打卡' }}</span>
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
      <router-link to="/bug-scanner" class="quick-btn" style="--color: #ef4444">
        <span class="quick-icon">🔍</span>
        <span>Bug 检测</span>
      </router-link>
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
  </div>
</template>

<script setup>
import { formatDate } from '../../utils/date'

defineProps({
  clockedIn: { type: Boolean, default: false },
  clockStatus: { type: Object, default: () => ({}) },
  todos: { type: Array, default: () => [] },
  recentRecords: { type: Array, default: () => [] },
  recentInspirations: { type: Array, default: () => [] },
  recentLitNotes: { type: Array, default: () => [] },
})
</script>

<style scoped>
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

@media (max-width: 900px) {
  .quick-actions { grid-template-columns: repeat(4, 1fr); gap: 8px; }
}

@media (max-width: 480px) {
  .quick-actions { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .quick-btn { padding: 10px 6px; }
  .quick-icon { font-size: 20px; }
}
</style>
