# ResearchHub - 科研管理平台

> 打卡、记录、论文写作一站式科研管理工具

**在线访问：[https://hush316.github.io/ResearchHub/](https://hush316.github.io/ResearchHub/)**

## 功能概览

| 模块 | 功能 |
|------|------|
| 工作台 | 综合仪表盘：实时时钟、迷你日历、快捷入口、待办事项、近期事件、考勤状态 |
| 打卡 | 上班/下班签到、工时统计、日历标记、纪念日设置、自定义事件 |
| 科研记录 | Markdown 编辑、标签分类、搜索筛选 |
| 文献笔记 | 论文阅读笔记、核心要点、研究方法、个人评价、评分、DOI 链接 |
| 实验记录 | 样品编号管理、实验条件/参数、步骤记录、结果记录 |
| 论文写作 | 项目管理、章节进度追踪、状态管理 |
| 写作指南 | 英文论文结构、中文论文规范、学术句式库、投稿检查清单 |
| 绘图技巧 | Origin/Python/PPT/ImageJ/COMSOL/LaTeX 绑图技巧与自定义笔记 |
| 润色提示词 | 英文/中文润色、语法检查、中译英、投稿回复等 20+ 提示词模板 |
| 翻译工具 | 中英文互译、学术术语翻译 |
| LaTeX 片段 | 20+ 内置公式/表格/图片/引用模板，自定义片段 |
| LaTeX 编辑器 | 在线编辑 .tex 文件，语法预览、快捷插入、下载 |
| 邮件模板 | 投稿沟通、审稿回复、导师汇报等 7 个英文邮件模板 |
| Zotero | 连接本地/云端 Zotero，同步文献库 |
| 计划表 | 待办任务管理、优先级排序 |
| 里程碑 | 学术阶段追踪（开题/中期/投稿/答辩）、进度可视化、过期提醒 |
| 组会记录 | 时间线展示、导师意见、后续待办 |
| 灵感板 | 卡片式研究想法记录、颜色标记、置顶功能 |
| 学术日历 | 会议截稿、基金申报、论文截止倒计时提醒 |
| 番茄钟 | 专注计时、休息提醒、累计统计、浏览器通知 |
| 喝水提醒 | 每日饮水记录与目标追踪 |
| 吃什么 | 餐食推荐与记录 |
| 排行榜 | 个人统计展示、团队成员在线状态（Firebase 跨浏览器同步） |
| 学术导航 | 60+ 常用学术网站、自定义收藏链接、玻尔学术等 |

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
│       ├── LoginView.vue          # 登录/注册页
│       ├── DashboardView.vue      # 工作台（综合仪表盘）
│       ├── CheckinView.vue        # 打卡（上下班 + 日历 + 事件）
│       ├── RecordsView.vue        # 科研记录
│       ├── LitNotesView.vue       # 文献阅读笔记
│       ├── ExperimentView.vue     # 实验记录
│       ├── WritingView.vue        # 论文写作
│       ├── GuideView.vue          # 写作指南（中英文）
│       ├── PlotTipsView.vue        # 绘图技巧
│       ├── TranslateView.vue      # 翻译工具
│       ├── PolishView.vue         # 润色提示词
│       ├── LatexSnippetsView.vue  # LaTeX 片段库
│       ├── LatexEditorView.vue    # LaTeX 在线编辑器
│       ├── EmailTemplatesView.vue # 邮件模板
│       ├── ZoteroView.vue         # Zotero 文献管理
│       ├── LinksView.vue          # 学术导航
│       ├── AcademicCalendarView.vue # 学术日历（截稿/申报）
│       ├── PlanView.vue           # 计划表
│       ├── MilestoneView.vue      # 里程碑追踪
│       ├── MeetingView.vue        # 组会/会议记录
│       ├── InspirationView.vue    # 灵感板
│       ├── PomodoroView.vue       # 番茄钟
│       ├── WaterView.vue          # 喝水提醒
│       ├── MealView.vue           # 吃什么
│       └── TeamView.vue           # 团队排行榜
├── .github/workflows/deploy.yml  # GitHub Pages 自动部署
├── index.html
└── package.json
```

## 已知限制

- **数据存储：** 所有数据存储在浏览器 localStorage 中（约 5MB 上限），无云端同步。排行榜仅显示当前用户的统计数据，其他成员仅显示在线状态。
- **用户认证：** 密码使用 base64 编码存储，仅提供基本的多用户隔离，不提供真正的安全性保障。
- **LaTeX 预览：** 编辑器的预览功能基于正则表达式解析，仅支持基本命令（`\title`、`\section`、`\textbf` 等），复杂 LaTeX 公式无法正确渲染。
- **浏览器兼容：** 建议使用 Chrome/Edge/Firefox 最新版本，Safari 部分 CSS 特性可能不支持。

## 后续规划

- 期刊推荐
- 文献追踪
- 格式改写
- 一键作图
- 更多科研功能持续更新中……

## 许可证

MIT License
