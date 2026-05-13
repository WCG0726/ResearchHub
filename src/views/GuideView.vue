<template>
  <div class="guide-page">
    <h1 class="page-title">科研论文写作指南</h1>

    <div class="guide-search">
      <input v-model="searchQuery" class="guide-search-input" placeholder="搜索指南内容..." />
    </div>

    <div class="guide-nav">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="guide-nav-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <div class="guide-content">
      <GuideStructure v-if="activeCategory === 'structure'" />
      <GuideEnglish v-if="activeCategory === 'english'" />
      <GuidePhrases v-if="activeCategory === 'phrases'" />
      <GuideFigures v-if="activeCategory === 'figures'" />
      <GuideSubmission v-if="activeCategory === 'submission'" />
      <GuideThermoelectric v-if="activeCategory === 'thermoelectric'" />
      <GuideChinese v-if="activeCategory === 'chinese'" />
      <GuideSearch v-if="activeCategory === 'search'" />
      <GuideSocial v-if="activeCategory === 'social'" />
      <GuideTools v-if="activeCategory === 'tools'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GuideStructure from './guide/GuideStructure.vue'
import GuideEnglish from './guide/GuideEnglish.vue'
import GuidePhrases from './guide/GuidePhrases.vue'
import GuideFigures from './guide/GuideFigures.vue'
import GuideSubmission from './guide/GuideSubmission.vue'
import GuideThermoelectric from './guide/GuideThermoelectric.vue'
import GuideChinese from './guide/GuideChinese.vue'
import GuideSearch from './guide/GuideSearch.vue'
import GuideSocial from './guide/GuideSocial.vue'
import GuideTools from './guide/GuideTools.vue'

const searchQuery = ref('')
const activeCategory = ref('structure')

const categories = [
  { id: 'structure', name: '论文结构', icon: '📄' },
  { id: 'english', name: '英文规范', icon: '✍️' },
  { id: 'phrases', name: '句式库', icon: '💬' },
  { id: 'figures', name: '图表文献', icon: '📊' },
  { id: 'submission', name: '投稿回复', icon: '📮' },
  { id: 'thermoelectric', name: '热电专用', icon: '🔬' },
  { id: 'chinese', name: '中文论文', icon: '🇨🇳' },
  { id: 'search', name: '文献检索', icon: '🔍' },
  { id: 'social', name: '学术社交', icon: '🤝' },
  { id: 'tools', name: '写作工具', icon: '🛠️' },
]
</script>

<style scoped>
.guide-page {
  max-width: 900px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.guide-search {
  margin-bottom: 16px;
}

.guide-search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.guide-search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.guide-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
  padding: 12px 0;
  z-index: 10;
}

.guide-nav-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.guide-nav-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Shared styles for sub-components */
.guide-content :deep(.guide-section h2) {
  font-size: 22px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.guide-content :deep(.guide-card) {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
}

.guide-content :deep(.guide-card h3) {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.guide-content :deep(.guide-card p) {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 8px;
}

.guide-content :deep(.tip-block .tip-title) {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  margin-top: 12px;
}

.guide-content :deep(.tip-block .tip-title:first-child) {
  margin-top: 0;
}

.guide-content :deep(.structure-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-content :deep(.structure-item) {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.guide-content :deep(.structure-idx) {
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.guide-content :deep(.structure-name) {
  font-weight: 600;
  color: var(--text-primary);
}

.guide-content :deep(.structure-desc) {
  font-size: 13px;
  color: var(--text-secondary);
}

.guide-content :deep(.funnel) {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.guide-content :deep(.funnel-level) {
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-primary);
}

.guide-content :deep(.funnel-level.level-1) { background: rgba(99,102,241,0.1); border-radius: var(--radius) var(--radius) 0 0; }
.guide-content :deep(.funnel-level.level-2) { background: rgba(99,102,241,0.2); }
.guide-content :deep(.funnel-level.level-3) { background: rgba(99,102,241,0.3); }
.guide-content :deep(.funnel-level.level-4) { background: rgba(99,102,241,0.4); border-radius: 0 0 var(--radius) var(--radius); }

.guide-content :deep(.example-block) {
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
}

.guide-content :deep(.example-block p) {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-style: italic;
}

.guide-content :deep(.phrase-list) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-content :deep(.phrase-item) {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.guide-content :deep(.phrase-en) {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  font-style: italic;
  margin-bottom: 4px;
  line-height: 1.6;
}

.guide-content :deep(.phrase-cn) {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
}

.guide-content :deep(.tip-list) {
  list-style: none;
  padding: 0;
}

.guide-content :deep(.tip-list li) {
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.guide-content :deep(.tip-list li:last-child) {
  border-bottom: none;
}

.guide-content :deep(.tip-list li::before) {
  content: '•';
  color: var(--primary);
  margin-right: 8px;
}

.guide-content :deep(.table-block) {
  overflow-x: auto;
}

.guide-content :deep(.table-block table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.guide-content :deep(.table-block th) {
  text-align: left;
  padding: 10px 12px;
  background: var(--bg-surface);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
}

.guide-content :deep(.table-block td) {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}

.guide-content :deep(.error-list) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-content :deep(.error-item) {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.guide-content :deep(.error-wrong) {
  color: var(--danger);
  font-size: 14px;
  margin-bottom: 4px;
}

.guide-content :deep(.error-right) {
  color: var(--success);
  font-size: 14px;
  margin-bottom: 4px;
}

.guide-content :deep(.error-note) {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

.guide-content :deep(.template-block) {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
  line-height: 1.8;
}

.guide-content :deep(.template-block p) {
  margin-bottom: 8px;
  font-size: 14px;
  white-space: pre-line;
}

.guide-content :deep(.checklist) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-content :deep(.checklist-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}

.guide-content :deep(.checklist-item input) {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.guide-content :deep(.checklist-item span) {
  flex: 1;
}
</style>
