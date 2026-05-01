import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useMilestonesStore = defineStore('milestones', {
  state: () => ({
    milestones: [],
    loaded: false
  }),
  getters: {
    doneCount: (state) => state.milestones.filter(m => m.done).length,
    pendingCount: (state) => state.milestones.filter(m => !m.done).length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.milestones = getStorage('milestones', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.milestones = getStorage('milestones', [])
      this.loaded = true
    },
    add(m) {
      this.load()
      m.id = Date.now()
      m.createdAt = new Date().toISOString()
      m.done = false
      this.milestones.push(m)
      this._persist()
      return m
    },
    update(id, updates) {
      this.load()
      const idx = this.milestones.findIndex(m => m.id === id)
      if (idx !== -1) {
        this.milestones[idx] = { ...this.milestones[idx], ...updates }
        this._persist()
        return this.milestones[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.milestones = this.milestones.filter(m => m.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('milestones', this.milestones)
    }
  }
})
