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
      <h3 class="card-title">{{ selectedPaper.title }}</h3>

      <!-- 章节进度 -->
      <div class="sections">
        <div v-for="(section, idx) in selectedPaper.sections" :key="idx" class="section-item">
          <div class="section-header">
            <span class="section-name">{{ section.name }}</span>
            <select v-model="section.status" class="section-status" @change="savePapers">
              <option value="未开始">未开始</option>
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
            </select>
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
          <input v-model="newPaper.journal" class="input" placeholder="如: Nature, Science, ACS Nano" />
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
import { getWritingProgress, setWritingProgress } from '../utils/storage'

export default {
  name: 'WritingView',
  data() {
    return {
      papers: [],
      selectedPaper: null,
      showEditor: false,
      newPaper: {
        title: '',
        journal: '',
        topic: ''
      }
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
        createdAt: new Date().toISOString()
      }
      this.papers.unshift(paper)
      this.savePapers()
      this.closeEditor()
    },
    savePapers() {
      // 更新论文状态
      this.papers.forEach(p => {
        if (p.sections) {
          const completed = p.sections.filter(s => s.status === '已完成').length
          p.progress = Math.round((completed / p.sections.length) * 100)
        }
      })
      setWritingProgress({ papers: this.papers })
    },
    closeEditor() {
      this.showEditor = false
      this.newPaper = { title: '', journal: '', topic: '' }
    },
    getStatusType(status) {
      const map = { '构思': 'primary', '写作中': 'warning', '修改中': 'info', '已投稿': 'success' }
      return map[status] || 'primary'
    },
    loadData() {
      const data = getWritingProgress()
      this.papers = data.papers || []
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
</style>
