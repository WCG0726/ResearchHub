<template>
  <div class="dashboard">
    <h1 class="page-title">工作台</h1>

    <!-- 打卡统计 -->
    <div class="stats-grid">
      <div class="stat-card" style="--accent: var(--primary)">
        <div class="stat-value">{{ streak.total }}</div>
        <div class="stat-label">累计打卡</div>
        <div class="stat-icon">📅</div>
      </div>
      <div class="stat-card" style="--accent: var(--success)">
        <div class="stat-value">{{ streak.current }}</div>
        <div class="stat-label">连续天数</div>
        <div class="stat-icon">🔥</div>
      </div>
      <div class="stat-card" style="--accent: var(--warning)">
        <div class="stat-value">{{ streak.longest }}</div>
        <div class="stat-label">最长连续</div>
        <div class="stat-icon">🏆</div>
      </div>
      <div class="stat-card" style="--accent: var(--info)">
        <div class="stat-value">{{ records.length }}</div>
        <div class="stat-label">科研记录</div>
        <div class="stat-icon">📝</div>
      </div>
    </div>

    <!-- 今日打卡 -->
    <div class="card today-checkin">
      <h3 class="card-title">今日打卡</h3>
      <div v-if="isCheckedIn" class="checkin-done">
        <span class="checkin-icon">✅</span>
        <span>今日已打卡</span>
        <span class="checkin-time">{{ checkinTime }}</span>
      </div>
      <button v-else class="btn btn-primary btn-lg" @click="doCheckin">
        立即打卡
      </button>
    </div>

    <!-- 最近记录 -->
    <div class="card recent-records">
      <h3 class="card-title">最近记录</h3>
      <div v-if="recentRecords.length === 0" class="empty">
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无记录</div>
      </div>
      <div v-else class="record-list">
        <div v-for="record in recentRecords" :key="record.id" class="record-item">
          <div class="record-header">
            <span class="record-title">{{ record.title }}</span>
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          </div>
          <div class="record-preview">{{ truncate(record.content, 80) }}</div>
          <div class="record-tags">
            <span v-for="tag in record.tags" :key="tag" class="tag tag-primary">{{ tag }}</span>
          </div>
        </div>
      </div>
      <router-link to="/records" class="view-all">查看全部 →</router-link>
    </div>

    <!-- 激励语录 -->
    <div class="card quote-card">
      <div class="quote-text">"{{ quote.text }}"</div>
      <div class="quote-author">—— {{ quote.author }}</div>
    </div>
  </div>
</template>

<script>
import { getStreak, getRecords, checkinToday } from '../utils/storage'

const QUOTES = [
  { text: '科学是永无止境的，它是一个永恒之谜。', author: '爱因斯坦' },
  { text: '研究要有恒心，有志者事竟成。', author: '钱学森' },
  { text: '在科学上没有平坦的大道，只有不畏劳苦沿着陡峭山路攀登的人，才有希望达到光辉的顶点。', author: '马克思' },
  { text: '好奇心是科学工作者产生无穷毅力和耐心的源泉。', author: '爱因斯坦' },
  { text: '一切推理都必须从观察与实验中得来。', author: '伽利略' },
  { text: '读万卷书，行万里路。', author: '董其昌' },
  { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
]

export default {
  name: 'DashboardView',
  data() {
    return {
      streak: { current: 0, longest: 0, total: 0 },
      records: [],
      isCheckedIn: false,
      checkinTime: '',
      quote: QUOTES[Math.floor(Math.random() * QUOTES.length)]
    }
  },
  computed: {
    recentRecords() {
      return this.records.slice(0, 5)
    }
  },
  methods: {
    doCheckin() {
      const result = checkinToday()
      if (result) {
        this.isCheckedIn = true
        this.checkinTime = new Date().toLocaleTimeString('zh-CN')
        this.streak = getStreak()
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('zh-CN')
    },
    truncate(str, len) {
      return str && str.length > len ? str.slice(0, len) + '...' : str
    },
    loadData() {
      this.streak = getStreak()
      this.records = getRecords()

      const today = new Date().toISOString().split('T')[0]
      const checkins = JSON.parse(localStorage.getItem('research_hub_checkins') || '{}')
      if (checkins[today]) {
        this.isCheckedIn = true
        this.checkinTime = new Date(checkins[today].time).toLocaleTimeString('zh-CN')
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stat-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  opacity: 0.5;
}

.today-checkin {
  margin-bottom: 30px;
}

.checkin-done {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--success);
  font-size: 16px;
}

.checkin-icon {
  font-size: 24px;
}

.checkin-time {
  color: var(--text-muted);
  font-size: 14px;
}

.btn-lg {
  padding: 14px 32px;
  font-size: 16px;
}

.recent-records {
  margin-bottom: 30px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-item {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-title {
  font-weight: 600;
  color: var(--text-primary);
}

.record-date {
  font-size: 13px;
  color: var(--text-muted);
}

.record-preview {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.record-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.view-all {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: var(--primary);
  font-size: 14px;
}

.quote-card {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
}

.quote-text {
  font-size: 18px;
  font-style: italic;
  line-height: 1.8;
  margin-bottom: 12px;
}

.quote-author {
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
