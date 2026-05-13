import { ref } from 'vue'
import { callAIStream } from '../utils/ai'

export function useStreamingText() {
  const displayText = ref('')
  const isStreaming = ref(false)
  let abortController = null

  async function startStream(systemPrompt, userMessage, options = {}) {
    displayText.value = ''
    isStreaming.value = true
    abortController = new AbortController()

    try {
      await callAIStream(systemPrompt, userMessage, {
        ...options,
        signal: abortController.signal,
        onChunk: (text) => { displayText.value = text }
      })
    } finally {
      isStreaming.value = false
      abortController = null
    }
  }

  function abort() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isStreaming.value = false
  }

  return { displayText, isStreaming, startStream, abort }
}
