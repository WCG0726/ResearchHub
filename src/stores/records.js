import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

export const useRecordsStore = defineStore('records', {
  state: () => ({
    records: [],
    loaded: false
  }),
  getters: {
    recentRecords: (state) => state.records.slice(0, 5),
    recordCount: (state) => state.records.length,
    recordsByTag: (state) => (tag) => state.records.filter(r => r.tags?.includes(tag))
  },
  actions: {
    load() {
      if (!this.loaded) {
        this.records = getStorage('records', [])
        this.loaded = true
      }
    },
    forceLoad() {
      this.records = getStorage('records', [])
      this.loaded = true
    },
    add(record) {
      this.load()
      record.id = Date.now()
      record.createdAt = new Date().toISOString()
      record.updatedAt = record.createdAt
      this.records.unshift(record)
      this._persist()
      return record
    },
    update(id, updates) {
      this.load()
      const idx = this.records.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.records[idx] = { ...this.records[idx], ...updates, updatedAt: new Date().toISOString() }
        this._persist()
        return this.records[idx]
      }
      return null
    },
    remove(id) {
      this.load()
      this.records = this.records.filter(r => r.id !== id)
      this._persist()
    },
    _persist() {
      setStorage('records', this.records)
    }
  }
})
