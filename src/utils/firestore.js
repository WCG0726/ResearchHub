/**
 * Firestore 云端同步模块
 * 为打卡数据提供多端实时同步、原子计数、离线缓存
 *
 * 配置步骤：
 * 1. Firebase Console → Firestore Database → 创建数据库 → 测试模式
 * 2. 数据库规则：allow read, write: if true;
 */

import { getFirestore, doc, setDoc, getDoc, onSnapshot, increment, serverTimestamp } from 'firebase/firestore'
import { initFirebase } from './firebase'

let firestore = null
let initialized = false

async function ensureFirestore() {
  if (initialized && firestore) return firestore
  const ok = await initFirebase()
  if (!ok) return null
  try {
    const { getApps } = await import('firebase/app')
    const app = getApps()[0]
    if (!app) return null
    firestore = getFirestore(app)
    initialized = true
    return firestore
  } catch (e) {
    console.warn('Firestore init failed:', e)
    return null
  }
}

/**
 * 保存用户打卡数据到 Firestore
 */
export async function saveCheckinsToCloud(username, checkins) {
  const db = await ensureFirestore()
  if (!db) return false
  try {
    await setDoc(doc(db, 'checkins', username), {
      data: checkins,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return true
  } catch (e) {
    console.warn('Save checkins to cloud failed:', e)
    return false
  }
}

/**
 * 从 Firestore 加载用户打卡数据
 */
export async function loadCheckinsFromCloud(username) {
  const db = await ensureFirestore()
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'checkins', username))
    if (snap.exists()) {
      return snap.data().data || {}
    }
    return null
  } catch (e) {
    console.warn('Load checkins from cloud failed:', e)
    return null
  }
}

/**
 * 实时监听打卡数据变化
 * @returns {Function} unsubscribe 函数
 */
export function watchCheckins(username, callback) {
  let unsubscribe = () => {}
  ensureFirestore().then(db => {
    if (!db) return
    try {
      unsubscribe = onSnapshot(doc(db, 'checkins', username), (snap) => {
        if (snap.exists()) {
          callback(snap.data().data || {})
        }
      }, (err) => {
        console.warn('Watch checkins error:', err)
      })
    } catch (e) {
      console.warn('Watch checkins setup failed:', e)
    }
  })
  return () => unsubscribe()
}

/**
 * 原子递增累计打卡天数
 */
export async function incrementCheckinCount(username) {
  const db = await ensureFirestore()
  if (!db) return false
  try {
    await setDoc(doc(db, 'user_stats', username), {
      totalCheckins: increment(1),
      lastCheckin: serverTimestamp()
    }, { merge: true })
    return true
  } catch (e) {
    console.warn('Increment checkin count failed:', e)
    return false
  }
}

/**
 * 保存全局统计数据（团队排行榜用）
 */
export async function saveUserStats(username, stats) {
  const db = await ensureFirestore()
  if (!db) return false
  try {
    await setDoc(doc(db, 'user_stats', username), {
      ...stats,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return true
  } catch (e) {
    console.warn('Save user stats failed:', e)
    return false
  }
}

/**
 * 监听所有用户统计（排行榜用）
 */
export function watchAllUserStats(callback) {
  // 使用 Realtime Database 的 presence 数据已有的方案
  // Firestore 版本需要 collection 查询
  return () => {}
}
