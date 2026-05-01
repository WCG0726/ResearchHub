import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useEmailTemplatesStore = defineStore('emailTemplates', {
  state: () => ({
    templates: [],
    loaded: false
  }),
  getters: {
    templateCount: (state) => state.templates.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.templates = getStorage('email_templates', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.templates = getStorage('email_templates', [])
      this.loaded = true
    },
    add(t) {
      this.load()
      t.id = Date.now()
      t.createdAt = new Date().toISOString()
      this.templates.unshift(t)
      this._persist()
      return t
    },
    remove(id) {
      this.load()
      this.templates = this.templates.filter(t => t.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('email_templates', this.templates)
    }
  }
})
