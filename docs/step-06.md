# 第六步：使用 Pinia 管理登录状态

## 本步结果

登录成功后保存接口返回的 token 和 user，首页显示账号并提供退出按钮。
同一标签页整页刷新后恢复用户信息；退出时清空内存和存储，再回到登录页。
本步仍使用模拟接口和模拟 Token，没有验证 Token 的有效期或签名。
首页仍可直接访问，未登录时显示“你还没有登录。”，下一步再加入路由守卫。

## 为什么增加 Pinia

form、errors、isSubmitting 只属于某个页面，适合保存在组件中。
Token 和当前用户则需要由登录页、首页，以及之后的请求模块和路由守卫共同使用。
Pinia 为它们提供共享的响应式状态仓库。
已安装依赖，命令为 `npm install pinia@3`。

## 阅读顺序

1. `src/stores/auth.ts`：共享状态与操作，本步重点。
2. `src/main.ts`：安装 Pinia，启动时恢复状态。
3. `src/views/LoginView.vue`：登录成功后，把响应交给 store。
4. `src/views/HomeView.vue`：读取当前用户，处理退出。
5. `src/utils/auth-storage.ts`：读写存储、检查损坏数据，容错细节可以稍后阅读。

## 1. defineStore 定义共享状态

```ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => token.value !== '' && user.value !== null)

  // 操作函数……

  return { token, user, isLoggedIn, setSession, restoreSession, logout }
})
```

defineStore 是 Pinia 提供的函数，auth 是仓库的唯一标识。
useAuthStore 是我们起的名字，不同组件调用它，在同一个 Pinia 实例中得到同一份状态。
token、user 是状态，computed 派生出 isLoggedIn；相关状态变化时会自动重新计算。
`AuthUser | null` 表示可以保存用户对象，也可以用 null 表示没有用户。
返回的 setSession、restoreSession、logout 是集中修改状态的操作，也称 actions。

store 内部对 ref 使用 `.value`；外部通过 authStore.user、authStore.token 访问时，Pinia 自动解包，不需要 `.value`。
本步页面直接读取 authStore.user，不将状态解构成普通变量，以保留响应性。
isLoggedIn 是客户端展示状态，不代表后端已经验证这个 Token 有效。

## 2. 登录成功后保存结果

```ts
const session = await login({ username: form.username, password: form.password })
if (!isActive) return
authStore.setSession(session)
await router.push({ name: 'home' })
```

现在保留 login 返回的数据，在跳转前交给 store。
setSession 把 token、user 放入 Pinia，并保存一份到 sessionStorage。
只保存 token、用户 id 和 username，不保存密码或确认密码。

## 3. Pinia 与 sessionStorage

| 机制              | 用途                       | 整页刷新后         |
| ----------------- | -------------------------- | ------------------ |
| 组件 ref/reactive | 当前组件局部状态           | 原来的状态消失     |
| Pinia             | 应用运行时共享状态         | 原来的内存状态消失 |
| sessionStorage    | 当前标签页会话内保存字符串 | 可以重新读取       |

Pinia 本身不会自动持久化。本步明确调用 saveSession 写入存储，启动时再恢复。
sessionStorage 是本标签页会话存储，与跨会话持久保存的 localStorage 不同。
本步使用它来学习刷新恢复；接真实后端时再结合认证方案确定 Token 的存储策略。

存储键名为 `hellovue.auth`，值是 JSON 字符串：

```json
{
  "token": "mock-token-...",
  "user": { "id": 1, "username": "xiaohu" }
}
```

JSON.stringify 将对象变成字符串，JSON.parse 把字符串读回数据。
可以在浏览器开发者工具的 Application / Storage 中查看当前站点的 Session Storage。

## 4. 启动恢复

```ts
const pinia = createPinia()
app.use(pinia)
useAuthStore(pinia).restoreSession()
app.use(router)
app.mount('#app')
```

先安装 Pinia、恢复状态，再启动路由和挂载页面。页面首次渲染时便能读取恢复的用户。
main.ts 位于组件之外，显式传入 pinia，明确使用哪个实例。

```ts
token.value = session?.token ?? ''
user.value = session?.user ?? null
```

`?.` 是可选链：session 为 null 时，得到 undefined，不继续访问属性。
`??` 是空值合并：左边为 null 或 undefined 时，取右边的默认值。

## 5. 退出登录

```ts
async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.replace({ name: 'login' })
}
```

logout 清空 token、user，并删除保存的会话记录。
replace 用登录地址替换当前历史条目，不会为这次跳转新增条目。
这不等于清空全部历史记录，也不保证后退无法访问首页；访问限制由下一步的路由守卫实现。
当前没有后端注销接口，退出只清理客户端信息。

## 6. 恢复数据为什么要检查类型

存储中的字符串可能被修改或损坏，TypeScript interface 不会在运行时检查 JSON。
所以读取后先使用 unknown，再检查 token、user、id 和 username 的结构。
`value is LoginResponse` 是类型谓词：检查函数返回 true 后，TypeScript 将 value 视为 LoginResponse。
它只检查数据形状，不验证 Token 是否有效。
无效数据按未登录处理，只删除本应用的记录，不清空其他存储。
浏览器限制存储时，本次页面运行仍能使用内存登录信息，但无法保证刷新恢复。

## 验证与模拟数据的边界

1. 注册并登录，首页应显示当前账号和退出按钮。
2. 查看 hellovue.auth，确认只有 token 和用户信息。
3. 刷新首页，账号应仍然显示。
4. 点击退出，应回到登录页，存储记录被删除。
5. 再访问 /home，应显示未登录，而不是之前的用户。
6. 退出后刷新，仍应未登录。
7. 把存储记录改为无效 JSON 后刷新，页面应不崩溃，按未登录处理。

第五步的模拟账号库仍在内存中，整页刷新后清空。
本步保存的是登录结果，不是账号库，因此刷新后仍能显示保存的用户。
如果刷新后退出，再想用原账号登录，需要重新注册。这是模拟账号库的限制，后续用 Go 数据库存储解决。

下一步：标记需要登录的路由，加入访问守卫和登录失效后的跳转流程。

参考：[Pinia 核心概念](https://pinia.vuejs.org/zh/core-concepts/)。
