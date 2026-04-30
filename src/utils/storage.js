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

// 上班/下班打卡
export function clockIn() {
  const today = new Date().toISOString().split('T')[0]
  const checkins = getCheckins()
  if (!checkins[today]) {
    checkins[today] = {}
  }
  if (checkins[today].clockIn) return false
  checkins[today].clockIn = new Date().toISOString()
  setCheckins(checkins)
  return true
}

export function clockOut() {
  const today = new Date().toISOString().split('T')[0]
  const checkins = getCheckins()
  if (!checkins[today] || !checkins[today].clockIn || checkins[today].clockOut) return false
  checkins[today].clockOut = new Date().toISOString()
  setCheckins(checkins)
  return true
}

export function getTodayClockStatus() {
  const today = new Date().toISOString().split('T')[0]
  const checkins = getCheckins()
  const record = checkins[today]
  if (!record) return { clockedIn: false, clockedOut: false }
  return {
    clockedIn: !!record.clockIn,
    clockedOut: !!record.clockOut,
    clockInTime: record.clockIn ? new Date(record.clockIn).toLocaleTimeString('zh-CN') : '',
    clockOutTime: record.clockOut ? new Date(record.clockOut).toLocaleTimeString('zh-CN') : '',
    duration: record.clockIn && record.clockOut
      ? formatDuration(new Date(record.clockOut) - new Date(record.clockIn))
      : ''
  }
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}小时${minutes}分钟`
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

// 计划表
export function getPlans() {
  return getStorage('plans', [])
}

export function setPlans(plans) {
  setStorage('plans', plans)
}

export function addPlan(plan) {
  const plans = getPlans()
  plan.id = Date.now()
  plan.done = false
  plan.createdAt = new Date().toISOString()
  plans.unshift(plan)
  setPlans(plans)
  return plan
}

export function togglePlan(id) {
  const plans = getPlans()
  const p = plans.find(p => p.id === id)
  if (p) {
    p.done = !p.done
    setPlans(plans)
  }
}

export function deletePlan(id) {
  setPlans(getPlans().filter(p => p.id !== id))
}

// 喝水记录
export function getWater() {
  const today = new Date().toISOString().split('T')[0]
  const data = getStorage('water', {})
  if (!data[today]) data[today] = { cups: 0, goal: 8 }
  return data[today]
}

export function addWaterCup() {
  const today = new Date().toISOString().split('T')[0]
  const data = getStorage('water', {})
  if (!data[today]) data[today] = { cups: 0, goal: 8 }
  data[today].cups++
  setStorage('water', data)
  return data[today]
}

export function removeWaterCup() {
  const today = new Date().toISOString().split('T')[0]
  const data = getStorage('water', {})
  if (data[today] && data[today].cups > 0) {
    data[today].cups--
    setStorage('water', data)
  }
  return data[today] || { cups: 0, goal: 8 }
}

export function setWaterGoal(goal) {
  const today = new Date().toISOString().split('T')[0]
  const data = getStorage('water', {})
  if (!data[today]) data[today] = { cups: 0, goal: 8 }
  data[today].goal = goal
  setStorage('water', data)
}

// 吃什么
export function getMeals() {
  return getStorage('meals', [])
}

export function addMeal(meal) {
  const meals = getMeals()
  meal.id = Date.now()
  meal.date = new Date().toISOString()
  meals.unshift(meal)
  setStorage('meals', meals)
  return meal
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
