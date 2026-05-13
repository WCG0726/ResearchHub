import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../utils/auth'

const TITLE_MAP = {
  login: '登录', dashboard: '科研管理平台', checkin: '打卡', records: '科研记录',
  'record-detail': '科研记录', writing: '论文写作', guide: '写作指南', plan: '计划表',
  water: '喝水记录', meal: '今天吃什么', translate: '翻译工具', polish: '论文润色',
  links: '学术导航', zotero: 'Zotero 文献', team: '团队排行榜', 'lit-notes': '文献笔记',
  experiment: '实验记录', 'plot-tips': '绘图技巧', 'latex-snippets': 'LaTeX',
  meeting: '组会记录', inspiration: '灵感板', milestone: '里程碑', pomodoro: '番茄钟',
  'email-templates': '邮件模板', 'academic-calendar': '学术日历', progress: '科研进度',
  settings: '设置', 'bug-scanner': 'Bug 检测', 'format-rewrite': '格式改写', 'not-found': '页面未找到'
}

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: '登录' } },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true, title: '科研管理平台' } },
  { path: '/checkin', name: 'checkin', component: () => import('../views/CheckinView.vue'), meta: { requiresAuth: true, title: '打卡' } },
  { path: '/records', name: 'records', component: () => import('../views/RecordsView.vue'), meta: { requiresAuth: true, title: '科研记录' } },
  { path: '/records/:id', name: 'record-detail', component: () => import('../views/RecordsView.vue'), meta: { requiresAuth: true, title: '科研记录' } },
  { path: '/writing', name: 'writing', component: () => import('../views/WritingView.vue'), meta: { requiresAuth: true, title: '论文写作' } },
  { path: '/guide', name: 'guide', component: () => import('../views/GuideView.vue'), meta: { requiresAuth: true, title: '写作指南' } },
  { path: '/plan', name: 'plan', component: () => import('../views/PlanView.vue'), meta: { requiresAuth: true, title: '计划表' } },
  { path: '/water', name: 'water', component: () => import('../views/WaterView.vue'), meta: { requiresAuth: true, title: '喝水记录' } },
  { path: '/meal', name: 'meal', component: () => import('../views/MealView.vue'), meta: { requiresAuth: true, title: '今天吃什么' } },
  { path: '/translate', name: 'translate', component: () => import('../views/TranslateView.vue'), meta: { requiresAuth: true, title: '翻译工具' } },
  { path: '/polish', name: 'polish', component: () => import('../views/PolishView.vue'), meta: { requiresAuth: true, title: '论文润色' } },
  { path: '/links', name: 'links', component: () => import('../views/LinksView.vue'), meta: { requiresAuth: true, title: '学术导航' } },
  { path: '/zotero', name: 'zotero', component: () => import('../views/ZoteroView.vue'), meta: { requiresAuth: true, title: 'Zotero 文献' } },
  { path: '/team', name: 'team', component: () => import('../views/TeamView.vue'), meta: { requiresAuth: true, title: '团队排行榜' } },
  { path: '/lit-notes', name: 'lit-notes', component: () => import('../views/LitNotesView.vue'), meta: { requiresAuth: true, title: '文献笔记' } },
  { path: '/experiment', name: 'experiment', component: () => import('../views/ExperimentView.vue'), meta: { requiresAuth: true, title: '实验记录' } },
  { path: '/plot-tips', name: 'plot-tips', component: () => import('../views/PlotTipsView.vue'), meta: { requiresAuth: true, title: '绘图技巧' } },
  { path: '/latex-snippets', name: 'latex-snippets', component: () => import('../views/LatexSnippetsView.vue'), meta: { requiresAuth: true, title: 'LaTeX' } },
  { path: '/meeting', name: 'meeting', component: () => import('../views/MeetingView.vue'), meta: { requiresAuth: true, title: '组会记录' } },
  { path: '/inspiration', name: 'inspiration', component: () => import('../views/InspirationView.vue'), meta: { requiresAuth: true, title: '灵感板' } },
  { path: '/milestone', name: 'milestone', component: () => import('../views/MilestoneView.vue'), meta: { requiresAuth: true, title: '里程碑' } },
  { path: '/pomodoro', name: 'pomodoro', component: () => import('../views/PomodoroView.vue'), meta: { requiresAuth: true, title: '番茄钟' } },
  { path: '/email-templates', name: 'email-templates', component: () => import('../views/EmailTemplatesView.vue'), meta: { requiresAuth: true, title: '邮件模板' } },
  { path: '/academic-calendar', name: 'academic-calendar', component: () => import('../views/AcademicCalendarView.vue'), meta: { requiresAuth: true, title: '学术日历' } },
  { path: '/progress', name: 'progress', component: () => import('../views/ProgressView.vue'), meta: { requiresAuth: true, title: '科研进度' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { requiresAuth: true, title: '设置' } },
  { path: '/bug-scanner', name: 'bug-scanner', component: () => import('../views/BugScannerView.vue'), meta: { requiresAuth: true, title: 'Bug 检测' } },
  { path: '/format-rewrite', name: 'format-rewrite', component: () => import('../views/FormatRewriteView.vue'), meta: { requiresAuth: true, title: '格式改写' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return { name: 'login' }
  if (to.name === 'login' && isLoggedIn()) return { name: 'dashboard' }
  document.title = to.meta.title || TITLE_MAP[to.name] || '科研管理平台'
})

export default router
