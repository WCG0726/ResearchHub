<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>

    <!-- 数据备份 -->
    <div class="card">
      <h3 class="card-title">💾 数据备份</h3>
      <p class="desc">导出所有数据为 JSON 文件，可用于备份或迁移到其他设备。</p>
      <div class="btn-row">
        <button class="btn btn-primary" @click="exportData">导出全部数据</button>
        <button class="btn btn-outline" @click="$refs.importFile.click()">导入数据</button>
        <input ref="importFile" type="file" accept=".json" style="display:none" @change="importData" />
      </div>
      <div v-if="msg" class="msg" :class="msgType">{{ msg }}</div>
    </div>

    <!-- 导入选项 -->
    <div v-if="importPreview" class="card">
      <h3 class="card-title">📋 导入预览</h3>
      <div class="import-info">
        <p>导出时间：{{ importPreview.exportedAt }}</p>
        <p>数据项数：{{ Object.keys(importPreview.data).length }} 类</p>
      </div>
      <div class="import-mode">
        <label>导入模式：</label>
        <select v-model="importMode" class="input" style="width:auto">
          <option value="merge">合并（保留现有数据，添加新数据）</option>
          <option value="overwrite">覆盖（替换所有数据）</option>
        </select>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" @click="confirmImport">确认导入</button>
        <button class="btn btn-outline" @click="importPreview = null">取消</button>
      </div>
    </div>

    <!-- 存储用量 -->
    <div class="card">
      <h3 class="card-title">📊 存储用量</h3>
      <div class="storage-bar">
        <div class="storage-fill" :style="{ width: storagePercent + '%' }"></div>
      </div>
      <div class="storage-text">{{ storageUsed }} / {{ storageTotal }} ({{ storagePercent }}%)</div>
    </div>

    <!-- 快捷键 -->
    <div class="card">
      <h3 class="card-title">⌨️ 快捷键</h3>
      <div class="shortcut-list">
        <div class="shortcut-row"><kbd>Ctrl</kbd> + <kbd>K</kbd><span>全局搜索</span></div>
        <div class="shortcut-row"><kbd>Ctrl</kbd> + <kbd>N</kbd><span>新建记录</span></div>
        <div class="shortcut-row"><kbd>Esc</kbd><span>关闭弹窗/搜索</span></div>
        <div class="shortcut-row"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd><span>切换主题</span></div>
      </div>
    </div>
  </div>
</template>

<script>
import { exportAllData, importAllData } from '../utils/storage'

export default {
  name: 'SettingsView',
  data() {
    return {
      msg: '',
      msgType: '',
      importPreview: null,
      importMode: 'merge',
      importFile: null,
      storageUsed: '',
      storageTotal: '5 MB',
      storagePercent: 0
    }
  },
  mounted() {
    this.calcStorage()
  },
  methods: {
    exportData() {
      try {
        const data = exportAllData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `researchhub-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        this.msg = '✓ 数据已导出'
        this.msgType = 'success'
      } catch (e) {
        this.msg = '导出失败：' + e.message
        this.msgType = 'error'
      }
    },
    importData(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target.result)
          if (!json.data) throw new Error('无效的备份文件')
          this.importPreview = json
          this.msg = ''
        } catch (err) {
          this.msg = '文件解析失败：' + err.message
          this.msgType = 'error'
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    confirmImport() {
      try {
        importAllData(this.importPreview, this.importMode)
        this.msg = '✓ 数据导入成功，刷新页面后生效'
        this.msgType = 'success'
        this.importPreview = null
        this.calcStorage()
      } catch (e) {
        this.msg = '导入失败：' + e.message
        this.msgType = 'error'
      }
    },
    calcStorage() {
      let total = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        total += (key.length + (localStorage.getItem(key) || '').length) * 2
      }
      const kb = total / 1024
      if (kb > 1024) {
        this.storageUsed = (kb / 1024).toFixed(1) + ' MB'
      } else {
        this.storageUsed = kb.toFixed(1) + ' KB'
      }
      this.storagePercent = Math.min(100, Math.round((total / (5 * 1024 * 1024)) * 100))
    }
  }
}
</script>

<style scoped>
.settings-page { max-width: 700px; }
.desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 14px; }
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.msg { margin-top: 10px; font-size: 13px; padding: 6px 0; }
.msg.success { color: var(--success); }
.msg.error { color: var(--danger); }
.import-info { font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
.import-info p { margin: 4px 0; }
.import-mode { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 14px; }
.storage-bar { height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.storage-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.3s; }
.storage-text { font-size: 13px; color: var(--text-muted); }
.shortcut-list { display: flex; flex-direction: column; gap: 8px; }
.shortcut-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
.shortcut-row span { margin-left: auto; color: var(--text-muted); }
kbd { padding: 2px 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; font-size: 12px; font-family: monospace; color: var(--text-primary); }
</style>
