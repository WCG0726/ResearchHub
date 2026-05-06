import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

const DEFAULT_PROFILE = { nickname: '科研人', avatar: '', avatarData: '', school: '', researchField: '' }

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: { ...DEFAULT_PROFILE },
    theme: 'light',
    loaded: false
  }),
  actions: {
    load() {
      if (!this.loaded) {
        this.profile = getStorage('profile', { ...DEFAULT_PROFILE })
        this.theme = getStorage('theme', 'light')
        this.loaded = true
      }
    },
    updateProfile(updates) {
      this.load()
      this.profile = { ...this.profile, ...updates }
      setStorage('profile', this.profile)
    },
    setTheme(theme) {
      this.theme = theme
      setStorage('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})
