/**
 * 学术段位系统
 * XP 从现有 store 数据动态计算，不额外存储
 */

export const TIERS = [
  { name: '实习生', icon: '🌱', color: '#94a3b8', minXP: 0 },
  { name: '研究助理', icon: '🔵', color: '#3b82f6', minXP: 50 },
  { name: '初级研究员', icon: '🟢', color: '#22c55e', minXP: 150 },
  { name: '中级研究员', icon: '🟡', color: '#eab308', minXP: 350 },
  { name: '高级研究员', icon: '🟠', color: '#f97316', minXP: 700 },
  { name: '资深研究员', icon: '🔴', color: '#ef4444', minXP: 1200 },
  { name: '首席科学家', icon: '🟣', color: '#a855f7', minXP: 2000 },
  { name: '学术泰斗', icon: '⭐', color: '#f59e0b', minXP: 3500 },
]

/**
 * 计算总 XP
 * @param {Object} data - 各模块数据汇总
 * @returns {number}
 */
export function calculateXP(data) {
  const {
    checkinDays = 0,
    maxStreak = 0,
    currentStreak = 0,
    pomodoroCount = 0,
    recordsCount = 0,
    litNotesCount = 0,
    experimentsCount = 0,
    milestonesCount = 0,
    meetingsCount = 0,
    inspirationsCount = 0,
  } = data

  return (
    currentStreak * 3 +
    maxStreak * 2 +
    checkinDays * 1 +
    pomodoroCount * 2 +
    recordsCount * 3 +
    litNotesCount * 4 +
    experimentsCount * 3 +
    milestonesCount * 5 +
    meetingsCount * 2 +
    inspirationsCount * 1
  )
}

/**
 * 根据 XP 获取段位
 * @param {number} xp
 * @returns {Object} { tier, nextTier, progress }
 */
export function getTier(xp) {
  let tier = TIERS[0]
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].minXP) {
      tier = TIERS[i]
      break
    }
  }

  const tierIndex = TIERS.indexOf(tier)
  const nextTier = tierIndex < TIERS.length - 1 ? TIERS[tierIndex + 1] : null

  let progress = 1
  if (nextTier) {
    const rangeXP = nextTier.minXP - tier.minXP
    const earnedXP = xp - tier.minXP
    progress = Math.min(1, earnedXP / rangeXP)
  }

  return { tier, nextTier, progress, xp }
}

