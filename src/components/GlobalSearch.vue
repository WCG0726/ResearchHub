<template>
  <Teleport to="body">
    <div v-if="show" class="search-overlay" @click.self="$emit('close')">
      <div class="search-modal">
        <div class="search-input-row">
          <span class="search-icon">🔍</span>
          <input
            ref="searchInput"
            :value="query"
            @input="$emit('update:query', $event.target.value)"
            class="search-input"
            placeholder="搜索记录、笔记、灵感、会议..."
            @keydown.esc="$emit('close')"
            @keydown.down.prevent="$emit('move', 1)"
            @keydown.up.prevent="$emit('move', -1)"
            @keydown.enter.prevent="$emit('go')"
          />
          <kbd class="search-esc">Esc</kbd>
        </div>
        <div v-if="query && results.length" class="search-results">
          <div
            v-for="(r, i) in results"
            :key="r.key"
            class="search-result-item"
            :class="{ selected: i === selectedIndex }"
            @click="$emit('go-to', r)"
            @mouseenter="$emit('select', i)"
          >
            <span class="result-icon">{{ r.icon }}</span>
            <div class="result-info">
              <div class="result-title">{{ r.title }}</div>
              <div class="result-meta">{{ r.meta }}</div>
            </div>
            <span class="result-type">{{ r.type }}</span>
          </div>
        </div>
        <div v-else-if="query" class="search-empty">未找到匹配结果</div>
        <div v-else class="search-tips">
          <div class="tip">输入关键词搜索所有数据</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  query: { type: String, default: '' },
  results: { type: Array, default: () => [] },
  selectedIndex: { type: Number, default: 0 },
})

defineEmits(['close', 'update:query', 'move', 'go', 'go-to', 'select'])

const searchInput = ref(null)

watch(() => props.show, (val) => {
  if (val) nextTick(() => searchInput.value?.focus())
})
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
}

.search-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 560px;
  max-width: 90vw;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.search-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-esc {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  font-family: inherit;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--bg-hover);
}

.result-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-type {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--bg-surface);
  border-radius: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.search-tips {
  padding: 20px;
  text-align: center;
}

.tip {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
