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

// 打卡相关
export function getCheckins() {
  return getStorage('checkins', {})
}

export function setCheckins(checkins) {
  setStorage('checkins', checkins)
}

export function checkinToday() {
  const today = new Date().toISOString().split('T')[0]
  const checkins = getCheckins()
  if (!checkins[today]) {
    checkins[today] = { time: new Date().toISOString(), note: '' }
    setCheckins(checkins)
    return true
  }
  return false
}

export function getStreak() {
  const checkins = getCheckins()
  const dates = Object.keys(checkins).sort().reverse()
  if (dates.length === 0) return { current: 0, longest: 0, total: 0 }

  const today = new Date()
  let current = 0
  let longest = 0
  let tempStreak = 0

  // 计算连续天数
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    if (checkins[dateStr]) {
      tempStreak++
      if (i === current) current = tempStreak
    } else {
      longest = Math.max(longest, tempStreak)
      tempStreak = 0
      if (i === current) break
    }
  }
  longest = Math.max(longest, tempStreak)

  return {
    current,
    longest,
    total: dates.length
  }
}

// 记录相关
export function getRecords() {
  return getStorage('records', [])
}

export function setRecords(records) {
  setStorage('records', records)
}

export function addRecord(record) {
  const records = getRecords()
  record.id = Date.now()
  record.createdAt = new Date().toISOString()
  record.updatedAt = record.createdAt
  records.unshift(record)
  setRecords(records)
  return record
}

export function updateRecord(id, updates) {
  const records = getRecords()
  const index = records.findIndex(r => r.id === id)
  if (index !== -1) {
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
    setRecords(records)
    return records[index]
  }
  return null
}

export function deleteRecord(id) {
  const records = getRecords().filter(r => r.id !== id)
  setRecords(records)
}

// 写作进度
export function getWritingProgress() {
  return getStorage('writing', {
    papers: [],
    currentPaper: null
  })
}

export function setWritingProgress(data) {
  setStorage('writing', data)
}

// 用户资料
const DEFAULT_PROFILE = { nickname: '科研人', avatar: '' }

export function getProfile() {
  return getStorage('profile', DEFAULT_PROFILE)
}

export function setProfile(profile) {
  setStorage('profile', { ...getProfile(), ...profile })
}

// 主题
export function getTheme() {
  return getStorage('theme', 'light')
}

export function setTheme(theme) {
  setStorage('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}
