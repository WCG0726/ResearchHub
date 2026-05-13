<template>
  <div class="translate-page">
    <h1 class="page-title">翻译工具</h1>

    <div v-if="!aiReady" class="card" style="text-align:center;padding:24px">
      <p style="color:var(--text-secondary);margin-bottom:12px">请先在「设置」页面配置 API Key 后使用翻译功能</p>
      <router-link to="/settings" class="btn btn-primary" style="text-decoration:none;display:inline-block;padding:8px 24px">前往设置</router-link>
    </div>

    <template v-else>
    <!-- 翻译风格 -->
    <div class="card" style="margin-bottom:12px">
      <div class="style-bar">
        <span class="style-label">翻译风格：</span>
        <button v-for="s in styles" :key="s.value" class="style-btn" :class="{ active: style === s.value }" @click="style = s.value">{{ s.label }}</button>
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
    </template>
  </div>
</template>

<script>
import { isAIConfigured, translateText } from '../utils/ai'

export default {
  name: 'TranslateView',
  data() {
    return {
      aiReady: isAIConfigured(),
      source: '',
      result: '',
      loading: false,
      direction: 'en2zh',
      style: 'academic',
      styles: [
        { value: 'academic', label: '学术论文' },
        { value: 'natural', label: '自然流畅' },
        { value: 'formal', label: '正式商务' },
        { value: 'simple', label: '简洁明了' }
      ],
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
    swapLang() {
      this.direction = this.direction === 'en2zh' ? 'zh2en' : 'en2zh'
      if (this.result) {
        this.source = this.result
        this.result = ''
      }
    },
    async translate() {
      this.loading = true
      this.result = ''
      try {
        this.result = await translateText(this.source, this.direction, this.style)
      } catch (e) {
        this.result = '翻译失败: ' + e.message
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

.style-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.style-label { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }

.style-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.style-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
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
