<template>
  <div class="project-page">
    <h1 class="page-title">项目管理</h1>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tab === 'milestone' }" @click="tab = 'milestone'">🎯 里程碑</button>
      <button class="tab-btn" :class="{ active: tab === 'plan' }" @click="tab = 'plan'">📋 计划表</button>
    </div>

    <!-- ===== 里程碑 Tab ===== -->
    <div v-if="tab === 'milestone'">
      <div class="toolbar">
        <button class="btn btn-primary" @click="showMilestoneForm = true">+ 添加里程碑</button>
      </div>

      <div v-if="showMilestoneForm" class="card form-card">
        <h3 class="card-title">添加里程碑</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="msForm.name" class="input" placeholder="如 开题报告" />
          </div>
          <div class="form-group">
            <label>截止日期</label>
            <input v-model="msForm.deadline" type="date" class="input" />
          </div>
          <div class="form-group">
            <label>阶段</label>
            <select v-model="msForm.stage" class="input">
              <option value="课程阶段">课程阶段</option>
              <option value="开题">开题</option>
              <option value="研究阶段">研究阶段</option>
              <option value="中期">中期</option>
              <option value="论文撰写">论文撰写</option>
              <option value="投稿">投稿</option>
              <option value="答辩">答辩</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="msForm.priority" class="input">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div class="form-group full">
            <label>说明</label>
            <textarea v-model="msForm.description" class="input textarea" rows="2" placeholder="详细说明..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline" @click="showMilestoneForm = false">取消</button>
          <button class="btn btn-primary" @click="saveMilestone">保存</button>
        </div>
      </div>

      <div class="progress-card card">
        <div class="progress-header">
          <h3>整体进度</h3>
          <span class="progress-pct">{{ msProgressPct }}%</span>
        </div>
        <div class="ms-progress-bar">
          <div class="ms-progress-fill" :style="{ width: msProgressPct + '%' }"></div>
        </div>
        <div class="progress-stats">
          <span>已完成 {{ msDoneCount }} / {{ milestones.length }}</span>
          <span v-if="msOverdueCount > 0" class="overdue-text">⚠️ {{ msOverdueCount }} 项已过期</span>
        </div>
      </div>

      <div v-if="milestones.length === 0" class="empty">
        <div class="empty-icon">🎯</div>
        <div class="empty-text">暂无里程碑，添加你的学术目标</div>
      </div>

      <div class="stages">
        <div v-for="stage in msStages" :key="stage" class="stage-group">
          <h3 class="stage-title">{{ stage }}</h3>
          <div class="stage-items">
            <div v-for="m in milestonesByStage(stage)" :key="m.id" class="card milestone-card" :class="{ done: m.done, overdue: isMsOverdue(m) }">
              <div class="ms-left">
                <input type="checkbox" :checked="m.done" @change="toggleMsDone(m)" class="ms-check" />
              </div>
              <div class="ms-body">
                <div class="ms-name" :class="{ 'line-through': m.done }">{{ m.name }}</div>
                <div class="ms-meta">
                  <span v-if="m.deadline" class="ms-deadline" :class="{ 'text-danger': isMsOverdue(m) }">{{ m.deadline }}</span>
                  <span class="tag" :class="priorityClass(m.priority)">{{ { high: '高', medium: '中', low: '低' }[m.priority] }}</span>
                </div>
                <p v-if="m.description" class="ms-desc">{{ m.description }}</p>
              </div>
              <button class="btn-icon" @click="removeMilestone(m.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 计划表 Tab ===== -->
    <div v-if="tab === 'plan'">
      <div class="card add-form">
        <div class="form-row">
          <input v-model="planText" type="text" placeholder="添加新任务..." class="input" @keyup.enter="addTask" />
          <select v-model="planPriority" class="select">
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <input v-model="planDate" type="date" class="input date-input" />
          <button class="btn btn-primary" @click="addTask">添加</button>
        </div>
      </div>

      <div class="filters">
        <button v-for="f in planFilters" :key="f.key" class="filter-btn" :class="{ active: planFilter === f.key }" @click="planFilter = f.key">
          {{ f.label }}
        </button>
      </div>

      <div class="card">
        <div v-if="filteredPlans.length === 0" class="empty">
          <div class="empty-icon">📋</div>
          <div class="empty-text">{{ planFilter === 'all' ? '暂无任务' : '该日期没有任务' }}</div>
        </div>
        <div v-else class="task-list">
          <div v-for="task in filteredPlans" :key="task.id" class="task-item" :class="{ done: task.done }">
            <button class="check-btn" :class="{ checked: task.done }" @click="toggleTask(task.id)">
              <span v-if="task.done">✓</span>
            </button>
            <div class="task-content">
              <div class="task-text">{{ task.text }}</div>
              <div class="task-meta">
                <span class="priority-tag" :class="'priority-' + task.priority">{{ planPriorityLabel(task.priority) }}</span>
                <span class="task-date" v-if="task.date">{{ task.date }}</span>
              </div>
            </div>
            <button class="delete-btn" @click="removeTask(task.id)">×</button>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <span class="stat-num">{{ planTotal }}</span>
          <span class="stat-label">总任务</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ planDoneCount }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ planTotal - planDoneCount }}</span>
          <span class="stat-label">待完成</span>
        </div>
        <div class="stat-box">
          <span class="stat-num">{{ planTotal ? Math.round(planDoneCount / planTotal * 100) : 0 }}%</span>
          <span class="stat-label">完成率</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMilestonesStore } from '../stores/milestones'
import { usePlansStore } from '../stores/plans'

const tab = ref('milestone')

// ===== Milestone =====
const milestonesStore = useMilestonesStore()
const milestones = ref([])
const showMilestoneForm = ref(false)
const msForm = ref({ name: '', deadline: '', stage: '研究阶段', priority: 'medium', description: '' })

const msStages = computed(() => [...new Set(milestones.value.map(m => m.stage))])
const msDoneCount = computed(() => milestones.value.filter(m => m.done).length)
const msOverdueCount = computed(() => milestones.value.filter(m => !m.done && isMsOverdue(m)).length)
const msProgressPct = computed(() => milestones.value.length ? Math.round(msDoneCount.value / milestones.value.length * 100) : 0)

function milestonesByStage(stage) { return milestones.value.filter(m => m.stage === stage) }
function isMsOverdue(m) { return m.deadline && !m.done && m.deadline < new Date().toISOString().split('T')[0] }
function priorityClass(p) { return { high: 'tag-danger', medium: 'tag-warning', low: 'tag-success' }[p] || 'tag-primary' }

function saveMilestone() {
  if (!msForm.value.name.trim()) return alert('请输入名称')
  milestonesStore.add(msForm.value)
  milestones.value = milestonesStore.milestones
  showMilestoneForm.value = false
  msForm.value = { name: '', deadline: '', stage: '研究阶段', priority: 'medium', description: '' }
}

function toggleMsDone(m) { milestonesStore.update(m.id, { done: !m.done }); milestones.value = milestonesStore.milestones }
function removeMilestone(id) { if (!confirm('确定删除？')) return; milestonesStore.remove(id); milestones.value = milestonesStore.milestones }

// ===== Plan =====
const plansStore = usePlansStore()
const plans = ref([])
const planText = ref('')
const planPriority = ref('medium')
const planDate = ref(new Date().toISOString().split('T')[0])
const planFilter = ref('all')
const planFilters = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今天' },
  { key: 'pending', label: '待完成' },
  { key: 'done', label: '已完成' }
]

const filteredPlans = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return plans.value.filter(p => {
    if (planFilter.value === 'today') return p.date === today
    if (planFilter.value === 'pending') return !p.done
    if (planFilter.value === 'done') return p.done
    return true
  })
})

const planTotal = computed(() => plans.value.length)
const planDoneCount = computed(() => plans.value.filter(p => p.done).length)

function addTask() {
  if (!planText.value.trim()) return
  plansStore.add({ text: planText.value.trim(), priority: planPriority.value, date: planDate.value })
  plans.value = plansStore.plans
  planText.value = ''
}

function toggleTask(id) { plansStore.toggle(id); plans.value = plansStore.plans }
function removeTask(id) { plansStore.remove(id); plans.value = plansStore.plans }
function planPriorityLabel(p) { return { high: '紧急', medium: '一般', low: '不急' }[p] }

onMounted(() => {
  milestonesStore.load(); milestones.value = milestonesStore.milestones
  plansStore.load(); plans.value = plansStore.plans
})
</script>

<style scoped>
.project-page { max-width: 900px; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border); }
.tab-btn {
  padding: 10px 24px; border: none; background: none;
  color: var(--text-secondary); font-size: 14px; font-weight: 500;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }

/* Milestone */
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.progress-card { padding: 20px; margin-bottom: 30px; }
.progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.progress-header h3 { margin: 0; }
.progress-pct { font-size: 24px; font-weight: 700; color: var(--primary); }
.ms-progress-bar { height: 10px; background: var(--bg-surface); border-radius: 5px; overflow: hidden; }
.ms-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--success)); border-radius: 5px; transition: width 0.4s; }
.progress-stats { display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: var(--text-secondary); }
.overdue-text { color: var(--danger); }
.stages { display: flex; flex-direction: column; gap: 24px; }
.stage-title { font-size: 15px; font-weight: 600; color: var(--primary); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
.stage-items { display: flex; flex-direction: column; gap: 10px; }
.milestone-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; }
.milestone-card.done { opacity: 0.6; }
.milestone-card.overdue { border-left: 3px solid var(--danger); }
.ms-left { padding-top: 2px; }
.ms-check { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
.ms-body { flex: 1; }
.ms-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.ms-name.line-through { text-decoration: line-through; color: var(--text-muted); }
.ms-meta { display: flex; gap: 10px; align-items: center; margin-top: 4px; }
.ms-deadline { font-size: 13px; color: var(--text-secondary); }
.ms-deadline.text-danger { color: var(--danger); font-weight: 600; }
.ms-desc { font-size: 13px; color: var(--text-secondary); margin: 6px 0 0; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; flex-shrink: 0; }
.btn-icon:hover { background: var(--bg-hover); }

/* Plan */
.add-form { margin-bottom: 16px; }
.form-row { display: flex; gap: 8px; flex-wrap: wrap; }
.input { flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; }
.date-input { width: 140px; min-width: 140px; flex: none; }
.select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; }
.btn { padding: 8px 20px; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; }
.btn-primary { background: var(--primary); color: white; }
.btn-outline { background: none; border: 1px solid var(--border); color: var(--text-secondary); }
.filters { display: flex; gap: 8px; margin-bottom: 16px; }
.filter-btn {
  padding: 6px 16px; border: 1px solid var(--border); border-radius: var(--radius);
  background: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius); background: var(--bg-secondary); transition: all 0.2s; }
.task-item.done { opacity: 0.5; }
.check-btn {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border);
  background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: white; flex-shrink: 0; transition: all 0.2s;
}
.check-btn.checked { background: var(--success); border-color: var(--success); }
.task-content { flex: 1; min-width: 0; }
.task-text { font-size: 14px; color: var(--text-primary); word-break: break-word; }
.task-item.done .task-text { text-decoration: line-through; }
.task-meta { display: flex; gap: 8px; margin-top: 4px; font-size: 12px; }
.priority-tag { padding: 1px 8px; border-radius: 10px; font-size: 11px; }
.priority-high { background: #fef2f2; color: #dc2626; }
.priority-medium { background: #fef3c7; color: #d97706; }
.priority-low { background: #ecfdf5; color: #059669; }
[data-theme="dark"] .priority-high { background: #451a1a; }
[data-theme="dark"] .priority-medium { background: #453a1a; }
[data-theme="dark"] .priority-low { background: #1a3a2a; }
.task-date { color: var(--text-muted); }
.delete-btn { background: none; border: none; font-size: 18px; color: var(--text-muted); cursor: pointer; padding: 4px; line-height: 1; }
.delete-btn:hover { color: var(--danger); }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
.stat-box { background: var(--bg-secondary); border-radius: var(--radius); padding: 16px; text-align: center; display: flex; flex-direction: column; gap: 4px; }
.stat-num { font-size: 24px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 12px; color: var(--text-secondary); }
.empty { text-align: center; padding: 40px 0; }
.empty-icon { font-size: 48px; margin-bottom: 8px; }
.empty-text { color: var(--text-muted); font-size: 14px; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
