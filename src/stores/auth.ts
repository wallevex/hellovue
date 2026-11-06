import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUser, LoginResponse } from '../types/auth'
import { clearSession, loadSession, saveSession } from '../utils/auth-storage'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => token.value !== '' && user.value !== null)

  function setSession(session: LoginResponse): void {
    token.value = session.token
    user.value = { id: session.user.id, username: session.user.username }
    saveSession(session)
  }

  function restoreSession(): void {
    const session = loadSession()
    token.value = session?.token ?? ''
    user.value = session?.user ?? null
  }

  function logout(): void {
    token.value = ''
    user.value = null
    clearSession()
  }

  return { token, user, isLoggedIn, setSession, restoreSession, logout }
})
