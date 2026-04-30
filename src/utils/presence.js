/**
 * 在线状态管理
 * 优先使用 Firebase（跨浏览器/跨设备）
 * 降级使用 localStorage（同浏览器）
 */

import { isFirebaseConfigured, initFirebase, goOnline, goOffline, watchPresence } from './firebase'

const HEARTBEAT_KEY = 'research_hub_presence'
const INTERVAL = 30000
const ONLINE_THRESHOLD = 120000

let timer = null
let firebaseReady = false
let remotePresence = {}
let remoteUnsubscribe = null

// 初始化（App.vue 调用）
export async function initPresence(username, nickname) {
  if (isFirebaseConfigured()) {
    firebaseReady = await initFirebase()
    if (firebaseReady) {
      goOnline(username, nickname)
      remoteUnsubscribe = watchPresence((data) => {
        remotePresence = data
      })
      return
    }
  }
  // 降级：localStorage 心跳
  startLocalHeartbeat(username)
}

// 停止
export function stopPresence(username, nickname) {
  if (firebaseReady) {
    goOffline(username, nickname)
    if (remoteUnsubscribe) remoteUnsubscribe()
    remoteUnsubscribe = null
  }
  stopLocalHeartbeat()
}

// 判断某用户是否在线
export function isOnline(username) {
  if (firebaseReady) {
    const r = remotePresence[username]
    return r ? r.online === true : false
  }
  // localStorage 降级
  const presence = getLocalPresence()
  const record = presence[username]
  if (!record) return false
  return (Date.now() - record.lastSeen) < ONLINE_THRESHOLD
}

// 获取最后活跃时间
export function getLastSeen(username) {
  if (firebaseReady) {
    const r = remotePresence[username]
    if (!r) return '从未活跃'
    if (r.online) return '在线'
    return formatLastSeen(r.lastSeen)
  }
  // localStorage 降级
  const presence = getLocalPresence()
  const record = presence[username]
  if (!record) return '从未活跃'
  return formatLocalLastSeen(record.lastSeen)
}

function formatLastSeen(ts) {
  if (!ts) return '从未活跃'
  const diff = Date.now() - ts
  if (diff < ONLINE_THRESHOLD) return '在线'
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

function formatLocalLastSeen(ts) {
  const diff = Date.now() - ts
  if (diff < ONLINE_THRESHOLD) return '在线'
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

// 获取所有 presence 数据（排行榜用）
export function getAllPresence() {
  if (firebaseReady) return remotePresence
  return getLocalPresence()
}

// ---- localStorage 降级方案 ----

function startLocalHeartbeat(username) {
  stopLocalHeartbeat()
  writeLocalHeartbeat(username)
  timer = setInterval(() => writeLocalHeartbeat(username), INTERVAL)
}

function stopLocalHeartbeat() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function writeLocalHeartbeat(username) {
  try {
    const data = JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}')
    data[username] = { lastSeen: Date.now() }
    localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data))
  } catch {}
}

function getLocalPresence() {
  try {
    return JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}')
  } catch {
    return {}
  }
}
