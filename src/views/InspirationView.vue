<template>
  <div class="inspiration-page">
    <h1 class="page-title">灵感板</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索灵感..." />
      <select v-model="filterColor" class="input filter-select">
        <option value="">全部颜色</option>
        <option v-for="c in colors" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 记录灵感</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">记录灵感</h3>
      <div class="form-group">
        <label>灵感标题 *</label>
        <input v-model="form.title" class="input" placeholder="一句话概括..." />
      </div>
      <div class="form-group">
        <label>详细描述</label>
        <textarea v-model="form.content" class="input textarea" rows="4" placeholder="展开描述你的想法..."></textarea>
      </div>
      <div class="form-group">
        <label>标签（逗号分隔）</label>
        <input v-model="form.tags" class="input" placeholder="热电, 新想法, 待验证" />
      </div>
      <div class="form-group">
        <label>颜色标记</label>
        <div class="color-options">
          <span v-for="c in colors" :key="c.value" class="color-dot" :style="{ background: c.value }" :class="{ active: form.color === c.value }" @click="form.color = c.value"></span>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveInspiration">保存</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty">
      <div class="empty-icon">💡</div>
      <div class="empty-text">暂无灵感，随时记录你的研究想法</div>
    </div>

    <div class="board">
      <div v-for="item in filtered" :key="item.id" class="card note-card" :style="{ borderLeft: `4px solid ${item.color || '#6366f1'}` }">
        <div class="note-top">
          <h3 class="note-title">{{ item.title }}</h3>
          <div class="note-actions">
            <button class="btn-icon" :class="{ pinned: item.pinned }" @click="togglePin(item)">📌</button>
            <button class="btn-icon" @click="removeItem(item.id)">🗑️</button>
          </div>
        </div>
        <p v-if="item.content" class="note-content">{{ item.content }}</p>
        <div v-if="item.tags" class="note-tags">
          <span v-for="t in item.tags.split(/[,，]/).filter(Boolean)" :key="t" class="tag tag-primary">{{ t.trim() }}</span>
        </div>
        <div class="note-time">{{ formatDate(item.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getInspirations, addInspiration, updateInspiration, deleteInspiration } from '../utils/storage'

export default {
  name: 'InspirationView',
  data() {
    return {
      items: [],
      search: '',
      filterColor: '',
      showForm: false,
      form: { title: '', content: '', tags: '', color: '#6366f1' },
      colors: [
        { value: '#6366f1', label: '紫' },
        { value: '#10b981', label: '绿' },
        { value: '#f59e0b', label: '黄' },
        { value: '#ef4444', label: '红' },
        { value: '#3b82f6', label: '蓝' },
        { value: '#ec4899', label: '粉' }
      ]
    }
  },
  computed: {
    filtered() {
      let list = [...this.items]
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
      if (this.filterColor) list = list.filter(i => i.color === this.filterColor)
      if (this.search) {
        const q = this.search.toLowerCase()
        list = list.filter(i => [i.title, i.content, i.tags].some(f => f && f.toLowerCase().includes(q)))
      }
      return list
    }
  },
  methods: {
    formatDate(iso) { return new Date(iso).toLocaleDateString('zh-CN') },
    saveInspiration() {
      if (!this.form.title.trim()) return alert('请输入标题')
      addInspiration(this.form)
      this.items = getInspirations()
      this.showForm = false
      this.form = { title: '', content: '', tags: '', color: '#6366f1' }
    },
    togglePin(item) { updateInspiration(item.id, { pinned: !item.pinned }); this.items = getInspirations() },
    removeItem(id) { if (!confirm('确定删除？')) return; deleteInspiration(id); this.items = getInspirations() }
  },
  mounted() { this.items = getInspirations() }
}
</script>

<style scoped>
.inspiration-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 120px; }
.form-card { margin-bottom: 24px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.color-options { display: flex; gap: 8px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: all 0.15s; }
.color-dot:hover { transform: scale(1.15); }
.color-dot.active { border-color: var(--text-primary); }
.board { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.note-card { padding: 16px; }
.note-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.note-title { font-size: 16px; font-weight: 600; margin: 0; }
.note-actions { display: flex; gap: 4px; flex-shrink: 0; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; opacity: 0.5; }
.btn-icon:hover { opacity: 1; background: var(--bg-hover); }
.btn-icon.pinned { opacity: 1; }
.note-content { font-size: 14px; color: var(--text-secondary); margin: 10px 0 0; white-space: pre-wrap; line-height: 1.6; }
.note-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px; }
.note-time { font-size: 12px; color: var(--text-muted); margin-top: 10px; }
</style>
