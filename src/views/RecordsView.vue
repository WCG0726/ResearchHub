<template>
  <div class="records-page">
    <div class="page-header">
      <h1 class="page-title">科研记录</h1>
      <button class="btn btn-primary" @click="showEditor = true">+ 新建记录</button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="card filter-bar">
      <input
        v-model="searchQuery"
        class="input"
        placeholder="搜索记录..."
      />
      <div class="filter-tags">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="filter-tag"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- 记录列表 -->
    <div v-if="filteredRecords.length === 0" class="card empty">
      <div class="empty-icon">📝</div>
      <div class="empty-text">暂无记录</div>
    </div>

    <div v-else class="records-list">
      <div v-for="record in filteredRecords" :key="record.id" class="card record-card">
        <div class="record-header">
          <h3 class="record-title">{{ record.title }}</h3>
          <div class="record-actions">
            <button class="btn btn-sm btn-outline" @click="editRecord(record)">编辑</button>
            <button class="btn btn-sm btn-outline" @click="deleteRecord(record.id)">删除</button>
          </div>
        </div>
        <div class="record-meta">
          <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          <span v-if="record.updatedAt !== record.createdAt" class="record-updated">
            (已编辑 {{ formatDate(record.updatedAt) }})
          </span>
        </div>
        <div class="record-content">{{ truncate(record.content, 200) }}</div>
        <div class="record-tags">
          <span v-for="tag in record.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑器弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal">
        <h2 class="modal-title">{{ editingId ? '编辑记录' : '新建记录' }}</h2>

        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" class="input" placeholder="输入标题" />
        </div>

        <div class="form-group">
          <label>内容</label>
          <textarea v-model="form.content" class="input textarea" rows="6" placeholder="输入内容..."></textarea>
          <button class="btn btn-outline btn-sm" style="margin-top:6px" :disabled="aiLoading" @click="aiSummarize">AI 生成摘要</button>
        </div>

        <div class="form-group">
          <label>标签（逗号分隔）</label>
          <div class="tags-row">
            <input v-model="form.tagsStr" class="input" placeholder="如: DFT, 计算, 材料" />
            <button class="btn btn-outline btn-sm" :disabled="aiLoading" @click="aiSuggestTags">AI 建议</button>
          </div>
        </div>

        <div class="form-group">
          <label>类别</label>
          <select v-model="form.category" class="input">
            <option value="experiment">实验</option>
            <option value="computation">计算</option>
            <option value="reading">文献阅读</option>
            <option value="writing">写作</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div v-if="aiMsg" class="ai-msg">{{ aiMsg }}</div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeEditor">取消</button>
          <button class="btn btn-primary" @click="saveRecord">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRecords, addRecord, updateRecord, deleteRecord as removeRecord } from '../utils/storage'
import { formatDate } from '../utils/date'
import { suggestTags, generateSummary, isAIConfigured } from '../utils/ai'

export default {
  name: 'RecordsView',
  data() {
    return {
      records: [],
      searchQuery: '',
      selectedTags: [],
      showEditor: false,
      editingId: null,
      form: {
        title: '',
        content: '',
        tagsStr: '',
        category: 'experiment'
      },
      aiLoading: false,
      aiMsg: ''
    }
  },
  computed: {
    allTags() {
      const tags = new Set()
      this.records.forEach(r => r.tags?.forEach(t => tags.add(t)))
      return [...tags]
    },
    filteredRecords() {
      return this.records.filter(r => {
        const matchSearch = !this.searchQuery ||
          r.title.includes(this.searchQuery) ||
          r.content.includes(this.searchQuery)
        const matchTags = this.selectedTags.length === 0 ||
          this.selectedTags.some(t => r.tags?.includes(t))
        return matchSearch && matchTags
      })
    }
  },
  methods: {
    toggleTag(tag) {
      const idx = this.selectedTags.indexOf(tag)
      if (idx === -1) this.selectedTags.push(tag)
      else this.selectedTags.splice(idx, 1)
    },
    editRecord(record) {
      this.editingId = record.id
      this.form = {
        title: record.title,
        content: record.content,
        tagsStr: record.tags?.join(', ') || '',
        category: record.category || 'experiment'
      }
      this.showEditor = true
    },
    saveRecord() {
      const data = {
        title: this.form.title,
        content: this.form.content,
        tags: this.form.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
        category: this.form.category
      }

      if (this.editingId) {
        updateRecord(this.editingId, data)
      } else {
        addRecord(data)
      }

      this.closeEditor()
      this.loadData()
    },
    deleteRecord(id) {
      if (confirm('确定删除这条记录？')) {
        removeRecord(id)
        this.loadData()
      }
    },
    closeEditor() {
      this.showEditor = false
      this.editingId = null
      this.form = { title: '', content: '', tagsStr: '', category: 'experiment' }
      this.aiMsg = ''
    },
    async aiSuggestTags() {
      if (!isAIConfigured()) { this.aiMsg = '请先在"翻译"页面配置 API Key'; return }
      if (!this.form.content.trim()) { this.aiMsg = '请先填写内容'; return }
      this.aiLoading = true
      this.aiMsg = ''
      try {
        const tags = await suggestTags(this.form.title + '\n' + this.form.content)
        this.form.tagsStr = tags
        this.aiMsg = '✓ 标签已生成'
      } catch (e) {
        this.aiMsg = e.message
      } finally {
        this.aiLoading = false
      }
    },
    async aiSummarize() {
      if (!isAIConfigured()) { this.aiMsg = '请先在"翻译"页面配置 API Key'; return }
      if (!this.form.content.trim()) { this.aiMsg = '请先填写内容'; return }
      this.aiLoading = true
      this.aiMsg = ''
      try {
        const summary = await generateSummary(this.form.title + '\n' + this.form.content)
        this.form.content = this.form.content + '\n\n【AI 摘要】' + summary
        this.aiMsg = '✓ 摘要已添加到内容末尾'
      } catch (e) {
        this.aiMsg = e.message
      } finally {
        this.aiLoading = false
      }
    },
    formatDate,
    truncate(str, len) {
      return str && str.length > len ? str.slice(0, len) + '...' : str
    },
    loadData() {
      this.records = getRecords()
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.records-page {
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
}

.filter-bar {
  margin-bottom: 24px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-tag.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  cursor: default;
}

.record-card:hover {
  box-shadow: var(--shadow);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.record-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.record-actions {
  display: flex;
  gap: 8px;
}

.record-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.record-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.record-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.tags-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tags-row .input { flex: 1; }

.ai-msg {
  font-size: 13px;
  color: var(--primary);
  margin-bottom: 12px;
  padding: 6px 0;
}
</style>
