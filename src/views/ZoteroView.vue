<template>
  <div class="zotero-page">
    <h1 class="page-title">Zotero 文献管理</h1>

    <!-- 连接状态 -->
    <div class="card status-card">
      <div v-if="connected" class="status-connected">
        <span class="status-icon">✅</span>
        <div>
          <h3>已连接 Zotero</h3>
          <p class="status-desc">{{ config.useLocal ? '本地 Zotero' : 'Web API' }} · {{ items.length }} 篇文献</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="showConfig = true">设置</button>
        <button class="btn btn-outline btn-sm" @click="fetchItems">刷新</button>
      </div>
      <div v-else class="status-disconnected">
        <span class="status-icon">📚</span>
        <div>
          <h3>连接 Zotero</h3>
          <p class="status-desc">同步你的文献库，自动识别已读文献</p>
        </div>
        <button class="btn btn-primary" @click="showConfig = true">配置连接</button>
      </div>
    </div>

    <!-- 配置弹窗 -->
    <Teleport to="body">
      <div v-if="showConfig" class="modal-overlay" @click.self="showConfig = false">
        <div class="modal">
          <h3>Zotero 连接配置</h3>
          <div class="config-tabs">
            <button class="tab" :class="{ active: configTab === 'local' }" @click="configTab = 'local'">本地连接</button>
            <button class="tab" :class="{ active: configTab === 'web' }" @click="configTab = 'web'">Web API</button>
          </div>

          <div v-if="configTab === 'local'">
            <p class="config-hint">确保 Zotero 已启动并开启本地 API（默认开启）</p>
            <div class="config-actions">
              <button class="btn btn-primary" @click="connectLocal">检测并连接</button>
            </div>
            <p v-if="localStatus" :class="localStatus.ok ? 'msg-success' : 'msg-error'">{{ localStatus.msg }}</p>
          </div>

          <div v-if="configTab === 'web'">
            <div class="form-group">
              <label>API Key</label>
              <input v-model="editApiKey" type="text" placeholder="在 zotero.org/settings/keys 创建" />
            </div>
            <div class="form-group">
              <label>User ID</label>
              <input v-model="editUserId" type="text" placeholder="在 zotero.org/settings/keys 页面查看" />
            </div>
            <p class="config-hint">
              获取方式：登录 <a href="https://www.zotero.org/settings/keys" target="_blank">zotero.org/settings/keys</a>
            </p>
            <div class="config-actions">
              <button class="btn btn-primary" @click="connectWeb">连接</button>
            </div>
            <p v-if="webStatus" :class="webStatus.ok ? 'msg-success' : 'msg-error'">{{ webStatus.msg }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="showConfig = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 文献列表 -->
    <div v-if="connected && items.length > 0" class="card">
      <h3 class="card-title">最近阅读的文献</h3>
      <div class="item-list">
        <div v-for="item in items" :key="item.key || item.title" class="item-card">
          <div class="item-type">{{ typeLabel(item.itemType) }}</div>
          <h4 class="item-title">
            <a v-if="item.url || item.DOI" :href="item.DOI ? `https://doi.org/${item.DOI}` : item.url" target="_blank">{{ item.title }}</a>
            <span v-else>{{ item.title }}</span>
          </h4>
          <div class="item-meta">
            <span class="item-authors">{{ formatAuthors(item.creators) }}</span>
            <span v-if="item.date" class="item-date">{{ item.date }}</span>
          </div>
          <div v-if="item.tags && item.tags.length" class="item-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
          </div>
          <p v-if="item.abstractNote" class="item-abstract">{{ truncate(item.abstractNote, 150) }}</p>
          <!-- AI 分析按钮 -->
          <div v-if="aiReady" class="ai-actions">
            <button class="ai-btn" :class="{ active: getAIResult(item, 'summary') }" :disabled="isLoading(item, 'summary')" @click="runAI(item, 'summary')">
              {{ isLoading(item, 'summary') ? '分析中...' : '📋 摘要' }}
            </button>
            <button class="ai-btn" :class="{ active: getAIResult(item, 'findings') }" :disabled="isLoading(item, 'findings')" @click="runAI(item, 'findings')">
              {{ isLoading(item, 'findings') ? '分析中...' : '🔍 关键发现' }}
            </button>
            <button class="ai-btn" :class="{ active: getAIResult(item, 'related') }" :disabled="isLoading(item, 'related')" @click="runAI(item, 'related')">
              {{ isLoading(item, 'related') ? '分析中...' : '🔗 相关研究' }}
            </button>
            <button class="ai-btn" :class="{ active: getAIResult(item, 'difficulty') }" :disabled="isLoading(item, 'difficulty')" @click="runAI(item, 'difficulty')">
              {{ isLoading(item, 'difficulty') ? '分析中...' : '📊 难度' }}
            </button>
          </div>
          <!-- AI 结果展示 -->
          <div v-for="type in ['summary', 'findings', 'related', 'difficulty']" :key="type">
            <div v-if="getAIResult(item, type)" class="ai-result-box">
              <div class="ai-result-label">{{ { summary: 'AI 摘要', findings: '关键发现', related: '相关研究', difficulty: '难度评估' }[type] }}</div>
              <div class="ai-result-text" v-html="formatAIResult(getAIResult(item, type))"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="connected && items.length === 0" class="card">
      <div class="empty">
        <div class="empty-icon">📭</div>
        <div class="empty-text">未获取到文献，请在 Zotero 中添加文献后刷新</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getZoteroConfig, saveZoteroConfig, detectLocalZotero, getRecentFromLocal, getRecentFromWeb, formatCreators } from '../utils/zotero'
import { isAIConfigured, summarizePaper, extractKeyFindings, recommendRelatedPapers, assessReadingDifficulty } from '../utils/ai'

export default {
  name: 'ZoteroView',
  data() {
    const config = getZoteroConfig()
    return {
      config,
      connected: config.connected,
      items: [],
      showConfig: false,
      configTab: 'local',
      editApiKey: config.apiKey,
      editUserId: config.userId,
      localStatus: null,
      webStatus: null,
      aiReady: isAIConfigured(),
      aiResults: {},
      aiLoading: null
    }
  },
  methods: {
    formatAuthors: formatCreators,
    truncate(str, len) {
      return str && str.length > len ? str.slice(0, len) + '...' : str
    },
    formatAIResult(text) {
      if (!text) return ''
      return text.replace(/\n/g, '<br>').replace(/(\d+\.)\s/g, '<strong>$1</strong> ')
    },
    typeLabel(type) {
      const map = {
        journalArticle: '期刊',
        conferencePaper: '会议',
        book: '图书',
        bookSection: '书章',
        thesis: '学位论文',
        preprint: '预印本',
        report: '报告',
        webpage: '网页'
      }
      return map[type] || type
    },
    async connectLocal() {
      this.localStatus = null
      const ok = await detectLocalZotero()
      if (ok) {
        saveZoteroConfig({ useLocal: true, connected: true })
        this.config = getZoteroConfig()
        this.connected = true
        this.localStatus = { ok: true, msg: '连接成功！' }
        await this.fetchItems()
      } else {
        this.localStatus = { ok: false, msg: '未检测到本地 Zotero，请确保 Zotero 已启动' }
      }
    },
    async connectWeb() {
      this.webStatus = null
      if (!this.editApiKey || !this.editUserId) {
        this.webStatus = { ok: false, msg: '请填写 API Key 和 User ID' }
        return
      }
      try {
        const items = await getRecentFromWeb(this.editApiKey, this.editUserId)
        saveZoteroConfig({ apiKey: this.editApiKey, userId: this.editUserId, useLocal: false, connected: true })
        this.config = getZoteroConfig()
        this.connected = true
        this.items = items
        this.webStatus = { ok: true, msg: `连接成功！获取到 ${items.length} 篇文献` }
      } catch {
        this.webStatus = { ok: false, msg: '连接失败，请检查 API Key 和 User ID' }
      }
    },
    async fetchItems() {
      const cfg = getZoteroConfig()
      if (cfg.useLocal) {
        this.items = await getRecentFromLocal()
      } else if (cfg.apiKey && cfg.userId) {
        this.items = await getRecentFromWeb(cfg.apiKey, cfg.userId)
      }
    },
    async runAI(item, type) {
      const key = item.key || item.title
      const loadingKey = `${key}|${type}`
      if (this.aiLoading === loadingKey) return
      this.aiLoading = loadingKey
      const title = item.title || ''
      const abstract = item.abstractNote || ''
      const field = item.tags?.[0] || ''
      try {
        let result
        if (type === 'summary') result = await summarizePaper(title, abstract)
        else if (type === 'findings') result = await extractKeyFindings(title, abstract)
        else if (type === 'related') result = await recommendRelatedPapers(title, abstract, field)
        else if (type === 'difficulty') result = await assessReadingDifficulty(title, abstract)
        if (!this.aiResults[key]) this.aiResults[key] = {}
        this.aiResults[key][type] = result
      } catch (e) {
        if (!this.aiResults[key]) this.aiResults[key] = {}
        this.aiResults[key][type] = '错误: ' + e.message
      } finally {
        this.aiLoading = null
      }
    },
    getAIResult(item, type) {
      const key = item.key || item.title
      return this.aiResults[key]?.[type] || ''
    },
    isLoading(item, type) {
      const key = item.key || item.title
      return this.aiLoading === `${key}|${type}`
    }
  },
  async mounted() {
    if (this.connected) {
      await this.fetchItems()
    }
  }
}
</script>

<style scoped>
.zotero-page { max-width: 900px; }

.status-card { margin-bottom: 24px; }

.status-connected, .status-disconnected {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon { font-size: 36px; }

.status-connected h3 { color: var(--success); margin: 0 0 4px; }
.status-disconnected h3 { color: var(--text-primary); margin: 0 0 4px; }

.status-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.status-connected .btn-outline { margin-left: auto; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 440px;
  max-width: 90vw;
}

.modal h3 { margin: 0 0 20px; font-size: 18px; color: var(--text-primary); }

.config-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.tab {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.config-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.config-hint a { color: var(--primary); }

.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; }
.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.config-actions { margin: 12px 0; }
.msg-success { color: var(--success); font-size: 13px; }
.msg-error { color: var(--danger); font-size: 13px; }

.modal-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
}

.item-list { display: flex; flex-direction: column; gap: 16px; }

.item-card {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.item-type {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.5;
}

.item-title a { color: var(--primary); }
.item-title a:hover { text-decoration: underline; }

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.item-authors { font-style: italic; }

.item-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.item-abstract {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 6px 0 0;
}

.ai-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.ai-btn {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-btn:hover { border-color: var(--primary); color: var(--primary); }
.ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-btn.active { background: rgba(99, 102, 241, 0.08); border-color: var(--primary); color: var(--primary); }

.ai-result-box {
  margin-top: 10px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius);
}

.ai-result-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 6px;
}

.ai-result-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.7;
}
</style>
