import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useLitNotesStore = defineStore('litNotes', {
  state: () => ({
    notes: [],
    loaded: false
  }),
  getters: {
    recentNotes: (state) => state.notes.slice(0, 4),
    noteCount: (state) => state.notes.length
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.notes = getStorage('lit_notes', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.notes = getStorage('lit_notes', [])
      this.loaded = true
    },
    add(note) {
      this.load()
      note.id = Date.now()
      note.createdAt = new Date().toISOString()
      note.updatedAt = note.createdAt
      this.notes.unshift(note)
      this._persist()
      return note
    },
    update(id, updates) {
      this.load()
      const idx = this.notes.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.notes[idx] = { ...this.notes[idx], ...updates, updatedAt: new Date().toISOString() }
        this._persist()
        return this.notes[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.notes = this.notes.filter(n => n.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('lit_notes', this.notes)
    }
  }
})
