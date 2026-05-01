import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useWaterStore = defineStore('water', {
  state: () => ({
    allData: {},
    loaded: false
  }),
  getters: {
    todayDate: () => new Date().toISOString().split('T')[0],
    todayData() {
      if (!this.allData[this.todayDate]) {
        return { cups: 0, goal: 8 }
      }
      return this.allData[this.todayDate]
    },
    todayCups() { return this.todayData.cups },
    todayGoal() { return this.todayData.goal }
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.allData = getStorage('water', {})
        this.loaded = true
      }
    },
    forceLoad() {
      this.allData = getStorage('water', {})
      this.loaded = true
    },
    addCup() {
      this.load()
      const today = this.todayDate
      if (!this.allData[today]) this.allData[today] = { cups: 0, goal: 8 }
      this.allData[today].cups++
      this._persist()
      return this.allData[today]
    },
    removeCup() {
      this.load()
      const today = this.todayDate
      if (this.allData[today] && this.allData[today].cups > 0) {
        this.allData[today].cups--
        this._persist()
      }
      return this.allData[today] || { cups: 0, goal: 8 }
    },
    setGoal(goal) {
      this.load()
      const today = this.todayDate
      if (!this.allData[today]) this.allData[today] = { cups: 0, goal: 8 }
      this.allData[today].goal = goal
      this._persist()
    },
    _persist() {
      setStorage('water', this.allData)
    }
  }
})
