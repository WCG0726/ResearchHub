import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useInspirationsStore = defineStore('inspirations', {
  state: () => ({
    inspirations: [],
    loaded: false
  }),
  getters: {
    recentInspirations: (state) => {
      return [...state.inspirations]
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
    },
    inspirationCount: (state) => state.inspirations.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.inspirations = getStorage('inspirations', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.inspirations = getStorage('inspirations', [])
      this.loaded = true
    },
    add(item) {
      this.load()
      item.id = Date.now()
      item.createdAt = new Date().toISOString()
      item.pinned = false
      this.inspirations.unshift(item)
      this._persist()
      return item
    },
    update(id, updates) {
      this.load()
      const idx = this.inspirations.findIndex(i => i.id === id)
      if (idx !== -1) {
        this.inspirations[idx] = { ...this.inspirations[idx], ...updates }
        this._persist()
        return this.inspirations[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.inspirations = this.inspirations.filter(i => i.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('inspirations', this.inspirations)
    }
  }
})
