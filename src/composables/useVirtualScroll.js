import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export function useVirtualScroll(items, options = {}) {
  const { itemHeight = 80, containerHeight = 600, threshold = 50 } = options
  const scrollTop = ref(0)
  const containerRef = ref(null)

  const shouldVirtualize = computed(() => items.value.length > threshold)

  const visibleRange = computed(() => {
    if (!shouldVirtualize.value) return { start: 0, end: items.value.length }
    const start = Math.floor(scrollTop.value / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
    return {
      start: Math.max(0, start - 1),
      end: Math.min(items.value.length, start + visibleCount + 1)
    }
  })

  const visibleItems = computed(() => {
    if (!shouldVirtualize.value) return items.value
    return items.value.slice(visibleRange.value.start, visibleRange.value.end)
  })

  const totalHeight = computed(() => items.value.length * itemHeight)
  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  function onScroll(e) {
    scrollTop.value = e.target.scrollTop
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    shouldVirtualize,
    onScroll
  }
}
