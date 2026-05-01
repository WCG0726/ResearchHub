<template>
  <div class="latex-page">
    <h1 class="page-title">LaTeX</h1>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tab === 'snippets' }" @click="tab = 'snippets'">片段库</button>
      <button class="tab-btn" :class="{ active: tab === 'editor' }" @click="tab = 'editor'">编辑器</button>
    </div>

    <!-- ===== 片段库 Tab ===== -->
    <div v-show="tab === 'snippets'">
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
                <button class="btn btn-sm btn-outline" @click="insertToEditor(s.code)">编辑器</button>
                <button v-if="s.custom" class="btn-icon" @click="removeSnippet(s.id)">🗑️</button>
              </div>
            </div>
            <pre class="snippet-code"><code>{{ s.code }}</code></pre>
            <span v-if="copiedId === s.id" class="copied-hint">已复制!</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 编辑器 Tab ===== -->
    <div v-show="tab === 'editor'">
      <div class="toolbar">
        <select v-model="currentFile" class="input file-select" @change="loadFile">
          <option value="">-- 选择文件 --</option>
          <option v-for="f in files" :key="f.name" :value="f.name">{{ f.name }}</option>
        </select>
        <input v-model="newFileName" class="input" placeholder="新文件名 (如 paper.tex)" style="width:200px" />
        <button class="btn btn-primary btn-sm" @click="createFile">新建</button>
        <button class="btn btn-success btn-sm" @click="saveFile" :disabled="!currentFile">保存</button>
        <button class="btn btn-outline btn-sm" @click="downloadFile" :disabled="!currentFile">下载</button>
        <button v-if="currentFile" class="btn btn-outline btn-sm" @click="deleteCurrentFile">删除</button>
      </div>

      <div class="editor-layout">
        <div class="editor-panel">
          <div class="panel-header">
            <span>LaTeX 源码</span>
            <div class="quick-inserts">
              <button v-for="q in quickInserts" :key="q.label" class="btn btn-sm btn-outline quick-btn" @click="insertText(q.text)" :title="q.text">{{ q.label }}</button>
            </div>
          </div>
          <textarea v-model="content" class="editor-textarea" placeholder="在此编辑 LaTeX 代码..." @keydown.tab.prevent="insertTab" spellcheck="false"></textarea>
        </div>
        <div class="preview-panel">
          <div class="panel-header">预览（简化渲染）</div>
          <div class="preview-content" v-html="previewHtml"></div>
        </div>
      </div>

      <div class="info-bar">
        <span>行数: {{ lineCount }}</span>
        <span>字符数: {{ content.length }}</span>
        <span v-if="currentFile">当前: {{ currentFile }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useLatexSnippetsStore } from '../stores/latexSnippets'
import { LATEX_SNIPPETS } from '../data/latexSnippets'
import { getStorage, setStorage } from '../utils/storage'

export default {
  name: 'LatexSnippetsView',
  data() {
    return {
      tab: 'snippets',
      latexSnippetsStore: useLatexSnippetsStore(),
      customSnippets: [],
      search: '',
      filterCat: '',
      showForm: false,
      form: { name: '', category: '自定义', code: '' },
      openCats: {},
      copiedId: null,
      // Editor state
      files: [],
      currentFile: '',
      content: '',
      newFileName: '',
      quickInserts: [
        { label: '文档类', text: '\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\n\\begin{document}\n\n\\end{document}' },
        { label: '章节', text: '\\section{标题}\n\\subsection{子标题}' },
        { label: '公式', text: '\\begin{equation}\n\\label{eq:}\n\n\\end{equation}' },
        { label: '图片', text: '\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\textwidth]{fig.eps}\n\\caption{}\n\\label{fig:}\n\\end{figure}' },
        { label: '表格', text: '\\begin{table}[htbp]\n\\centering\n\\caption{}\n\\begin{tabular}{ccc}\n\\hline\n & & \\\\\n\\hline\n & & \\\\\n\\hline\n\\end{tabular}\n\\end{table}' },
        { label: '引用', text: '\\cite{}' },
        { label: '列表', text: '\\begin{itemize}\n\\item \n\\item \n\\end{itemize}' }
      ]
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
    },
    lineCount() { return this.content ? this.content.split('\n').length : 0 },
    previewHtml() {
      if (!this.content) return '<p style="color:var(--text-muted)">开始编辑后在此预览...</p>'
      let html = this.content
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/^\\documentclass.*$/gm, '')
        .replace(/^\\usepackage.*$/gm, '')
        .replace(/^\\begin\{document\}/gm, '')
        .replace(/^\\end\{document\}/gm, '')
        .replace(/^\\title\{(.+?)\}/gm, '<h1 style="text-align:center">$1</h1>')
        .replace(/^\\author\{(.+?)\}/gm, '<p style="text-align:center;color:var(--text-secondary)">$1</p>')
        .replace(/^\\section\{(.+?)\}/gm, '<h2>$1</h2>')
        .replace(/^\\subsection\{(.+?)\}/gm, '<h3>$1</h3>')
        .replace(/^\\textbf\{(.+?)\}/gm, '<strong>$1</strong>')
        .replace(/^\\textit\{(.+?)\}/gm, '<em>$1</em>')
        .replace(/^%\s*(.*)/gm, '<span style="color:var(--text-muted);font-style:italic">// $1</span>')
        .replace(/\n\n/g, '</p><p>')
      return `<div style="font-size:14px;line-height:1.8"><p>${html}</p></div>`
    }
  },
  methods: {
    // Snippets methods
    snippetsByCat(cat) {
      return this.allSnippets.filter(s => {
        const matchCat = s.category === cat
        const matchSearch = !this.search || s.name.toLowerCase().includes(this.search.toLowerCase()) || s.code.toLowerCase().includes(this.search.toLowerCase())
        return matchCat && matchSearch
      })
    },
    toggleCat(cat) { this.openCats = { ...this.openCats, [cat]: !this.openCats[cat] } },
    copyCode(code) {
      navigator.clipboard.writeText(code).catch(() => {
        const ta = document.createElement('textarea')
        ta.value = code
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      })
    },
    insertToEditor(code) {
      this.content = code
      this.tab = 'editor'
    },
    saveSnippet() {
      if (!this.form.name.trim() || !this.form.code.trim()) return alert('请填写名称和代码')
      this.latexSnippetsStore.add(this.form)
      this.customSnippets = this.latexSnippetsStore.snippets
      this.showForm = false
      this.form = { name: '', category: '自定义', code: '' }
    },
    removeSnippet(id) { if (!confirm('确定删除？')) return; this.latexSnippetsStore.remove(id); this.customSnippets = this.latexSnippetsStore.snippets },
    // Editor methods
    loadFiles() { this.files = getStorage('latex_files', []) },
    loadFile() {
      if (!this.currentFile) { this.content = ''; return }
      const f = this.files.find(f => f.name === this.currentFile)
      this.content = f ? f.content : ''
    },
    createFile() {
      const name = this.newFileName.trim()
      if (!name) return alert('请输入文件名')
      if (this.files.find(f => f.name === name)) return alert('文件已存在')
      this.files.push({ name, content: '', updatedAt: new Date().toISOString() })
      setStorage('latex_files', this.files)
      this.currentFile = name
      this.content = ''
      this.newFileName = ''
    },
    saveFile() {
      if (!this.currentFile) return
      const f = this.files.find(f => f.name === this.currentFile)
      if (f) { f.content = this.content; f.updatedAt = new Date().toISOString() }
      setStorage('latex_files', this.files)
    },
    downloadFile() {
      if (!this.currentFile) return
      const blob = new Blob([this.content], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = this.currentFile
      a.click()
      URL.revokeObjectURL(a.href)
    },
    deleteCurrentFile() {
      if (!confirm(`确定删除 ${this.currentFile}？`)) return
      this.files = this.files.filter(f => f.name !== this.currentFile)
      setStorage('latex_files', this.files)
      this.currentFile = ''
      this.content = ''
    },
    insertText(text) {
      const ta = document.querySelector('.editor-textarea')
      if (!ta) return
      const start = ta.selectionStart
      this.content = this.content.slice(0, start) + text + this.content.slice(ta.selectionEnd)
      this.$nextTick(() => { ta.selectionStart = ta.selectionEnd = start + text.length; ta.focus() })
    },
    insertTab() { this.insertText('  ') }
  },
  mounted() {
    this.latexSnippetsStore.load()
    this.customSnippets = this.latexSnippetsStore.snippets
    this.openCats = { '数学公式': true, '表格': true }
    this.loadFiles()
  }
}
</script>

<style scoped>
.latex-page { max-width: 1000px; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border); }
.tab-btn {
  padding: 10px 24px;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.file-select { width: 200px; }
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
/* Editor styles */
.editor-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
.editor-panel, .preview-panel { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; }
.panel-header { padding: 10px 14px; background: var(--bg-surface); font-size: 13px; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
.quick-inserts { display: flex; gap: 4px; flex-wrap: wrap; }
.quick-btn { font-size: 11px; padding: 3px 8px; }
.editor-textarea { flex: 1; min-height: 500px; padding: 16px; border: none; resize: none; font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; line-height: 1.7; background: var(--bg-primary); color: var(--text-primary); outline: none; }
.preview-content { flex: 1; min-height: 500px; padding: 20px; overflow-y: auto; background: var(--bg-primary); }
.preview-content h1 { font-size: 22px; margin-bottom: 8px; }
.preview-content h2 { font-size: 18px; margin: 16px 0 8px; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 4px; }
.preview-content h3 { font-size: 15px; margin: 12px 0 6px; }
.info-bar { display: flex; gap: 20px; font-size: 12px; color: var(--text-muted); }
@media (max-width: 900px) { .editor-layout { grid-template-columns: 1fr; } .editor-textarea, .preview-content { min-height: 300px; } }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
