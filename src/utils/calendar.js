import { toDateString } from './date'

export function generateCalendarDays(year, month, checkins = {}, events = {}) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date().toISOString().split('T')[0]
  const days = []

  const start = firstDay.getDay()
  for (let i = start - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const ds = toDateString(d)
    days.push({
      date: d.getDate(),
      fullDate: ds,
      currentMonth: false,
      isToday: ds === today,
      isChecked: !!checkins[ds],
      hasEvent: !!(events[ds]?.length),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const ds = toDateString(d)
    days.push({
      date: i,
      fullDate: ds,
      currentMonth: true,
      isToday: ds === today,
      isChecked: !!checkins[ds],
      hasEvent: !!(events[ds]?.length),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    })
  }

  const rem = 42 - days.length
  for (let i = 1; i <= rem; i++) {
    const d = new Date(year, month + 1, i)
    const ds = toDateString(d)
    days.push({
      date: i,
      fullDate: ds,
      currentMonth: false,
      isToday: ds === today,
      isChecked: !!checkins[ds],
      hasEvent: !!(events[ds]?.length),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    })
  }

  return days
}
