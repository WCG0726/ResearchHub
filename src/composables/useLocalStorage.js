import { ref, watch } from 'vue'
import { getStorage, setStorage, removeStorage } from '../utils/storage'

// Re-export storage utils so stores import from composables, not utils directly
export { getStorage, setStorage, removeStorage }

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

/**
 * Storage-backed accessor for Pinia stores.
 * Returns an object with a `.value` property backed by getStorage/setStorage.
 * Safe to use at module scope (no Vue setup context required).
 *
 * @param {string} key - Storage key (without prefix)
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {{ value: * }} - accessor whose .value reads/writes localStorage
 */
export function createPersistedRef(key, defaultValue = null) {
  return {
    get value() {
      return getStorage(key, defaultValue)
    },
    set value(v) {
      setStorage(key, v)
    }
  }
}
