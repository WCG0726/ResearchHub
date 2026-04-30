import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'

const LoginView = () => import('../views/LoginView.vue')
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
const LinksView = () => import('../views/LinksView.vue')
const ZoteroView = () => import('../views/ZoteroView.vue')
const TeamView = () => import('../views/TeamView.vue')

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/checkin', name: 'checkin', component: CheckinView, meta: { requiresAuth: true } },
  { path: '/records', name: 'records', component: RecordsView, meta: { requiresAuth: true } },
  { path: '/records/:id', name: 'record-detail', component: RecordsView, meta: { requiresAuth: true } },
  { path: '/writing', name: 'writing', component: WritingView, meta: { requiresAuth: true } },
  { path: '/guide', name: 'guide', component: GuideView, meta: { requiresAuth: true } },
  { path: '/plan', name: 'plan', component: PlanView, meta: { requiresAuth: true } },
  { path: '/water', name: 'water', component: WaterView, meta: { requiresAuth: true } },
  { path: '/meal', name: 'meal', component: MealView, meta: { requiresAuth: true } },
  { path: '/translate', name: 'translate', component: TranslateView, meta: { requiresAuth: true } },
  { path: '/polish', name: 'polish', component: PolishView, meta: { requiresAuth: true } },
  { path: '/links', name: 'links', component: LinksView, meta: { requiresAuth: true } },
  { path: '/zotero', name: 'zotero', component: ZoteroView, meta: { requiresAuth: true } },
  { path: '/team', name: 'team', component: TeamView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'login' }
  }
  if (to.name === 'login' && isLoggedIn()) {
    return { name: 'dashboard' }
  }

  const titles = {
    login: '登录',
    dashboard: '科研管理平台',
    checkin: '打卡',
    records: '科研记录',
    writing: '论文写作',
    guide: '写作指南',
    plan: '计划表',
    water: '喝水记录',
    meal: '今天吃什么',
    translate: '翻译工具',
    polish: '论文润色',
    links: '学术导航',
    zotero: 'Zotero 文献',
    team: '团队排行榜'
  }
  document.title = titles[to.name] || '科研管理平台'
})

export default router
