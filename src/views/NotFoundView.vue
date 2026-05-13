<template>
  <div class="not-found">
    <div class="nf-icon">🔭</div>
    <h1 class="nf-code">404</h1>
    <p class="nf-text">页面未找到</p>
    <p class="nf-hint">科研路上迷了路？让我们回到工作台吧</p>
    <router-link to="/" class="btn btn-primary">返回工作台</router-link>
  </div>
</template>

<script setup>
// NotFoundView
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.nf-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

.nf-code {
  font-size: 80px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nf-text {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.nf-hint {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 28px;
}
</style>
