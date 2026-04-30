<template>
  <div class="latex-editor-page">
    <h1 class="page-title">LaTeX 编辑器</h1>

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
</template>

<script>
import { getStorage, setStorage } from '../utils/storage'

export default {
  name: 'LatexEditorView',
  data() {
    return {
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
    insertTab(e) {
      this.insertText('  ')
    }
  },
  mounted() { this.loadFiles() }
}
</script>

<style scoped>
.latex-editor-page { max-width: 1200px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.file-select { width: 200px; }
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
</style>
