<template>
  <div class="polish-page">
    <h1 class="page-title">论文润色提示词</h1>

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

    <div class="card intro">
      <p>以下提示词也可复制到 ChatGPT / Claude / DeepL Write 等 AI 工具中使用。</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filters">
      <button v-for="cat in categories" :key="cat.key" class="filter-btn" :class="{ active: activeCat === cat.key }" @click="activeCat = cat.key">
        {{ cat.label }}
      </button>
    </div>

    <!-- 提示词列表 -->
    <div class="prompt-list">
      <div v-for="prompt in filtered" :key="prompt.id" class="card prompt-card">
        <div class="prompt-header">
          <h3 class="prompt-title">{{ prompt.title }}</h3>
          <button class="btn-copy" @click="copyPrompt(prompt.text)">
            {{ copiedId === prompt.id ? '✓ 已复制' : '📋 复制' }}
          </button>
        </div>
        <div class="prompt-desc">{{ prompt.desc }}</div>
        <div class="prompt-text">
          <pre>{{ prompt.text }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { polishText, isAIConfigured } from '../utils/ai'
import { POLISH_PROMPTS, POLISH_CATEGORIES } from '../data/polishPrompts'

export default {
  name: 'PolishView',
  data() {
    return {
      prompts: POLISH_PROMPTS,
      categories: POLISH_CATEGORIES,
      activeCat: 'all',
      copiedId: null,
      aiStyle: 'academic',
      aiInput: '',
      aiResult: '',
      aiError: '',
      aiLoading: false,
      aiCopied: false
    }
  },
  computed: {
    filtered() {
      if (this.activeCat === 'all') return this.prompts
      return this.prompts.filter(p => p.cat === this.activeCat)
    }
  },
  methods: {
    copyPrompt(text) {
      navigator.clipboard.writeText(text).then(() => {
        const prompt = this.prompts.find(p => p.text === text)
        if (prompt) {
          this.copiedId = prompt.id
          setTimeout(() => { this.copiedId = null }, 2000)
        }
      })
    },
    async runPolish() {
      if (!isAIConfigured()) { this.aiError = '请先在翻译页面配置 API Key'; return }
      this.aiLoading = true
      this.aiError = ''
      this.aiResult = ''
      try {
        this.aiResult = await polishText(this.aiInput, this.aiStyle)
      } catch (e) {
        this.aiError = e.message
      } finally {
        this.aiLoading = false
      }
    },
    copyResult() {
      navigator.clipboard.writeText(this.aiResult).then(() => {
        this.aiCopied = true
        setTimeout(() => { this.aiCopied = false }, 2000)
      })
    }
  }
}
</script>

<style scoped>
.polish-page { max-width: 800px; margin: 0 auto; }

.intro {
  margin-bottom: 16px;
}

.intro p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-card { margin-bottom: 0; }

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.prompt-title {
  font-size: 16px;
  margin: 0;
  color: var(--text-primary);
}

.btn-copy {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.prompt-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.prompt-text {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 12px;
  overflow-x: auto;
}

.prompt-text pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}

/* AI 直接润色 */
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
</style>
