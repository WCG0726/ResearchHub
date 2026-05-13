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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmailTemplatesStore } from '../stores/emailTemplates'
import { generateEmail, isAIConfigured } from '../utils/ai'
import { EMAIL_TEMPLATES } from '../data/emailTemplates'

const emailTemplatesStore = useEmailTemplatesStore()

const customTemplates = ref([])
const search = ref('')
const filterCat = ref('')
const showForm = ref(false)
const form = ref({ name: '', category: '自定义', content: '' })
const openCats = ref({})
const aiScenario = ref('')
const aiKeyInfo = ref('')
const aiResult = ref('')
const aiLoading = ref(false)
const aiMsg = ref('')

const allTemplates = computed(() => {
  const built = EMAIL_TEMPLATES.map(t => ({ ...t, custom: false }))
  const custom = customTemplates.value.map(t => ({ ...t, custom: true }))
  return [...built, ...custom]
})

const categories = computed(() => [...new Set(allTemplates.value.map(t => t.category))])

const displayCategories = computed(() => {
  let cats = categories.value
  if (filterCat.value) cats = cats.filter(c => c === filterCat.value)
  return cats
})

function templatesByCat(cat) {
  return allTemplates.value.filter(t => {
    const matchCat = t.category === cat
    const matchSearch = !search.value || t.name.toLowerCase().includes(search.value.toLowerCase()) || t.content.toLowerCase().includes(search.value.toLowerCase())
    return matchCat && matchSearch
  })
}

function toggleCat(cat) {
  openCats.value = { ...openCats.value, [cat]: !openCats.value[cat] }
}

function copyContent(content) {
  const ta = document.createElement('textarea')
  ta.value = content
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
  alert('已复制到剪贴板')
}

function saveTemplate() {
  if (!form.value.name.trim() || !form.value.content.trim()) return alert('请填写名称和内容')
  emailTemplatesStore.add(form.value)
  customTemplates.value = emailTemplatesStore.templates
  showForm.value = false
  form.value = { name: '', category: '自定义', content: '' }
}

function removeTemplate(id) {
  if (!confirm('确定删除？')) return
  emailTemplatesStore.remove(id)
  customTemplates.value = emailTemplatesStore.templates
}

async function aiGenerate() {
  if (!isAIConfigured()) { aiMsg.value = '请先在"翻译"页面配置 API Key'; return }
  if (!aiScenario.value.trim()) { aiMsg.value = '请填写邮件场景'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    aiResult.value = await generateEmail(aiScenario.value, aiKeyInfo.value)
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}

function aiCopyResult() {
  navigator.clipboard.writeText(aiResult.value).then(() => {
    aiMsg.value = '✓ 已复制'
    setTimeout(() => { aiMsg.value = '' }, 2000)
  })
}

function aiSaveAsTemplate() {
  if (!aiResult.value) return
  form.value = { name: aiScenario.value || 'AI 生成邮件', category: '自定义', content: aiResult.value }
  showForm.value = true
}

onMounted(() => {
  emailTemplatesStore.load()
  customTemplates.value = emailTemplatesStore.templates
  openCats.value = { '投稿沟通': true }
})
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
