<template>
  <div class="writing-page">
    <h1 class="page-title">论文写作</h1>

    <!-- 论文列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">我的论文</h3>
        <button class="btn btn-primary btn-sm" @click="showEditor = true">+ 新建论文</button>
      </div>

      <div v-if="papers.length === 0" class="empty">
        <div class="empty-icon">📄</div>
        <div class="empty-text">暂无论文项目</div>
      </div>

      <div v-else class="papers-list">
        <div v-for="paper in papers" :key="paper.id" class="paper-item" @click="selectPaper(paper)">
          <div class="paper-info">
            <h4 class="paper-title">{{ paper.title }}</h4>
            <p class="paper-journal">{{ paper.journal || '未指定期刊' }}</p>
          </div>
          <div class="paper-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: paper.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ paper.progress }}%</span>
          </div>
          <span class="paper-status tag" :class="'tag-' + getStatusType(paper.status)">
            {{ paper.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- 选中论文详情 -->
    <div v-if="selectedPaper" class="card paper-detail">
      <div class="paper-detail-header">
        <div>
          <h3 class="card-title">{{ selectedPaper.title }}</h3>
          <div class="paper-meta">
            <select v-model="selectedPaper.status" class="paper-status-select" @change="savePapers">
              <option>构思</option>
              <option>写作中</option>
              <option>修改中</option>
              <option>已投稿</option>
              <option>已接收</option>
            </select>
            <span class="paper-updated">最后更新：{{ formatDateTime(selectedPaper.updatedAt || selectedPaper.createdAt) }}</span>
          </div>
        </div>
        <div class="paper-detail-actions">
          <button class="btn btn-outline btn-sm" @click="aiGenerateAbstract" :disabled="aiLoading">
            {{ aiLoading ? '生成中...' : 'AI 生成摘要' }}
          </button>
          <button class="btn btn-outline btn-sm btn-danger" @click="deletePaper(selectedPaper.id)">删除论文</button>
        </div>
      </div>

      <!-- AI 摘要结果 -->
      <div v-if="aiAbstractResult" class="ai-result-box">
        <div class="ai-result-header">
          <span>AI 生成的摘要</span>
          <div>
            <button class="btn btn-primary btn-xs" @click="copyAbstract">复制</button>
            <button class="btn-close-sm" @click="aiAbstractResult = ''">×</button>
          </div>
        </div>
        <pre class="ai-result-text">{{ aiAbstractResult }}</pre>
      </div>

      <!-- 章节进度 -->
      <div class="sections">
        <div v-for="(section, idx) in selectedPaper.sections" :key="idx" class="section-item">
          <div class="section-header">
            <span class="section-name">{{ section.name }}</span>
            <div class="section-actions">
              <button
                class="btn btn-outline btn-xs"
                @click="aiDraftSection(idx)"
                :disabled="aiLoading"
                title="AI 辅助生成草稿"
              >AI 辅助</button>
              <select v-model="section.status" class="section-status" @change="savePapers">
                <option value="未开始">未开始</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
          </div>
          <textarea
            v-model="section.notes"
            class="input textarea section-notes"
            placeholder="记录进展或想法..."
            @input="savePapers"
          ></textarea>
        </div>
      </div>

      <!-- 进度更新 -->
      <div class="progress-update">
        <label>总体进度：{{ selectedPaper.progress }}%</label>
        <input type="range" v-model.number="selectedPaper.progress" min="0" max="100" @input="savePapers" />
      </div>
    </div>

    <!-- 新建论文弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal">
        <h2 class="modal-title">新建论文</h2>

        <div class="form-group">
          <label>论文标题</label>
          <input v-model="newPaper.title" class="input" placeholder="输入论文标题" />
        </div>

        <div class="form-group">
          <label>目标期刊</label>
          <div class="input-with-btn">
            <input v-model="newPaper.journal" class="input" placeholder="如: Nature, Science, ACS Nano" />
            <button class="btn btn-outline btn-sm" @click="aiRecommendJournals" :disabled="aiLoading || !newPaper.title">
              {{ aiLoading ? '推荐中...' : 'AI 推荐' }}
            </button>
          </div>
          <div v-if="aiJournalResult" class="ai-result-box">
            <div class="ai-result-header">
              <span>AI 推荐结果</span>
              <button class="btn-close-sm" @click="aiJournalResult = ''">×</button>
            </div>
            <pre class="ai-result-text">{{ aiJournalResult }}</pre>
          </div>
        </div>

        <div class="form-group">
          <label>研究方向</label>
          <input v-model="newPaper.topic" class="input" placeholder="如: 热电材料" />
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeEditor">取消</button>
          <button class="btn btn-primary" @click="createPaper">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useWritingStore } from '../stores/writing'
import { recommendJournals, generateAbstract, generateSectionDraft, isAIConfigured } from '../utils/ai'

export default {
  name: 'WritingView',
  data() {
    return {
      writingStore: useWritingStore(),
      papers: [],
      selectedPaper: null,
      showEditor: false,
      newPaper: {
        title: '',
        journal: '',
        topic: ''
      },
      aiLoading: false,
      aiJournalResult: '',
      aiAbstractResult: '',
      aiError: ''
    }
  },
  methods: {
    selectPaper(paper) {
      this.selectedPaper = paper
    },
    createPaper() {
      const paper = {
        id: Date.now(),
        title: this.newPaper.title,
        journal: this.newPaper.journal,
        topic: this.newPaper.topic,
        status: '构思',
        progress: 0,
        sections: [
          { name: '摘要 (Abstract)', status: '未开始', notes: '' },
          { name: '引言 (Introduction)', status: '未开始', notes: '' },
          { name: '方法 (Methods)', status: '未开始', notes: '' },
          { name: '结果 (Results)', status: '未开始', notes: '' },
          { name: '讨论 (Discussion)', status: '未开始', notes: '' },
          { name: '结论 (Conclusion)', status: '未开始', notes: '' },
          { name: '参考文献 (References)', status: '未开始', notes: '' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.papers.unshift(paper)
      this.savePapers()
      this.closeEditor()
    },
    savePapers() {
      this.papers.forEach(p => {
        if (p.sections) {
          const completed = p.sections.filter(s => s.status === '已完成').length
          p.progress = Math.round((completed / p.sections.length) * 100)
        }
        p.updatedAt = new Date().toISOString()
      })
      this.writingStore.save({ papers: this.papers })
    },
    deletePaper(id) {
      if (!confirm('确定删除这篇论文？')) return
      this.papers = this.papers.filter(p => p.id !== id)
      this.selectedPaper = null
      this.savePapers()
    },
    closeEditor() {
      this.showEditor = false
      this.newPaper = { title: '', journal: '', topic: '' }
      this.aiJournalResult = ''
    },
    getStatusType(status) {
      const map = { '构思': 'primary', '写作中': 'warning', '修改中': 'info', '已投稿': 'success', '已接收': 'success' }
      return map[status] || 'primary'
    },
    formatDateTime(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    async aiRecommendJournals() {
      if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
      this.aiLoading = true
      this.aiJournalResult = ''
      try {
        this.aiJournalResult = await recommendJournals(this.newPaper.title, '', this.newPaper.topic)
      } catch (e) {
        alert('AI 推荐失败：' + e.message)
      }
      this.aiLoading = false
    },
    async aiDraftSection(idx) {
      if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
      if (!this.selectedPaper) return
      const section = this.selectedPaper.sections[idx]
      this.aiLoading = true
      try {
        const sectionName = section.name.replace(/\s*\(.*?\)/, '')
        const draft = await generateSectionDraft(sectionName, this.selectedPaper.title, section.notes || this.selectedPaper.topic)
        section.notes = (section.notes ? section.notes + '\n\n' : '') + '--- AI 生成草稿 ---\n' + draft
        section.status = '进行中'
        this.savePapers()
      } catch (e) {
        alert('AI 生成失败：' + e.message)
      }
      this.aiLoading = false
    },
    async aiGenerateAbstract() {
      if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
      if (!this.selectedPaper) return
      const completedSections = this.selectedPaper.sections
        .filter(s => s.status === '已完成' && s.notes)
        .map(s => `## ${s.name}\n${s.notes}`)
        .join('\n\n')
      if (!completedSections) { alert('请先完成至少一个章节并填写笔记'); return }
      this.aiLoading = true
      this.aiAbstractResult = ''
      try {
        this.aiAbstractResult = await generateAbstract(this.selectedPaper.title, completedSections)
      } catch (e) {
        alert('AI 生成摘要失败：' + e.message)
      }
      this.aiLoading = false
    },
    copyAbstract() {
      navigator.clipboard.writeText(this.aiAbstractResult).then(() => {
        alert('已复制到剪贴板')
      })
    },
    loadData() {
      this.writingStore.load()
      this.papers = this.writingStore.papers || []
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.writing-page {
  max-width: 900px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.paper-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.paper-item:hover {
  background: var(--bg-hover);
}

.paper-info {
  flex: 1;
}

.paper-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.paper-journal {
  font-size: 13px;
  color: var(--text-muted);
}

.paper-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
  width: 40px;
  text-align: right;
}

.paper-detail {
  margin-top: 24px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.section-item {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-name {
  font-weight: 600;
  color: var(--text-primary);
}

.section-status {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.section-notes {
  min-height: 60px;
  font-size: 14px;
}

.progress-update {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.progress-update label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.progress-update input[type="range"] {
  width: 100%;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32px;
  width: 90%;
  max-width: 500px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.input-with-btn {
  display: flex;
  gap: 8px;
}

.input-with-btn .input { flex: 1; }

.paper-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.paper-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.paper-status-select {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.paper-updated {
  font-size: 12px;
  color: var(--text-muted);
}

.paper-detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-danger {
  color: var(--danger);
  border-color: var(--danger);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-xs {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

.ai-result-box {
  margin-top: 12px;
  padding: 12px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius);
}

.ai-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.ai-result-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.btn-close-sm {
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 4px;
}

.btn-close-sm:hover { color: var(--text-primary); }
</style>
