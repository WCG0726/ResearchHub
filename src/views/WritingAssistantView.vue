<template>
  <div class="writing-assistant-page">
    <h1 class="page-title">写作助手</h1>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tab === 'guide' }" @click="tab = 'guide'">📘 写作指南</button>
      <button class="tab-btn" :class="{ active: tab === 'polish' }" @click="tab = 'polish'">✨ 润色提示词</button>
    </div>

    <!-- ===== 写作指南 Tab ===== -->
    <div v-if="tab === 'guide'">
      <div class="guide-search">
        <input v-model="searchQuery" class="guide-search-input" placeholder="搜索指南内容..." />
      </div>

      <div class="guide-nav">
        <button
          v-for="cat in filteredCategories"
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

    <!-- ===== 润色提示词 Tab ===== -->
    <div v-if="tab === 'polish'">
      <!-- AI 直接润色区 -->
      <div class="card ai-polish-section">
        <h3 class="card-title">✨ AI 直接润色</h3>
        <p class="ai-desc">粘贴文本，选择润色风格，AI 直接返回润色结果。</p>
        <div class="ai-controls">
          <select v-model="aiStyle" class="input ai-select">
            <option value="academic">通用学术润色</option>
            <option value="deep">深度润色（含修改说明）</option>
            <option value="sci">SCI 期刊级别</option>
          </select>
          <button class="btn btn-primary" :disabled="!aiInput.trim() || aiLoading" @click="runPolish">
            {{ aiLoading ? '润色中...' : '开始润色' }}
          </button>
        </div>
        <textarea v-model="aiInput" class="input textarea ai-textarea" rows="5" placeholder="粘贴需要润色的英文段落..."></textarea>
        <div v-if="aiResult" class="ai-result">
          <div class="ai-result-header">
            <span class="ai-result-label">润色结果</span>
            <button class="btn-copy" @click="copyResult">{{ aiCopied ? '✓ 已复制' : '📋 复制' }}</button>
          </div>
          <pre class="ai-result-text">{{ aiResult }}</pre>
        </div>
        <div v-if="aiError" class="ai-error">{{ aiError }}</div>
      </div>

      <!-- 润色历史 -->
      <div v-if="history.length" class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin-bottom:0">📜 最近润色</h3>
          <button class="btn-clear" @click="clearHistory">清空</button>
        </div>
        <div class="history-list">
          <div v-for="(h, idx) in history" :key="idx" class="history-item" @click="loadHistory(h)">
            <div class="history-preview">{{ h.input.slice(0, 80) }}{{ h.input.length > 80 ? '...' : '' }}</div>
            <div class="history-meta">
              <span class="tag tag-sm" :class="'tag-' + getStyleTag(h.style)">{{ getStyleName(h.style) }}</span>
              <span class="history-time">{{ formatTime(h.time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card intro">
        <p>以下提示词也可复制到 ChatGPT / Claude / DeepL Write 等 AI 工具中使用。</p>
      </div>

      <div class="filters">
        <button v-for="cat in polishCategories" :key="cat.key" class="filter-btn" :class="{ active: activeCat === cat.key }" @click="activeCat = cat.key">
          {{ cat.label }}
        </button>
      </div>

      <div class="prompt-list">
        <div v-for="prompt in filteredPrompts" :key="prompt.id" class="card prompt-card">
          <div class="prompt-header">
            <h3 class="prompt-title">{{ prompt.title }}</h3>
            <button class="btn-copy" @click="copyPrompt(prompt.text)">
              {{ copiedId === prompt.id ? '✓ 已复制' : '📋 复制' }}
            </button>
          </div>
          <div class="prompt-desc">{{ prompt.desc }}</div>
          <div class="prompt-text"><pre>{{ prompt.text }}</pre></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { polishText, isAIConfigured } from '../utils/ai'
import { POLISH_PROMPTS, POLISH_CATEGORIES } from '../data/polishPrompts'
import { getStorage, setStorage } from '../utils/storage'

// Guide sub-components (lazy loaded)
const GuideStructure = defineAsyncComponent(() => import('./guide/GuideStructure.vue'))
const GuideEnglish = defineAsyncComponent(() => import('./guide/GuideEnglish.vue'))
const GuidePhrases = defineAsyncComponent(() => import('./guide/GuidePhrases.vue'))
const GuideFigures = defineAsyncComponent(() => import('./guide/GuideFigures.vue'))
const GuideSubmission = defineAsyncComponent(() => import('./guide/GuideSubmission.vue'))
const GuideThermoelectric = defineAsyncComponent(() => import('./guide/GuideThermoelectric.vue'))
const GuideChinese = defineAsyncComponent(() => import('./guide/GuideChinese.vue'))
const GuideSearch = defineAsyncComponent(() => import('./guide/GuideSearch.vue'))
const GuideSocial = defineAsyncComponent(() => import('./guide/GuideSocial.vue'))
const GuideTools = defineAsyncComponent(() => import('./guide/GuideTools.vue'))

const tab = ref('guide')

// Guide state
const searchQuery = ref('')
const activeCategory = ref('structure')
const categories = [
  { id: 'structure', name: '论文结构', icon: '📄', keywords: ['title', 'abstract', 'introduction', 'methods', 'results', 'discussion', 'conclusion', '摘要', '引言', '方法', '结果', '讨论', '结论', '结构', 'IMRD'] },
  { id: 'english', name: '英文规范', icon: '✍️', keywords: ['tense', 'voice', 'article', 'grammar', '时态', '语态', '冠词', '语法', '连接词', 'passive', 'active'] },
  { id: 'phrases', name: '句式库', icon: '💬', keywords: ['phrase', 'sentence', '句式', '模板', '常用表达', 'background', 'method', 'result', 'conclusion'] },
  { id: 'figures', name: '图表文献', icon: '📊', keywords: ['figure', 'table', 'reference', '图', '表', '参考文献', '分辨率', 'dpi', 'Zotero', 'EndNote'] },
  { id: 'submission', name: '投稿回复', icon: '📮', keywords: ['cover letter', 'response', 'reviewer', '投稿', '回复', '审稿', '检查清单', 'checklist'] },
  { id: 'thermoelectric', name: '热电专用', icon: '🔬', keywords: ['thermoelectric', 'ZT', 'Seebeck', '热电', '电导率', '热导率', '功率因子', 'phonon'] },
  { id: 'chinese', name: '中文论文', icon: '🇨🇳', keywords: ['中文', 'chinese', '摘要', '标点', 'GB/T', '参考文献格式', '国标'] },
  { id: 'search', name: '文献检索', icon: '🔍', keywords: ['Google Scholar', 'Web of Science', 'Scopus', '检索', '搜索', '数据库', '文献管理', 'Zotero'] },
  { id: 'social', name: '学术社交', icon: '🤝', keywords: ['ResearchGate', 'ORCID', '会议', 'poster', '邮件', '时间管理', '番茄'] },
  { id: 'tools', name: '写作工具', icon: '🛠️', keywords: ['Grammarly', 'Origin', 'matplotlib', 'Overleaf', 'LaTeX', '工具', '软件', 'AI'] },
]

const filteredCategories = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return categories
  return categories.filter(cat =>
    cat.name.toLowerCase().includes(q) ||
    cat.keywords.some(k => k.toLowerCase().includes(q))
  )
})

// Polish state
const polishPrompts = POLISH_PROMPTS
const polishCategories = POLISH_CATEGORIES
const activeCat = ref('all')
const copiedId = ref(null)
const aiStyle = ref('academic')
const aiInput = ref('')
const aiResult = ref('')
const aiError = ref('')
const aiLoading = ref(false)
const aiCopied = ref(false)
const history = ref(getStorage('polish_history', []))

const filteredPrompts = computed(() => {
  if (activeCat.value === 'all') return polishPrompts
  return polishPrompts.filter(p => p.cat === activeCat.value)
})

function copyPrompt(text) {
  navigator.clipboard.writeText(text).then(() => {
    const prompt = polishPrompts.find(p => p.text === text)
    if (prompt) { copiedId.value = prompt.id; setTimeout(() => { copiedId.value = null }, 2000) }
  })
}

async function runPolish() {
  if (!isAIConfigured()) { aiError.value = '请先在设置中配置 API Key'; return }
  aiLoading.value = true; aiError.value = ''; aiResult.value = ''
  try {
    aiResult.value = await polishText(aiInput.value, aiStyle.value)
    history.value.unshift({ input: aiInput.value, result: aiResult.value, style: aiStyle.value, time: Date.now() })
    if (history.value.length > 10) history.value = history.value.slice(0, 10)
    setStorage('polish_history', history.value)
  } catch (e) { aiError.value = e.message }
  finally { aiLoading.value = false }
}

function loadHistory(h) { aiInput.value = h.input; aiResult.value = h.result; aiStyle.value = h.style }
function clearHistory() { history.value = []; setStorage('polish_history', []) }
function getStyleName(s) { return { academic: '通用', deep: '深度', sci: 'SCI' }[s] || s }
function getStyleTag(s) { return { academic: 'primary', deep: 'warning', sci: 'success' }[s] || 'primary' }
function formatTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
function copyResult() { navigator.clipboard.writeText(aiResult.value).then(() => { aiCopied.value = true; setTimeout(() => { aiCopied.value = false }, 2000) }) }
</script>

<style scoped>
.writing-assistant-page { max-width: 900px; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border); }
.tab-btn {
  padding: 10px 24px; border: none; background: none;
  color: var(--text-secondary); font-size: 14px; font-weight: 500;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }

/* Guide */
.guide-search { margin-bottom: 16px; }
.guide-search-input {
  width: 100%; padding: 10px 16px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--bg-primary); color: var(--text-primary); font-size: 14px; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
}
.guide-search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.guide-nav {
  display: flex; gap: 8px; margin-bottom: 30px; flex-wrap: wrap;
  position: sticky; top: 0; background: var(--bg-secondary); padding: 12px 0; z-index: 10;
}
.guide-nav-btn {
  padding: 10px 20px; border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--bg-primary); color: var(--text-secondary); font-size: 14px;
  cursor: pointer; transition: all 0.2s;
}
.guide-nav-btn:hover { border-color: var(--primary); color: var(--primary); }
.guide-nav-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

/* Polish */
.intro { margin-bottom: 16px; }
.intro p { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
.filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.filter-btn {
  padding: 6px 14px; border: 1px solid var(--border); border-radius: var(--radius);
  background: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.filter-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.prompt-list { display: flex; flex-direction: column; gap: 12px; }
.prompt-card { margin-bottom: 0; }
.prompt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.prompt-title { font-size: 16px; margin: 0; color: var(--text-primary); }
.btn-copy {
  padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius);
  background: none; color: var(--text-secondary); font-size: 12px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.btn-copy:hover { background: var(--primary); color: white; border-color: var(--primary); }
.prompt-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
.prompt-text { background: var(--bg-secondary); border-radius: var(--radius); padding: 12px; overflow-x: auto; }
.prompt-text pre { margin: 0; font-size: 13px; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap; word-break: break-word; font-family: inherit; }
.ai-polish-section { margin-bottom: 20px; }
.ai-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
.ai-controls { display: flex; gap: 10px; margin-bottom: 10px; }
.ai-select { width: 200px; }
.ai-textarea { width: 100%; box-sizing: border-box; }
.ai-result { margin-top: 14px; background: var(--bg-secondary); border-radius: var(--radius); padding: 14px; }
.ai-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.ai-result-label { font-size: 13px; font-weight: 600; color: var(--primary); }
.ai-result-text { margin: 0; font-size: 14px; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap; font-family: inherit; }
.ai-error { margin-top: 8px; color: var(--danger); font-size: 13px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn-clear { border: none; background: none; color: var(--text-muted); font-size: 12px; cursor: pointer; }
.btn-clear:hover { color: var(--danger); }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
.history-item:hover { background: var(--bg-hover); }
.history-preview { font-size: 13px; color: var(--text-primary); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.history-time { color: var(--text-muted); }
.tag-sm { padding: 2px 6px; font-size: 11px; }

/* Guide sub-component shared styles */
.guide-content :deep(.guide-card) {
  background: var(--bg-primary); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;
}
.guide-content :deep(.guide-card h3) { font-size: 16px; margin-bottom: 16px; color: var(--text-primary); }
.guide-content :deep(.guide-card p) { font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 8px; }
.guide-content :deep(.tip-block .tip-title) { font-weight: 600; color: var(--text-primary); margin-bottom: 8px; margin-top: 12px; }
.guide-content :deep(.tip-block .tip-title:first-child) { margin-top: 0; }
.guide-content :deep(.tip-list) { list-style: none; padding: 0; }
.guide-content :deep(.tip-list li) { padding: 8px 0; font-size: 14px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.guide-content :deep(.tip-list li:last-child) { border-bottom: none; }
.guide-content :deep(.tip-list li::before) { content: '•'; color: var(--primary); margin-right: 8px; }
.guide-content :deep(.table-block) { overflow-x: auto; }
.guide-content :deep(.table-block table) { width: 100%; border-collapse: collapse; font-size: 14px; }
.guide-content :deep(.table-block th) { text-align: left; padding: 10px 12px; background: var(--bg-surface); font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border); }
.guide-content :deep(.table-block td) { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
.guide-content :deep(.example-block) { padding: 12px 16px; background: var(--bg-surface); border-radius: var(--radius); border-left: 4px solid var(--primary); }
.guide-content :deep(.example-block p) { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; font-style: italic; }
.guide-content :deep(.phrase-list) { display: flex; flex-direction: column; gap: 10px; }
.guide-content :deep(.phrase-item) { padding: 12px; background: var(--bg-surface); border-radius: var(--radius); }
.guide-content :deep(.phrase-en) { display: block; font-size: 14px; color: var(--text-primary); font-style: italic; margin-bottom: 4px; line-height: 1.6; }
.guide-content :deep(.phrase-cn) { display: block; font-size: 13px; color: var(--text-muted); }
.guide-content :deep(.structure-list) { display: flex; flex-direction: column; gap: 12px; }
.guide-content :deep(.structure-item) { display: flex; gap: 12px; padding: 12px; background: var(--bg-surface); border-radius: var(--radius); }
.guide-content :deep(.structure-idx) { width: 28px; height: 28px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.guide-content :deep(.structure-name) { font-weight: 600; color: var(--text-primary); }
.guide-content :deep(.structure-desc) { font-size: 13px; color: var(--text-secondary); }
.guide-content :deep(.funnel) { display: flex; flex-direction: column; gap: 0; }
.guide-content :deep(.funnel-level) { padding: 12px 16px; text-align: center; font-size: 14px; color: var(--text-primary); }
.guide-content :deep(.funnel-level.level-1) { background: rgba(99,102,241,0.1); border-radius: var(--radius) var(--radius) 0 0; }
.guide-content :deep(.funnel-level.level-2) { background: rgba(99,102,241,0.2); }
.guide-content :deep(.funnel-level.level-3) { background: rgba(99,102,241,0.3); }
.guide-content :deep(.funnel-level.level-4) { background: rgba(99,102,241,0.4); border-radius: 0 0 var(--radius) var(--radius); }
.guide-content :deep(.error-list) { display: flex; flex-direction: column; gap: 16px; }
.guide-content :deep(.error-item) { padding: 12px; background: var(--bg-surface); border-radius: var(--radius); }
.guide-content :deep(.error-wrong) { color: var(--danger); font-size: 14px; margin-bottom: 4px; }
.guide-content :deep(.error-right) { color: var(--success); font-size: 14px; margin-bottom: 4px; }
.guide-content :deep(.error-note) { font-size: 12px; color: var(--text-muted); font-style: italic; }
.guide-content :deep(.template-block) { padding: 16px; background: var(--bg-surface); border-radius: var(--radius); border-left: 4px solid var(--primary); line-height: 1.8; }
.guide-content :deep(.template-block p) { margin-bottom: 8px; font-size: 14px; white-space: pre-line; }
.guide-content :deep(.checklist) { display: flex; flex-direction: column; gap: 12px; }
.guide-content :deep(.checklist-item) { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-secondary); cursor: pointer; }
.guide-content :deep(.checklist-item input) { width: 18px; height: 18px; accent-color: var(--primary); }
.guide-content :deep(.checklist-item span) { flex: 1; }
</style>
