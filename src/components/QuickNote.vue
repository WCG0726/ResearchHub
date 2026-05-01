<template>
  <Teleport to="body">
    <div v-if="show" class="quick-note-overlay" @click.self="$emit('close')">
      <div class="quick-note-modal">
        <div class="quick-note-header">
          <h3>快捷笔记</h3>
          <button class="btn-close" @click="$emit('close')">×</button>
        </div>
        <div class="quick-note-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.icon }} {{ tab.label }}</button>
        </div>
        <div class="quick-note-body">
          <input
            v-model="title"
            class="quick-note-title"
            :placeholder="activeTab === 'inspiration' ? '记录你的灵感...' : '待办事项...'"
            @keyup.enter="save"
          />
          <textarea
            v-if="activeTab === 'inspiration'"
            v-model="content"
            class="quick-note-content"
            placeholder="详细内容（可选）"
            rows="3"
          ></textarea>
          <select v-if="activeTab === 'inspiration'" v-model="color" class="quick-note-color">
            <option value="#6366f1">紫色</option>
            <option value="#10b981">绿色</option>
            <option value="#f59e0b">橙色</option>
            <option value="#ef4444">红色</option>
            <option value="#3b82f6">蓝色</option>
          </select>
          <select v-if="activeTab === 'plan'" v-model="priority" class="quick-note-color">
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>
        <div class="quick-note-footer">
          <span class="shortcut-hint">Enter 保存 · Esc 关闭</span>
          <button class="btn btn-primary btn-sm" @click="save" :disabled="!title.trim()">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useInspirationsStore } from '../stores/inspirations'
import { usePlansStore } from '../stores/plans'

export default {
  name: 'QuickNote',
  props: {
    show: Boolean
  },
  emits: ['close'],
  data() {
    return {
      activeTab: 'inspiration',
      title: '',
      content: '',
      color: '#6366f1',
      priority: 'medium',
      tabs: [
        { key: 'inspiration', icon: '💡', label: '灵感' },
        { key: 'plan', icon: '📋', label: '待办' }
      ]
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.title = ''
        this.content = ''
        this.color = '#6366f1'
        this.priority = 'medium'
      }
    }
  },
  methods: {
    save() {
      if (!this.title.trim()) return
      if (this.activeTab === 'inspiration') {
        const store = useInspirationsStore()
        store.add({ title: this.title.trim(), content: this.content.trim(), color: this.color })
      } else {
        const store = usePlansStore()
        store.add({ text: this.title.trim(), priority: this.priority })
      }
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.quick-note-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

.quick-note-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.quick-note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.quick-note-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover { background: var(--bg-hover); }

.quick-note-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--bg-surface);
}

.quick-note-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-note-title {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 15px;
  box-sizing: border-box;
}

.quick-note-title:focus {
  outline: none;
  border-color: var(--primary);
}

.quick-note-content {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.quick-note-content:focus {
  outline: none;
  border-color: var(--primary);
}

.quick-note-color {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}

.quick-note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.shortcut-hint {
  font-size: 12px;
  color: var(--text-muted);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
