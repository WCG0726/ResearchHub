import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useMealsStore = defineStore('meals', {
  state: () => ({
    meals: [],
    loaded: false
  }),
  getters: {
    mealCount: (state) => state.meals.length,
    recentMeals: (state) => state.meals.slice(0, 10)
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.meals = getStorage('meals', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.meals = getStorage('meals', [])
      this.loaded = true
    },
    add(meal) {
      this.load()
      meal.id = Date.now()
      meal.date = new Date().toISOString()
      this.meals.unshift(meal)
      this._persist()
      return meal
    },
    _persist() {
      setStorage('meals', this.meals)
    }
  }
})
