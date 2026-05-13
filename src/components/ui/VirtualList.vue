<template>
  <div ref="container" class="virtual-list" :style="{ height: height + 'px', overflow: 'auto' }" @scroll="onScroll">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div :style="{ position: 'absolute', top: offsetY + 'px', width: '100%' }">
        <div v-for="item in visibleItems" :key="item._key" :style="{ height: itemHeight + 'px' }">
          <slot :item="item._data" :index="item._index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  itemHeight: { type: Number, default: 60 },
  height: { type: Number, default: 400 },
  keyField: { type: String, default: 'id' },
})

const scrollTop = ref(0)
const container = ref(null)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleCount = computed(() => Math.ceil(props.height / props.itemHeight) + 2)

const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1))

const visibleItems = computed(() => {
  const items = props.items
  const start = startIndex.value
  const end = Math.min(items.length, start + visibleCount.value)
  const result = []
  for (let i = start; i < end; i++) {
    result.push({
      _key: items[i]?.[props.keyField] ?? i,
      _data: items[i],
      _index: i,
    })
  }
  return result
})

const offsetY = computed(() => startIndex.value * props.itemHeight)

function onScroll(e) {
  scrollTop.value = e.target.scrollTop
}
</script>

<style scoped>
.virtual-list {
  will-change: transform;
}
</style>
