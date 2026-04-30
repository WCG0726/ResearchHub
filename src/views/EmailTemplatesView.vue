<template>
  <div class="email-page">
    <h1 class="page-title">邮件模板</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索模板..." />
      <select v-model="filterCat" class="input filter-select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 自定义模板</button>
    </div>

    <!-- AI 邮件生成 -->
    <div class="card ai-section">
      <h3 class="card-title">🤖 AI 邮件生成</h3>
      <p class="ai-desc">描述邮件场景和关键信息，AI 帮你生成专业邮件。</p>
      <div class="form-group">
        <label>邮件场景</label>
        <input v-model="aiScenario" class="input" placeholder="如：向导师汇报本周实验进展" />
      </div>
      <div class="form-group">
        <label>关键信息</label>
        <textarea v-model="aiKeyInfo" class="input textarea" rows="3" placeholder="需要包含的关键内容..."></textarea>
      </div>
      <div class="ai-controls">
        <button class="btn btn-primary" :disabled="aiLoading" @click="aiGenerate">{{ aiLoading ? '生成中...' : '生成邮件' }}</button>
      </div>
      <div v-if="aiMsg" class="ai-msg">{{ aiMsg }}</div>
      <div v-if="aiResult" class="ai-result">
        <div class="ai-result-header">
          <span>生成结果</span>
          <div class="ai-result-actions">
            <button class="btn btn-sm btn-outline" @click="aiCopyResult">复制</button>
            <button class="btn btn-sm btn-outline" @click="aiSaveAsTemplate">保存为模板</button>
          </div>
        </div>
        <pre class="ai-result-text">{{ aiResult }}</pre>
      </div>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">添加模板</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>模板名称 *</label>
          <input v-model="form.name" class="input" placeholder="如 投稿状态询问" />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category" class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            <option value="自定义">自定义</option>
          </select>
        </div>
        <div class="form-group full">
          <label>邮件内容</label>
          <textarea v-model="form.content" class="input textarea code-textarea" rows="12" placeholder="Dear ..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveTemplate">保存</button>
      </div>
    </div>

    <div v-for="cat in displayCategories" :key="cat" class="category-section">
      <h2 class="cat-title" @click="toggleCat(cat)">
        <span class="cat-arrow" :class="{ open: openCats[cat] }">▶</span>
        {{ cat }}
      </h2>
      <div v-if="openCats[cat]" class="cat-body">
        <div v-for="t in templatesByCat(cat)" :key="t.id" class="card template-card">
          <div class="tpl-header">
            <span class="tpl-name">{{ t.name }}</span>
            <div class="tpl-actions">
              <button class="btn btn-sm btn-outline" @click="copyContent(t.content)">复制</button>
              <button v-if="t.custom" class="btn-icon" @click="removeTemplate(t.id)">🗑️</button>
            </div>
          </div>
          <pre class="tpl-content">{{ t.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getEmailTemplates, addEmailTemplate, deleteEmailTemplate } from '../utils/storage'
import { generateEmail, isAIConfigured } from '../utils/ai'

const BUILT_IN = [
  {
    name: '投稿状态询问',
    category: '投稿沟通',
    content: `Dear Editor,

I hope this email finds you well. I am writing to inquire about the current status of our manuscript entitled "[Title]" (Manuscript ID: XXX), which was submitted to [Journal Name] on [Date].

We have not yet received any feedback regarding the review process. Could you kindly provide an update on the expected timeline for the editorial decision?

Thank you for your time and consideration.

Best regards,
[Your Name]`
  },
  {
    name: '审稿意见回复',
    category: '投稿沟通',
    content: `Dear Editor,

Thank you for the opportunity to revise our manuscript entitled "[Title]" (Manuscript ID: XXX). We are grateful for the constructive comments from the reviewers.

We have carefully addressed all the comments and suggestions. The revised manuscript has been highlighted with yellow color for the modified parts. A detailed point-by-point response to each reviewer comment is attached.

We believe the manuscript has been significantly improved based on the reviewers' suggestions. We hope the revised version is suitable for publication in [Journal Name].

Thank you for your consideration.

Best regards,
[Your Name]`
  },
  {
    name: '询问导师进度',
    category: '导师沟通',
    content: `Dear Prof. [Name],

I hope you are doing well. I am writing to follow up on [specific topic, e.g., the draft of my paper / my research proposal / the experiment plan].

I have completed [brief description of what you've done], and would appreciate your feedback when you have time. I am available to meet at your convenience.

Thank you for your guidance.

Best regards,
[Your Name]`
  },
  {
    name: '汇报研究进展',
    category: '导师沟通',
    content: `Dear Prof. [Name],

I would like to update you on my recent research progress:

1. [Task 1]: [Brief description of progress]
2. [Task 2]: [Brief description of progress]
3. [Task 3]: [Brief description of progress]

Issues encountered:
- [Problem 1 and attempted solutions]

Plans for next week:
- [Planned tasks]

Please let me know if you have any suggestions or if we should discuss further.

Best regards,
[Your Name]`
  },
  {
    name: '会议注册/摘要提交',
    category: '学术会议',
    content: `Dear [Conference/Organizer],

I would like to register for [Conference Name] and submit an abstract for [oral/poster] presentation.

Title: [Your Title]
Authors: [Author list]
Affiliation: [Your institution]

Abstract:
[Your abstract text]

I confirm that all authors have approved this submission. Please let me know if any additional information is needed.

Thank you.

Best regards,
[Your Name]`
  },
  {
    name: '请求推荐信',
    category: '其他',
    content: `Dear Prof. [Name],

I hope this email finds you well. I am applying for [position/program/scholarship] and would be honored if you could provide a letter of recommendation for me.

The deadline for submission is [Date]. I have attached my CV and a brief summary of my research for your reference.

If you are willing to write the recommendation, I would be happy to provide any additional information you may need.

Thank you very much for your support.

Best regards,
[Your Name]`
  },
  {
    name: '联系合作者',
    category: '其他',
    content: `Dear Prof. [Name],

I am [Your Name], a [PhD student/researcher] at [Your Institution], working on [research area].

I have read your recent publication "[Paper Title]" with great interest. Your work on [specific topic] is highly relevant to our ongoing research on [your topic].

I was wondering if there might be an opportunity for collaboration. Specifically, I am interested in [specific collaboration idea].

I would be happy to discuss this further at your convenience. Please find my CV attached for your reference.

Thank you for your time.

Best regards,
[Your Name]`
  }
]

export default {
  name: 'EmailTemplatesView',
  data() {
    return {
      customTemplates: [],
      search: '',
      filterCat: '',
      showForm: false,
      form: { name: '', category: '自定义', content: '' },
      openCats: {},
      aiScenario: '',
      aiKeyInfo: '',
      aiResult: '',
      aiLoading: false,
      aiMsg: ''
    }
  },
  computed: {
    allTemplates() {
      const built = BUILT_IN.map(t => ({ ...t, custom: false }))
      const custom = this.customTemplates.map(t => ({ ...t, custom: true }))
      return [...built, ...custom]
    },
    categories() { return [...new Set(this.allTemplates.map(t => t.category))] },
    displayCategories() {
      let cats = this.categories
      if (this.filterCat) cats = cats.filter(c => c === this.filterCat)
      return cats
    }
  },
  methods: {
    templatesByCat(cat) {
      return this.allTemplates.filter(t => {
        const matchCat = t.category === cat
        const matchSearch = !this.search || t.name.toLowerCase().includes(this.search.toLowerCase()) || t.content.toLowerCase().includes(this.search.toLowerCase())
        return matchCat && matchSearch
      })
    },
    toggleCat(cat) { this.openCats = { ...this.openCats, [cat]: !this.openCats[cat] } },
    copyContent(content) {
      const ta = document.createElement('textarea')
      ta.value = content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('已复制到剪贴板')
    },
    saveTemplate() {
      if (!this.form.name.trim() || !this.form.content.trim()) return alert('请填写名称和内容')
      addEmailTemplate(this.form)
      this.customTemplates = getEmailTemplates()
      this.showForm = false
      this.form = { name: '', category: '自定义', content: '' }
    },
    removeTemplate(id) { if (!confirm('确定删除？')) return; deleteEmailTemplate(id); this.customTemplates = getEmailTemplates() },
    async aiGenerate() {
      if (!isAIConfigured()) { this.aiMsg = '请先在"翻译"页面配置 API Key'; return }
      if (!this.aiScenario.trim()) { this.aiMsg = '请填写邮件场景'; return }
      this.aiLoading = true
      this.aiMsg = ''
      try {
        this.aiResult = await generateEmail(this.aiScenario, this.aiKeyInfo)
      } catch (e) {
        this.aiMsg = e.message
      } finally {
        this.aiLoading = false
      }
    },
    aiCopyResult() {
      navigator.clipboard.writeText(this.aiResult).then(() => { this.aiMsg = '✓ 已复制'; setTimeout(() => { this.aiMsg = '' }, 2000) })
    },
    aiSaveAsTemplate() {
      if (!this.aiResult) return
      this.form = { name: this.aiScenario || 'AI 生成邮件', category: '自定义', content: this.aiResult }
      this.showForm = true
    }
  },
  mounted() {
    this.customTemplates = getEmailTemplates()
    this.openCats = { '投稿沟通': true }
  }
}
</script>

<style scoped>
.email-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.code-textarea { font-family: 'Consolas', monospace; font-size: 13px; line-height: 1.6; }
.category-section { margin-bottom: 20px; }
.cat-title { font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 0; user-select: none; }
.cat-title:hover { color: var(--primary); }
.cat-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; }
.cat-arrow.open { transform: rotate(90deg); }
.cat-body { display: flex; flex-direction: column; gap: 12px; }
.template-card { padding: 16px; }
.tpl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tpl-name { font-weight: 600; font-size: 15px; }
.tpl-actions { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.tpl-content { background: var(--bg-surface); padding: 14px 16px; border-radius: var(--radius); font-size: 13px; line-height: 1.7; margin: 0; white-space: pre-wrap; font-family: 'Consolas', monospace; color: var(--text-primary); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.ai-section { margin-bottom: 24px; }
.ai-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
.ai-controls { margin-top: 8px; }
.ai-msg { font-size: 13px; color: var(--primary); margin-top: 8px; }
.ai-result { margin-top: 12px; background: var(--bg-secondary); border-radius: var(--radius); padding: 14px; }
.ai-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: var(--primary); }
.ai-result-actions { display: flex; gap: 6px; }
.ai-result-text { margin: 0; font-size: 13px; line-height: 1.7; white-space: pre-wrap; font-family: 'Consolas', monospace; color: var(--text-primary); }
</style>
