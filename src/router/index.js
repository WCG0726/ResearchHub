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
const LitNotesView = () => import('../views/LitNotesView.vue')
const ExperimentView = () => import('../views/ExperimentView.vue')
const PlotTipsView = () => import('../views/PlotTipsView.vue')
const LatexSnippetsView = () => import('../views/LatexSnippetsView.vue')
const MeetingView = () => import('../views/MeetingView.vue')
const InspirationView = () => import('../views/InspirationView.vue')
const MilestoneView = () => import('../views/MilestoneView.vue')
const PomodoroView = () => import('../views/PomodoroView.vue')
const EmailTemplatesView = () => import('../views/EmailTemplatesView.vue')
const LatexEditorView = () => import('../views/LatexEditorView.vue')
const AcademicCalendarView = () => import('../views/AcademicCalendarView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')

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
  { path: '/lit-notes', name: 'lit-notes', component: LitNotesView, meta: { requiresAuth: true } },
  { path: '/experiment', name: 'experiment', component: ExperimentView, meta: { requiresAuth: true } },
  { path: '/plot-tips', name: 'plot-tips', component: PlotTipsView, meta: { requiresAuth: true } },
  { path: '/latex-snippets', name: 'latex-snippets', component: LatexSnippetsView, meta: { requiresAuth: true } },
  { path: '/meeting', name: 'meeting', component: MeetingView, meta: { requiresAuth: true } },
  { path: '/inspiration', name: 'inspiration', component: InspirationView, meta: { requiresAuth: true } },
  { path: '/milestone', name: 'milestone', component: MilestoneView, meta: { requiresAuth: true } },
  { path: '/pomodoro', name: 'pomodoro', component: PomodoroView, meta: { requiresAuth: true } },
  { path: '/email-templates', name: 'email-templates', component: EmailTemplatesView, meta: { requiresAuth: true } },
  { path: '/latex-editor', name: 'latex-editor', component: LatexEditorView, meta: { requiresAuth: true } },
  { path: '/academic-calendar', name: 'academic-calendar', component: AcademicCalendarView, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
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
    team: '团队排行榜',
    'lit-notes': '文献笔记',
    experiment: '实验记录',
    'plot-tips': '绘图技巧',
    'latex-snippets': 'LaTeX 片段',
    meeting: '组会记录',
    inspiration: '灵感板',
    milestone: '里程碑',
    pomodoro: '番茄钟',
    'email-templates': '邮件模板',
    'latex-editor': 'LaTeX 编辑器',
    'academic-calendar': '学术日历',
    'not-found': '页面未找到'
  }
  document.title = titles[to.name] || '科研管理平台'
})

export default router
