import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useExperimentsStore = defineStore('experiments', {
  state: () => ({
    experiments: [],
    loaded: false
  }),
  getters: {
    recentExperiments: (state) => state.experiments.slice(0, 5),
    experimentCount: (state) => state.experiments.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.experiments = getStorage('experiments', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.experiments = getStorage('experiments', [])
      this.loaded = true
    },
    add(exp) {
      this.load()
      exp.id = Date.now()
      exp.createdAt = new Date().toISOString()
      exp.updatedAt = exp.createdAt
      this.experiments.unshift(exp)
      this._persist()
      return exp
    },
    update(id, updates) {
      this.load()
      const idx = this.experiments.findIndex(e => e.id === id)
      if (idx !== -1) {
        this.experiments[idx] = { ...this.experiments[idx], ...updates, updatedAt: new Date().toISOString() }
        this._persist()
        return this.experiments[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.experiments = this.experiments.filter(e => e.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('experiments', this.experiments)
    }
  }
})
