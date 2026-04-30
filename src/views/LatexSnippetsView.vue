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
import { getLatexSnippets, addLatexSnippet, deleteLatexSnippet } from '../utils/storage'

const BUILT_IN = [
  { name: '行内公式', category: '数学公式', code: '$E = mc^2$' },
  { name: '行间公式', category: '数学公式', code: '$$\nE = mc^2\n$$' },
  { name: '多行对齐', category: '数学公式', code: '\\begin{align}\na &= b + c \\\\\nd &= e + f\n\\end{align}' },
  { name: '上下标', category: '数学公式', code: '$x^{2}_{i}$' },
  { name: '希腊字母', category: '数学公式', code: '$\\alpha \\beta \\gamma \\delta \\epsilon \\theta \\lambda \\mu \\sigma \\omega$' },
  { name: '求和/积分', category: '数学公式', code: '$\\sum_{i=1}^{n} x_i$  $\\int_{0}^{\\infty} f(x)dx$' },
  { name: '分数', category: '数学公式', code: '$\\frac{a}{b}$' },
  { name: '矩阵', category: '数学公式', code: '\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}' },
  { name: '三线表', category: '表格', code: '\\begin{table}[htbp]\n\\centering\n\\caption{表格标题}\n\\label{tab:example}\n\\begin{tabular}{ccc}\n\\hline\n列1 & 列2 & 列3 \\\\\n\\hline\n数据1 & 数据2 & 数据3 \\\\\n数据4 & 数据5 & 数据6 \\\\\n\\hline\n\\end{tabular}\n\\end{table}' },
  { name: '图片插入', category: '图片', code: '\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{filename.eps}\n\\caption{图片说明}\n\\label{fig:example}\n\\end{figure}' },
  { name: '并排图片', category: '图片', code: '\\begin{figure}[htbp]\n\\centering\n\\begin{subfigure}{0.48\\textwidth}\n\\includegraphics[width=\\textwidth]{a.eps}\n\\caption{子图A}\n\\end{subfigure}\n\\hfill\n\\begin{subfigure}{0.48\\textwidth}\n\\includegraphics[width=\\textwidth]{b.eps}\n\\caption{子图B}\n\\end{subfigure}\n\\caption{总说明}\n\\end{figure}' },
  { name: '参考文献引用', category: '引用', code: '文献~\\cite{author2024}' },
  { name: '脚注', category: '引用', code: '文字内容\\footnote{脚注内容}' },
  { name: '定理环境', category: '结构', code: '\\newtheorem{theorem}{定理}\n\\begin{theorem}\n定理内容...\n\\end{theorem}' },
  { name: '列表', category: '结构', code: '\\begin{itemize}\n\\item 第一项\n\\item 第二项\n\\end{itemize}' },
  { name: '枚举', category: '结构', code: '\\begin{enumerate}\n\\item 第一点\n\\item 第二点\n\\end{enumerate}' },
  { name: '超链接', category: '其他', code: '\\usepackage{hyperref}\n\\href{https://example.com}{链接文字}' },
  { name: '化学式', category: '其他', code: '\\usepackage{mhchem}\n\\ce{CO2}, \\ce{H2O}, \\ce{Bi2Te3}' },
  { name: '单位', category: '其他', code: '\\usepackage{siunitx}\n\\SI{300}{K}, \\SI{1.5}{eV}, \\SI{5}{W.m^{-1}.K^{-1}}' },
]

export default {
  name: 'LatexSnippetsView',
  data() {
    return {
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
      const built = BUILT_IN.map(s => ({ ...s, custom: false }))
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
      addLatexSnippet(this.form)
      this.customSnippets = getLatexSnippets()
      this.showForm = false
      this.form = { name: '', category: '自定义', code: '' }
    },
    removeSnippet(id) { if (!confirm('确定删除？')) return; deleteLatexSnippet(id); this.customSnippets = getLatexSnippets() }
  },
  mounted() {
    this.customSnippets = getLatexSnippets()
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
