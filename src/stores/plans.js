import { defineStore } from 'pinia'
import { createPersistedRef } from '../composables/useLocalStorage'

const _data = createPersistedRef('plans', [])

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
        this.plans = _data.value
        this.loaded = true
      }
    },
    forceLoad() {
      this.plans = _data.value
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
      _data.value = this.plans
    }
  }
})
