<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2 class="modal-title">新建论文</h2>

      <div class="form-group">
        <label>论文标题</label>
        <input :value="title" @input="$emit('update:title', $event.target.value)" class="input" placeholder="输入论文标题" />
      </div>

      <div class="form-group">
        <label>目标期刊</label>
        <div class="input-with-btn">
          <input :value="journal" @input="$emit('update:journal', $event.target.value)" class="input" placeholder="如: Nature, Science, ACS Nano" />
          <button class="btn btn-outline btn-sm" @click="$emit('ai-recommend')" :disabled="aiLoading || !title">
            {{ aiLoading ? '推荐中...' : 'AI 推荐' }}
          </button>
        </div>
        <div v-if="journalCards.length" class="ai-result-box">
          <div class="ai-result-header">
            <span>AI 推荐期刊</span>
            <button class="btn-close-sm" @click="$emit('clear-journal-cards')">×</button>
          </div>
          <div class="journal-cards">
            <div v-for="(j, i) in journalCards" :key="i" class="journal-card">
              <div class="journal-name">{{ j.name }} <span class="journal-abbr">({{ j.abbreviation }})</span></div>
              <div class="journal-meta">
                <span class="journal-if">IF: {{ j.impactFactor }}</span>
                <span class="journal-speed">{{ j.reviewSpeed }}</span>
                <span v-if="j.openAccess" class="journal-oa">OA</span>
              </div>
              <div class="journal-fit">
                <div class="fit-bar"><div class="fit-fill" :style="{ width: j.fitScore + '%' }"></div></div>
                <span class="fit-score">匹配度 {{ j.fitScore }}%</span>
              </div>
              <div class="journal-reason">{{ j.reasoning }}</div>
              <button class="btn-select" @click="$emit('select-journal', j.abbreviation || j.name)">选择此刊</button>
            </div>
          </div>
        </div>
        <div v-else-if="journalResult" class="ai-result-box">
          <div class="ai-result-header">
            <span>AI 推荐结果</span>
            <button class="btn-close-sm" @click="$emit('clear-journal-result')">×</button>
          </div>
          <pre class="ai-result-text">{{ journalResult }}</pre>
        </div>
      </div>

      <div class="form-group">
        <label>研究方向</label>
        <input :value="topic" @input="$emit('update:topic', $event.target.value)" class="input" placeholder="如: 热电材料" />
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="$emit('create')">创建</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  journal: { type: String, default: '' },
  topic: { type: String, default: '' },
  aiLoading: { type: Boolean, default: false },
  journalCards: { type: Array, default: () => [] },
  journalResult: { type: String, default: '' },
})

defineEmits([
  'close', 'create', 'ai-recommend',
  'update:title', 'update:journal', 'update:topic',
  'select-journal', 'clear-journal-cards', 'clear-journal-result',
])
</script>

<style scoped>
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
  max-width: 500px;
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

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn .input { flex: 1; }

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

.journal-cards { display: flex; flex-direction: column; gap: 10px; }
.journal-card { padding: 12px; background: var(--bg-surface); border-radius: var(--radius); }
.journal-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.journal-abbr { font-weight: 400; color: var(--text-secondary); font-size: 13px; }
.journal-meta { display: flex; gap: 10px; margin: 6px 0; font-size: 12px; }
.journal-if { padding: 2px 8px; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 4px; font-weight: 600; }
.journal-speed { color: var(--text-secondary); }
.journal-oa { padding: 2px 6px; background: rgba(16, 185, 129, 0.1); color: var(--success); border-radius: 4px; font-size: 11px; font-weight: 600; }
.journal-fit { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
.fit-bar { flex: 1; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; }
.fit-fill { height: 100%; background: var(--primary); border-radius: 3px; }
.fit-score { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
.journal-reason { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
.btn-select {
  padding: 4px 12px;
  border: 1px solid var(--primary);
  border-radius: var(--radius);
  background: none;
  color: var(--primary);
  font-size: 12px;
  cursor: pointer;
}
.btn-select:hover { background: rgba(99, 102, 241, 0.08); }
</style>
