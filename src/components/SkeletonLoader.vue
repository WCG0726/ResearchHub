<template>
  <div class="skeleton" :class="type">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>
    <div v-else class="skeleton-text">
      <div v-for="i in count" :key="i" class="skeleton-line" :class="{ short: i === count }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: { type: String, default: 'text' },
    count: { type: Number, default: 3 }
  }
}
</script>

<style scoped>
.skeleton { animation: shimmer 1.5s infinite linear; }

.skeleton-line {
  height: 14px;
  background: var(--bg-hover);
  border-radius: 6px;
  margin-bottom: 10px;
}

.skeleton-line.title {
  height: 20px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-line.short { width: 40%; }

.skeleton-card {
  padding: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-hover);
  flex-shrink: 0;
}

.skeleton-list-content { flex: 1; }

.skeleton-list-content .skeleton-line:last-child { margin-bottom: 0; }

@keyframes shimmer {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>
