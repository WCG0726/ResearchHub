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

// 日历事件
export function getCalendarEvents() {
  return getStorage('calendar_events', {})
}

export function addCalendarEvent(date, event) {
  const events = getCalendarEvents()
  if (!events[date]) events[date] = []
  event.id = Date.now()
  events[date].push(event)
  setStorage('calendar_events', events)
  return event
}

// 获取某天的事件（包含每年重复的纪念日）
export function getEventsForDate(dateStr) {
  const events = getCalendarEvents()
  const result = []
  // 直接事件
  if (events[dateStr]) {
    result.push(...events[dateStr])
  }
  // 检查纪念日（每年重复）
  const [, m, d] = dateStr.split('-')
  for (const [key, evts] of Object.entries(events)) {
    if (key === dateStr) continue
    const [, km, kd] = key.split('-')
    if (km === m && kd === d) {
      for (const ev of evts) {
        if (ev.recurring) {
          result.push({ ...ev, isAnniversary: true, originalDate: key })
        }
      }
    }
  }
  return result
}

export function deleteCalendarEvent(date, eventId) {
  const events = getCalendarEvents()
  if (events[date]) {
    events[date] = events[date].filter(e => e.id !== eventId)
    if (events[date].length === 0) delete events[date]
    setStorage('calendar_events', events)
  }
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

// 文献阅读笔记
export function getLitNotes() {
  return getStorage('lit_notes', [])
}

export function addLitNote(note) {
  const notes = getLitNotes()
  note.id = Date.now()
  note.createdAt = new Date().toISOString()
  note.updatedAt = note.createdAt
  notes.unshift(note)
  setStorage('lit_notes', notes)
  return note
}

export function updateLitNote(id, updates) {
  const notes = getLitNotes()
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) {
    notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() }
    setStorage('lit_notes', notes)
    return notes[idx]
  }
  return null
}

export function deleteLitNote(id) {
  setStorage('lit_notes', getLitNotes().filter(n => n.id !== id))
}

// 实验记录
export function getExperiments() {
  return getStorage('experiments', [])
}

export function addExperiment(exp) {
  const exps = getExperiments()
  exp.id = Date.now()
  exp.createdAt = new Date().toISOString()
  exp.updatedAt = exp.createdAt
  exps.unshift(exp)
  setStorage('experiments', exps)
  return exp
}

export function updateExperiment(id, updates) {
  const exps = getExperiments()
  const idx = exps.findIndex(e => e.id === id)
  if (idx !== -1) {
    exps[idx] = { ...exps[idx], ...updates, updatedAt: new Date().toISOString() }
    setStorage('experiments', exps)
    return exps[idx]
  }
  return null
}

export function deleteExperiment(id) {
  setStorage('experiments', getExperiments().filter(e => e.id !== id))
}

// 数据分析
export function getDatasets() {
  return getStorage('datasets', [])
}

export function addDataset(ds) {
  const datasets = getDatasets()
  ds.id = Date.now()
  ds.createdAt = new Date().toISOString()
  datasets.unshift(ds)
  setStorage('datasets', datasets)
  return ds
}

export function deleteDataset(id) {
  setStorage('datasets', getDatasets().filter(d => d.id !== id))
}

// LaTeX 片段
export function getLatexSnippets() {
  return getStorage('latex_snippets', [])
}

export function addLatexSnippet(s) {
  const list = getLatexSnippets()
  s.id = Date.now()
  s.createdAt = new Date().toISOString()
  list.unshift(s)
  setStorage('latex_snippets', list)
  return s
}

export function deleteLatexSnippet(id) {
  setStorage('latex_snippets', getLatexSnippets().filter(s => s.id !== id))
}

// 组会/会议记录
export function getMeetings() {
  return getStorage('meetings', [])
}

export function addMeeting(m) {
  const list = getMeetings()
  m.id = Date.now()
  m.createdAt = new Date().toISOString()
  list.unshift(m)
  setStorage('meetings', list)
  return m
}

export function updateMeeting(id, updates) {
  const list = getMeetings()
  const idx = list.findIndex(m => m.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates }
    setStorage('meetings', list)
    return list[idx]
  }
  return null
}

export function deleteMeeting(id) {
  setStorage('meetings', getMeetings().filter(m => m.id !== id))
}

// 灵感板
export function getInspirations() {
  return getStorage('inspirations', [])
}

export function addInspiration(item) {
  const list = getInspirations()
  item.id = Date.now()
  item.createdAt = new Date().toISOString()
  item.pinned = false
  list.unshift(item)
  setStorage('inspirations', list)
  return item
}

export function updateInspiration(id, updates) {
  const list = getInspirations()
  const idx = list.findIndex(i => i.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates }
    setStorage('inspirations', list)
    return list[idx]
  }
  return null
}

export function deleteInspiration(id) {
  setStorage('inspirations', getInspirations().filter(i => i.id !== id))
}

// 里程碑
export function getMilestones() {
  return getStorage('milestones', [])
}

export function addMilestone(m) {
  const list = getMilestones()
  m.id = Date.now()
  m.createdAt = new Date().toISOString()
  m.done = false
  list.push(m)
  setStorage('milestones', list)
  return m
}

export function updateMilestone(id, updates) {
  const list = getMilestones()
  const idx = list.findIndex(m => m.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates }
    setStorage('milestones', list)
    return list[idx]
  }
  return null
}

export function deleteMilestone(id) {
  setStorage('milestones', getMilestones().filter(m => m.id !== id))
}

// 番茄钟
export function getPomodoroStats() {
  return getStorage('pomodoro', { total: 0, today: 0, todayDate: '', history: [] })
}

export function addPomodoroSession(minutes) {
  const stats = getPomodoroStats()
  const today = new Date().toISOString().split('T')[0]
  if (stats.todayDate !== today) {
    stats.todayDate = today
    stats.today = 0
  }
  stats.total++
  stats.today++
  stats.history.push({ date: today, minutes, time: new Date().toISOString() })
  if (stats.history.length > 500) stats.history = stats.history.slice(-500)
  setStorage('pomodoro', stats)
  return stats
}

// 邮件模板
export function getEmailTemplates() {
  return getStorage('email_templates', [])
}

export function addEmailTemplate(t) {
  const list = getEmailTemplates()
  t.id = Date.now()
  t.createdAt = new Date().toISOString()
  list.unshift(t)
  setStorage('email_templates', list)
  return t
}

export function deleteEmailTemplate(id) {
  setStorage('email_templates', getEmailTemplates().filter(t => t.id !== id))
}

// 学术日历（截稿日期）
export function getAcademicEvents() {
  return getStorage('academic_events', [])
}

export function addAcademicEvent(e) {
  const list = getAcademicEvents()
  e.id = Date.now()
  e.createdAt = new Date().toISOString()
  list.push(e)
  list.sort((a, b) => a.date.localeCompare(b.date))
  setStorage('academic_events', list)
  return e
}

export function deleteAcademicEvent(id) {
  setStorage('academic_events', getAcademicEvents().filter(e => e.id !== id))
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
        // merge mode: 对数组合并去重，对象合并
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
