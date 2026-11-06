<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import type { AuthCredentials } from '../types/auth'

const pageTitle: string = '登录'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// reactive 用于组织多个相关字段；ref 用于保存单独的提示文字。
const form = reactive<AuthCredentials>({
  username: typeof route.query.username === 'string' ? route.query.username : '',
  password: '',
})

const errors = reactive<AuthCredentials>({
  username: '',
  password: '',
})

const submitMessage = ref(route.query.registered === '1' ? '注册成功，请登录。' : '')
const requestError = ref('')
const isSubmitting = ref(false)

// 离开页面后忽略未完成请求的结果，避免它又把用户带回首页。
let isActive = true
onUnmounted(() => {
  isActive = false
})

function clearFeedback(): void {
  submitMessage.value = ''
  requestError.value = ''
}

async function handleLogin(): Promise<void> {
  if (isSubmitting.value) {
    return
  }

  errors.username = ''
  errors.password = ''
  clearFeedback()

  if (!form.username.trim()) {
    errors.username = '请输入账号'
  }

  // 密码可能包含空格，不对它使用 trim，以免改变用户输入。
  if (!form.password) {
    errors.password = '请输入密码'
  }

  if (errors.username || errors.password) {
    return
  }

  isSubmitting.value = true
  try {
    const session = await login({ username: form.username, password: form.password })
    if (!isActive) return
    authStore.setSession(session)
    await router.push({ name: 'home' })
  } catch (error) {
    if (!isActive) return
    requestError.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" aria-labelledby="login-title">
      <header class="auth-header">
        <h1 id="login-title">{{ pageTitle }}</h1>
        <p>欢迎回来，请输入你的账号和密码。</p>
      </header>

      <form
        class="auth-form"
        :aria-busy="isSubmitting"
        @submit.prevent="handleLogin"
        @input="clearFeedback"
      >
        <div class="form-field">
          <label for="username">账号</label>
          <input
            id="username"
            v-model.trim="form.username"
            :disabled="isSubmitting"
            name="username"
            type="text"
            autocomplete="username"
            placeholder="请输入账号"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'username-error' : undefined"
          />
          <p v-if="errors.username" id="username-error" class="field-error">
            {{ errors.username }}
          </p>
        </div>

        <div class="form-field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            :disabled="isSubmitting"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'password-error' : undefined"
          />
          <p v-if="errors.password" id="password-error" class="field-error">
            {{ errors.password }}
          </p>
        </div>

        <button class="auth-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中…' : '登录' }}
        </button>
        <p v-if="requestError" class="field-error" role="alert">{{ requestError }}</p>
        <p class="submit-message" role="status">{{ submitMessage }}</p>
      </form>

      <p class="auth-prompt">
        还没有账号？
        <RouterLink class="auth-link" to="/register">注册账号</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
