<template>
  <div class="bug-scanner-page">
    <h1 class="page-title">AI Bug 检测</h1>

    <!-- 扫描控制 -->
    <div class="card scan-control">
      <div class="scan-header">
        <div>
          <h3 class="card-title" style="margin-bottom:4px">项目健康检查</h3>
          <p class="scan-desc">扫描 Vue 组件、检测常见问题、监控运行时错误</p>
        </div>
        <button class="btn btn-primary" :disabled="scanning" @click="runScan">
          {{ scanning ? '扫描中...' : '开始扫描' }}
        </button>
      </div>
      <!-- 统计条 -->
      <div class="scan-stats">
        <div class="scan-stat" :class="{ active: filter === 'all' }" @click="setFilter('all')">
          <span class="scan-stat-num">{{ totalIssues }}</span>
          <span class="scan-stat-label">全部</span>
        </div>
        <div class="scan-stat fatal" :class="{ active: filter === 'fatal' }" @click="setFilter('fatal')">
          <span class="scan-stat-num">{{ counts.fatal }}</span>
          <span class="scan-stat-label">致命</span>
        </div>
        <div class="scan-stat warning" :class="{ active: filter === 'warning' }" @click="setFilter('warning')">
          <span class="scan-stat-num">{{ counts.warning }}</span>
          <span class="scan-stat-label">警告</span>
        </div>
        <div class="scan-stat info" :class="{ active: filter === 'info' }" @click="setFilter('info')">
          <span class="scan-stat-num">{{ counts.info }}</span>
          <span class="scan-stat-label">提示</span>
        </div>
      </div>
    </div>

    <!-- 性能指标 -->
    <div class="card">
      <h3 class="card-title">性能指标</h3>
      <div class="perf-grid">
        <div class="perf-item">
          <span class="perf-value">{{ metrics.loadTime }}ms</span>
          <span class="perf-label">页面加载</span>
        </div>
        <div class="perf-item">
          <span class="perf-value">{{ metrics.memoryUsage }}MB</span>
          <span class="perf-label">内存占用</span>
        </div>
        <div class="perf-item">
          <span class="perf-value">{{ runtimeErrors.length }}</span>
          <span class="perf-label">运行时错误</span>
        </div>
        <div class="perf-item">
          <span class="perf-value">{{ topComponents.length }}</span>
          <span class="perf-label">组件追踪</span>
        </div>
      </div>
    </div>

    <!-- 运行时错误 -->
    <div v-if="runtimeErrors.length" class="card">
      <div class="card-header">
        <h3 class="card-title" style="margin-bottom:0">运行时错误日志</h3>
        <button class="btn-clear" @click="clearErrors">清空</button>
      </div>
      <div class="error-list">
        <div v-for="err in runtimeErrors" :key="err.id" class="error-item fatal">
          <div class="error-severity">致命</div>
          <div class="error-body">
            <div class="error-msg">{{ err.message }}</div>
            <div class="error-meta">
              <span v-if="err.filename">{{ err.filename }}:{{ err.lineno }}</span>
              <span>{{ formatTime(err.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 组件渲染排行 -->
    <div v-if="topComponents.length" class="card">
      <h3 class="card-title">组件渲染次数排行</h3>
      <div class="render-list">
        <div v-for="comp in topComponents" :key="comp.name" class="render-item">
          <span class="render-name">{{ comp.name }}</span>
          <div class="render-bar-wrap">
            <div class="render-bar" :style="{ width: Math.min(100, comp.count / maxRender * 100) + '%' }"></div>
          </div>
          <span class="render-count">{{ comp.count }}</span>
        </div>
      </div>
    </div>

    <!-- 扫描结果列表 -->
    <div v-if="filteredErrors.length" class="card">
      <h3 class="card-title">检测结果</h3>
      <div class="result-list">
        <div v-for="(err, idx) in filteredErrors" :key="idx" class="result-item" :class="err.severity">
          <div class="result-severity">
            <span v-if="err.severity === 'fatal'" class="sev-icon">🔴</span>
            <span v-else-if="err.severity === 'warning'" class="sev-icon">🟡</span>
            <span v-else class="sev-icon">🔵</span>
          </div>
          <div class="result-body">
            <div class="result-msg">{{ err.message }}</div>
            <div class="result-location">
              <span v-if="err.file" class="result-file">{{ err.file }}</span>
              <span v-if="err.line" class="result-line">:{{ err.line }}</span>
            </div>
            <div v-if="err.suggestion" class="result-suggestion">
              <span class="suggestion-label">修复建议：</span>{{ err.suggestion }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!scanning && filteredErrors.length === 0 && totalIssues > 0" class="card empty-state">
      <span class="empty-icon">✨</span>
      <p>当前筛选条件下没有问题</p>
    </div>
    <div v-if="!scanning && totalIssues === 0" class="card empty-state">
      <span class="empty-icon">🔍</span>
      <p>点击"开始扫描"检测项目问题</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBugScannerStore } from '../stores/bugScanner'

const store = useBugScannerStore()

const scanning = computed(() => store.scanning)
const filter = computed(() => store.filterSeverity)
const counts = computed(() => store.errorCounts)
const totalIssues = computed(() => store.errors.length)
const filteredErrors = computed(() => store.filteredErrors)
const runtimeErrors = computed(() => store.runtimeErrors.slice(-20).reverse())
const metrics = computed(() => store.performanceMetrics)
const topComponents = computed(() => store.topRenderComponents)
const maxRender = computed(() =>
  topComponents.value.length ? topComponents.value[0].count : 1
)

function runScan() {
  store.scanProject()
}

function setFilter(severity) {
  store.setFilter(severity)
}

function clearErrors() {
  store.clearErrors()
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.bug-scanner-page { max-width: 900px; }

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
}

.scan-control { margin-bottom: 20px; }

.scan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.scan-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.scan-stats {
  display: flex;
  gap: 12px;
}

.scan-stat {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-surface);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.scan-stat:hover { background: var(--bg-hover); }
.scan-stat.active { border-color: var(--primary); }
.scan-stat.fatal .scan-stat-num { color: #ef4444; }
.scan-stat.warning .scan-stat-num { color: #f59e0b; }
.scan-stat.info .scan-stat-num { color: #3b82f6; }

.scan-stat-num {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.scan-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 性能指标 */
.perf-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.perf-item {
  text-align: center;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.perf-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
}

.perf-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 运行时错误 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.btn-clear {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
}

.btn-clear:hover { color: var(--danger); }

.error-list { display: flex; flex-direction: column; gap: 8px; }

.error-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-surface);
}

.error-item.fatal { border-left: 3px solid #ef4444; }

.error-severity {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  align-self: flex-start;
  white-space: nowrap;
}

.error-msg { font-size: 14px; color: var(--text-primary); margin-bottom: 4px; }

.error-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

/* 组件渲染排行 */
.render-list { display: flex; flex-direction: column; gap: 6px; }

.render-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.render-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 140px;
  font-family: monospace;
}

.render-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.render-bar {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.render-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 40px;
  text-align: right;
}

/* 扫描结果 */
.result-list { display: flex; flex-direction: column; gap: 10px; }

.result-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--bg-surface);
}

.result-item.fatal { border-left: 3px solid #ef4444; }
.result-item.warning { border-left: 3px solid #f59e0b; }
.result-item.info { border-left: 3px solid #3b82f6; }

.sev-icon { font-size: 16px; }

.result-msg {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.5;
}

.result-location {
  font-size: 12px;
  font-family: monospace;
  color: var(--primary);
  margin-bottom: 6px;
}

.result-suggestion {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 10px;
  background: var(--bg-primary);
  border-radius: var(--radius);
  line-height: 1.5;
}

.suggestion-label {
  font-weight: 600;
  color: var(--success);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }

.empty-state p {
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .scan-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .scan-stats { flex-wrap: wrap; }
  .scan-stat { min-width: 60px; }
  .perf-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
