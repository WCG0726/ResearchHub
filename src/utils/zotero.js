/**
 * Zotero 集成工具
 * 支持 Zotero Web API 和本地 Zotero API
 */

const ZOTERO_API = 'https://api.zotero.org'
const ZOTERO_LOCAL = 'http://127.0.0.1:23119'

const SETTINGS_KEY = 'research_hub_zotero'

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function getZoteroConfig() {
  return {
    apiKey: getSettings().apiKey || '',
    userId: getSettings().userId || '',
    useLocal: getSettings().useLocal !== false,
    connected: getSettings().connected || false
  }
}

export function saveZoteroConfig(config) {
  saveSettings({ ...getSettings(), ...config })
}

// 检测本地 Zotero 是否运行
export async function detectLocalZotero() {
  try {
    const resp = await fetch(`${ZOTERO_LOCAL}/connector/ping`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    })
    return resp.ok
  } catch {
    return false
  }
}

// 通过本地 Zotero 获取最近文献
export async function getRecentFromLocal() {
  try {
    const resp = await fetch(`${ZOTERO_LOCAL}/search?q=&limit=20`, {
      signal: AbortSignal.timeout(5000)
    })
    if (!resp.ok) return []
    return await resp.json()
  } catch {
    return []
  }
}

// 通过 Web API 获取文献
export async function getRecentFromWeb(apiKey, userId) {
  try {
    const resp = await fetch(`${ZOTERO_API}/users/${userId}/items?sort=dateModified&limit=20&itemType=-attachment%20-note`, {
      headers: {
        'Zotero-API-Key': apiKey
      },
      signal: AbortSignal.timeout(10000)
    })
    if (!resp.ok) return []
    const items = await resp.json()
    return items.map(item => ({
      key: item.key,
      title: item.data.title,
      creators: item.data.creators || [],
      date: item.data.date || '',
      itemType: item.data.itemType,
      abstractNote: item.data.abstractNote || '',
      tags: (item.data.tags || []).map(t => t.tag),
      dateAdded: item.data.dateAdded,
      dateModified: item.data.dateModified,
      url: item.data.url || '',
      DOI: item.data.DOI || ''
    }))
  } catch {
    return []
  }
}

// 获取收藏集合
export async function getCollections(apiKey, userId) {
  try {
    const resp = await fetch(`${ZOTERO_API}/users/${userId}/collections?limit=50`, {
      headers: { 'Zotero-API-Key': apiKey },
      signal: AbortSignal.timeout(10000)
    })
    if (!resp.ok) return []
    const cols = await resp.json()
    return cols.map(c => ({
      key: c.key,
      name: c.data.name,
      parentCollection: c.data.parentCollection
    }))
  } catch {
    return []
  }
}

// 格式化作者名
export function formatCreators(creators) {
  if (!creators || creators.length === 0) return '未知作者'
  const names = creators.slice(0, 3).map(c => {
    if (c.lastName) return c.lastName + (c.firstName ? ` ${c.firstName.charAt(0)}` : '')
    return c.name || '未知'
  })
  return names.join(', ') + (creators.length > 3 ? ' et al.' : '')
}
