<template>
  <div class="life-page">
    <h1 class="page-title">生活助手</h1>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tab === 'water' }" @click="tab = 'water'">💧 喝水提醒</button>
      <button class="tab-btn" :class="{ active: tab === 'meal' }" @click="tab = 'meal'">🍜 今天吃什么</button>
    </div>

    <!-- ===== 喝水 Tab ===== -->
    <div v-if="tab === 'water'">
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
              <div class="progress-fill" :style="{ width: Math.min(100, waterPct) + '%' }"></div>
            </div>
            <span class="progress-text">{{ waterPct }}%</span>
          </div>
        </div>

        <div class="water-actions">
          <button class="btn btn-primary" @click="addCup">💧 喝一杯</button>
          <button class="btn btn-outline" @click="removeCup" :disabled="water.cups === 0">↩ 撤销</button>
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

      <div class="card tips">
        <h3 class="card-title">💧 喝水小贴士</h3>
        <ul class="tip-list">
          <li>晨起一杯水，唤醒身体</li>
          <li>每次 200ml 左右，少量多次</li>
          <li>运动前后及时补水</li>
          <li>不要等到口渴才喝水</li>
        </ul>
      </div>
    </div>

    <!-- ===== 吃什么 Tab ===== -->
    <div v-if="tab === 'meal'">
      <div class="card random-card">
        <h3 class="card-title">🎲 让命运决定</h3>
        <div class="random-result" v-if="randomMeal">
          <div class="random-icon">{{ randomMeal.icon }}</div>
          <div class="random-name">{{ randomMeal.name }}</div>
          <div class="random-type">{{ randomMeal.type }}</div>
        </div>
        <button class="btn btn-primary btn-lg" @click="roll">
          {{ randomMeal ? '再摇一次' : '开始摇一摇' }}
        </button>
      </div>

      <div class="card">
        <h3 class="card-title">🍜 分类推荐</h3>
        <div class="category-grid">
          <div v-for="cat in mealCategories" :key="cat.name" class="category-item" @click="pickCategory(cat)">
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">📝 今日饮食</h3>
        <div class="add-row">
          <input v-model="newMeal" type="text" placeholder="吃了什么..." class="input" @keyup.enter="addMealRecord" />
          <select v-model="newMealType" class="select">
            <option value="breakfast">🌅 早餐</option>
            <option value="lunch">☀️ 午餐</option>
            <option value="dinner">🌙 晚餐</option>
            <option value="snack">🍪 零食</option>
          </select>
          <button class="btn btn-primary" @click="addMealRecord">记录</button>
        </div>
        <div v-if="todayMeals.length === 0" class="empty">
          <div class="empty-text">今天还没记录饮食哦</div>
        </div>
        <div v-else class="meal-list">
          <div v-for="meal in todayMeals" :key="meal.id" class="meal-item">
            <span class="meal-type-icon">{{ mealTypeIcon(meal.mealType) }}</span>
            <span class="meal-name">{{ meal.name }}</span>
            <span class="meal-time">{{ formatTime(meal.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWaterStore } from '../stores/water'
import { useMealsStore } from '../stores/meals'
import { FOOD_DB } from '../data/foods'

const tab = ref('water')

// Water
const waterStore = useWaterStore()
const water = ref({ cups: 0, goal: 8 })
const waterPct = computed(() => water.value.goal ? Math.round(water.value.cups / water.value.goal * 100) : 0)

function addCup() { waterStore.addCup(); water.value = waterStore.todayData }
function removeCup() { waterStore.removeCup(); water.value = waterStore.todayData }
function setGoal(g) { waterStore.setGoal(g); water.value = waterStore.todayData }

// Meal
const mealsStore = useMealsStore()
const meals = ref([])
const randomMeal = ref(null)
const newMeal = ref('')
const newMealType = ref('lunch')
const mealCategories = Object.entries(FOOD_DB).map(([name, v]) => ({ name, icon: v.icon }))

const todayMeals = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return meals.value.filter(m => m.date && m.date.startsWith(today))
})

function roll() {
  const all = Object.values(FOOD_DB).flatMap(c => c.items)
  randomMeal.value = all[Math.floor(Math.random() * all.length)]
}

function pickCategory(cat) {
  const items = FOOD_DB[cat.name]?.items || []
  randomMeal.value = items[Math.floor(Math.random() * items.length)]
}

function addMealRecord() {
  if (!newMeal.value.trim()) return
  mealsStore.add({ name: newMeal.value.trim(), mealType: newMealType.value })
  meals.value = mealsStore.meals
  newMeal.value = ''
}

function mealTypeIcon(type) {
  return { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' }[type] || '🍽️'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// Init
waterStore.load()
water.value = waterStore.todayData
mealsStore.load()
meals.value = mealsStore.meals
</script>

<style scoped>
.life-page { max-width: 600px; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid var(--border); }
.tab-btn {
  padding: 10px 24px; border: none; background: none;
  color: var(--text-secondary); font-size: 14px; font-weight: 500;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }

/* Water */
.water-main { text-align: center; }
.water-display { padding: 16px 0; }
.cups-row { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.cup {
  width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; border-radius: var(--radius); background: var(--bg-secondary);
  cursor: pointer; transition: all 0.3s;
}
.cup.filled { background: #dbeafe; animation: pop 0.3s ease; }
[data-theme="dark"] .cup.filled { background: #1e3a5f; }
@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
.water-count { font-size: 30px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.count-sep { color: var(--text-muted); margin: 0 4px; }
.count-goal { color: var(--text-secondary); font-size: 24px; }
.count-unit { font-size: 16px; color: var(--text-muted); margin-left: 4px; }
.water-progress { display: flex; align-items: center; gap: 12px; max-width: 300px; margin: 0 auto; }
.progress-bar { flex: 1; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); border-radius: 4px; transition: width 0.5s ease; }
.progress-text { font-size: 14px; font-weight: 600; color: var(--primary); min-width: 40px; }
.water-actions { display: flex; justify-content: center; gap: 12px; margin: 20px 0; }
.goal-setting {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding-top: 16px; border-top: 1px solid var(--border);
  font-size: 14px; color: var(--text-secondary);
}
.goal-btns { display: flex; gap: 6px; }
.goal-btn {
  padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius);
  background: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.goal-btn.active { background: var(--primary); color: white; border-color: var(--primary); }

/* Meal */
.random-card { text-align: center; }
.random-result { padding: 16px; margin-bottom: 12px; }
.random-icon { font-size: 52px; margin-bottom: 6px; }
.random-name { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.random-type { font-size: 13px; color: var(--text-secondary); }
.btn { padding: 8px 20px; border: none; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-lg { padding: 10px 28px; font-size: 15px; }
.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.category-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px; border-radius: var(--radius); background: var(--bg-secondary);
  cursor: pointer; transition: all 0.2s;
}
.category-item:hover { background: var(--bg-hover); transform: translateY(-2px); }
.cat-icon { font-size: 28px; }
.cat-name { font-size: 13px; color: var(--text-secondary); }
.add-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.input { flex: 1; min-width: 120px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; }
.select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); font-size: 14px; }
.meal-list { display: flex; flex-direction: column; gap: 8px; }
.meal-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius); background: var(--bg-secondary); }
.meal-type-icon { font-size: 20px; }
.meal-name { flex: 1; font-size: 14px; color: var(--text-primary); }
.meal-time { font-size: 12px; color: var(--text-muted); }
.empty { text-align: center; padding: 20px 0; }
.empty-text { color: var(--text-muted); font-size: 14px; }
.tips { margin-top: 16px; }
.card-title { font-size: 16px; margin: 0 0 12px; color: var(--text-primary); }
.tip-list { list-style: none; padding: 0; margin: 0; }
.tip-list li { padding: 8px 0; font-size: 14px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
.tip-list li:last-child { border-bottom: none; }
</style>
