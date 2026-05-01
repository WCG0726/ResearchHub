import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useLatexSnippetsStore = defineStore('latexSnippets', {
  state: () => ({
    snippets: [],
    loaded: false
  }),
  getters: {
    snippetCount: (state) => state.snippets.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.snippets = getStorage('latex_snippets', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.snippets = getStorage('latex_snippets', [])
      this.loaded = true
    },
    add(s) {
      this.load()
      s.id = Date.now()
      s.createdAt = new Date().toISOString()
      this.snippets.unshift(s)
      this._persist()
      return s
    },
    remove(id) {
      this.load()
      this.snippets = this.snippets.filter(s => s.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('latex_snippets', this.snippets)
    }
  }
})
