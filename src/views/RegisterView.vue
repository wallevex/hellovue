<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { register } from '../api/auth'
import type { AuthCredentials } from '../types/auth'

interface RegisterForm extends AuthCredentials {
  confirmPassword: string
}

const router = useRouter()

const form = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
})

const requestError = ref('')
const isSubmitting = ref(false)

let isActive = true
onUnmounted(() => {
  isActive = false
})

async function handleRegister(): Promise<void> {
  if (isSubmitting.value) {
    return
  }

  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
  requestError.value = ''

  if (!form.username.trim()) {
    errors.username = '请输入账号'
  }

  if (!form.password) {
    errors.password = '请输入密码'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  }

  if (errors.username || errors.password || errors.confirmPassword) {
    return
  }

  isSubmitting.value = true
  try {
    const user = await register({ username: form.username, password: form.password })
    if (!isActive) return
    await router.push({
      name: 'login',
      query: { registered: '1', username: user.username },
    })
  } catch (error) {
    if (!isActive) return
    requestError.value = error instanceof Error ? error.message : '注册失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card" aria-labelledby="register-title">
      <header class="auth-header">
        <h1 id="register-title">注册</h1>
        <p>填写账号和密码，开始使用你的应用。</p>
      </header>

      <form
        class="auth-form"
        :aria-busy="isSubmitting"
        @submit.prevent="handleRegister"
        @input="requestError = ''"
      >
        <div class="form-field">
          <label for="register-username">账号</label>
          <input
            id="register-username"
            v-model.trim="form.username"
            :disabled="isSubmitting"
            name="username"
            type="text"
            autocomplete="username"
            placeholder="请输入账号"
            :aria-invalid="Boolean(errors.username)"
            :aria-describedby="errors.username ? 'register-username-error' : undefined"
          />
          <p v-if="errors.username" id="register-username-error" class="field-error">
            {{ errors.username }}
          </p>
        </div>

        <div class="form-field">
          <label for="register-password">密码</label>
          <input
            id="register-password"
            v-model="form.password"
            :disabled="isSubmitting"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="请设置密码"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'register-password-error' : undefined"
          />
          <p v-if="errors.password" id="register-password-error" class="field-error">
            {{ errors.password }}
          </p>
        </div>

        <div class="form-field">
          <label for="confirm-password">确认密码</label>
          <input
            id="confirm-password"
            v-model="form.confirmPassword"
            :disabled="isSubmitting"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="请再次输入密码"
            :aria-invalid="Boolean(errors.confirmPassword)"
            :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
          />
          <p v-if="errors.confirmPassword" id="confirm-password-error" class="field-error">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <button class="auth-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '注册中…' : '注册' }}
        </button>
        <p v-if="requestError" class="field-error" role="alert">{{ requestError }}</p>
      </form>

      <p class="auth-prompt">
        已有账号？
        <RouterLink class="auth-link" to="/login">返回登录</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
