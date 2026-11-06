import type { LoginResponse } from '../types/auth'

const STORAGE_KEY = 'hellovue.auth'

// JSON 来自浏览器存储，不能仅凭 TypeScript 类型就认定它有效。
function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== 'object' || value === null) return false
  if (!('token' in value) || typeof value.token !== 'string' || !value.token.trim()) {
    return false
  }
  if (!('user' in value) || typeof value.user !== 'object' || value.user === null) {
    return false
  }

  const user = value.user
  return (
    'id' in user &&
    typeof user.id === 'number' &&
    Number.isInteger(user.id) &&
    user.id > 0 &&
    'username' in user &&
    typeof user.username === 'string' &&
    user.username.trim().length > 0
  )
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // 浏览器不允许访问存储时，内存中的退出操作仍能完成。
  }
}

export function loadSession(): LoginResponse | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw === null) return null

    const data: unknown = JSON.parse(raw)
    if (isLoginResponse(data)) {
      return {
        token: data.token,
        user: { id: data.user.id, username: data.user.username },
      }
    }
  } catch {
    // JSON 损坏或存储不可访问时，按未登录处理。
  }

  clearSession()
  return null
}

export function saveSession(session: LoginResponse): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: session.token,
        user: { id: session.user.id, username: session.user.username },
      }),
    )
  } catch {
    // 存储不可用时，本次页面运行仍可使用 Pinia 中的登录信息。
    clearSession()
  }
}
