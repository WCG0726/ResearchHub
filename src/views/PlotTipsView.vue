<template>
  <div class="plot-tips-page">
    <h1 class="page-title">绘图技巧与模板</h1>

    <!-- AI 绑图代码生成器 -->
    <div class="card ai-plot-card">
      <h3 class="card-title" @click="showAIPanel = !showAIPanel" style="cursor:pointer">
        🤖 AI 一键作图
        <span class="toggle-icon">{{ showAIPanel ? '▲' : '▼' }}</span>
      </h3>
      <div v-if="showAIPanel">
        <div class="ai-plot-form">
          <div class="form-group">
            <label>描述你想要的图表</label>
            <textarea v-model="plotDesc" class="input textarea" rows="3" placeholder="例如：画一个 SnSe、Bi2Te3、PbTe 三种材料的 XRD 叠加图，2theta 范围 20-60°"></textarea>
          </div>
          <div class="ai-plot-options">
            <div class="form-group">
              <label>输出语言</label>
              <select v-model="plotLang" class="input">
                <option value="python">Python (matplotlib)</option>
                <option value="origin">Origin (LabTalk)</option>
              </select>
            </div>
            <div class="form-group">
              <label>图表类型</label>
              <select v-model="plotType" class="input">
                <option value="auto">自动检测</option>
                <option value="line">折线图</option>
                <option value="scatter">散点图</option>
                <option value="bar">柱状图</option>
                <option value="heatmap">热力图</option>
                <option value="XRD">XRD 图谱</option>
                <option value="stress_strain">应力-应变曲线</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" @click="generatePlot" :disabled="aiPlotLoading || !plotDesc.trim()">
            {{ aiPlotLoading ? '生成中...' : '生成代码' }}
          </button>
        </div>
        <div v-if="plotCode" class="ai-plot-result">
          <div class="result-header">
            <span>生成的代码</span>
            <button class="btn-icon" @click="copyPlotCode" title="复制">📋</button>
          </div>
          <pre class="code-block"><code>{{ plotCode }}</code></pre>
          <p class="ai-hint">提示：请检查代码后在相应环境中运行，AI 生成的代码可能需要微调</p>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索绘图技巧..." />
      <select v-model="filterCat" class="input filter-select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div v-for="cat in displayCategories" :key="cat" class="category-section">
      <h2 class="cat-title" @click="toggleCat(cat)">
        <span class="cat-arrow" :class="{ open: openCats[cat] }">▶</span>
        {{ cat }}
        <span class="cat-count">{{ tipsByCat(cat).length }}</span>
      </h2>
      <div v-if="openCats[cat]" class="cat-body">
        <div v-for="tip in tipsByCat(cat)" :key="tip.title" class="card tip-card">
          <h3 class="tip-title">{{ tip.title }}</h3>
          <div class="tip-content" v-html="tip.content"></div>
          <div v-if="tip.tools" class="tip-tools">
            <span class="tools-label">推荐工具：</span>
            <span v-for="t in tip.tools" :key="t" class="tag tag-primary">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义笔记 -->
    <div class="section-divider"></div>
    <h2 class="section-title">我的绘图笔记</h2>
    <div class="toolbar">
      <button class="btn btn-primary btn-sm" @click="showForm = true">+ 添加笔记</button>
    </div>
    <div v-if="showForm" class="card form-card">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="input" placeholder="如 Origin 画XRD图步骤" />
      </div>
      <div class="form-group">
        <label>内容</label>
        <textarea v-model="form.content" class="input textarea" rows="5" placeholder="记录你的绘图经验..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveNote">保存</button>
      </div>
    </div>
    <div v-for="n in customNotes" :key="n.id" class="card tip-card">
      <div class="tip-header">
        <h3 class="tip-title">{{ n.title }}</h3>
        <button class="btn-icon" @click="removeNote(n.id)">🗑️</button>
      </div>
      <div class="tip-content"><p>{{ n.content }}</p></div>
      <div class="tip-time">{{ new Date(n.createdAt).toLocaleDateString('zh-CN') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStorage, setStorage } from '../utils/storage'
import { isAIConfigured, generatePlotCode } from '../utils/ai'
import { useDebounce } from '../composables/useDebounce'
import { PLOT_TIPS } from '../data/plotTips'

const TIPS = PLOT_TIPS

const search = ref('')
const debouncedSearch = useDebounce(search, 300)
const filterCat = ref('')
const openCats = ref({})
const customNotes = ref([])
const showForm = ref(false)
const form = ref({ title: '', content: '' })
const showAIPanel = ref(isAIConfigured())
const plotDesc = ref('')
const plotLang = ref('python')
const plotType = ref('auto')
const plotCode = ref('')
const aiPlotLoading = ref(false)

const categories = computed(() => [...new Set(TIPS.map(t => t.category))])

const displayCategories = computed(() => {
  let cats = categories.value
  if (filterCat.value) cats = cats.filter(c => c === filterCat.value)
  return cats
})

function tipsByCat(cat) {
  return TIPS.filter(t => {
    const matchCat = t.category === cat
    const matchSearch = !debouncedSearch.value || t.title.includes(debouncedSearch.value) || t.content.includes(debouncedSearch.value)
    return matchCat && matchSearch
  })
}

function toggleCat(cat) {
  openCats.value = { ...openCats.value, [cat]: !openCats.value[cat] }
}

function saveNote() {
  if (!form.value.title.trim()) return alert('请输入标题')
  const notes = getStorage('plot_notes', [])
  notes.unshift({ ...form.value, id: Date.now(), createdAt: new Date().toISOString() })
  setStorage('plot_notes', notes)
  customNotes.value = notes
  showForm.value = false
  form.value = { title: '', content: '' }
}

function removeNote(id) {
  if (!confirm('确定删除？')) return
  const notes = getStorage('plot_notes', []).filter(n => n.id !== id)
  setStorage('plot_notes', notes)
  customNotes.value = notes
}

async function generatePlot() {
  aiPlotLoading.value = true
  plotCode.value = ''
  try {
    const raw = await generatePlotCode(plotDesc.value, plotType.value === 'auto' ? '' : plotType.value, '', plotLang.value)
    // 提取代码块内容
    const match = raw.match(/```(?:python|origin|labtalk)?\n?([\s\S]*?)```/)
    plotCode.value = match ? match[1].trim() : raw
  } catch (e) {
    plotCode.value = '生成失败: ' + e.message
  }
  aiPlotLoading.value = false
}

function copyPlotCode() {
  if (plotCode.value) navigator.clipboard.writeText(plotCode.value)
}

onMounted(() => {
  customNotes.value = getStorage('plot_notes', [])
  openCats.value = { 'Origin 绘图': true }
})
</script>

<style scoped>
.plot-tips-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.ai-plot-card { margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 8px; }
.toggle-icon { font-size: 12px; color: var(--text-muted); margin-left: auto; }
.ai-plot-form { margin-top: 12px; }
.ai-plot-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; }
.ai-plot-result { margin-top: 16px; }
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.code-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
  color: var(--text-primary);
}
.ai-hint { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.btn { padding: 10px 32px; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-icon { background: none; border: none; font-size: 14px; cursor: pointer; padding: 4px; color: var(--text-muted); }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.category-section { margin-bottom: 20px; }
.cat-title { font-size: 16px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 0; user-select: none; }
.cat-title:hover { color: var(--primary); }
.cat-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; }
.cat-arrow.open { transform: rotate(90deg); }
.cat-count { font-size: 12px; color: var(--text-muted); font-weight: 400; }
.cat-body { display: flex; flex-direction: column; gap: 12px; }
.tip-card { padding: 18px; }
.tip-header { display: flex; justify-content: space-between; align-items: center; }
.tip-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }
.tip-content { font-size: 14px; line-height: 1.8; color: var(--text-primary); }
.tip-content :deep(ul), .tip-content :deep(ol) { padding-left: 20px; margin: 8px 0; }
.tip-content :deep(li) { margin-bottom: 4px; }
.tip-content :deep(pre) { background: var(--bg-surface); padding: 12px; border-radius: var(--radius); overflow-x: auto; font-size: 12px; margin: 8px 0; }
.tip-content :deep(code) { font-family: 'Consolas', monospace; font-size: 13px; }
.tip-tools { display: flex; align-items: center; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.tools-label { font-size: 12px; color: var(--text-muted); }
.tip-time { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.section-divider { height: 1px; background: var(--border); margin: 30px 0 20px; }
.section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.form-card { margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
</style>
