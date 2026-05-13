/**
 * 在线状态管理
 * 优先使用 Firebase（跨浏览器/跨设备）
 * 降级使用 localStorage（同浏览器）
 *
 * Firebase 延迟加载，不阻塞首屏
 */

const HEARTBEAT_KEY = 'research_hub_presence'
const INTERVAL = 30000
const ONLINE_THRESHOLD = 120000

let timer = null
let firebaseReady = false
let remotePresence = {}
let remoteUnsubscribe = null
let firebaseModule = null

// 动态加载 Firebase 模块（不阻塞首屏）
async function loadFirebase() {
  if (firebaseModule) return firebaseModule
  try {
    firebaseModule = await import('./firebase.js')
    return firebaseModule
  } catch (e) {
    console.warn('Firebase load failed, using localStorage fallback:', e)
    return null
  }
}

// 初始化（App.vue 调用）
export async function initPresence(username, nickname) {
  const fb = await loadFirebase()
  if (fb && fb.isFirebaseConfigured()) {
    firebaseReady = await fb.initFirebase()
    if (firebaseReady) {
      fb.goOnline(username, nickname)
      remoteUnsubscribe = fb.watchPresence((data) => {
        remotePresence = data
      })
      window.addEventListener('beforeunload', () => fb.goOffline(username, nickname))
      return
    }
  }
  // 降级：localStorage 心跳
  startLocalHeartbeat(username)
}

// 停止
export function stopPresence(username, nickname) {
  if (firebaseReady && firebaseModule) {
    firebaseModule.goOffline(username, nickname)
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
  const presence = getLocalPresence()
  const record = presence[username]
  if (!record) return '从未活跃'
  return formatLastSeen(record.lastSeen)
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

// 获取所有 presence 数据
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
  if (timer) { clearInterval(timer); timer = null }
}

function writeLocalHeartbeat(username) {
  try {
    const data = JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}')
    data[username] = { lastSeen: Date.now() }
    localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data))
  } catch {}
}

function getLocalPresence() {
  try { return JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}') }
  catch { return {} }
}
