import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useCalendarEventsStore = defineStore('calendarEvents', {
  state: () => ({
    events: {},
    loaded: false
  }),
  getters: {
    allEvents: (state) => state.events,
    eventsForDate: (state) => (dateStr) => {
      const result = []
      if (state.events[dateStr]) {
        result.push(...state.events[dateStr])
      }
      const [, m, d] = dateStr.split('-')
      for (const [key, evts] of Object.entries(state.events)) {
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
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.events = getStorage('calendar_events', {})
        this.loaded = true
      }
    },
    forceLoad() {
      this.events = getStorage('calendar_events', {})
      this.loaded = true
    },
    add(date, event) {
      this.load()
      if (!this.events[date]) this.events[date] = []
      event.id = Date.now()
      this.events[date].push(event)
      this._persist()
      return event
    },
    remove(date, eventId) {
      this.load()
      if (this.events[date]) {
        this.events[date] = this.events[date].filter(e => e.id !== eventId)
        if (this.events[date].length === 0) delete this.events[date]
        this._persist()
      }
    },
    _persist() {
      setStorage('calendar_events', this.events)
    }
  }
})
