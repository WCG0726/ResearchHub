<template>
  <div class="week-bar">
    <div
      v-for="day in weekDays"
      :key="day.date"
      class="week-day"
      :class="{ today: day.isToday, checked: day.isChecked, weekend: day.isWeekend }"
    >
      <span class="week-day-label">{{ day.weekday }}</span>
      <span class="week-day-num">{{ day.date }}</span>
      <span v-if="day.isChecked" class="week-check">✓</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  weekDays: { type: Array, default: () => [] },
})
</script>

<style scoped>
.week-bar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: var(--radius);
  position: relative;
  transition: all 0.2s;
}

.week-day.today {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
}

.week-day.checked:not(.today) {
  background: rgba(16, 185, 129, 0.1);
}

.week-day-label {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
}

.week-day.today .week-day-label {
  opacity: 0.9;
}

.week-day-num {
  font-size: 16px;
  font-weight: 600;
}

.week-day.weekend:not(.today) {
  color: var(--danger);
}

.week-check {
  font-size: 10px;
  color: var(--success);
  font-weight: 700;
}

.week-day.today .week-check {
  color: white;
}

@media (max-width: 600px) {
  .week-bar { gap: 3px; padding: 8px 10px; }
}
</style>
