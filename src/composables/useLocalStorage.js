import { ref, watch } from 'vue'
import { getStorage, setStorage } from '../utils/storage'

/**
 * Reactive localStorage composable.
 * Returns a ref that auto-persists to localStorage on change.
 *
 * @param {string} key - Storage key (without prefix)
 * @param {*} defaultValue - Default value if key doesn't exist
 * @param {Object} options - { maxAge: ms } for auto-expiry
 */
export function useLocalStorage(key, defaultValue = null, options = {}) {
  const stored = getStorage(key, defaultValue)
  const data = ref(stored)

  watch(data, (val) => {
    setStorage(key, val)
  }, { deep: true })

  // Auto-expiry check
  if (options.maxAge) {
    const meta = getStorage(key + '_meta')
    if (meta && Date.now() - meta.ts > options.maxAge) {
      data.value = defaultValue
      setStorage(key, defaultValue)
    }
    watch(data, () => {
      setStorage(key + '_meta', { ts: Date.now() })
    }, { deep: true })
  }

  return data
}
