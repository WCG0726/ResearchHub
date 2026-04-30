# ResearchHub - 科研管理平台

> 打卡、记录、论文写作一站式管理工具

## 功能特性

### 打卡系统
- 每日签到打卡
- 连续天数统计
- 可视化日历
- 打卡记录查看

### 科研记录
- Markdown 编辑支持
- 标签分类管理
- 搜索筛选功能
- 记录编辑删除

### 论文写作
- 论文项目管理
- 章节进度追踪
- 状态管理（构思/写作/修改/投稿）
- 进度可视化

### 写作指南
- 论文结构模板
- 常用学术句式
- 写作技巧总结
- 期刊投稿清单
- 热电材料专用模板

### 其他
- 深色/浅色主题切换
- 数据本地存储
- 响应式设计
- 纯前端，无需服务器

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

- Vue 3 + Composition API
- Vue Router 4
- Vite
- localStorage (本地存储)
- 纯 CSS (无 UI 框架依赖)

## 项目结构

```
ResearchHub/
├── src/
│   ├── assets/styles/    # CSS 样式
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   └── views/            # 页面视图
│       ├── DashboardView.vue    # 工作台
│       ├── CheckinView.vue      # 打卡
│       ├── RecordsView.vue      # 科研记录
│       ├── WritingView.vue      # 论文写作
│       └── GuideView.vue        # 写作指南
└── index.html
```

## 数据存储

所有数据存储在浏览器 localStorage 中，包括：
- 打卡记录
- 科研记录
- 论文进度
- 主题设置

## 后续计划

- [ ] 添加用户登录系统
- [ ] 集成后端 API
- [ ] 数据导出功能
- [ ] 团队协作功能
- [ ] 移动端适配优化
- [ ] 提醒通知功能

## 许可证

MIT License
