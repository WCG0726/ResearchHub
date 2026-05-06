<template>
  <div class="ambient-bg" :class="{ 'is-login': isLogin }">
    <div class="mesh-layer"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="orb orb-4"></div>
    <div class="orb orb-5"></div>
    <div v-if="isLogin" class="orb orb-6"></div>
    <div v-if="isLogin" class="orb orb-7"></div>
  </div>
</template>

<script>
export default {
  name: 'AmbientBackground',
  props: {
    isLogin: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.ambient-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.mesh-layer {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse at 20% 50%, var(--orb-1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--orb-2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, var(--orb-3) 0%, transparent 50%),
    var(--bg-secondary);
  background-size: 100% 100%;
  animation: mesh-rotate 30s ease-in-out infinite;
  opacity: 0.6;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  will-change: transform;
}

.orb-1 {
  width: 400px;
  height: 400px;
  top: -10%;
  left: -5%;
  background: var(--orb-1);
  animation: orb-drift-1 25s ease-in-out infinite;
}

.orb-2 {
  width: 300px;
  height: 300px;
  top: 60%;
  right: -8%;
  background: var(--orb-2);
  animation: orb-drift-2 30s ease-in-out infinite;
  animation-delay: -8s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  top: 20%;
  right: 20%;
  background: var(--orb-3);
  animation: orb-drift-1 35s ease-in-out infinite;
  animation-delay: -15s;
}

.orb-4 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 15%;
  background: var(--orb-4);
  animation: orb-drift-2 28s ease-in-out infinite;
  animation-delay: -5s;
}

.orb-5 {
  width: 350px;
  height: 350px;
  top: 40%;
  left: 50%;
  background: var(--orb-2);
  animation: orb-drift-1 32s ease-in-out infinite;
  animation-delay: -20s;
  opacity: 0.5;
}

/* 登录页额外光晕 */
.orb-6 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: 10%;
  background: var(--orb-1);
  animation: orb-drift-2 22s ease-in-out infinite;
  animation-delay: -12s;
}

.orb-7 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 30%;
  background: var(--orb-3);
  animation: orb-drift-1 27s ease-in-out infinite;
  animation-delay: -3s;
}

/* 登录页增强 */
.ambient-bg.is-login .mesh-layer {
  opacity: 0.85;
}

.ambient-bg.is-login .orb {
  filter: blur(80px);
}

/* 移动端减少光晕 */
@media (max-width: 480px) {
  .orb-3, .orb-4, .orb-5 { display: none; }
}
</style>
