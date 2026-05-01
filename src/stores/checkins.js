import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useCheckinsStore = defineStore('checkins', {
  state: () => ({
    checkins: {},
    loaded: false
  }),
  getters: {
    todayDate: () => new Date().toISOString().split('T')[0],
    todayRecord() {
      return this.checkins[this.todayDate] || null
    },
    streak() {
      const today = new Date()
      let current = 0
      let longest = 0
      let tempStreak = 0
      for (let i = 0; i < 365; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        if (this.checkins[dateStr]) {
          tempStreak++
          if (i === current) current = tempStreak
        } else {
          longest = Math.max(longest, tempStreak)
          tempStreak = 0
          if (i === current) break
        }
      }
      longest = Math.max(longest, tempStreak)
      return { current, longest, total: Object.keys(this.checkins).length }
    },
    clockStatus() {
      const today = this.todayDate
      const record = this.checkins[today]
      if (!record) return { clockedIn: false, clockedOut: false }
      const formatTime = (iso) => new Date(iso).toLocaleTimeString('zh-CN')
      const formatDuration = (ms) => {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.floor((ms % 3600000) / 60000)
        return `${hours}小时${minutes}分钟`
      }
      return {
        clockedIn: !!record.clockIn,
        clockedOut: !!record.clockOut,
        clockInTime: record.clockIn ? formatTime(record.clockIn) : '',
        clockOutTime: record.clockOut ? formatTime(record.clockOut) : '',
        duration: record.clockIn && record.clockOut
          ? formatDuration(new Date(record.clockOut) - new Date(record.clockIn))
          : ''
      }
    }
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.checkins = getStorage('checkins', {})
        this.loaded = true
      }
    },
    forceLoad() {
      this.checkins = getStorage('checkins', {})
      this.loaded = true
    },
    clockIn() {
      this.load()
      const today = this.todayDate
      if (!this.checkins[today]) this.checkins[today] = {}
      if (this.checkins[today].clockIn) return false
      this.checkins[today].clockIn = new Date().toISOString()
      this._persist()
      return true
    },
    clockOut() {
      this.load()
      const today = this.todayDate
      if (!this.checkins[today] || !this.checkins[today].clockIn || this.checkins[today].clockOut) return false
      this.checkins[today].clockOut = new Date().toISOString()
      this._persist()
      return true
    },
    _persist() {
      setStorage('checkins', this.checkins)
    }
  }
})
