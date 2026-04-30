<template>
  <div class="bg-decor" aria-hidden="true">
    <svg class="bg-logo logo-cas" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <text x="100" y="85" text-anchor="middle" font-size="18" font-weight="bold" fill="currentColor">中国科学院</text>
      <text x="100" y="110" text-anchor="middle" font-size="11" fill="currentColor">CHINESE ACADEMY</text>
      <text x="100" y="125" text-anchor="middle" font-size="11" fill="currentColor">OF SCIENCES</text>
      <path d="M 100 30 L 105 50 L 100 45 L 95 50 Z" fill="currentColor"/>
    </svg>

    <svg class="bg-logo logo-nankai" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" stroke-width="1"/>
      <text x="100" y="80" text-anchor="middle" font-size="22" font-weight="bold" fill="currentColor">南开大学</text>
      <text x="100" y="105" text-anchor="middle" font-size="10" fill="currentColor">NANKAI UNIVERSITY</text>
      <text x="100" y="130" text-anchor="middle" font-size="13" fill="currentColor">允公允能 日新月异</text>
    </svg>

    <svg class="bg-logo logo-just" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="100" r="90" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="110" cy="100" r="75" fill="none" stroke="currentColor" stroke-width="1"/>
      <text x="110" y="78" text-anchor="middle" font-size="16" font-weight="bold" fill="currentColor">江苏科技大学</text>
      <text x="110" y="100" text-anchor="middle" font-size="9" fill="currentColor">JIANGSU UNIVERSITY OF</text>
      <text x="110" y="113" text-anchor="middle" font-size="9" fill="currentColor">SCIENCE AND TECHNOLOGY</text>
      <text x="110" y="138" text-anchor="middle" font-size="12" fill="currentColor">笃学明德 经世致用</text>
    </svg>
  </div>
</template>

<script>
export default { name: 'BackgroundDecor' }
</script>

<style scoped>
.bg-decor {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-logo {
  position: absolute;
  opacity: 0.035;
  color: var(--text-primary);
}

.logo-cas {
  width: 260px;
  height: 260px;
  top: 8%;
  right: 5%;
  transform: rotate(-8deg);
}

.logo-nankai {
  width: 240px;
  height: 240px;
  bottom: 12%;
  left: 3%;
  transform: rotate(5deg);
}

.logo-just {
  width: 260px;
  height: 260px;
  bottom: 8%;
  right: 18%;
  transform: rotate(-3deg);
}

@media (max-width: 900px) {
  .logo-cas { width: 160px; height: 160px; top: 5%; right: -2%; }
  .logo-nankai { width: 140px; height: 140px; bottom: 8%; left: -2%; }
  .logo-just { width: 150px; height: 150px; bottom: 5%; right: 5%; }
}
</style>
