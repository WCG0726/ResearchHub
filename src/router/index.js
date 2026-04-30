import { createRouter, createWebHistory } from 'vue-router'

const DashboardView = () => import('../views/DashboardView.vue')
const CheckinView = () => import('../views/CheckinView.vue')
const RecordsView = () => import('../views/RecordsView.vue')
const WritingView = () => import('../views/WritingView.vue')
const GuideView = () => import('../views/GuideView.vue')

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/checkin', name: 'checkin', component: CheckinView },
  { path: '/records', name: 'records', component: RecordsView },
  { path: '/records/:id', name: 'record-detail', component: RecordsView },
  { path: '/writing', name: 'writing', component: WritingView },
  { path: '/guide', name: 'guide', component: GuideView },
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
    guide: '写作指南'
  }
  document.title = titles[to.name] || '科研管理平台'
})

export default router
