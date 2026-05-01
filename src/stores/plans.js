import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [],
    loaded: false
  }),
  getters: {
    todos: (state) => state.plans.slice(0, 5),
    pendingPlans: (state) => state.plans.filter(p => !p.done),
    donePlans: (state) => state.plans.filter(p => p.done),
    planCount: (state) => state.plans.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.plans = getStorage('plans', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.plans = getStorage('plans', [])
      this.loaded = true
    },
    add(plan) {
      this.load()
      plan.id = Date.now()
      plan.done = false
      plan.createdAt = new Date().toISOString()
      this.plans.unshift(plan)
      this._persist()
      return plan
    },
    toggle(id) {
      this.load()
      const p = this.plans.find(p => p.id === id)
      if (p) {
        p.done = !p.done
        this._persist()
      }
    },
    remove(id) {
      this.load()
      this.plans = this.plans.filter(p => p.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('plans', this.plans)
    }
  }
})
