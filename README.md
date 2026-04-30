# ResearchHub - 科研管理平台

> 打卡、记录、论文写作一站式科研管理工具

**在线访问：[https://wcg0726.github.io/ResearchHub/](https://wcg0726.github.io/ResearchHub/)**

## 功能概览

| 模块 | 功能 |
|------|------|
| 工作台 | 综合仪表盘：实时时钟、迷你日历、快捷入口、待办事项、近期事件、考勤状态 |
| 打卡 | 上班/下班签到、工时统计、日历标记、纪念日设置、自定义事件 |
| 科研记录 | Markdown 编辑、标签分类、搜索筛选 |
| 论文写作 | 项目管理、章节进度追踪、状态管理 |
| 写作指南 | 英文论文结构、中文论文规范、学术句式库、投稿检查清单 |
| 润色提示词 | 英文/中文润色、语法检查、中译英、投稿回复等 20+ 提示词模板 |
| 翻译工具 | 中英文互译、学术术语翻译 |
| Zotero | 连接本地/云端 Zotero，同步文献库 |
| 计划表 | 待办任务管理、优先级排序 |
| 喝水提醒 | 每日饮水记录与目标追踪 |
| 吃什么 | 餐食推荐与记录 |
| 排行榜 | 团队打卡排名、实时在线状态（Firebase 跨浏览器同步） |
| 学术导航 | 40+ 常用学术网站、自定义收藏链接、玻尔学术等 |

## 特色功能

- 多用户登录注册系统
- 自定义头像上传
- 深色/浅色主题切换
- Firebase 跨浏览器在线状态同步
- 日历纪念日（每年重复）
- 响应式设计，支持移动端

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- **前端框架：** Vue 3 + Vue Router 4
- **构建工具：** Vite
- **数据存储：** localStorage + Firebase Realtime Database
- **样式：** 纯 CSS（无 UI 框架依赖）
- **部署：** GitHub Pages + GitHub Actions

## 项目结构

```
ResearchHub/
├── src/
│   ├── assets/styles/          # 全局样式与主题变量
│   ├── components/
│   │   ├── HeaderNav.vue       # 顶部导航栏
│   │   └── SidebarNav.vue      # 侧边栏导航
│   ├── router/index.js         # 路由配置与鉴权守卫
│   ├── utils/
│   │   ├── auth.js             # 用户认证（登录/注册）
│   │   ├── storage.js          # localStorage 数据管理
│   │   ├── firebase.js         # Firebase 在线状态服务
│   │   ├── presence.js         # 在线状态管理（Firebase + 本地降级）
│   │   └── zotero.js           # Zotero API 集成
│   └── views/
│       ├── LoginView.vue       # 登录/注册页
│       ├── DashboardView.vue   # 工作台（综合仪表盘）
│       ├── CheckinView.vue     # 打卡（上下班 + 日历 + 事件）
│       ├── RecordsView.vue     # 科研记录
│       ├── WritingView.vue     # 论文写作
│       ├── GuideView.vue       # 写作指南（中英文）
│       ├── PlanView.vue        # 计划表
│       ├── WaterView.vue       # 喝水提醒
│       ├── MealView.vue        # 吃什么
│       ├── TranslateView.vue   # 翻译工具
│       ├── PolishView.vue      # 润色提示词
│       ├── ZoteroView.vue      # Zotero 文献管理
│       ├── TeamView.vue        # 团队排行榜
│       └── LinksView.vue       # 学术导航
├── .github/workflows/deploy.yml  # GitHub Pages 自动部署
├── index.html
└── package.json
```

## 许可证

MIT License
