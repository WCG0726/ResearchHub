<template>
  <div class="lit-notes-page">
    <h1 class="page-title">文献阅读笔记</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索标题、作者、标签..." />
      <select v-model="filterTag" class="input filter-select">
        <option value="">全部标签</option>
        <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 新增笔记</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <div class="form-title-row">
        <h3 class="card-title" style="margin:0">{{ editing ? '编辑笔记' : '新增阅读笔记' }}</h3>
        <button v-if="!editing" class="btn btn-outline btn-sm" :disabled="aiLoading" @click="aiGenerateNote">
          {{ aiLoading ? '生成中...' : 'AI 自动生成' }}
        </button>
      </div>
      <div v-if="aiMsg" class="ai-msg">{{ aiMsg }}</div>
      <div class="form-grid">
        <div class="form-group">
          <label>论文标题 *</label>
          <input v-model="form.title" class="input" placeholder="论文标题" />
        </div>
        <div class="form-group">
          <label>作者</label>
          <input v-model="form.authors" class="input" placeholder="作者1, 作者2, ..." />
        </div>
        <div class="form-group">
          <label>期刊/会议</label>
          <input v-model="form.journal" class="input" placeholder="如 Advanced Materials" />
        </div>
        <div class="form-group">
          <label>年份</label>
          <input v-model="form.year" class="input" placeholder="2024" />
        </div>
        <div class="form-group">
          <label>DOI</label>
          <input v-model="form.doi" class="input" placeholder="10.xxxx/xxxxx" />
        </div>
        <div class="form-group">
          <label>评分</label>
          <div class="rating">
            <span v-for="s in 5" :key="s" class="star" :class="{ active: s <= form.rating }" @click="form.rating = s">★</span>
          </div>
        </div>
        <div class="form-group full">
          <label>标签（逗号分隔）</label>
          <input v-model="form.tags" class="input" placeholder="热电, Seebeck, 综述" />
        </div>
        <div class="form-group full">
          <label>核心要点</label>
          <textarea v-model="form.keyPoints" class="input textarea" rows="3" placeholder="论文的主要创新点和结论..."></textarea>
        </div>
        <div class="form-group full">
          <label>研究方法</label>
          <textarea v-model="form.methods" class="input textarea" rows="2" placeholder="使用了哪些方法和手段..."></textarea>
        </div>
        <div class="form-group full">
          <label>个人评价</label>
          <textarea v-model="form.comments" class="input textarea" rows="2" placeholder="对论文的评价、启发、不足之处..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="cancelEdit">取消</button>
        <button class="btn btn-primary" @click="saveNote">保存</button>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty">
      <div class="empty-icon">📖</div>
      <div class="empty-text">暂无文献笔记，点击"新增笔记"开始记录</div>
    </div>

    <div class="notes-list">
      <div v-for="note in filtered" :key="note.id" class="card note-card">
        <div class="note-header">
          <div class="note-title-row">
            <h3 class="note-title">{{ note.title }}</h3>
            <div class="note-actions">
              <button class="btn-icon" @click="editNote(note)">✏️</button>
              <button class="btn-icon" @click="removeNote(note.id)">🗑️</button>
            </div>
          </div>
          <div class="note-meta">
            <span v-if="note.authors">{{ note.authors }}</span>
            <span v-if="note.journal" class="journal">{{ note.journal }}</span>
            <span v-if="note.year">{{ note.year }}</span>
            <span v-if="note.rating" class="rating-display">{{ '★'.repeat(note.rating) }}{{ '☆'.repeat(5 - note.rating) }}</span>
          </div>
          <div v-if="note.tags" class="note-tags">
            <span v-for="t in parseTags(note.tags)" :key="t" class="tag tag-primary">{{ t }}</span>
          </div>
        </div>
        <div v-if="note.keyPoints" class="note-section">
          <div class="section-label">核心要点</div>
          <p>{{ note.keyPoints }}</p>
        </div>
        <div v-if="note.methods" class="note-section">
          <div class="section-label">研究方法</div>
          <p>{{ note.methods }}</p>
        </div>
        <div v-if="note.comments" class="note-section">
          <div class="section-label">个人评价</div>
          <p>{{ note.comments }}</p>
        </div>
        <div class="note-footer">
          <span class="time">{{ formatDate(note.createdAt) }}</span>
          <a v-if="note.doi" :href="'https://doi.org/' + note.doi" target="_blank" class="doi-link">DOI: {{ note.doi }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLitNotesStore } from '../stores/litNotes'
import { formatDate } from '../utils/date'
import { generateLitNoteTemplate, isAIConfigured } from '../utils/ai'

const litNotesStore = useLitNotesStore()

const search = ref('')
const filterTag = ref('')
const showForm = ref(false)
const editing = ref(null)
const form = ref(emptyForm())
const aiLoading = ref(false)
const aiMsg = ref('')

const notes = ref([])

function emptyForm() {
  return { title: '', authors: '', journal: '', year: '', doi: '', rating: 0, tags: '', keyPoints: '', methods: '', comments: '' }
}

function parseTags(str) {
  return str.split(/[,，]/).map(s => s.trim()).filter(Boolean)
}

const allTags = computed(() => {
  const tags = new Set()
  notes.value.forEach(n => { if (n.tags) parseTags(n.tags).forEach(t => tags.add(t)) })
  return [...tags].sort()
})

const filtered = computed(() => {
  return notes.value.filter(n => {
    const matchSearch = !search.value || [n.title, n.authors, n.tags, n.keyPoints].some(f => f && f.toLowerCase().includes(search.value.toLowerCase()))
    const matchTag = !filterTag.value || (n.tags && parseTags(n.tags).includes(filterTag.value))
    return matchSearch && matchTag
  })
})

function saveNote() {
  if (!form.value.title.trim()) return alert('请输入论文标题')
  if (editing.value) {
    litNotesStore.update(editing.value, form.value)
  } else {
    litNotesStore.add(form.value)
  }
  notes.value = litNotesStore.notes
  cancelEdit()
}

function editNote(note) {
  editing.value = note.id
  form.value = { ...note }
  showForm.value = true
}

function cancelEdit() {
  showForm.value = false
  editing.value = null
  form.value = emptyForm()
  aiMsg.value = ''
}

async function aiGenerateNote() {
  if (!isAIConfigured()) { aiMsg.value = '请先在"翻译"页面配置 API Key'; return }
  if (!form.value.title.trim()) { aiMsg.value = '请先填写论文标题'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    const result = await generateLitNoteTemplate(form.value.title, form.value.doi)
    // 解析结果填充到对应字段
    const lines = result.split('\n')
    let section = ''
    const parsed = { keyPoints: '', methods: '', comments: '' }
    for (const line of lines) {
      if (/核心要点|Key Points/i.test(line)) section = 'keyPoints'
      else if (/研究方法|Methods/i.test(line)) section = 'methods'
      else if (/个人评价|Comments/i.test(line)) section = 'comments'
      else if (section && line.trim()) {
        parsed[section] += (parsed[section] ? '\n' : '') + line.replace(/^[-•*]\s*/, '')
      }
    }
    if (parsed.keyPoints) form.value.keyPoints = parsed.keyPoints
    if (parsed.methods) form.value.methods = parsed.methods
    if (parsed.comments) form.value.comments = parsed.comments
    aiMsg.value = '✓ AI 已生成笔记模板'
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}

function removeNote(id) {
  if (!confirm('确定删除？')) return
  litNotesStore.remove(id)
  notes.value = litNotesStore.notes
}

onMounted(() => {
  litNotesStore.load()
  notes.value = litNotesStore.notes
})
</script>

<style scoped>
.lit-notes-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 150px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.rating { display: flex; gap: 4px; }
.star { font-size: 22px; cursor: pointer; color: var(--border); transition: color 0.15s; }
.star.active { color: #f59e0b; }
.notes-list { display: flex; flex-direction: column; gap: 16px; }
.note-card { padding: 20px; }
.note-header { margin-bottom: 12px; }
.note-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.note-title { font-size: 17px; font-weight: 600; color: var(--text-primary); margin: 0; }
.note-actions { display: flex; gap: 4px; flex-shrink: 0; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.note-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: var(--text-secondary); margin-top: 6px; }
.journal { font-style: italic; }
.rating-display { color: #f59e0b; }
.note-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.note-section { margin-top: 12px; padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); }
.section-label { font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 4px; text-transform: uppercase; }
.note-section p { font-size: 14px; color: var(--text-primary); margin: 0; white-space: pre-wrap; }
.note-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 12px; color: var(--text-muted); }
.doi-link { color: var(--primary); font-size: 12px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.form-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ai-msg { font-size: 13px; color: var(--primary); margin-bottom: 10px; }
</style>
