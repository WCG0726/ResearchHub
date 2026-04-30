<template>
  <div class="water-page">
    <h1 class="page-title">喝水记录</h1>

    <!-- 主卡片 -->
    <div class="card water-main">
      <div class="water-display">
        <div class="cups-row">
          <div
            v-for="i in water.goal"
            :key="i"
            class="cup"
            :class="{ filled: i <= water.cups }"
            @click="i <= water.cups ? removeCup() : addCup()"
          >
            <span class="cup-icon">{{ i <= water.cups ? '💧' : '🫗' }}</span>
          </div>
        </div>
        <div class="water-count">
          <span class="count-num">{{ water.cups }}</span>
          <span class="count-sep">/</span>
          <span class="count-goal">{{ water.goal }}</span>
          <span class="count-unit">杯</span>
        </div>
        <div class="water-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: Math.min(100, percent) + '%' }"></div>
          </div>
          <span class="progress-text">{{ percent }}%</span>
        </div>
      </div>

      <div class="water-actions">
        <button class="btn btn-add" @click="addCup">
          <span>💧</span> 喝一杯
        </button>
        <button class="btn btn-remove" @click="removeCup" :disabled="water.cups === 0">
          <span>↩</span> 撤销一杯
        </button>
      </div>

      <div class="goal-setting">
        <label>每日目标：</label>
        <div class="goal-btns">
          <button v-for="g in [6,8,10,12]" :key="g" class="goal-btn" :class="{ active: water.goal === g }" @click="setGoal(g)">
            {{ g }}杯
          </button>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div class="card tips">
      <h3 class="card-title">💧 喝水小贴士</h3>
      <ul class="tip-list">
        <li>晨起一杯水，唤醒身体</li>
        <li>每次 200ml 左右，少量多次</li>
        <li>运动前后及时补水</li>
        <li>不要等到口渴才喝水</li>
        <li>温水比冷水更利于吸收</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getWater, addWaterCup, removeWaterCup, setWaterGoal } from '../utils/storage'

export default {
  name: 'WaterView',
  data() {
    return {
      water: getWater()
    }
  },
  computed: {
    percent() {
      return this.water.goal ? Math.round(this.water.cups / this.water.goal * 100) : 0
    }
  },
  methods: {
    addCup() {
      this.water = addWaterCup()
    },
    removeCup() {
      this.water = removeWaterCup()
    },
    setGoal(g) {
      setWaterGoal(g)
      this.water = getWater()
    }
  }
}
</script>

<style scoped>
.water-page { max-width: 500px; margin: 0 auto; }

.water-main { text-align: center; }

.water-display { padding: 16px 0; }

.cups-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cup {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.cup.filled {
  background: #dbeafe;
  animation: pop 0.3s ease;
}

[data-theme="dark"] .cup.filled { background: #1e3a5f; }

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.water-count {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.count-sep { color: var(--text-muted); margin: 0 4px; }
.count-goal { color: var(--text-secondary); font-size: 24px; }
.count-unit { font-size: 16px; color: var(--text-muted); margin-left: 4px; }

.water-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  min-width: 40px;
}

.water-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-add {
  background: #3b82f6;
  color: white;
}

.btn-add:hover { background: #2563eb; }

.btn-remove {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-remove:hover { background: var(--bg-hover); }
.btn-remove:disabled { opacity: 0.4; cursor: not-allowed; }

.goal-setting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-secondary);
}

.goal-btns { display: flex; gap: 6px; }

.goal-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.goal-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.tips { margin-top: 16px; }

.tip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tip-list li {
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.tip-list li:last-child { border-bottom: none; }

.card-title {
  font-size: 16px;
  margin: 0 0 12px;
  color: var(--text-primary);
}
</style>
