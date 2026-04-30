<template>
  <div class="meal-page">
    <h1 class="page-title">今天吃什么</h1>

    <!-- 随机推荐 -->
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

    <!-- 快捷分类 -->
    <div class="card">
      <h3 class="card-title">🍜 分类推荐</h3>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.name" class="category-item" @click="pickCategory(cat)">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 饮食记录 -->
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
</template>

<script>
import { getMeals, addMeal } from '../utils/storage'

const FOOD_DB = {
  '中餐': { icon: '🍚', items: [
    { name: '宫保鸡丁', type: '中餐' }, { name: '番茄炒蛋', type: '中餐' },
    { name: '红烧肉', type: '中餐' }, { name: '麻婆豆腐', type: '中餐' },
    { name: '鱼香肉丝', type: '中餐' }, { name: '回锅肉', type: '中餐' },
    { name: '水煮鱼', type: '中餐' }, { name: '酸菜鱼', type: '中餐' },
    { name: '炒饭', type: '中餐' }, { name: '饺子', type: '中餐' },
    { name: '面条', type: '中餐' }, { name: '火锅', type: '中餐' }
  ]},
  '西餐': { icon: '🍝', items: [
    { name: '意面', type: '西餐' }, { name: '披萨', type: '西餐' },
    { name: '牛排', type: '西餐' }, { name: '汉堡', type: '西餐' },
    { name: '三明治', type: '西餐' }, { name: '沙拉', type: '西餐' },
    { name: '炸鸡', type: '西餐' }, { name: '寿司', type: '西餐' }
  ]},
  '快餐': { icon: '🍔', items: [
    { name: '麦当劳', type: '快餐' }, { name: '肯德基', type: '快餐' },
    { name: '必胜客', type: '快餐' }, { name: '赛百味', type: '快餐' },
    { name: '炸鸡汉堡', type: '快餐' }, { name: '麻辣烫', type: '快餐' }
  ]},
  '饮品': { icon: '🧋', items: [
    { name: '奶茶', type: '饮品' }, { name: '咖啡', type: '饮品' },
    { name: '果汁', type: '饮品' }, { name: '酸奶', type: '饮品' },
    { name: '豆浆', type: '饮品' }, { name: '茶', type: '饮品' }
  ]},
  '水果': { icon: '🍎', items: [
    { name: '苹果', type: '水果' }, { name: '香蕉', type: '水果' },
    { name: '橙子', type: '水果' }, { name: '葡萄', type: '水果' },
    { name: '西瓜', type: '水果' }, { name: '草莓', type: '水果' }
  ]},
  '烧烤': { icon: '🍖', items: [
    { name: '烤串', type: '烧烤' }, { name: '烤鱼', type: '烧烤' },
    { name: '烤肉', type: '烧烤' }, { name: '烤鸡翅', type: '烧烤' }
  ]}
}

export default {
  name: 'MealView',
  data() {
    return {
      meals: getMeals(),
      randomMeal: null,
      newMeal: '',
      newMealType: 'lunch',
      categories: Object.entries(FOOD_DB).map(([name, v]) => ({ name, icon: v.icon }))
    }
  },
  computed: {
    todayMeals() {
      const today = new Date().toISOString().split('T')[0]
      return this.meals.filter(m => m.date && m.date.startsWith(today))
    }
  },
  methods: {
    roll() {
      const all = Object.values(FOOD_DB).flatMap(c => c.items)
      this.randomMeal = all[Math.floor(Math.random() * all.length)]
    },
    pickCategory(cat) {
      const items = FOOD_DB[cat.name]?.items || []
      this.randomMeal = items[Math.floor(Math.random() * items.length)]
    },
    addMealRecord() {
      if (!this.newMeal.trim()) return
      addMeal({ name: this.newMeal.trim(), mealType: this.newMealType })
      this.meals = getMeals()
      this.newMeal = ''
    },
    mealTypeIcon(type) {
      return { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' }[type] || '🍽️'
    },
    formatTime(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.meal-page { max-width: 500px; margin: 0 auto; }

.random-card { text-align: center; }

.random-result {
  padding: 16px;
  margin-bottom: 12px;
}

.random-icon { font-size: 52px; margin-bottom: 6px; }

.random-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.random-type {
  font-size: 13px;
  color: var(--text-secondary);
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-lg { padding: 10px 28px; font-size: 15px; }

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover { background: var(--bg-hover); transform: translateY(-2px); }

.cat-icon { font-size: 28px; }
.cat-name { font-size: 13px; color: var(--text-secondary); }

.add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.meal-list { display: flex; flex-direction: column; gap: 8px; }

.meal-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
}

.meal-type-icon { font-size: 20px; }
.meal-name { flex: 1; font-size: 14px; color: var(--text-primary); }
.meal-time { font-size: 12px; color: var(--text-muted); }

.empty { text-align: center; padding: 20px 0; }
.empty-text { color: var(--text-muted); font-size: 14px; }

.card-title {
  font-size: 16px;
  margin: 0 0 16px;
  color: var(--text-primary);
}
</style>
