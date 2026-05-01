<template>
  <div class="latex-page">
    <h1 class="page-title">LaTeX 片段库</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索片段..." />
      <select v-model="filterCat" class="input filter-select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <button class="btn btn-primary" @click="showForm = true">+ 自定义片段</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">添加自定义片段</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>名称 *</label>
          <input v-model="form.name" class="input" placeholder="如 三线表" />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="form.category" class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            <option value="自定义">自定义</option>
          </select>
        </div>
        <div class="form-group full">
          <label>LaTeX 代码 *</label>
          <textarea v-model="form.code" class="input textarea code-textarea" rows="8" placeholder="LaTeX 代码..."></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveSnippet">保存</button>
      </div>
    </div>

    <div v-for="cat in displayCategories" :key="cat" class="category-section">
      <h2 class="cat-title" @click="toggleCat(cat)">
        <span class="cat-arrow" :class="{ open: openCats[cat] }">▶</span>
        {{ cat }}
        <span class="cat-count">{{ snippetsByCat(cat).length }}</span>
      </h2>
      <div v-if="openCats[cat]" class="cat-body">
        <div v-for="s in snippetsByCat(cat)" :key="s.id" class="card snippet-card">
          <div class="snippet-header">
            <span class="snippet-name">{{ s.name }}</span>
            <div class="snippet-actions">
              <button class="btn btn-sm btn-outline" @click="copyCode(s.code)">复制</button>
              <button v-if="s.custom" class="btn-icon" @click="removeSnippet(s.id)">🗑️</button>
            </div>
          </div>
          <pre class="snippet-code"><code>{{ s.code }}</code></pre>
          <span v-if="copiedId === s.id" class="copied-hint">已复制!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useLatexSnippetsStore } from '../stores/latexSnippets'
import { LATEX_SNIPPETS } from '../data/latexSnippets'

export default {
  name: 'LatexSnippetsView',
  data() {
    return {
      latexSnippetsStore: useLatexSnippetsStore(),
      customSnippets: [],
      search: '',
      filterCat: '',
      showForm: false,
      form: { name: '', category: '自定义', code: '' },
      openCats: {},
      copiedId: null
    }
  },
  computed: {
    allSnippets() {
      const built = LATEX_SNIPPETS.map(s => ({ ...s, custom: false }))
      const custom = this.customSnippets.map(s => ({ ...s, custom: true }))
      return [...built, ...custom]
    },
    categories() {
      return [...new Set(this.allSnippets.map(s => s.category))]
    },
    displayCategories() {
      let cats = this.categories
      if (this.filterCat) cats = cats.filter(c => c === this.filterCat)
      return cats
    }
  },
  methods: {
    snippetsByCat(cat) {
      return this.allSnippets.filter(s => {
        const matchCat = s.category === cat
        const matchSearch = !this.search || s.name.toLowerCase().includes(this.search.toLowerCase()) || s.code.toLowerCase().includes(this.search.toLowerCase())
        return matchCat && matchSearch
      })
    },
    toggleCat(cat) { this.openCats = { ...this.openCats, [cat]: !this.openCats[cat] } },
    copyCode(code) {
      navigator.clipboard.writeText(code).then(() => {
        this.copiedId = null
        setTimeout(() => {}, 10)
      })
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    },
    saveSnippet() {
      if (!this.form.name.trim() || !this.form.code.trim()) return alert('请填写名称和代码')
      this.latexSnippetsStore.add(this.form)
      this.customSnippets = this.latexSnippetsStore.snippets
      this.showForm = false
      this.form = { name: '', category: '自定义', code: '' }
    },
    removeSnippet(id) { if (!confirm('确定删除？')) return; this.latexSnippetsStore.remove(id); this.customSnippets = this.latexSnippetsStore.snippets }
  },
  mounted() {
    this.latexSnippetsStore.load()
    this.customSnippets = this.latexSnippetsStore.snippets
    this.openCats = { '数学公式': true, '表格': true }
  }
}
</script>

<style scoped>
.latex-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.code-textarea { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
.category-section { margin-bottom: 20px; }
.cat-title { font-size: 16px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 0; user-select: none; }
.cat-title:hover { color: var(--primary); }
.cat-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; }
.cat-arrow.open { transform: rotate(90deg); }
.cat-count { font-size: 12px; color: var(--text-muted); font-weight: 400; }
.cat-body { display: flex; flex-direction: column; gap: 10px; }
.snippet-card { padding: 16px; }
.snippet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.snippet-name { font-weight: 600; font-size: 14px; }
.snippet-actions { display: flex; gap: 8px; align-items: center; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.snippet-code { background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius); overflow-x: auto; font-size: 13px; line-height: 1.6; margin: 0; font-family: 'Consolas', 'Monaco', monospace; color: var(--text-primary); }
.copied-hint { font-size: 12px; color: var(--success); margin-top: 4px; display: inline-block; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
