<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-icon">⚠️</div>
    <h3>页面出现错误</h3>
    <p class="error-message">{{ error?.message || '未知错误' }}</p>
    <button class="btn btn-primary" @click="retry">重试</button>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  data() {
    return { hasError: false, error: null }
  },
  errorCaptured(err, info) {
    this.hasError = true
    this.error = { message: err.message, info }
    return false
  },
  methods: {
    retry() {
      this.hasError = false
      this.error = null
    }
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-boundary h3 {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
  max-width: 400px;
}
</style>
