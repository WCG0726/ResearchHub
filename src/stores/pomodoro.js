import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const usePomodoroStore = defineStore('pomodoro', {
  state: () => ({
    stats: { total: 0, today: 0, todayDate: '', history: [] },
    loaded: false
  }),
  getters: {
    total: (state) => state.stats.total,
    today: (state) => {
      const today = new Date().toISOString().split('T')[0]
      if (state.stats.todayDate !== today) return 0
      return state.stats.today
    },
    history: (state) => state.stats.history
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.stats = getStorage('pomodoro', { total: 0, today: 0, todayDate: '', history: [] })
        this.loaded = true
      }
    },
    forceLoad() {
      this.stats = getStorage('pomodoro', { total: 0, today: 0, todayDate: '', history: [] })
      this.loaded = true
    },
    addSession(minutes) {
      this.load()
      const today = new Date().toISOString().split('T')[0]
      if (this.stats.todayDate !== today) {
        this.stats.todayDate = today
        this.stats.today = 0
      }
      this.stats.total++
      this.stats.today++
      this.stats.history.push({ date: today, minutes, time: new Date().toISOString() })
      if (this.stats.history.length > 500) this.stats.history = this.stats.history.slice(-500)
      this._persist()
      return this.stats
    },
    _persist() {
      setStorage('pomodoro', this.stats)
    }
  }
})
