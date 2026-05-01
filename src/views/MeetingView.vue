<template>
  <div class="meeting-page">
    <h1 class="page-title">组会记录</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索会议内容..." />
      <button class="btn btn-primary" @click="showForm = true">+ 新增会议</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <div class="form-title-row">
        <h3 class="card-title" style="margin:0">{{ editing ? '编辑会议' : '新增会议记录' }}</h3>
        <button v-if="!editing" class="btn btn-outline btn-sm" :disabled="aiLoading" @click="aiGenerateMinutes">
          {{ aiLoading ? '生成中...' : 'AI 生成纪要' }}
        </button>
      </div>
      <div v-if="aiMsg" class="ai-msg">{{ aiMsg }}</div>
      <div class="form-grid">
        <div class="form-group">
          <label>会议日期 *</label>
          <input v-model="form.date" type="date" class="input" />
        </div>
        <div class="form-group">
          <label>会议类型</label>
          <select v-model="form.type" class="input">
            <option value="组会">组会</option>
            <option value="开题/中期">开题/中期</option>
            <option value="文献分享">文献分享</option>
            <option value="学术会议">学术会议</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group full">
          <label>主要议题</label>
          <textarea v-model="form.topics" class="input textarea" rows="3" placeholder="本次会议讨论的主要内容..."></textarea>
        </div>
        <div class="form-group full">
          <label>导师/他人意见</label>
          <textarea v-model="form.feedback" class="input textarea" rows="3" placeholder="导师的建议和指导..."></textarea>
        </div>
        <div class="form-group full">
          <label>后续待办</label>
          <textarea v-model="form.todos" class="input textarea" rows="3" placeholder="会后需要完成的任务（每行一条）..."></textarea>
        </div>
        <div class="form-group full">
          <label>备注</label>
          <textarea v-model="form.notes" class="input textarea" rows="2" placeholder="其他记录..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="cancelEdit">取消</button>
        <button class="btn btn-primary" @click="saveMeeting">保存</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无会议记录</div>
    </div>

    <div class="timeline">
      <div v-for="m in filtered" :key="m.id" class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="card meeting-card">
          <div class="meeting-header">
            <div>
              <span class="meeting-date">{{ m.date }}</span>
              <span class="tag tag-primary" style="margin-left:8px">{{ m.type }}</span>
            </div>
            <div class="meeting-actions">
              <button class="btn-icon" @click="editMeeting(m)">✏️</button>
              <button class="btn-icon" @click="removeMeeting(m.id)">🗑️</button>
            </div>
          </div>
          <div v-if="m.topics" class="meeting-section">
            <div class="section-label">主要议题</div>
            <p>{{ m.topics }}</p>
          </div>
          <div v-if="m.feedback" class="meeting-section">
            <div class="section-label">导师意见</div>
            <p>{{ m.feedback }}</p>
          </div>
          <div v-if="m.todos" class="meeting-section todos-section">
            <div class="section-label">后续待办</div>
            <ul class="todo-list">
              <li v-for="(t, i) in m.todos.split('\n').filter(Boolean)" :key="i">{{ t }}</li>
            </ul>
          </div>
          <div v-if="m.notes" class="meeting-section">
            <div class="section-label">备注</div>
            <p>{{ m.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMeetingsStore } from '../stores/meetings'
import { generateMeetingMinutes, isAIConfigured } from '../utils/ai'

export default {
  name: 'MeetingView',
  data() {
    return {
      meetingsStore: useMeetingsStore(),
      meetings: [],
      search: '',
      showForm: false,
      editing: null,
      form: this.emptyForm(),
      aiLoading: false,
      aiMsg: ''
    }
  },
  computed: {
    filtered() {
      if (!this.search) return this.meetings
      const q = this.search.toLowerCase()
      return this.meetings.filter(m => [m.topics, m.feedback, m.todos, m.notes].some(f => f && f.toLowerCase().includes(q)))
    }
  },
  methods: {
    emptyForm() { return { date: new Date().toISOString().split('T')[0], type: '组会', topics: '', feedback: '', todos: '', notes: '' } },
    saveMeeting() {
      if (!this.form.date) return alert('请选择日期')
      if (this.editing) { this.meetingsStore.update(this.editing, this.form) }
      else { this.meetingsStore.add(this.form) }
      this.meetings = this.meetingsStore.meetings
      this.cancelEdit()
    },
    editMeeting(m) { this.editing = m.id; this.form = { ...m }; this.showForm = true },
    cancelEdit() { this.showForm = false; this.editing = null; this.form = this.emptyForm(); this.aiMsg = '' },
    async aiGenerateMinutes() {
      if (!isAIConfigured()) { this.aiMsg = '请先在"翻译"页面配置 API Key'; return }
      if (!this.form.topics.trim()) { this.aiMsg = '请先填写主要议题'; return }
      this.aiLoading = true
      this.aiMsg = ''
      try {
        const result = await generateMeetingMinutes(this.form.topics, this.form.feedback)
        this.form.notes = (this.form.notes ? this.form.notes + '\n\n' : '') + '【AI 会议纪要】\n' + result
        this.aiMsg = '✓ AI 纪要已添加到备注'
      } catch (e) {
        this.aiMsg = e.message
      } finally {
        this.aiLoading = false
      }
    },
    removeMeeting(id) { if (!confirm('确定删除？')) return; this.meetingsStore.remove(id); this.meetings = this.meetingsStore.meetings }
  },
  mounted() { this.meetingsStore.load(); this.meetings = this.meetingsStore.meetings }
}
</script>

<style scoped>
.meeting-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; }
.search-input { flex: 1; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.timeline { position: relative; padding-left: 24px; }
.timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: var(--border); }
.timeline-item { position: relative; margin-bottom: 20px; }
.timeline-dot { position: absolute; left: -20px; top: 24px; width: 12px; height: 12px; background: var(--primary); border-radius: 50%; border: 2px solid var(--bg-primary); }
.meeting-card { padding: 20px; }
.meeting-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.meeting-date { font-weight: 600; font-size: 15px; }
.meeting-actions { display: flex; gap: 4px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.meeting-section { margin-top: 10px; padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); }
.section-label { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 4px; }
.meeting-section p { font-size: 14px; color: var(--text-primary); margin: 0; white-space: pre-wrap; }
.todo-list { margin: 0; padding-left: 20px; font-size: 14px; }
.todo-list li { margin-bottom: 4px; color: var(--text-primary); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.form-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ai-msg { font-size: 13px; color: var(--primary); margin-bottom: 10px; }
</style>
