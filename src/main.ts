import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
// 在首次路由显示前恢复当前标签页里保存的登录信息。
useAuthStore(pinia).restoreSession()
app.use(router)
app.mount('#app')
