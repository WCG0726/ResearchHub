<template>
  <div class="translate-page">
    <h1 class="page-title">翻译工具</h1>

    <!-- API 配置 -->
    <div class="card config-card">
      <div class="config-header" @click="showConfig = !showConfig">
        <h3 class="card-title">⚙️ API 配置</h3>
        <span class="toggle-icon">{{ showConfig ? '▲' : '▼' }}</span>
      </div>
      <div v-if="showConfig" class="config-body">
        <div class="form-row">
          <label>服务商</label>
          <select v-model="config.provider" class="select">
            <option value="openai">OpenAI</option>
            <option value="deepl">DeepL</option>
            <option value="custom">自定义 API</option>
          </select>
        </div>
        <div class="form-row">
          <label>API Key</label>
          <input v-model="config.apiKey" type="password" placeholder="sk-..." class="input" />
        </div>
        <div class="form-row" v-if="config.provider === 'custom'">
          <label>API 地址</label>
          <input v-model="config.baseUrl" type="text" placeholder="https://api.example.com/v1/chat/completions" class="input" />
        </div>
        <div class="form-row" v-if="config.provider === 'openai'">
          <label>模型</label>
          <input v-model="config.model" type="text" placeholder="gpt-4o-mini" class="input" />
        </div>
        <div class="form-row">
          <label>提示词风格</label>
          <select v-model="config.style" class="select">
            <option value="academic">学术论文</option>
            <option value="natural">自然流畅</option>
            <option value="formal">正式商务</option>
            <option value="simple">简洁明了</option>
          </select>
        </div>
        <button class="btn btn-save" @click="saveConfig">保存配置</button>
      </div>
    </div>

    <!-- 翻译区域 -->
    <div class="translate-box">
      <div class="lang-bar">
        <button class="lang-btn" :class="{ active: direction === 'en2zh' }" @click="direction = 'en2zh'">
          英 → 中
        </button>
        <button class="swap-btn" @click="swapLang">⇄</button>
        <button class="lang-btn" :class="{ active: direction === 'zh2en' }" @click="direction = 'zh2en'">
          中 → 英
        </button>
      </div>

      <div class="editor-row">
        <div class="editor-col">
          <textarea
            v-model="source"
            :placeholder="direction === 'en2zh' ? 'Enter English text...' : '输入中文文本...'"
            class="textarea"
            rows="10"
          ></textarea>
          <div class="editor-footer">
            <span class="char-count">{{ source.length }} 字符</span>
            <button class="btn-icon" @click="source = ''" title="清空">✕</button>
          </div>
        </div>

        <div class="editor-col">
          <div class="textarea result-area" :class="{ translating: loading }">
            <span v-if="loading" class="loading-dots">翻译中<span>.</span><span>.</span><span>.</span></span>
            <span v-else-if="result">{{ result }}</span>
            <span v-else class="placeholder">翻译结果将显示在这里...</span>
          </div>
          <div class="editor-footer">
            <span class="char-count">{{ result.length }} 字符</span>
            <button class="btn-icon" @click="copyResult" title="复制">📋</button>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="btn btn-primary btn-lg" @click="translate" :disabled="loading || !source.trim()">
          {{ loading ? '翻译中...' : '翻译' }}
        </button>
      </div>
    </div>

    <!-- 快捷短语 -->
    <div class="card">
      <h3 class="card-title">📝 常用学术翻译</h3>
      <div class="phrase-list">
        <div v-for="phrase in phrases" :key="phrase.en" class="phrase-item" @click="source = phrase.en; direction = 'en2zh'">
          <div class="phrase-en">{{ phrase.en }}</div>
          <div class="phrase-zh">{{ phrase.zh }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStorage, setStorage } from '../utils/storage'

const STYLE_PROMPTS = {
  academic: 'You are an academic translator. Translate the following text into natural, fluent Chinese suitable for academic papers. Preserve technical terminology. Output only the translation.',
  natural: 'Translate the following text into natural, fluent Chinese. Output only the translation.',
  formal: 'Translate the following text into formal business Chinese. Output only the translation.',
  simple: 'Translate the following text into simple, clear Chinese. Output only the translation.'
}

const STYLE_PROMPTS_EN = {
  academic: 'You are an academic translator. Translate the following text into polished, publication-ready English suitable for academic papers. Preserve technical terminology. Output only the translation.',
  natural: 'Translate the following text into natural, fluent English. Output only the translation.',
  formal: 'Translate the following text into formal business English. Output only the translation.',
  simple: 'Translate the following text into simple, clear English. Output only the translation.'
}

export default {
  name: 'TranslateView',
  data() {
    return {
      config: getStorage('translate_config', {
        provider: 'openai',
        apiKey: '',
        baseUrl: '',
        model: 'gpt-4o-mini',
        style: 'academic'
      }),
      showConfig: false,
      source: '',
      result: '',
      loading: false,
      direction: 'en2zh',
      phrases: [
        { en: 'This paper presents a novel approach to...', zh: '本文提出了一种新颖的方法来...' },
        { en: 'The results demonstrate that...', zh: '结果表明...' },
        { en: 'In conclusion, our findings suggest that...', zh: '总之，我们的研究结果表明...' },
        { en: 'The experimental setup is as follows...', zh: '实验设置如下...' },
        { en: 'As shown in Figure 1, ...', zh: '如图1所示，...' },
        { en: 'It is worth noting that...', zh: '值得注意的是...' },
        { en: 'The correlation between X and Y was found to be...', zh: 'X与Y之间的相关性被发现为...' },
        { en: 'Further investigation is required to...', zh: '需要进一步研究以...' }
      ]
    }
  },
  methods: {
    saveConfig() {
      setStorage('translate_config', this.config)
      this.showConfig = false
    },
    swapLang() {
      this.direction = this.direction === 'en2zh' ? 'zh2en' : 'en2zh'
      if (this.result) {
        this.source = this.result
        this.result = ''
      }
    },
    async translate() {
      if (!this.config.apiKey) {
        this.showConfig = true
        return
      }
      this.loading = true
      this.result = ''

      const prompt = this.direction === 'en2zh'
        ? STYLE_PROMPTS[this.config.style]
        : STYLE_PROMPTS_EN[this.config.style]

      try {
        if (this.config.provider === 'openai' || this.config.provider === 'custom') {
          const url = this.config.provider === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : this.config.baseUrl

          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
              model: this.config.model || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: this.source }
              ],
              temperature: 0.3
            })
          })
          const data = await resp.json()
          if (data.choices) {
            this.result = data.choices[0].message.content.trim()
          } else if (data.error) {
            this.result = '错误: ' + data.error.message
          }
        } else if (this.config.provider === 'deepl') {
          const resp = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auth_key: this.config.apiKey,
              text: this.source,
              target_lang: this.direction === 'en2zh' ? 'ZH' : 'EN'
            })
          })
          const data = await resp.json()
          if (data.translations) {
            this.result = data.translations[0].text
          }
        }
      } catch (e) {
        this.result = '请求失败: ' + e.message
      } finally {
        this.loading = false
      }
    },
    copyResult() {
      if (this.result) {
        navigator.clipboard.writeText(this.result)
      }
    }
  }
}
</script>

<style scoped>
.translate-page { max-width: 900px; margin: 0 auto; }

.config-card { margin-bottom: 16px; }

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.config-header .card-title { margin: 0; }

.toggle-icon { color: var(--text-muted); font-size: 12px; }

.config-body { margin-top: 16px; }

.form-row {
  margin-bottom: 12px;
}

.form-row label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.input, .select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.translate-box { margin-bottom: 16px; }

.lang-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.lang-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.swap-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: none;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.swap-btn:hover { transform: rotate(180deg); }

.editor-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 700px) {
  .editor-row { grid-template-columns: 1fr; }
}

.editor-col { position: relative; }

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
  min-height: 240px;
  display: flex;
  align-items: flex-start;
}

.result-area .placeholder { color: var(--text-muted); }

.translating { opacity: 0.7; }

.loading-dots span {
  animation: blink 1.4s infinite both;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.char-count { font-size: 12px; color: var(--text-muted); }

.btn-icon {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  color: var(--text-muted);
}

.btn-icon:hover { color: var(--text-primary); }

.action-bar {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.btn {
  padding: 10px 32px;
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-lg { padding: 12px 40px; font-size: 16px; }

.phrase-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phrase-item {
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.phrase-item:hover { background: var(--bg-hover); }

.phrase-en { font-size: 14px; color: var(--text-primary); margin-bottom: 2px; }
.phrase-zh { font-size: 13px; color: var(--text-secondary); }

.card-title {
  font-size: 16px;
  margin: 0 0 12px;
  color: var(--text-primary);
}
</style>
