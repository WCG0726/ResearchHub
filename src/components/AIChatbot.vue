<template>
  <div class="ai-chatbot">
    <!-- 触发按钮 -->
    <button class="chatbot-trigger" :class="{ active: isOpen }" @click="isOpen = !isOpen" title="AI 助手">
      🤖
    </button>

    <!-- 聊天面板 -->
    <transition name="slide">
      <div v-if="isOpen" class="chatbot-panel">
        <div class="panel-header">
          <span>AI 科研助手</span>
          <button class="btn-close" @click="isOpen = false">×</button>
        </div>

        <!-- 快捷操作 -->
        <div v-if="!currentConv || currentConv.messages.length === 0" class="quick-actions">
          <button v-for="action in quickActions" :key="action.label" class="quick-btn" @click="useQuickAction(action)">
            {{ action.icon }} {{ action.label }}
          </button>
        </div>

        <!-- 消息列表 -->
        <div class="messages" ref="messagesEl">
          <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
            <div class="message-bubble" v-html="formatMessage(msg.content)"></div>
          </div>
          <div v-if="isStreaming" class="message assistant">
            <div class="message-bubble streaming">{{ streamText }}<span class="cursor">|</span></div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="input-area">
          <textarea
            v-model="input"
            class="chat-input"
            placeholder="输入消息..."
            rows="1"
            @keydown.enter.exact.prevent="send"
            @input="autoResize"
            ref="inputEl"
          ></textarea>
          <button class="send-btn" @click="send" :disabled="!input.trim() || isStreaming">
            ↑
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { callAIStream } from '../utils/ai'
import { useChatHistoryStore } from '../stores/chatHistory'

export default {
  name: 'AIChatbot',
  data() {
    return {
      isOpen: false,
      input: '',
      streamText: '',
      isStreaming: false,
      chatStore: useChatHistoryStore(),
      quickActions: [
        { icon: '📧', label: '帮我写邮件', prompt: '请帮我写一封学术邮件，场景是：' },
        { icon: '📄', label: '解释这篇论文', prompt: '请帮我分析以下论文摘要：' },
        { icon: '🔬', label: '研究方向建议', prompt: '我的研究方向是，请帮我分析有前景的研究方向：' },
        { icon: '✍️', label: '帮我润色', prompt: '请帮我润色以下学术文本：' }
      ]
    }
  },
  computed: {
    currentConv() {
      return this.chatStore.currentConversation
    },
    messages() {
      return this.currentConv?.messages || []
    }
  },
  watch: {
    isOpen(val) {
      if (val) this.$nextTick(() => this.scrollToBottom())
    },
    messages() {
      this.$nextTick(() => this.scrollToBottom())
    }
  },
  methods: {
    getSystemPrompt() {
      const pageName = this.$route?.name || 'unknown'
      const pageNames = {
        dashboard: '工作台', checkin: '打卡', records: '科研记录', writing: '论文写作',
        guide: '写作指南', translate: '翻译', polish: '润色', zotero: 'Zotero 文献',
        'plot-tips': '绘图技巧', 'lit-notes': '文献笔记', experiment: '实验记录',
        meeting: '组会记录', inspiration: '灵感板', settings: '设置'
      }
      return `You are an AI research assistant embedded in ResearchHub, a scientific research management platform.
The user is currently on the "${pageNames[pageName] || pageName}" page.
You can help with: research methodology, paper writing, literature analysis, data visualization, academic communication.
Be concise, professional, and respond in the same language as the user (Chinese or English).
Keep responses under 500 words unless the user asks for more detail.`
    },
    async send() {
      const text = this.input.trim()
      if (!text || this.isStreaming) return
      this.input = ''
      this.$nextTick(() => this.autoResize())

      let conv = this.currentConv
      if (!conv) {
        conv = this.chatStore.createConversation()
      }
      this.chatStore.addMessage(conv.id, 'user', text)

      this.isStreaming = true
      this.streamText = ''
      try {
        const systemPrompt = this.getSystemPrompt()
        await callAIStream(systemPrompt, text, {
          temperature: 0.7,
          maxTokens: 1000,
          onChunk: (t) => { this.streamText = t }
        })
        this.chatStore.addMessage(conv.id, 'assistant', this.streamText)
      } catch (e) {
        this.chatStore.addMessage(conv.id, 'assistant', '错误: ' + e.message)
      } finally {
        this.isStreaming = false
        this.streamText = ''
      }
    },
    useQuickAction(action) {
      this.input = action.prompt
      this.$nextTick(() => this.$refs.inputEl?.focus())
    },
    formatMessage(text) {
      if (!text) return ''
      return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
    },
    autoResize() {
      const el = this.$refs.inputEl
      if (el) {
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 100) + 'px'
      }
    },
    scrollToBottom() {
      const el = this.$refs.messagesEl
      if (el) el.scrollTop = el.scrollHeight
    }
  }
}
</script>

<style scoped>
.chatbot-trigger {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 999;
  transition: transform 0.2s;
}

.chatbot-trigger:hover { transform: scale(1.1); }
.chatbot-trigger.active { transform: scale(0.95); }

.chatbot-panel {
  position: fixed;
  bottom: 84px;
  right: 24px;
  width: 380px;
  height: 520px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  z-index: 999;
  overflow: hidden;
}

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0 4px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}

.quick-btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover { border-color: var(--primary); color: var(--primary); }

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message { display: flex; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.message.user .message-bubble {
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-bubble {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.message-bubble.streaming { opacity: 0.8; }
.cursor { animation: blink 0.8s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.message-bubble code {
  background: rgba(0,0,0,0.08);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 100px;
}

.chat-input:focus { border-color: var(--primary); }

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 500px) {
  .chatbot-panel {
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
</style>
