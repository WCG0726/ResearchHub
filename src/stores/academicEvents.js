import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useAcademicEventsStore = defineStore('academicEvents', {
  state: () => ({
    events: [],
    loaded: false
  }),
  getters: {
    eventCount: (state) => state.events.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.events = getStorage('academic_events', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.events = getStorage('academic_events', [])
      this.loaded = true
    },
    add(e) {
      this.load()
      e.id = Date.now()
      e.createdAt = new Date().toISOString()
      this.events.push(e)
      this.events.sort((a, b) => a.date.localeCompare(b.date))
      this._persist()
      return e
    },
    remove(id) {
      this.load()
      this.events = this.events.filter(e => e.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('academic_events', this.events)
    }
  }
})
