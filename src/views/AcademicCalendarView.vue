<template>
  <div class="academic-calendar-page">
    <h1 class="page-title">学术日历</h1>

    <div class="toolbar">
      <select v-model="filterType" class="input filter-select">
        <option value="">全部类型</option>
        <option value="会议截稿">会议截稿</option>
        <option value="基金申报">基金申报</option>
        <option value="论文截止">论文截止</option>
        <option value="答辩">答辩</option>
        <option value="其他">其他</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 添加日程</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">添加学术日程</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>名称 *</label>
          <input v-model="form.name" class="input" placeholder="如 Nature 投稿截止" />
        </div>
        <div class="form-group">
          <label>日期 *</label>
          <input v-model="form.date" type="date" class="input" />
        </div>
        <div class="form-group">
          <label>类型</label>
          <select v-model="form.type" class="input">
            <option value="会议截稿">会议截稿</option>
            <option value="基金申报">基金申报</option>
            <option value="论文截止">论文截止</option>
            <option value="答辩">答辩</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>重要程度</label>
          <select v-model="form.importance" class="input">
            <option value="high">重要</option>
            <option value="normal">一般</option>
            <option value="low">提醒</option>
          </select>
        </div>
        <div class="form-group full">
          <label>备注</label>
          <textarea v-model="form.notes" class="input textarea" rows="2" placeholder="详细信息、链接等..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveEvent">保存</button>
      </div>
    </div>

    <!-- 即将到来 -->
    <div class="section-title">即将到来</div>
    <div v-if="upcoming.length === 0" class="empty-small">暂无即将到来的日程</div>
    <div class="events-list">
      <div v-for="e in upcoming" :key="e.id" class="card event-card" :class="{ urgent: daysLeft(e) <= 7 }">
        <div class="event-left">
          <div class="event-countdown" :class="countdownClass(e)">
            <span class="countdown-num">{{ daysLeft(e) }}</span>
            <span class="countdown-label">天</span>
          </div>
        </div>
        <div class="event-body">
          <div class="event-name">{{ e.name }}</div>
          <div class="event-meta">
            <span class="tag" :class="typeClass(e.type)">{{ e.type }}</span>
            <span class="event-date">{{ e.date }}</span>
          </div>
          <p v-if="e.notes" class="event-notes">{{ e.notes }}</p>
        </div>
        <button class="btn-icon" @click="removeEvent(e.id)">🗑️</button>
      </div>
    </div>

    <!-- 已过期 -->
    <div v-if="past.length > 0" class="section-title" style="margin-top:30px">已过期</div>
    <div class="events-list past-list">
      <div v-for="e in past" :key="e.id" class="card event-card past">
        <div class="event-body">
          <span class="event-name">{{ e.name }}</span>
          <span class="tag" :class="typeClass(e.type)" style="margin-left:8px">{{ e.type }}</span>
          <span class="event-date" style="margin-left:8px">{{ e.date }}</span>
        </div>
        <button class="btn-icon" @click="removeEvent(e.id)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAcademicEventsStore } from '../stores/academicEvents'

export default {
  name: 'AcademicCalendarView',
  data() {
    return {
      academicEventsStore: useAcademicEventsStore(),
      events: [],
      filterType: '',
      showForm: false,
      form: { name: '', date: '', type: '会议截稿', importance: 'normal', notes: '' }
    }
  },
  computed: {
    today() { return new Date().toISOString().split('T')[0] },
    filtered() {
      let list = this.events
      if (this.filterType) list = list.filter(e => e.type === this.filterType)
      return list
    },
    upcoming() { return this.filtered.filter(e => e.date >= this.today).sort((a, b) => a.date.localeCompare(b.date)) },
    past() { return this.filtered.filter(e => e.date < this.today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10) }
  },
  methods: {
    daysLeft(e) {
      const diff = new Date(e.date) - new Date(this.today)
      return Math.max(0, Math.ceil(diff / 86400000))
    },
    countdownClass(e) {
      const d = this.daysLeft(e)
      if (d <= 3) return 'countdown-danger'
      if (d <= 14) return 'countdown-warning'
      return 'countdown-normal'
    },
    typeClass(t) {
      return { '会议截稿': 'tag-primary', '基金申报': 'tag-warning', '论文截止': 'tag-danger', '答辩': 'tag-success', '其他': 'tag-primary' }[t] || 'tag-primary'
    },
    saveEvent() {
      if (!this.form.name.trim() || !this.form.date) return alert('请填写名称和日期')
      this.academicEventsStore.add(this.form)
      this.events = this.academicEventsStore.events
      this.showForm = false
      this.form = { name: '', date: '', type: '会议截稿', importance: 'normal', notes: '' }
    },
    removeEvent(id) { if (!confirm('确定删除？')) return; this.academicEventsStore.remove(id); this.events = this.academicEventsStore.events }
  },
  mounted() { this.academicEventsStore.load(); this.events = this.academicEventsStore.events }
}
</script>

<style scoped>
.academic-calendar-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; }
.filter-select { width: 130px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 14px; }
.empty-small { text-align: center; padding: 30px; color: var(--text-muted); font-size: 14px; }
.events-list { display: flex; flex-direction: column; gap: 12px; }
.event-card { display: flex; align-items: center; gap: 16px; padding: 16px; }
.event-card.urgent { border-left: 3px solid var(--danger); }
.event-card.past { opacity: 0.5; }
.event-left { flex-shrink: 0; }
.event-countdown { width: 60px; height: 60px; border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.countdown-normal { background: rgba(99,102,241,0.1); color: var(--primary); }
.countdown-warning { background: rgba(245,158,11,0.1); color: var(--warning); }
.countdown-danger { background: rgba(239,68,68,0.1); color: var(--danger); }
.countdown-num { font-size: 22px; font-weight: 700; line-height: 1; }
.countdown-label { font-size: 11px; }
.event-body { flex: 1; }
.event-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.event-meta { display: flex; gap: 10px; align-items: center; margin-top: 4px; }
.event-date { font-size: 13px; color: var(--text-secondary); }
.event-notes { font-size: 13px; color: var(--text-secondary); margin: 6px 0 0; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; flex-shrink: 0; }
.btn-icon:hover { background: var(--bg-hover); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
