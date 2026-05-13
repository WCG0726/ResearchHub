import { defineStore } from 'pinia'
import { getStorage, setStorage } from '../utils/storage'

const STORAGE_KEY = 'chat_history'
const MAX_CONVERSATIONS = 10
const MAX_MESSAGES = 50

export const useChatHistoryStore = defineStore('chatHistory', {
  state: () => ({
    conversations: getStorage(STORAGE_KEY, [])
  }),
  getters: {
    currentConversation: (state) => state.conversations[0] || null
  },
  actions: {
    _save() {
      setStorage(STORAGE_KEY, this.conversations)
    },
    createConversation(title = '新对话') {
      const conv = {
        id: Date.now().toString(36),
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.conversations.unshift(conv)
      if (this.conversations.length > MAX_CONVERSATIONS) {
        this.conversations = this.conversations.slice(0, MAX_CONVERSATIONS)
      }
      this._save()
      return conv
    },
    addMessage(convId, role, content) {
      const conv = this.conversations.find(c => c.id === convId)
      if (!conv) return
      conv.messages.push({ role, content, timestamp: new Date().toISOString() })
      if (conv.messages.length > MAX_MESSAGES) {
        conv.messages = conv.messages.slice(-MAX_MESSAGES)
      }
      conv.updatedAt = new Date().toISOString()
      if (conv.messages.length === 1 && role === 'user') {
        conv.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
      }
      this._save()
    },
    getMessages(convId) {
      const conv = this.conversations.find(c => c.id === convId)
      return conv ? conv.messages : []
    },
    deleteConversation(convId) {
      this.conversations = this.conversations.filter(c => c.id !== convId)
      this._save()
    },
    clearAll() {
      this.conversations = []
      this._save()
    }
  }
})
