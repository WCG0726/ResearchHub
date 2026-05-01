import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useMeetingsStore = defineStore('meetings', {
  state: () => ({
    meetings: [],
    loaded: false
  }),
  getters: {
    recentMeetings: (state) => state.meetings.slice(0, 5),
    meetingCount: (state) => state.meetings.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.meetings = getStorage('meetings', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.meetings = getStorage('meetings', [])
      this.loaded = true
    },
    add(m) {
      this.load()
      m.id = Date.now()
      m.createdAt = new Date().toISOString()
      this.meetings.unshift(m)
      this._persist()
      return m
    },
    update(id, updates) {
      this.load()
      const idx = this.meetings.findIndex(m => m.id === id)
      if (idx !== -1) {
        this.meetings[idx] = { ...this.meetings[idx], ...updates }
        this._persist()
        return this.meetings[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.meetings = this.meetings.filter(m => m.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('meetings', this.meetings)
    }
  }
})
