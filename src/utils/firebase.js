/**
 * Firebase 在线状态服务
 *
 * 配置步骤：
 * 1. 打开 https://console.firebase.google.com 创建项目
 * 2. 左侧菜单 → Authentication → 启用"匿名登录"
 * 3. 左侧菜单 → Realtime Database → 创建数据库 → 选择"测试模式"
 * 4. 左侧菜单 → 项目设置 → 常规 → 添加 Web 应用 → 复制配置填入下方
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, onDisconnect, serverTimestamp } from 'firebase/database'
import { getAuth, signInAnonymously } from 'firebase/auth'

// ⬇️ 替换为你的 Firebase 配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}

let app = null
let db = null
let auth = null
let initialized = false

export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY'
}

export async function initFirebase() {
  if (!isFirebaseConfigured()) return false
  if (initialized) return true

  try {
    app = initializeApp(firebaseConfig)
    db = getDatabase(app)
    auth = getAuth(app)
    await signInAnonymously(auth)
    initialized = true
    return true
  } catch (err) {
    console.error('Firebase init failed:', err)
    return false
  }
}

// 上线：写入 presence 节点，断线自动移除
export function goOnline(username, nickname) {
  if (!initialized || !db) return
  const userRef = ref(db, `presence/${username}`)
  set(userRef, {
    nickname,
    online: true,
    lastSeen: serverTimestamp()
  })
  // 断线时自动设为离线
  onDisconnect(userRef).set({
    nickname,
    online: false,
    lastSeen: serverTimestamp()
  })
}

// 手动下线
export function goOffline(username, nickname) {
  if (!initialized || !db) return
  const userRef = ref(db, `presence/${username}`)
  set(userRef, {
    nickname,
    online: false,
    lastSeen: serverTimestamp()
  })
}

// 监听所有用户在线状态
export function watchPresence(callback) {
  if (!initialized || !db) return () => {}
  const presenceRef = ref(db, 'presence')
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {}
    callback(data)
  })
  return unsubscribe
}
