<template>
  <div class="card calendar-card">
    <div class="calendar-nav">
      <button class="nav-btn" @click="$emit('prev-month')">◀</button>
      <h3 class="card-title" style="margin:0">{{ year }} 年 {{ month }} 月</h3>
      <button class="nav-btn" @click="$emit('next-month')">▶</button>
      <button class="nav-btn today-btn" @click="$emit('go-today')">今天</button>
    </div>
    <div class="calendar">
      <div class="calendar-header">
        <span v-for="day in ['日','一','二','三','四','五','六']" :key="day" class="weekday">{{ day }}</span>
      </div>
      <div class="calendar-body">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.currentMonth,
            'is-today': day.isToday,
            'is-checked': day.isChecked,
            'has-event': day.hasEvent,
            'is-weekend': day.isWeekend
          }"
          @click="$emit('day-click', day)"
        >
          <span class="day-number">{{ day.date }}</span>
          <span v-if="day.isChecked" class="check-mark">✓</span>
          <span v-if="day.hasEvent" class="event-dot" :title="day.eventText"></span>
        </div>
      </div>
    </div>
    <!-- 选中日期的事件列表 -->
    <div v-if="selectedDay" class="day-detail">
      <div class="day-detail-header">
        <h4>{{ selectedDay.fullDate }} {{ selectedDay.isToday ? '(今天)' : '' }}</h4>
        <button class="btn-close" @click="$emit('close-detail')">×</button>
      </div>
      <div v-if="selectedDay.isChecked" class="day-checkin-info">
        <span class="tag tag-success">已打卡</span>
        <span v-if="checkins[selectedDay.fullDate]?.clockIn" class="checkin-time-detail">
          上班 {{ formatTime(checkins[selectedDay.fullDate].clockIn) }}
          <template v-if="checkins[selectedDay.fullDate]?.clockOut">
            · 下班 {{ formatTime(checkins[selectedDay.fullDate].clockOut) }}
          </template>
        </span>
      </div>
      <div v-if="dayEvents.length" class="day-events">
        <div v-for="ev in dayEvents" :key="ev.id + (ev.isAnniversary ? '-anniv' : '')" class="event-item">
          <span class="event-color" :style="{ background: ev.color || '#6366f1' }"></span>
          <span class="event-text">{{ ev.text }}</span>
          <span v-if="ev.isAnniversary" class="anniversary-badge">纪念日</span>
          <button class="btn-del-event" @click="$emit('remove-event', ev.id, ev.originalDate)">×</button>
        </div>
      </div>
      <div class="add-event">
        <input :value="newEventText" @input="$emit('update:newEventText', $event.target.value)" type="text" placeholder="添加事件..." @keyup.enter="$emit('add-event')" />
        <input :value="newEventColor" @input="$emit('update:newEventColor', $event.target.value)" type="color" class="color-pick" />
        <label class="recurring-check">
          <input type="checkbox" :checked="newEventRecurring" @change="$emit('update:newEventRecurring', $event.target.checked)" />
          <span>每年重复</span>
        </label>
        <button class="btn btn-primary btn-sm" @click="$emit('add-event')">添加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime } from '../../utils/date'

defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  calendarDays: { type: Array, default: () => [] },
  selectedDay: { type: Object, default: null },
  checkins: { type: Object, default: () => ({}) },
  dayEvents: { type: Array, default: () => [] },
  newEventText: { type: String, default: '' },
  newEventColor: { type: String, default: '#6366f1' },
  newEventRecurring: { type: Boolean, default: false },
})

defineEmits([
  'prev-month', 'next-month', 'go-today', 'day-click', 'close-detail',
  'remove-event', 'add-event',
  'update:newEventText', 'update:newEventColor', 'update:newEventRecurring',
])
</script>

<style scoped>
.calendar-card {
  margin-bottom: 24px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.today-btn {
  width: auto;
  padding: 0 12px;
  font-size: 13px;
  margin-left: auto;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-size: 14px;
  position: relative;
  cursor: default;
}

.calendar-day.other-month {
  color: var(--text-muted);
  opacity: 0.4;
}

.calendar-day.is-today {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.calendar-day.is-checked {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.calendar-day.is-today.is-checked {
  background: var(--success);
  color: white;
}

.calendar-day.is-weekend {
  color: var(--danger);
}

.calendar-day.other-month.is-weekend {
  color: var(--text-muted);
}

.calendar-day.has-event {
  cursor: pointer;
}

.check-mark {
  font-size: 10px;
  position: absolute;
  bottom: 4px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  position: absolute;
  top: 4px;
  right: 4px;
}

.day-detail {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.day-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-detail-header h4 {
  font-size: 15px;
  margin: 0;
  color: var(--text-primary);
}

.btn-close {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.day-checkin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.checkin-time-detail {
  font-size: 13px;
  color: var(--text-secondary);
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--bg-primary);
  border-radius: var(--radius);
}

.event-item .anniversary-badge {
  font-size: 11px;
  padding: 1px 5px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
  border-radius: 4px;
  flex-shrink: 0;
}

.event-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.btn-del-event {
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
}

.btn-del-event:hover {
  color: var(--danger);
}

.add-event {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-event input[type="text"] {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.add-event input[type="text"]:focus {
  outline: none;
  border-color: var(--primary);
}

.color-pick {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  padding: 2px;
}

.recurring-check {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

.recurring-check input {
  width: 14px;
  height: 14px;
  accent-color: var(--primary);
}
</style>
