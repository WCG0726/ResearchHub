<template>
  <aside class="records-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">科研记录</h2>
      <button class="btn btn-primary btn-sm" @click="$emit('new')">+ 新建</button>
    </div>

    <div class="sidebar-search">
      <input :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" class="search-input" placeholder="搜索记录..." />
    </div>

    <div class="sidebar-tags">
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-pill"
        :class="{ active: selectedTags.includes(tag) }"
        @click="$emit('toggle-tag', tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="records-list">
      <template v-if="records.length > 50">
        <VirtualList :items="records" :item-height="76" :height="listHeight" key-field="id">
          <template #default="{ item }">
            <div
              class="record-item"
              :class="{ active: activeId === item.id }"
              @click="$emit('select', item)"
            >
              <div class="record-item-title">{{ item.title || '无标题' }}</div>
              <div class="record-item-meta">
                <span>{{ formatDate(item.createdAt) }}</span>
                <span v-for="tag in (item.tags || []).slice(0, 2)" :key="tag" class="mini-tag">{{ tag }}</span>
              </div>
              <div class="record-item-preview">{{ truncate(item.content, 60) }}</div>
            </div>
          </template>
        </VirtualList>
      </template>
      <template v-else>
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
          :class="{ active: activeId === record.id }"
          @click="$emit('select', record)"
        >
          <div class="record-item-title">{{ record.title || '无标题' }}</div>
          <div class="record-item-meta">
            <span>{{ formatDate(record.createdAt) }}</span>
            <span v-for="tag in (record.tags || []).slice(0, 2)" :key="tag" class="mini-tag">{{ tag }}</span>
          </div>
          <div class="record-item-preview">{{ truncate(record.content, 60) }}</div>
        </div>
      </template>
      <div v-if="records.length === 0" class="empty-list">暂无记录</div>
    </div>
  </aside>
</template>

<script setup>
import { formatDate } from '../../utils/date'
import VirtualList from '../ui/VirtualList.vue'

defineProps({
  records: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  allTags: { type: Array, default: () => [] },
  selectedTags: { type: Array, default: () => [] },
  activeId: { type: [Number, String, null], default: null },
  listHeight: { type: Number, default: 600 },
})

defineEmits(['new', 'update:searchQuery', 'toggle-tag', 'select'])

function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len) + '...' : (str || '')
}
</script>

<style scoped>
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
</style>
