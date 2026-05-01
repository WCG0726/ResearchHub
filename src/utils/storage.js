/**
 * localStorage 管理工具
 */

const STORAGE_PREFIX = 'research_hub_'

export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

// ===== 数据导出/导入 =====

const ALL_KEYS = [
  'checkins', 'records', 'writing', 'plans', 'water', 'meals',
  'calendar_events', 'profile', 'theme', 'lit_notes', 'experiments',
  'datasets', 'latex_snippets', 'meetings', 'inspirations', 'milestones',
  'pomodoro', 'email_templates', 'academic_events', 'translate_config',
  'custom_links'
]

export function exportAllData() {
  const data = {}
  for (const key of ALL_KEYS) {
    const val = getStorage(key)
    if (val !== null && val !== undefined) data[key] = val
  }
  const user = getStorage('current_user')
  if (user) data._user = user
  return {
    version: '2.3.0',
    exportedAt: new Date().toISOString(),
    data
  }
}

export function importAllData(json, mode = 'merge') {
  if (!json || !json.data) throw new Error('无效的备份文件')
  const imported = json.data
  for (const key of ALL_KEYS) {
    if (imported[key] !== undefined) {
      if (mode === 'overwrite') {
        setStorage(key, imported[key])
      } else {
        const existing = getStorage(key)
        if (Array.isArray(imported[key]) && Array.isArray(existing)) {
          const existingIds = new Set(existing.map(i => i.id))
          const newItems = imported[key].filter(i => !existingIds.has(i.id))
          setStorage(key, [...existing, ...newItems])
        } else if (typeof imported[key] === 'object' && imported[key] !== null && !Array.isArray(imported[key])) {
          setStorage(key, { ...existing, ...imported[key] })
        } else {
          setStorage(key, imported[key])
        }
      }
    }
  }
  return true
}
