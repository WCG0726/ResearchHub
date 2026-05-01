<template>
  <div class="plan-page">
    <h1 class="page-title">计划表</h1>

    <!-- 添加任务 -->
    <div class="card add-form">
      <div class="form-row">
        <input v-model="newText" type="text" placeholder="添加新任务..." class="input" @keyup.enter="addTask" />
        <select v-model="newPriority" class="select">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <input v-model="newDate" type="date" class="input date-input" />
        <button class="btn btn-primary" @click="addTask">添加</button>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filters">
      <button v-for="f in filters" :key="f.key" class="filter-btn" :class="{ active: filter === f.key }" @click="filter = f.key">
        {{ f.label }}
      </button>
    </div>

    <!-- 任务列表 -->
    <div class="card">
      <div v-if="filtered.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <div class="empty-text">{{ filter === 'all' ? '暂无任务' : '该日期没有任务' }}</div>
      </div>
      <div v-else class="task-list">
        <div v-for="task in filtered" :key="task.id" class="task-item" :class="{ done: task.done }">
          <button class="check-btn" :class="{ checked: task.done }" @click="toggle(task.id)">
            <span v-if="task.done">✓</span>
          </button>
          <div class="task-content">
            <div class="task-text">{{ task.text }}</div>
            <div class="task-meta">
              <span class="priority-tag" :class="'priority-' + task.priority">{{ priorityLabel(task.priority) }}</span>
              <span class="task-date" v-if="task.date">{{ task.date }}</span>
            </div>
          </div>
          <button class="delete-btn" @click="remove(task.id)">×</button>
        </div>
      </div>
    </div>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-box">
        <span class="stat-num">{{ total }}</span>
        <span class="stat-label">总任务</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ doneCount }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ total - doneCount }}</span>
        <span class="stat-label">待完成</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ total ? Math.round(doneCount / total * 100) : 0 }}%</span>
        <span class="stat-label">完成率</span>
      </div>
    </div>
  </div>
</template>

<script>
import { usePlansStore } from '../stores/plans'

export default {
  name: 'PlanView',
  data() {
    return {
      plansStore: usePlansStore(),
      plans: [],
      newText: '',
      newPriority: 'medium',
      newDate: new Date().toISOString().split('T')[0],
      filter: 'all',
      filters: [
        { key: 'all', label: '全部' },
        { key: 'today', label: '今天' },
        { key: 'pending', label: '待完成' },
        { key: 'done', label: '已完成' }
      ]
    }
  },
  computed: {
    filtered() {
      const today = new Date().toISOString().split('T')[0]
      return this.plans.filter(p => {
        if (this.filter === 'today') return p.date === today
        if (this.filter === 'pending') return !p.done
        if (this.filter === 'done') return p.done
        return true
      })
    },
    total() { return this.plans.length },
    doneCount() { return this.plans.filter(p => p.done).length }
  },
  methods: {
    addTask() {
      if (!this.newText.trim()) return
      this.plansStore.add({ text: this.newText.trim(), priority: this.newPriority, date: this.newDate })
      this.plans = this.plansStore.plans
      this.newText = ''
    },
    toggle(id) {
      this.plansStore.toggle(id)
      this.plans = this.plansStore.plans
    },
    remove(id) {
      this.plansStore.remove(id)
      this.plans = this.plansStore.plans
    },
    priorityLabel(p) {
      return { high: '紧急', medium: '一般', low: '不急' }[p]
    }
  },
  created() {
    this.plansStore.load()
    this.plans = this.plansStore.plans
  }
}
</script>

<style scoped>
.plan-page { max-width: 800px; margin: 0 auto; }

.add-form { margin-bottom: 16px; }

.form-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.date-input { width: 140px; min-width: 140px; flex: none; }

.select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary { background: var(--primary); color: white; }

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.task-list { display: flex; flex-direction: column; gap: 8px; }

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  transition: all 0.2s;
}

.task-item.done { opacity: 0.5; }

.check-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  flex-shrink: 0;
  transition: all 0.2s;
}

.check-btn.checked {
  background: var(--success);
  border-color: var(--success);
}

.task-content { flex: 1; min-width: 0; }

.task-text {
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-word;
}

.task-item.done .task-text { text-decoration: line-through; }

.task-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
}

.priority-tag {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.priority-high { background: #fef2f2; color: #dc2626; }
.priority-medium { background: #fef3c7; color: #d97706; }
.priority-low { background: #ecfdf5; color: #059669; }

[data-theme="dark"] .priority-high { background: #451a1a; }
[data-theme="dark"] .priority-medium { background: #453a1a; }
[data-theme="dark"] .priority-low { background: #1a3a2a; }

.task-date { color: var(--text-muted); }

.delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.delete-btn:hover { color: var(--danger); }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.stat-box {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num { font-size: 24px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 12px; color: var(--text-secondary); }

.empty {
  text-align: center;
  padding: 40px 0;
}

.empty-icon { font-size: 48px; margin-bottom: 8px; }
.empty-text { color: var(--text-muted); font-size: 14px; }
</style>
