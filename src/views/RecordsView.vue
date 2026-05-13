<template>
  <div class="records-page">
    <!-- 左侧：标签+搜索+列表 -->
    <aside class="records-sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">科研记录</h2>
        <button class="btn btn-primary btn-sm" @click="newRecord">+ 新建</button>
      </div>

      <div class="sidebar-search">
        <input v-model="searchQuery" class="search-input" placeholder="搜索记录..." />
      </div>

      <div class="sidebar-tags">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="tag-pill"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <div class="records-list">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="record-item"
          :class="{ active: editingId === record.id }"
          @click="selectRecord(record)"
        >
          <div class="record-item-title">{{ record.title || '无标题' }}</div>
          <div class="record-item-meta">
            <span>{{ formatDate(record.createdAt) }}</span>
            <span v-for="tag in (record.tags || []).slice(0, 2)" :key="tag" class="mini-tag">{{ tag }}</span>
          </div>
          <div class="record-item-preview">{{ truncate(record.content, 60) }}</div>
        </div>
        <div v-if="filteredRecords.length === 0" class="empty-list">暂无记录</div>
      </div>
    </aside>

    <!-- 右侧：编辑器 -->
    <main class="records-editor">
      <div v-if="!showEditor && !editingId" class="editor-empty">
        <div class="empty-icon">📝</div>
        <p>选择一条记录查看或编辑</p>
        <button class="btn btn-primary" @click="newRecord">+ 新建记录</button>
      </div>

      <template v-else>
        <div class="editor-toolbar">
          <input v-model="form.title" class="editor-title-input" placeholder="输入标题..." />
          <div class="editor-actions">
            <button class="btn btn-outline btn-sm" :disabled="aiLoading" @click="aiSummarize">AI 摘要</button>
            <button class="btn btn-outline btn-sm" :disabled="aiLoading" @click="aiSuggestTags">AI 标签</button>
            <button class="btn btn-outline btn-sm" @click="deleteRecord" v-if="editingId">删除</button>
            <button class="btn btn-primary btn-sm" @click="saveRecord">保存</button>
          </div>
        </div>

        <div v-if="aiMsg" class="ai-toast">{{ aiMsg }}</div>

        <textarea
          v-model="form.content"
          class="editor-body"
          placeholder="开始记录你的科研内容...&#10;&#10;支持 Markdown 格式"
        ></textarea>

        <div class="editor-footer">
          <div class="footer-tags">
            <span class="footer-label">标签</span>
            <input v-model="form.tagsStr" class="tags-input" placeholder="逗号分隔" />
          </div>
          <div class="footer-category">
            <span class="footer-label">类别</span>
            <select v-model="form.category" class="category-select">
              <option value="experiment">实验</option>
              <option value="computation">计算</option>
              <option value="reading">文献阅读</option>
              <option value="writing">写作</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="footer-info">
            <span v-if="form.updatedAt" class="footer-time">更新于 {{ formatDate(form.updatedAt) }}</span>
            <span class="footer-count">{{ form.content?.length || 0 }} 字</span>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecordsStore } from '../stores/records'
import { formatDate } from '../utils/date'
import { suggestTags, generateSummary, isAIConfigured } from '../utils/ai'

const recordsStore = useRecordsStore()
const records = ref([])
const searchQuery = ref('')
const selectedTags = ref([])
const showEditor = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null })
const aiLoading = ref(false)
const aiMsg = ref('')

recordsStore.load()
records.value = recordsStore.records

const allTags = computed(() => {
  const tags = new Set()
  records.value.forEach(r => r.tags?.forEach(t => tags.add(t)))
  return [...tags]
})

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.content && r.content.toLowerCase().includes(q))
    const matchTags = selectedTags.value.length === 0 ||
      selectedTags.value.some(t => r.tags?.includes(t))
    return matchSearch && matchTags
  })
})

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

function selectRecord(record) {
  editingId.value = record.id
  showEditor.value = true
  form.value = {
    title: record.title,
    content: record.content,
    tagsStr: record.tags?.join(', ') || '',
    category: record.category || 'experiment',
    updatedAt: record.updatedAt
  }
}

function newRecord() {
  editingId.value = null
  showEditor.value = true
  form.value = { title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null }
}

function saveRecord() {
  const data = {
    title: form.value.title,
    content: form.value.content,
    tags: form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
    category: form.value.category
  }

  if (editingId.value) {
    recordsStore.update(editingId.value, data)
  } else {
    recordsStore.add(data)
  }

  records.value = recordsStore.records
  if (!editingId.value) {
    // Select the newly created record
    const newest = records.value[0]
    if (newest) selectRecord(newest)
  }
}

function deleteRecord() {
  if (!editingId.value) return
  if (confirm('确定删除这条记录？')) {
    recordsStore.remove(editingId.value)
    records.value = recordsStore.records
    editingId.value = null
    showEditor.value = false
    form.value = { title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null }
  }
}

async function aiSuggestTags() {
  if (!isAIConfigured()) { aiMsg.value = '请先在设置中配置 API Key'; return }
  if (!form.value.content.trim()) { aiMsg.value = '请先填写内容'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    const tags = await suggestTags(form.value.title + '\n' + form.value.content)
    form.value.tagsStr = tags
    aiMsg.value = '标签已生成'
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}

async function aiSummarize() {
  if (!isAIConfigured()) { aiMsg.value = '请先在设置中配置 API Key'; return }
  if (!form.value.content.trim()) { aiMsg.value = '请先填写内容'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    const summary = await generateSummary(form.value.title + '\n' + form.value.content)
    form.value.content = form.value.content + '\n\n【AI 摘要】' + summary
    aiMsg.value = '摘要已添加到内容末尾'
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}

function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len) + '...' : (str || '')
}
</script>

<style scoped>
.records-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  height: calc(100vh - var(--header-h) - 60px);
  margin: -30px -40px;
  max-width: none;
}

/* 左侧栏 */
.records-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: var(--bg-primary);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.sidebar-search {
  padding: 12px 16px 8px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 13px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.sidebar-tags {
  display: flex;
  gap: 6px;
  padding: 4px 16px 12px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
}

.tag-pill {
  padding: 3px 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: none;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.tag-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tag-pill.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.records-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.record-item {
  padding: 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 4px;
}

.record-item:hover {
  background: var(--bg-hover);
}

.record-item.active {
  background: rgba(99, 102, 241, 0.1);
  box-shadow: inset 3px 0 0 var(--primary);
}

.record-item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.mini-tag {
  padding: 1px 6px;
  background: var(--bg-surface);
  border-radius: 8px;
  font-size: 10px;
}

.record-item-preview {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-list {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 16px;
}

/* 右侧编辑器 */
.records-editor {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  overflow: hidden;
}

.editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
}

.editor-empty .empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.editor-empty p {
  font-size: 14px;
  margin: 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
}

.editor-title-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  padding: 4px 0;
}

.editor-title-input::placeholder {
  color: var(--text-muted);
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.ai-toast {
  padding: 8px 20px;
  font-size: 13px;
  color: var(--primary);
  background: rgba(99, 102, 241, 0.06);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.editor-body {
  flex: 1;
  padding: 20px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.8;
  resize: none;
  outline: none;
  font-family: inherit;
}

.editor-body::placeholder {
  color: var(--text-muted);
}

.editor-footer {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-primary);
  flex-wrap: wrap;
}

.footer-tags, .footer-category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.tags-input {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-size: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  width: 160px;
}

.tags-input:focus {
  outline: none;
  border-color: var(--primary);
}

.category-select {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px 8px;
  font-size: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.footer-time {
  font-size: 11px;
  color: var(--text-muted);
}

.footer-count {
  font-size: 11px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .records-page {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }

  .records-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
</style>
