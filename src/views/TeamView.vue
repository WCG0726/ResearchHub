<template>
  <div class="team-page">
    <h1 class="page-title">团队排行榜</h1>

    <!-- 个人统计 -->
    <div class="stats-grid">
      <div class="stat-card" style="--accent: var(--primary)">
        <div class="stat-value">{{ myStats.streak }}</div>
        <div class="stat-label">连续打卡天数</div>
        <div class="stat-icon">🔥</div>
      </div>
      <div class="stat-card" style="--accent: var(--success)">
        <div class="stat-value">{{ myStats.totalCheckins }}</div>
        <div class="stat-label">累计打卡</div>
        <div class="stat-icon">📅</div>
      </div>
      <div class="stat-card" style="--accent: var(--warning)">
        <div class="stat-value">{{ myStats.records }}</div>
        <div class="stat-label">科研记录</div>
        <div class="stat-icon">📝</div>
      </div>
      <div class="stat-card" style="--accent: var(--info)">
        <div class="stat-value">{{ myStats.experiments }}</div>
        <div class="stat-label">实验记录</div>
        <div class="stat-icon">🔬</div>
      </div>
      <div class="stat-card" style="--accent: #ec4899">
        <div class="stat-value">{{ myStats.litNotes }}</div>
        <div class="stat-label">文献笔记</div>
        <div class="stat-icon">📖</div>
      </div>
      <div class="stat-card" style="--accent: #8b5cf6">
        <div class="stat-value">{{ myStats.pomodoro }}</div>
        <div class="stat-label">番茄钟数</div>
        <div class="stat-icon">🍅</div>
      </div>
      <div class="stat-card" style="--accent: #06b6d4">
        <div class="stat-value">{{ myStats.inspirations }}</div>
        <div class="stat-label">灵感记录</div>
        <div class="stat-icon">💡</div>
      </div>
      <div class="stat-card" style="--accent: #f97316">
        <div class="stat-value">{{ myStats.meetings }}</div>
        <div class="stat-label">会议记录</div>
        <div class="stat-icon">🗣️</div>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="card">
      <div class="rank-header">
        <h3 class="card-title" style="margin-bottom:0">排行榜</h3>
        <div class="rank-tabs">
          <button v-for="tab in rankTabs" :key="tab.key" class="rank-tab" :class="{ active: rankBy === tab.key }" @click="rankBy = tab.key">{{ tab.label }}</button>
        </div>
      </div>

      <div class="rank-list">
        <div
          v-for="(entry, idx) in rankedList"
          :key="entry.username"
          class="rank-item"
          :class="{ 'is-me': entry.username === currentUser }"
        >
          <div class="rank-pos">
            <span v-if="idx === 0" class="rank-medal">🥇</span>
            <span v-else-if="idx === 1" class="rank-medal">🥈</span>
            <span v-else-if="idx === 2" class="rank-medal">🥉</span>
            <span v-else class="rank-num">{{ idx + 1 }}</span>
          </div>
          <div class="rank-avatar-wrap">
            <div class="rank-avatar">{{ entry.nickname.charAt(0) }}</div>
            <span class="online-dot" :class="{ online: entry.online }"></span>
          </div>
          <div class="rank-info">
            <div class="rank-name-row">
              <span class="rank-name">{{ entry.nickname }}</span>
              <span v-if="entry.username === currentUser" class="rank-me-tag">我</span>
            </div>
            <span class="rank-status" :class="{ online: entry.online }">{{ entry.online ? '在线' : entry.lastSeen }}</span>
          </div>
          <div class="rank-value">
            {{ entry[rankBy] || 0 }}
            <span class="rank-unit">{{ rankUnit }}</span>
          </div>
        </div>

        <div v-if="rankedList.length === 0" class="empty">
          <div class="empty-text">暂无数据，快去打卡吧！</div>
        </div>
      </div>
    </div>

    <!-- 团队成员 -->
    <div class="card">
      <h3 class="card-title">团队成员 <span class="online-count">{{ onlineCount }} 人在线</span></h3>
      <div class="member-list">
        <div v-for="member in members" :key="member.username" class="member-item">
          <div class="member-avatar-wrap">
            <div class="member-avatar">{{ member.nickname.charAt(0) }}</div>
            <span class="online-dot" :class="{ online: member.online }"></span>
          </div>
          <div class="member-info">
            <span class="member-name">{{ member.nickname }}</span>
            <span class="member-join">加入于 {{ formatDate(member.createdAt) }} · <span :class="{ 'text-online': member.online }">{{ member.online ? '在线' : member.lastSeen }}</span></span>
          </div>
          <span v-if="member.username === currentUser" class="tag tag-primary">当前用户</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCheckins, getStreak, getRecords, getWritingProgress, getExperiments, getLitNotes, getMeetings, getInspirations, getPomodoroStats } from '../utils/storage'
import { getCurrentUser } from '../utils/auth'
import { getAllPresence } from '../utils/presence'
import { formatDate } from '../utils/date'

export default {
  name: 'TeamView',
  data() {
    return {
      rankBy: 'streak',
      rankTabs: [
        { key: 'streak', label: '连续打卡' },
        { key: 'total', label: '累计打卡' },
        { key: 'records', label: '科研记录' },
        { key: 'experiments', label: '实验记录' },
        { key: 'litNotes', label: '文献笔记' },
        { key: 'pomodoro', label: '番茄钟' },
        { key: 'inspirations', label: '灵感' },
        { key: 'meetings', label: '会议' },
      ],
      currentUser: '',
      myStats: { streak: 0, totalCheckins: 0, records: 0, experiments: 0, litNotes: 0, pomodoro: 0, inspirations: 0, meetings: 0 },
      members: [],
      allStats: {},
      presenceData: {}
    }
  },
  computed: {
    rankUnit() {
      const units = { streak: '天', total: '次', records: '条', experiments: '条', litNotes: '篇', pomodoro: '个', inspirations: '条', meetings: '次' }
      return units[this.rankBy] || ''
    },
    rankedList() {
      const presence = this.presenceData
      const list = this.members.map(m => {
        const p = presence[m.username]
        const online = p ? p.online === true : false
        const lastSeen = p ? (p.online ? '在线' : this.formatDiff(p.lastSeen)) : '从未活跃'
        const stats = this.allStats[m.username] || {}
        return { ...m, ...stats, online, lastSeen }
      })
      list.sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1
        return (b[this.rankBy] || 0) - (a[this.rankBy] || 0)
      })
      return list
    },
    onlineCount() {
      const presence = this.presenceData
      return this.members.filter(m => presence[m.username]?.online === true).length
    }
  },
  methods: {
    formatDate(dateStr) {
      return dateStr ? formatDate(dateStr) : ''
    },
    formatDiff(ts) {
      if (!ts) return '从未活跃'
      const diff = Date.now() - ts
      if (diff < 120000) return '在线'
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      return `${Math.floor(diff / 86400000)} 天前`
    },
    loadData() {
      const user = getCurrentUser()
      if (user) this.currentUser = user.username

      // 刷新 Firebase 在线状态
      this.presenceData = getAllPresence()

      // 加载所有用户：合并 localStorage 本地用户 + Firebase presence 用户
      try {
        const localUsers = JSON.parse(localStorage.getItem('research_hub_users') || '{}')
        const presence = this.presenceData
        const allUsers = new Map()

        // 先加本地用户
        for (const [username, data] of Object.entries(localUsers)) {
          allUsers.set(username, {
            username,
            nickname: data.nickname || username,
            createdAt: data.createdAt
          })
        }

        // 再加 Firebase 中的用户（可能来自其他浏览器）
        for (const [username, data] of Object.entries(presence)) {
          if (!allUsers.has(username)) {
            allUsers.set(username, {
              username,
              nickname: data.nickname || username,
              createdAt: null
            })
          }
        }

        this.members = Array.from(allUsers.values())
      } catch {
        this.members = []
      }

      // 计算当前用户统计
      const streak = getStreak()
      const records = getRecords()
      const experiments = getExperiments()
      const litNotes = getLitNotes()
      const pomodoro = getPomodoroStats()
      const inspirations = getInspirations()
      const meetings = getMeetings()
      const totalCheckins = Object.keys(getCheckins()).length

      const myData = {
        streak: streak.current,
        total: totalCheckins,
        records: records.length,
        experiments: experiments.length,
        litNotes: litNotes.length,
        pomodoro: pomodoro.total || 0,
        inspirations: inspirations.length,
        meetings: meetings.length
      }
      this.myStats = { ...myData, totalCheckins }

      // 为所有成员生成排行数据
      this.allStats = {}
      this.members.forEach(m => {
        if (m.username === this.currentUser) {
          this.allStats[m.username] = myData
        } else {
          this.allStats[m.username] = myData
        }
      })
    }
  },
  mounted() {
    this.loadData()
    this.refreshTimer = setInterval(() => this.loadData(), 15000)
  },
  unmounted() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  }
}
</script>

<style scoped>
.team-page { max-width: 900px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
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

.stat-value { font-size: 32px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.stat-icon { position: absolute; top: 12px; right: 12px; font-size: 20px; opacity: 0.5; }

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rank-tabs { display: flex; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }

.rank-tab {
  padding: 6px 14px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}

.rank-tab.active {
  background: var(--primary);
  color: white;
}

.rank-list { display: flex; flex-direction: column; gap: 8px; }

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  transition: all 0.2s;
}

.rank-item.is-me {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.rank-pos { width: 32px; text-align: center; flex-shrink: 0; }
.rank-medal { font-size: 24px; }
.rank-num { font-size: 16px; font-weight: 600; color: var(--text-muted); }

.rank-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.rank-avatar-wrap, .member-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  background: var(--text-muted);
}

.online-dot.online {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.rank-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.rank-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-name { font-weight: 500; color: var(--text-primary); font-size: 15px; }

.rank-status {
  font-size: 12px;
  color: var(--text-muted);
}

.rank-status.online {
  color: #22c55e;
  font-weight: 500;
}

.online-count {
  font-size: 13px;
  font-weight: 400;
  color: #22c55e;
  margin-left: 8px;
}

.rank-me-tag {
  padding: 1px 6px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  border-radius: 4px;
}

.rank-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.rank-unit {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
}

.member-list { display: flex; flex-direction: column; gap: 8px; }

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.member-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.member-info { flex: 1; }
.member-name { display: block; font-weight: 500; color: var(--text-primary); font-size: 14px; }
.member-join { font-size: 12px; color: var(--text-muted); }
.text-online { color: #22c55e; font-weight: 500; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
