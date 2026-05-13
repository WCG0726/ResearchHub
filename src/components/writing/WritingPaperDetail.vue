<template>
  <div class="card paper-detail">
    <div class="paper-detail-header">
      <div>
        <h3 class="card-title">{{ paper.title }}</h3>
        <div class="paper-meta">
          <select :value="paper.status" @change="$emit('update-status', $event.target.value)" class="paper-status-select">
            <option>构思</option>
            <option>写作中</option>
            <option>修改中</option>
            <option>已投稿</option>
            <option>已接收</option>
          </select>
          <span class="paper-updated">最后更新：{{ formatDateTime(paper.updatedAt || paper.createdAt) }}</span>
        </div>
      </div>
      <div class="paper-detail-actions">
        <button class="btn btn-outline btn-sm" @click="$emit('ai-abstract')" :disabled="aiLoading">
          {{ aiLoading ? '生成中...' : 'AI 生成摘要' }}
        </button>
        <button class="btn btn-outline btn-sm btn-danger" @click="$emit('delete')">删除论文</button>
      </div>
    </div>

    <!-- AI 摘要结果 -->
    <div v-if="aiAbstract" class="ai-result-box">
      <div class="ai-result-header">
        <span>AI 生成的摘要</span>
        <div>
          <button class="btn btn-primary btn-xs" @click="$emit('copy-abstract')">复制</button>
          <button class="btn-close-sm" @click="$emit('clear-abstract')">×</button>
        </div>
      </div>
      <pre class="ai-result-text">{{ aiAbstract }}</pre>
    </div>

    <!-- 章节进度 -->
    <div class="sections">
      <div v-for="(section, idx) in paper.sections" :key="idx" class="section-item">
        <div class="section-header">
          <span class="section-name">{{ section.name }}</span>
          <div class="section-actions">
            <button class="btn btn-outline btn-xs" @click="$emit('ai-draft', idx)" :disabled="aiLoading" title="AI 辅助生成草稿">AI 辅助</button>
            <select :value="section.status" @change="$emit('update-section-status', idx, $event.target.value)" class="section-status">
              <option value="未开始">未开始</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
        </div>
        <textarea
          :value="section.notes"
          @input="$emit('update-section-notes', idx, $event.target.value)"
          class="input textarea section-notes"
          placeholder="记录进展或想法..."
        ></textarea>
      </div>
    </div>

    <!-- 进度更新 -->
    <div class="progress-update">
      <label>总体进度：{{ paper.progress }}%</label>
      <input type="range" :value="paper.progress" min="0" max="100" @input="$emit('update-progress', +$event.target.value)" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  paper: { type: Object, required: true },
  aiLoading: { type: Boolean, default: false },
  aiAbstract: { type: String, default: '' },
})

defineEmits([
  'update-status', 'delete', 'ai-abstract', 'copy-abstract', 'clear-abstract',
  'ai-draft', 'update-section-status', 'update-section-notes', 'update-progress',
])

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.paper-detail { margin-top: 24px; }

.paper-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.paper-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.paper-status-select {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.paper-updated {
  font-size: 12px;
  color: var(--text-muted);
}

.paper-detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-danger {
  color: var(--danger);
  border-color: var(--danger);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.ai-result-box {
  margin-top: 12px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius);
}

.ai-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.ai-result-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.btn-close-sm {
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 4px;
}

.btn-close-sm:hover { color: var(--text-primary); }

.btn-xs {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.section-item {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-name {
  font-weight: 600;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.section-status {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.section-notes {
  min-height: 60px;
  font-size: 14px;
}

.progress-update {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.progress-update label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.progress-update input[type="range"] {
  width: 100%;
}
</style>
