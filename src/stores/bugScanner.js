import { defineStore } from 'pinia'

export const useBugScannerStore = defineStore('bugScanner', {
  state: () => ({
    scanning: false,
    errors: [],
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0
    },
    runtimeErrors: [],
    componentRenders: {},
    filterSeverity: 'all'
  }),
  getters: {
    filteredErrors(state) {
      if (state.filterSeverity === 'all') return state.errors
      return state.errors.filter(e => e.severity === state.filterSeverity)
    },
    errorCounts(state) {
      const counts = { fatal: 0, warning: 0, info: 0 }
      state.errors.forEach(e => {
        if (counts[e.severity] !== undefined) counts[e.severity]++
      })
      return counts
    },
    topRenderComponents(state) {
      return Object.entries(state.componentRenders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    }
  },
  actions: {
    addRuntimeError(error) {
      this.runtimeErrors.push({
        ...error,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString()
      })
    },
    addScanResult(result) {
      this.errors.push(result)
    },
    updatePerformanceMetrics(metrics) {
      Object.assign(this.performanceMetrics, metrics)
    },
    trackComponentRender(name) {
      this.componentRenders[name] = (this.componentRenders[name] || 0) + 1
    },
    setFilter(severity) {
      this.filterSeverity = severity
    },
    clearErrors() {
      this.errors = []
      this.runtimeErrors = []
    },
    async scanProject() {
      this.scanning = true
      this.errors = []

      // 模拟静态分析（实际项目中可用 ESLint API 或 AST 解析）
      await new Promise(r => setTimeout(r, 800))

      // 检查 Vue 组件常见问题
      this._checkVuePatterns()
      this._checkRuntimeErrors()
      this._collectPerformanceMetrics()

      this.scanning = false
    },
    _checkVuePatterns() {
      // 基于已知的代码模式添加检查结果
      // 实际实现中，这些会通过 AST 解析或 ESLint API 获得
      const checks = [
        {
          condition: true,
          result: {
            severity: 'info',
            message: '建议：所有 setInterval/setTimeout 应在 beforeUnmount 中清理',
            file: '各组件',
            suggestion: '在 beforeUnmount() 中调用 clearInterval/clearTimeout'
          }
        },
        {
          condition: true,
          result: {
            severity: 'info',
            message: '建议：Firebase onSnapshot 监听器应在组件卸载时取消订阅',
            file: 'utils/firebase.js, utils/presence.js',
            suggestion: '在 onUnmounted() 或 beforeUnmount() 中调用 unsubscribe()'
          }
        },
        {
          condition: true,
          result: {
            severity: 'warning',
            message: 'Options API 中 computed 属性调用外部函数会丢失 Vue 响应式追踪',
            file: '已修复 (CheckinView.vue, DashboardView.vue)',
            suggestion: '将计算逻辑内联到 computed 属性中，直接访问 this.xxxStore.property'
          }
        }
      ]

      checks.forEach(check => {
        if (check.condition) {
          this.addScanResult(check.result)
        }
      })
    },
    _checkRuntimeErrors() {
      // 将运行时收集的错误转为扫描结果
      this.runtimeErrors.forEach(err => {
        this.addScanResult({
          severity: err.type === 'unhandledrejection' ? 'fatal' : 'warning',
          message: err.message,
          file: err.filename || 'unknown',
          line: err.lineno || 0,
          suggestion: '检查错误堆栈，添加适当的错误处理'
        })
      })
    },
    _collectPerformanceMetrics() {
      if (typeof performance !== 'undefined') {
        const timing = performance.timing
        const loadTime = timing.loadEventEnd - timing.navigationStart
        this.updatePerformanceMetrics({
          loadTime: loadTime > 0 ? loadTime : 0
        })
      }

      if (performance.memory) {
        this.updatePerformanceMetrics({
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        })
      }
    }
  }
})
