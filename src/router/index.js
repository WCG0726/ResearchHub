import { createRouter, createWebHistory } from 'vue-router'

const DashboardView = () => import('../views/DashboardView.vue')
const CheckinView = () => import('../views/CheckinView.vue')
const RecordsView = () => import('../views/RecordsView.vue')
const WritingView = () => import('../views/WritingView.vue')
const GuideView = () => import('../views/GuideView.vue')
const PlanView = () => import('../views/PlanView.vue')
const WaterView = () => import('../views/WaterView.vue')
const MealView = () => import('../views/MealView.vue')
const TranslateView = () => import('../views/TranslateView.vue')
const PolishView = () => import('../views/PolishView.vue')

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/checkin', name: 'checkin', component: CheckinView },
  { path: '/records', name: 'records', component: RecordsView },
  { path: '/records/:id', name: 'record-detail', component: RecordsView },
  { path: '/writing', name: 'writing', component: WritingView },
  { path: '/guide', name: 'guide', component: GuideView },
  { path: '/plan', name: 'plan', component: PlanView },
  { path: '/water', name: 'water', component: WaterView },
  { path: '/meal', name: 'meal', component: MealView },
  { path: '/translate', name: 'translate', component: TranslateView },
  { path: '/polish', name: 'polish', component: PolishView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const titles = {
    dashboard: '科研管理平台',
    checkin: '打卡',
    records: '科研记录',
    writing: '论文写作',
    guide: '写作指南',
    plan: '计划表',
    water: '喝水记录',
    meal: '今天吃什么',
    translate: '翻译工具',
    polish: '论文润色'
  }
  document.title = titles[to.name] || '科研管理平台'
})

export default router
