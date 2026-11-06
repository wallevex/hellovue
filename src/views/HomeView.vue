<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const pageTitle: string = '首页'
const authStore = useAuthStore()
const router = useRouter()

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <main class="home-page">
    <header class="home-header">
      <h1>{{ pageTitle }}</h1>
      <template v-if="authStore.isLoggedIn">
        <p>欢迎，{{ authStore.user?.username }}。</p>
        <button class="logout-button" type="button" @click="handleLogout">退出登录</button>
      </template>
      <template v-else>
        <p>你还没有登录。</p>
        <RouterLink class="back-link" to="/login">前往登录</RouterLink>
      </template>
    </header>
  </main>
</template>

<style scoped>
.home-page {
  width: min(100% - 32px, 960px);
  margin: 48px auto;
}

.home-header {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.home-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

.home-header p {
  margin: 0;
  color: #475569;
}

.back-link {
  display: inline-block;
  margin-top: 16px;
  color: #1d4ed8;
  text-underline-offset: 3px;
}

.logout-button {
  min-height: 44px;
  margin-top: 16px;
  padding: 10px 16px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  color: #0f172a;
  background: #fff;
  cursor: pointer;
}

.logout-button:hover {
  background: #f1f5f9;
}

.logout-button:focus-visible,
.back-link:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}
</style>
