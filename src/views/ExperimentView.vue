<template>
  <div class="experiment-page">
    <h1 class="page-title">实验记录</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索样品、实验内容..." />
      <select v-model="filterStatus" class="input filter-select">
        <option value="">全部状态</option>
        <option value="进行中">进行中</option>
        <option value="已完成">已完成</option>
        <option value="待分析">待分析</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 新增实验</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">{{ editing ? '编辑实验' : '新增实验记录' }}</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>样品编号 *</label>
          <input v-model="form.sampleId" class="input" placeholder="如 S-2024-001" />
        </div>
        <div class="form-group">
          <label>实验名称 *</label>
          <input v-model="form.name" class="input" placeholder="实验名称" />
        </div>
        <div class="form-group">
          <label>实验日期</label>
          <input v-model="form.date" type="date" class="input" />
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="form.status" class="input">
            <option value="进行中">进行中</option>
            <option value="已完成">已完成</option>
            <option value="待分析">待分析</option>
          </select>
        </div>
        <div class="form-group full">
          <label>实验条件/参数</label>
          <textarea v-model="form.params" class="input textarea" rows="3" placeholder="温度、压力、气氛、时间等参数..."></textarea>
        </div>
        <div class="form-group full">
          <label>实验步骤</label>
          <textarea v-model="form.steps" class="input textarea" rows="3" placeholder="操作步骤记录..."></textarea>
        </div>
        <div class="form-group full">
          <label>实验结果</label>
          <textarea v-model="form.results" class="input textarea" rows="3" placeholder="观察到的现象、数据结果..."></textarea>
        </div>
        <div class="form-group full">
          <label>备注</label>
          <textarea v-model="form.notes" class="input textarea" rows="2" placeholder="注意事项、问题记录..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="cancelEdit">取消</button>
        <button class="btn btn-primary" @click="saveExp">保存</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty">
      <div class="empty-icon">🔬</div>
      <div class="empty-text">暂无实验记录</div>
    </div>

    <div class="exp-list">
      <div v-for="exp in filtered" :key="exp.id" class="card exp-card">
        <div class="exp-header">
          <div class="exp-title-row">
            <div>
              <span class="sample-badge">{{ exp.sampleId }}</span>
              <span class="exp-name">{{ exp.name }}</span>
            </div>
            <div class="exp-actions">
              <span class="tag" :class="statusClass(exp.status)">{{ exp.status }}</span>
              <button class="btn-icon" @click="editExp(exp)">✏️</button>
              <button class="btn-icon" @click="removeExp(exp.id)">🗑️</button>
            </div>
          </div>
          <div class="exp-date">{{ exp.date || '未设置日期' }}</div>
        </div>
        <div v-if="exp.params" class="exp-section">
          <div class="section-label">实验条件</div>
          <p>{{ exp.params }}</p>
        </div>
        <div v-if="exp.steps" class="exp-section">
          <div class="section-label">实验步骤</div>
          <p>{{ exp.steps }}</p>
        </div>
        <div v-if="exp.results" class="exp-section">
          <div class="section-label">实验结果</div>
          <p>{{ exp.results }}</p>
        </div>
        <div v-if="exp.notes" class="exp-section">
          <div class="section-label">备注</div>
          <p>{{ exp.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getExperiments, addExperiment, updateExperiment, deleteExperiment } from '../utils/storage'

export default {
  name: 'ExperimentView',
  data() {
    return {
      experiments: [],
      search: '',
      filterStatus: '',
      showForm: false,
      editing: null,
      form: this.emptyForm()
    }
  },
  computed: {
    filtered() {
      return this.experiments.filter(e => {
        const matchSearch = !this.search || [e.sampleId, e.name, e.params, e.results].some(f => f && f.toLowerCase().includes(this.search.toLowerCase()))
        const matchStatus = !this.filterStatus || e.status === this.filterStatus
        return matchSearch && matchStatus
      })
    }
  },
  methods: {
    emptyForm() {
      return { sampleId: '', name: '', date: new Date().toISOString().split('T')[0], status: '进行中', params: '', steps: '', results: '', notes: '' }
    },
    statusClass(s) {
      return { '进行中': 'tag-primary', '已完成': 'tag-success', '待分析': 'tag-warning' }[s] || 'tag-primary'
    },
    saveExp() {
      if (!this.form.sampleId.trim() || !this.form.name.trim()) return alert('请填写样品编号和实验名称')
      if (this.editing) { updateExperiment(this.editing, this.form) }
      else { addExperiment(this.form) }
      this.experiments = getExperiments()
      this.cancelEdit()
    },
    editExp(exp) { this.editing = exp.id; this.form = { ...exp }; this.showForm = true },
    cancelEdit() { this.showForm = false; this.editing = null; this.form = this.emptyForm() },
    removeExp(id) { if (!confirm('确定删除？')) return; deleteExperiment(id); this.experiments = getExperiments() }
  },
  mounted() { this.experiments = getExperiments() }
}
</script>

<style scoped>
.experiment-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.exp-list { display: flex; flex-direction: column; gap: 16px; }
.exp-card { padding: 20px; }
.exp-header { margin-bottom: 12px; }
.exp-title-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.sample-badge { display: inline-block; padding: 2px 10px; background: rgba(99,102,241,0.1); color: var(--primary); border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 8px; }
.exp-name { font-size: 17px; font-weight: 600; color: var(--text-primary); }
.exp-actions { display: flex; align-items: center; gap: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.exp-date { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.exp-section { margin-top: 10px; padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); }
.section-label { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 4px; }
.exp-section p { font-size: 14px; color: var(--text-primary); margin: 0; white-space: pre-wrap; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
