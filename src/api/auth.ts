import type { AuthCredentials, AuthUser, LoginResponse } from '../types/auth'

interface MockAccount extends AuthUser {
  password: string
}

// 模拟数据库，只保留在当前页面运行时的内存中，整页刷新后会清空。
const accounts = new Map<string, MockAccount>()
let nextUserId = 1

function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 600)
  })
}

export async function register(credentials: AuthCredentials): Promise<AuthUser> {
  const username = credentials.username.trim()
  const password = credentials.password
  await delay()

  if (!username || !password) {
    throw new Error('账号和密码不能为空')
  }

  if (accounts.has(username)) {
    throw new Error('账号已存在，请使用其他账号或返回登录')
  }

  const user: AuthUser = { id: nextUserId++, username }
  accounts.set(username, { ...user, password })
  return user
}

export async function login(credentials: AuthCredentials): Promise<LoginResponse> {
  const username = credentials.username.trim()
  const password = credentials.password
  await delay()

  const account = accounts.get(username)
  if (!account || account.password !== password) {
    throw new Error('账号或密码错误')
  }

  return {
    // 仅模拟返回结构；它不是 JWT，也没有真实的身份验证能力。
    token: `mock-token-${crypto.randomUUID()}`,
    user: { id: account.id, username: account.username },
  }
}
