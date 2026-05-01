import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useWritingStore = defineStore('writing', {
  state: () => ({
    data: { papers: [], currentPaper: null },
    loaded: false
  }),
  getters: {
    papers: (state) => state.data.papers,
    currentPaper: (state) => state.data.currentPaper
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.data = getStorage('writing', { papers: [], currentPaper: null })
        this.loaded = true
      }
    },
    forceLoad() {
      this.data = getStorage('writing', { papers: [], currentPaper: null })
      this.loaded = true
    },
    save(data) {
      this.data = { ...this.data, ...data }
      this._persist()
    },
    _persist() {
      setStorage('writing', this.data)
    }
  }
})
