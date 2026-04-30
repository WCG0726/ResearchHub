/**
 * 在线状态管理（基于 localStorage 心跳）
 */

const HEARTBEAT_KEY = 'research_hub_presence'
const INTERVAL = 30000 // 30秒
const ONLINE_THRESHOLD = 120000 // 2分钟内活跃视为在线

let timer = null

export function startHeartbeat(username) {
  stopHeartbeat()
  writeHeartbeat(username)
  timer = setInterval(() => writeHeartbeat(username), INTERVAL)
}

export function stopHeartbeat() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function writeHeartbeat(username) {
  try {
    const data = JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}')
    data[username] = { lastSeen: Date.now() }
    localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data))
  } catch {}
}

export function getAllPresence() {
  try {
    return JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}')
  } catch {
    return {}
  }
}

export function isOnline(username) {
  const presence = getAllPresence()
  const record = presence[username]
  if (!record) return false
  return (Date.now() - record.lastSeen) < ONLINE_THRESHOLD
}

export function getLastSeen(username) {
  const presence = getAllPresence()
  const record = presence[username]
  if (!record) return null
  const diff = Date.now() - record.lastSeen
  if (diff < ONLINE_THRESHOLD) return '在线'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}
