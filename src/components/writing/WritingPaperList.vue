<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">我的论文</h3>
      <button class="btn btn-primary btn-sm" @click="$emit('new')">+ 新建论文</button>
    </div>

    <div v-if="papers.length === 0" class="empty">
      <div class="empty-icon">📄</div>
      <div class="empty-text">暂无论文项目</div>
    </div>

    <div v-else class="papers-list">
      <div v-for="paper in papers" :key="paper.id" class="paper-item" @click="$emit('select', paper)">
        <div class="paper-info">
          <h4 class="paper-title">{{ paper.title }}</h4>
          <p class="paper-journal">{{ paper.journal || '未指定期刊' }}</p>
        </div>
        <div class="paper-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: paper.progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ paper.progress }}%</span>
        </div>
        <span class="paper-status tag" :class="'tag-' + statusType(paper.status)">
          {{ paper.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  papers: { type: Array, default: () => [] },
})

defineEmits(['new', 'select'])

function statusType(status) {
  const map = { '构思': 'primary', '写作中': 'warning', '修改中': 'info', '已投稿': 'success', '已接收': 'success' }
  return map[status] || 'primary'
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.paper-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.paper-item:hover {
  background: var(--bg-hover);
}

.paper-info { flex: 1; }

.paper-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.paper-journal {
  font-size: 13px;
  color: var(--text-muted);
}

.paper-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
  width: 40px;
  text-align: right;
}
</style>
