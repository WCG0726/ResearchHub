<template>
  <main class="records-editor">
    <div v-if="!active" class="editor-empty">
      <div class="empty-icon">📝</div>
      <p>选择一条记录查看或编辑</p>
      <button class="btn btn-primary" @click="$emit('new')">+ 新建记录</button>
    </div>

    <template v-else>
      <div class="editor-toolbar">
        <input :value="form.title" @input="$emit('update:form', { ...form, title: $event.target.value })" class="editor-title-input" placeholder="输入标题..." />
        <div class="editor-actions">
          <button class="btn btn-outline btn-sm" :disabled="aiLoading" @click="$emit('ai-summarize')">AI 摘要</button>
          <button class="btn btn-outline btn-sm" :disabled="aiLoading" @click="$emit('ai-tags')">AI 标签</button>
          <button class="btn btn-outline btn-sm" @click="$emit('delete')" v-if="editingId">删除</button>
          <button class="btn btn-primary btn-sm" @click="$emit('save')">保存</button>
        </div>
      </div>

      <div v-if="aiMsg" class="ai-toast">{{ aiMsg }}</div>

      <textarea
        :value="form.content"
        @input="$emit('update:form', { ...form, content: $event.target.value })"
        class="editor-body"
        placeholder="开始记录你的科研内容...&#10;&#10;支持 Markdown 格式"
      ></textarea>

      <div class="editor-footer">
        <div class="footer-tags">
          <span class="footer-label">标签</span>
          <input :value="form.tagsStr" @input="$emit('update:form', { ...form, tagsStr: $event.target.value })" class="tags-input" placeholder="逗号分隔" />
        </div>
        <div class="footer-category">
          <span class="footer-label">类别</span>
          <select :value="form.category" @change="$emit('update:form', { ...form, category: $event.target.value })" class="category-select">
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
</template>

<script setup>
import { formatDate } from '../../utils/date'

defineProps({
  active: { type: Boolean, default: false },
  editingId: { type: [Number, String, null], default: null },
  form: { type: Object, default: () => ({ title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null }) },
  aiLoading: { type: Boolean, default: false },
  aiMsg: { type: String, default: '' },
})

defineEmits(['new', 'save', 'delete', 'ai-summarize', 'ai-tags', 'update:form'])
</script>

<style scoped>
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
</style>
