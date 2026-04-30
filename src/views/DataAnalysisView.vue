<template>
  <div class="data-page">
    <h1 class="page-title">数据分析</h1>

    <div class="toolbar">
      <button class="btn btn-primary" @click="showForm = true">+ 新建数据集</button>
    </div>

    <div v-if="showForm" class="card form-card">
      <h3 class="card-title">新建数据集</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>数据集名称 *</label>
          <input v-model="form.name" class="input" placeholder="如 ZT值 vs 温度" />
        </div>
        <div class="form-group">
          <label>图表类型</label>
          <select v-model="form.chartType" class="input">
            <option value="line">折线图</option>
            <option value="bar">柱状图</option>
            <option value="scatter">散点图</option>
          </select>
        </div>
        <div class="form-group">
          <label>X 轴标签</label>
          <input v-model="form.xLabel" class="input" placeholder="如 温度 (K)" />
        </div>
        <div class="form-group">
          <label>Y 轴标签</label>
          <input v-model="form.yLabel" class="input" placeholder="如 ZT" />
        </div>
        <div class="form-group full">
          <label>数据（每行一组 x,y 用逗号或空格分隔，支持多列 y）</label>
          <textarea v-model="form.rawData" class="input textarea" rows="8" placeholder="300, 0.5&#10;400, 0.8&#10;500, 1.2&#10;600, 0.9"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveDataset">保存并绘图</button>
      </div>
    </div>

    <div v-if="datasets.length === 0 && !showForm" class="empty">
      <div class="empty-icon">📊</div>
      <div class="empty-text">暂无数据集，点击"新建数据集"开始</div>
    </div>

    <div class="datasets-list">
      <div v-for="ds in datasets" :key="ds.id" class="card dataset-card">
        <div class="ds-header">
          <h3>{{ ds.name }}</h3>
          <button class="btn-icon" @click="removeDataset(ds.id)">🗑️</button>
        </div>
        <div class="ds-info">
          <span class="tag tag-primary">{{ chartLabel(ds.chartType) }}</span>
          <span v-if="ds.xLabel">{{ ds.xLabel }}</span>
          <span v-if="ds.yLabel">{{ ds.yLabel }}</span>
        </div>
        <div class="chart-area">
          <svg :viewBox="'0 0 600 300'" class="chart-svg" v-if="ds.parsed.length > 0">
            <!-- Y axis -->
            <line x1="50" y1="20" x2="50" y2="270" stroke="var(--border)" stroke-width="1"/>
            <!-- X axis -->
            <line x1="50" y1="270" x2="580" y2="270" stroke="var(--border)" stroke-width="1"/>
            <!-- Y labels -->
            <text v-for="(yl, i) in ds.yTicks" :key="'y'+i" x="45" :y="270 - (i * 250 / (ds.yTicks.length - 1))" text-anchor="end" font-size="10" fill="var(--text-muted)">{{ yl }}</text>
            <!-- X labels -->
            <text v-for="(xl, i) in ds.xTicks" :key="'x'+i" :x="50 + ((i + 0.5) / ds.xTicks.length) * 530" y="288" text-anchor="middle" font-size="10" fill="var(--text-muted)">{{ xl }}</text>
            <!-- Data rendering -->
            <template v-if="ds.chartType === 'line'">
              <polyline :points="linePoints(ds)" fill="none" stroke="var(--primary)" stroke-width="2"/>
              <circle v-for="(p, i) in ds.screenPoints" :key="'c'+i" :cx="p.x" :cy="p.y" r="3" fill="var(--primary)"/>
            </template>
            <template v-if="ds.chartType === 'bar'">
              <rect v-for="(p, i) in ds.screenPoints" :key="'b'+i" :x="p.x - 10" :y="p.y" width="20" :height="270 - p.y" fill="var(--primary)" opacity="0.7" rx="2"/>
            </template>
            <template v-if="ds.chartType === 'scatter'">
              <circle v-for="(p, i) in ds.screenPoints" :key="'s'+i" :cx="p.x" :cy="p.y" r="5" fill="var(--primary)" opacity="0.7"/>
            </template>
          </svg>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th v-for="(h, i) in ds.headers" :key="i">{{ h }}</th></tr></thead>
            <tbody><tr v-for="(row, i) in ds.parsed.slice(0, 10)" :key="i"><td v-for="(v, j) in row" :key="j">{{ v }}</td></tr></tbody>
          </table>
          <div v-if="ds.parsed.length > 10" class="table-more">共 {{ ds.parsed.length }} 条数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDatasets, addDataset, deleteDataset } from '../utils/storage'

export default {
  name: 'DataAnalysisView',
  data() {
    return { datasets: [], showForm: false, form: { name: '', chartType: 'line', xLabel: '', yLabel: '', rawData: '' } }
  },
  methods: {
    chartLabel(t) { return { line: '折线图', bar: '柱状图', scatter: '散点图' }[t] || t },
    parseRaw(raw) {
      return raw.trim().split('\n').filter(Boolean).map(line => {
        const parts = line.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n))
        return parts
      }).filter(r => r.length >= 2)
    },
    computeTicks(values) {
      const min = Math.min(...values)
      const max = Math.max(...values)
      const step = (max - min) / 4 || 1
      return Array.from({ length: 5 }, (_, i) => (min + i * step).toFixed(2))
    },
    linePoints(ds) {
      return ds.screenPoints.map(p => `${p.x},${p.y}`).join(' ')
    },
    saveDataset() {
      if (!this.form.name.trim() || !this.form.rawData.trim()) return alert('请填写名称和数据')
      const parsed = this.parseRaw(this.form.rawData)
      if (parsed.length === 0) return alert('数据格式不正确')
      const headers = parsed[0].map((_, i) => i === 0 ? (this.form.xLabel || 'X') : (this.form.yLabel || `Y${i}`))
      const xValues = parsed.map(r => r[0])
      const yValues = parsed.map(r => r.slice(1).reduce((a, b) => a + b, 0) / (r.length - 1))
      const yTicks = this.computeTicks(yValues)
      const xTicks = xValues.map(v => String(v))
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)
      const yRange = yMax - yMin || 1
      const screenPoints = parsed.map((r, i) => ({
        x: 50 + ((i + 0.5) / parsed.length) * 530,
        y: 270 - ((yValues[i] - yMin) / yRange) * 250
      }))
      addDataset({ ...this.form, parsed, headers, yTicks, xTicks, screenPoints })
      this.datasets = this.processAll(getDatasets())
      this.showForm = false
      this.form = { name: '', chartType: 'line', xLabel: '', yLabel: '', rawData: '' }
    },
    processAll(list) {
      return list.map(ds => {
        if (ds.screenPoints) return ds
        const parsed = ds.parsed || this.parseRaw(ds.rawData || '')
        if (parsed.length === 0) return { ...ds, parsed, screenPoints: [], yTicks: [], xTicks: [] }
        const xValues = parsed.map(r => r[0])
        const yValues = parsed.map(r => r.slice(1).reduce((a, b) => a + b, 0) / (r.length - 1))
        const yTicks = this.computeTicks(yValues)
        const xTicks = xValues.map(v => String(v))
        const yMin = Math.min(...yValues)
        const yMax = Math.max(...yValues)
        const yRange = yMax - yMin || 1
        const screenPoints = parsed.map((r, i) => ({
          x: 50 + ((i + 0.5) / parsed.length) * 530,
          y: 270 - ((yValues[i] - yMin) / yRange) * 250
        }))
        return { ...ds, parsed, headers: ds.headers || parsed[0].map((_, i) => i === 0 ? 'X' : `Y${i}`), yTicks, xTicks, screenPoints }
      })
    },
    removeDataset(id) { if (!confirm('确定删除？')) return; deleteDataset(id); this.datasets = this.processAll(getDatasets()) }
  },
  mounted() { this.datasets = this.processAll(getDatasets()) }
}
</script>

<style scoped>
.data-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; }
.form-card { margin-bottom: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.datasets-list { display: flex; flex-direction: column; gap: 20px; }
.dataset-card { padding: 20px; }
.ds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.ds-header h3 { margin: 0; font-size: 17px; }
.ds-info { display: flex; gap: 12px; align-items: center; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
.chart-area { margin-bottom: 16px; }
.chart-svg { width: 100%; height: auto; background: var(--bg-surface); border-radius: var(--radius); }
.data-table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th, .data-table td { padding: 6px 12px; border-bottom: 1px solid var(--border); text-align: center; }
.data-table th { background: var(--bg-surface); font-weight: 600; color: var(--text-secondary); }
.table-more { text-align: center; padding: 8px; font-size: 13px; color: var(--text-muted); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
