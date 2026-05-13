import { ref, watch } from 'vue'

/**
 * Debounce a ref value.
 * @param {*} value - Source value to debounce
 * @param {number} delay - Debounce delay in ms (default 300)
 */
export function useDebounce(value, delay = 300) {
  const debounced = ref(value.value)
  let timer = null

  watch(value, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = val }, delay)
  })

  return debounced
}
