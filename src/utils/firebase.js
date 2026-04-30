/**
 * Firebase 在线状态服务
 *
 * 配置步骤：
 * 1. 打开 https://console.firebase.google.com 创建项目
 * 2. 左侧菜单 → Realtime Database → 创建数据库 → 选择"测试模式"
 * 3. 左侧菜单 → 项目设置 → 常规 → 添加 Web 应用 → 复制配置填入下方
 * 4. 数据库规则设为：{ "rules": { ".read": true, ".write": true } }
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, onDisconnect, serverTimestamp } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBg0IQOFKHeQR2pp-V_lUzKc9EST-uUghQ",
  authDomain: "researchhub-3d4b4.firebaseapp.com",
  databaseURL: "https://researchhub-3d4b4-default-rtdb.firebaseio.com",
  projectId: "researchhub-3d4b4",
  storageBucket: "researchhub-3d4b4.firebasestorage.app",
  messagingSenderId: "209526833070",
  appId: "1:209526833070:web:0cb7cffab117914191123f"
}

let app = null
let db = null
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
