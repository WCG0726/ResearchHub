<template>
  <div class="format-rewrite-page">
    <h1 class="page-title">格式改写</h1>

    <div v-if="!aiReady" class="card" style="text-align:center;padding:24px">
      <p style="color:var(--text-secondary);margin-bottom:12px">请先在「设置」页面配置 API Key</p>
      <router-link to="/settings" class="btn btn-primary" style="text-decoration:none;display:inline-block;padding:8px 24px">前往设置</router-link>
    </div>

    <template v-else>
      <!-- 格式选择 -->
      <div class="card options-card">
        <div class="format-row">
          <div class="format-group">
            <label>源格式</label>
            <select v-model="sourceFormat" class="input">
              <option v-for="f in formats" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
          <span class="arrow">→</span>
          <div class="format-group">
            <label>目标格式</label>
            <select v-model="targetFormat" class="input">
              <option v-for="f in formats" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>
        <div class="options-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="opts.convertCitations" /> 转换引用格式
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="opts.restructureParagraphs" /> 重组段落结构
          </label>
          <div class="tone-group">
            <label>语调</label>
            <select v-model="opts.adjustTone" class="input input-sm">
              <option value="formal">正式</option>
              <option value="academic">学术</option>
              <option value="concise">简洁</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 编辑区 -->
      <div class="editor-row">
        <div class="editor-col">
          <div class="editor-header">
            <span>源文本</span>
            <span class="char-count">{{ source.length }} 字符</span>
          </div>
          <textarea v-model="source" class="textarea" rows="12" placeholder="粘贴需要改写的文本..."></textarea>
        </div>
        <div class="editor-col">
          <div class="editor-header">
            <span>改写结果</span>
            <button v-if="result" class="btn-icon" @click="copyResult" title="复制">📋</button>
          </div>
          <div class="textarea result-area" :class="{ streaming: isStreaming }">
            <span v-if="isStreaming && !displayText" class="loading-dots">改写中<span>.</span><span>.</span><span>.</span></span>
            <span v-else-if="displayText" v-html="formatResult(displayText)"></span>
            <span v-else class="placeholder">改写结果将显示在这里...</span>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="btn btn-primary btn-lg" @click="rewrite" :disabled="isStreaming || !source.trim()">
          {{ isStreaming ? '改写中...' : '开始改写' }}
        </button>
        <button v-if="isStreaming" class="btn btn-outline" @click="abortStream">停止</button>
      </div>

      <!-- 历史记录 -->
      <div v-if="history.length" class="card" style="margin-top:16px">
        <div class="history-header">
          <h3 class="card-title">改写历史</h3>
          <button class="btn-icon" @click="clearHistory" title="清空">🗑️</button>
        </div>
        <div class="history-list">
          <div v-for="(h, i) in history" :key="i" class="history-item" @click="loadHistory(h)">
            <div class="history-meta">{{ h.sourceFormat }} → {{ h.targetFormat }} · {{ h.time }}</div>
            <div class="history-preview">{{ h.source.slice(0, 60) }}...</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { isAIConfigured, rewriteFormat } from '../utils/ai'
import { getStorage, setStorage } from '../utils/storage'
import { useStreamingText } from '../composables/useStreamingText'

export default {
  name: 'FormatRewriteView',
  setup() {
    const { displayText, isStreaming, startStream, abort } = useStreamingText()
    return { displayText, isStreaming, startStream, abortStream: abort }
  },
  data() {
    return {
      aiReady: isAIConfigured(),
      source: '',
      result: '',
      sourceFormat: 'IEEE',
      targetFormat: 'APA 7th',
      formats: ['IEEE', 'APA 7th', 'Nature style', 'ACS style', 'Elsevier', 'Springer', '通用学术'],
      opts: {
        convertCitations: true,
        restructureParagraphs: true,
        adjustTone: 'formal'
      },
      history: getStorage('format_rewrite_history', [])
    }
  },
  watch: {
    displayText(val) { this.result = val }
  },
  methods: {
    async rewrite() {
      this.result = ''
      const prompt = `Rewrite the following text from "${this.sourceFormat}" format to "${this.targetFormat}" format.

Tasks:
${this.opts.convertCitations ? '- Convert all citation formats to match the target style' : '- Keep citation formats unchanged'}
${this.opts.restructureParagraphs ? '- Restructure paragraphs to fit the target format conventions' : '- Keep paragraph structure unchanged'}
- Adjust tone to: ${this.opts.adjustTone}
- Preserve all technical content and meaning
- Output only the rewritten text`
      await this.startStream(prompt, this.source, { temperature: 0.3, maxTokens: 2000 })
      this.saveToHistory()
    },
    saveToHistory() {
      if (!this.result) return
      const entry = {
        source: this.source,
        result: this.result,
        sourceFormat: this.sourceFormat,
        targetFormat: this.targetFormat,
        time: new Date().toLocaleString('zh-CN')
      }
      this.history.unshift(entry)
      if (this.history.length > 10) this.history = this.history.slice(0, 10)
      setStorage('format_rewrite_history', this.history)
    },
    loadHistory(h) {
      this.source = h.source
      this.sourceFormat = h.sourceFormat
      this.targetFormat = h.targetFormat
      this.result = h.result
      this.displayText = h.result
    },
    clearHistory() {
      this.history = []
      setStorage('format_rewrite_history', [])
    },
    copyResult() {
      if (this.result) navigator.clipboard.writeText(this.result)
    },
    formatResult(text) {
      return text.replace(/\n/g, '<br>')
    }
  }
}
</script>

<style scoped>
.format-rewrite-page { max-width: 960px; margin: 0 auto; }

.options-card { margin-bottom: 16px; }

.format-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.format-group { flex: 1; }
.format-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; }

.arrow { font-size: 20px; color: var(--text-muted); padding-bottom: 8px; }

.options-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.tone-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.tone-group label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
.input-sm { width: auto; padding: 4px 8px; font-size: 13px; }

.editor-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 700px) { .editor-row { grid-template-columns: 1fr; } }

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
}

.result-area {
  min-height: 280px;
  display: flex;
  align-items: flex-start;
}

.result-area .placeholder { color: var(--text-muted); }
.streaming { opacity: 0.8; border-color: var(--primary); }

.loading-dots span { animation: blink 1.4s infinite both; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }

.action-bar { display: flex; justify-content: center; gap: 10px; }

.btn { padding: 10px 32px; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-lg { padding: 12px 40px; font-size: 16px; }
.btn-outline { background: none; border: 1px solid var(--border); color: var(--text-primary); }

.btn-icon { background: none; border: none; font-size: 14px; cursor: pointer; padding: 4px; color: var(--text-muted); }
.btn-icon:hover { color: var(--text-primary); }

.char-count { font-size: 12px; color: var(--text-muted); }

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.history-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 16px; margin: 0; color: var(--text-primary); }

.history-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }

.history-item {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover { background: var(--bg-hover); }
.history-meta { font-size: 12px; color: var(--text-muted); margin-bottom: 2px; }
.history-preview { font-size: 13px; color: var(--text-secondary); }
</style>
