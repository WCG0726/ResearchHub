<template>
  <div class="milestone-page">
    <h1 class="page-title">里程碑追踪</h1>

    <div class="toolbar">
      <button class="btn btn-primary" @click="showForm = true">+ 添加里程碑</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">添加里程碑</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>名称 *</label>
          <input v-model="form.name" class="input" placeholder="如 开题报告" />
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input v-model="form.deadline" type="date" class="input" />
        </div>
        <div class="form-group">
          <label>阶段</label>
          <select v-model="form.stage" class="input">
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
          <select v-model="form.priority" class="input">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div class="form-group full">
          <label>说明</label>
          <textarea v-model="form.description" class="input textarea" rows="2" placeholder="详细说明..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveMilestone">保存</button>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-card card">
      <div class="progress-header">
        <h3>整体进度</h3>
        <span class="progress-pct">{{ progressPct }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div class="progress-stats">
        <span>已完成 {{ doneCount }} / {{ milestones.length }}</span>
        <span v-if="overdueCount > 0" class="overdue-text">⚠️ {{ overdueCount }} 项已过期</span>
      </div>
    </div>

    <!-- 阶段时间线 -->
    <div v-if="milestones.length === 0" class="empty">
      <div class="empty-icon">🎯</div>
      <div class="empty-text">暂无里程碑，添加你的学术目标</div>
    </div>

    <div class="stages">
      <div v-for="stage in stages" :key="stage" class="stage-group">
        <h3 class="stage-title">{{ stage }}</h3>
        <div class="stage-items">
          <div v-for="m in milestonesByStage(stage)" :key="m.id" class="card milestone-card" :class="{ done: m.done, overdue: isOverdue(m) }">
            <div class="ms-left">
              <input type="checkbox" :checked="m.done" @change="toggleDone(m)" class="ms-check" />
            </div>
            <div class="ms-body">
              <div class="ms-name" :class="{ 'line-through': m.done }">{{ m.name }}</div>
              <div class="ms-meta">
                <span v-if="m.deadline" class="ms-deadline" :class="{ 'text-danger': isOverdue(m) }">{{ m.deadline }}</span>
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
</template>

<script>
import { getMilestones, addMilestone, updateMilestone, deleteMilestone } from '../utils/storage'

export default {
  name: 'MilestoneView',
  data() {
    return {
      milestones: [],
      showForm: false,
      form: { name: '', deadline: '', stage: '研究阶段', priority: 'medium', description: '' }
    }
  },
  computed: {
    stages() { return [...new Set(this.milestones.map(m => m.stage))] },
    doneCount() { return this.milestones.filter(m => m.done).length },
    overdueCount() { return this.milestones.filter(m => !m.done && this.isOverdue(m)).length },
    progressPct() { return this.milestones.length ? Math.round(this.doneCount / this.milestones.length * 100) : 0 }
  },
  methods: {
    milestonesByStage(stage) { return this.milestones.filter(m => m.stage === stage) },
    isOverdue(m) { return m.deadline && !m.done && m.deadline < new Date().toISOString().split('T')[0] },
    priorityClass(p) { return { high: 'tag-danger', medium: 'tag-warning', low: 'tag-success' }[p] || 'tag-primary' },
    saveMilestone() {
      if (!this.form.name.trim()) return alert('请输入名称')
      addMilestone(this.form)
      this.milestones = getMilestones()
      this.showForm = false
      this.form = { name: '', deadline: '', stage: '研究阶段', priority: 'medium', description: '' }
    },
    toggleDone(m) { updateMilestone(m.id, { done: !m.done }); this.milestones = getMilestones() },
    removeMilestone(id) { if (!confirm('确定删除？')) return; deleteMilestone(id); this.milestones = getMilestones() }
  },
  mounted() { this.milestones = getMilestones() }
}
</script>

<style scoped>
.milestone-page { max-width: 900px; }
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
.progress-bar { height: 10px; background: var(--bg-surface); border-radius: 5px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--success)); border-radius: 5px; transition: width 0.4s; }
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
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
