/**
 * 多用户登录管理
 */

import { setProfile } from './storage'

const USERS_KEY = 'research_hub_users'
const SESSION_KEY = 'research_hub_session'

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function register(username, password, nickname) {
  const users = getUsers()
  if (users[username]) {
    return { success: false, message: '用户名已存在' }
  }
  const nick = nickname || username
  users[username] = {
    password: btoa(password),
    nickname: nick,
    createdAt: new Date().toISOString()
  }
  saveUsers(users)
  setSession(username)
  setProfile({ nickname: nick })
  return { success: true }
}

export function login(username, password) {
  const users = getUsers()
  const user = users[username]
  if (!user) {
    return { success: false, message: '用户不存在' }
  }
  if (user.password !== btoa(password)) {
    return { success: false, message: '密码错误' }
  }
  setSession(username)
  setProfile({ nickname: user.nickname })
  return { success: true }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY))
    if (!session || !session.username) return null
    const users = getUsers()
    const user = users[session.username]
    if (!user) return null
    return {
      username: session.username,
      nickname: user.nickname,
      createdAt: user.createdAt
    }
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return !!getCurrentUser()
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    username,
    loginAt: new Date().toISOString()
  }))
}
