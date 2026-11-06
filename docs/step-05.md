# 第五步：通过模拟接口串起注册和登录

## 本步结果

注册成功后自动回到登录页，显示注册成功提示，并预填账号。
登录时检查同一次页面运行中注册的账号和密码，成功后进入首页。
请求过程中显示“注册中…”或“登录中…”，禁用输入和提交按钮；失败后恢复操作并显示原因。

这是浏览器内存中的模拟接口：没有发送 HTTP 请求，没有后端和数据库。
切换路由可以保留模拟账号，整页刷新、关闭页面或开发时模块重载会使账号清空。
本步返回模拟 Token，但还没有保存登录状态；首页仍可直接访问，下一步再学习登录状态管理。

## 文件分工

| 文件                         | 责任                                           |
| ---------------------------- | ---------------------------------------------- |
| `src/types/auth.ts`          | 定义请求数据、用户和登录响应的 TypeScript 类型 |
| `src/api/auth.ts`            | 实现异步 register、login，模拟延迟和失败       |
| `src/views/RegisterView.vue` | 校验输入，调用注册，处理成功/失败和跳转        |
| `src/views/LoginView.vue`    | 调用登录，处理成功/失败和跳转                  |
| `src/assets/auth.css`        | 添加请求期间的禁用样式                         |

后续接 Go 后端时，会把接口模块内部的模拟实现换成 HTTP 请求。
页面仍然可以保持“校验 → 调接口 → 处理结果”的组织方式。

## 1. interface 描述请求和响应结构

```ts
export interface AuthCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
```

AuthCredentials 是登录和注册共用的输入结构，AuthUser 只包含 id 和 username，不包含密码。
RegisterForm 通过 `extends AuthCredentials` 增加 confirmPassword。
确认密码只在页面检查，不传给注册接口。
`import type` 表示只导入类型，构建后不会保留这个类型导入。

## 2. Promise 表示未来才能获得的结果

```ts
export async function login(credentials: AuthCredentials): Promise<LoginResponse>
```

这个签名表示：传入账号密码，返回一个 Promise；成功后会得到 LoginResponse。
它不是立即返回登录数据。

模拟延迟：

```ts
function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 600)
  })
}
```

setTimeout 在约 600 毫秒后调用 resolve，将 Promise 标记为成功完成。
`Promise<void>` 表示完成后没有业务数据。
在函数前加 async，会让函数始终返回 Promise。
`await delay()` 暂停的是当前异步函数后续执行，不会阻塞浏览器界面和整个 JavaScript 线程。

`register` 完成后返回 AuthUser；`login` 完成后返回 token 和 user。
异步函数中的 `throw new Error(...)` 会使返回的 Promise 失败。

## 3. try / catch / finally 处理请求

```ts
isSubmitting.value = true
try {
  await login({ username: form.username, password: form.password })
  await router.push({ name: 'home' })
} catch (error) {
  requestError.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
} finally {
  isSubmitting.value = false
}
```

这是主流程的简化版，完整代码还会判断页面是否已经离开。

- try：尝试登录；await 成功后继续向下执行，再跳转首页。
- catch：接收前面执行过程中抛出的错误。登录失败时不会继续执行跳转。
- finally：成功、失败或从 try/catch 提前 return，都会执行，恢复等待状态。
- instanceof Error：判断捕获的值是否为 Error 对象，再安全读取 message。

前端字段错误保存在 errors，接口失败保存在 requestError，分别显示。

## 4. 等待状态与重复提交

```vue
<button type="submit" :disabled="isSubmitting">
  {{ isSubmitting ? '登录中…' : '登录' }}
</button>
```

`:disabled` 动态控制按钮是否可操作，同时输入框也会禁用。
函数开头的 `if (isSubmitting.value) return` 再防止等待期间重复进入提交逻辑。
`:aria-busy="isSubmitting"` 向辅助工具说明表单是否正在处理操作。

## 5. 编程式跳转与查询参数

`RouterLink` 用于点击链接跳转；接口成功后自动跳转，则在代码中使用 `router.push()`。
组件中通过 `useRouter()` 获取路由器。

```ts
await router.push({
  name: 'login',
  query: { registered: '1', username: user.username },
})
```

会得到类似 `/login?registered=1&username=xiaohu` 的地址。
登录页通过 `useRoute()` 获取当前路由，用 `route.query` 读取参数，显示提示并预填账号。
query 的值可能是字符串、数组或 null，所以先用 typeof 判断 username 是字符串。
这些 URL 参数只是展示提示和预填数据，不代表登录凭据，也不决定是否允许登录；密码没有放进地址。

## 6. 模拟数据库与页面生命周期

`Map<string, MockAccount>` 按账号名保存模拟账号，便于通过 has 判断重复、get 查找账号。
模块在同一页面运行期间会共享这份 Map，所以从注册路由切到登录路由后，账号仍然存在。
`{ ...user, password }` 使用对象展开，把 user 的属性复制到保存的模拟记录中。

离开页面时，onUnmounted 会将当前组件的 isActive 设为 false。
异步调用返回后先检查它，避免用户已经离开登录页，却被旧请求再次带去首页。
这不会取消已经开始的模拟操作，只会忽略当前页面后续的提示和跳转。

## 7. 模拟 Token 的边界

登录返回 `mock-token-...` 形式的字符串，用于学习响应结构。它不是 JWT，没有真实认证能力。
本步登录页等待响应成功后跳转，不保存或展示 Token；下一步再把响应接入统一登录状态。
账号密码只保存在模拟模块的内存中，这份实现用于学习，后续由 Go 后端负责账号存储和验证。

## 验证顺序

1. 运行 `npm run dev`，访问登录页，随意输入未注册账号，提交后应提示“账号或密码错误”。
2. 点击注册，填写账号、密码和相同的确认密码；提交时观察按钮变成“注册中…”且不可重复操作。
3. 成功后自动回到登录页，账号已预填，显示注册成功提示。
4. 输入错误密码，确认提示错误且按钮恢复可用；再输入正确密码，应进入首页。
5. 返回登录，进入注册页，尝试相同账号，应提示账号已存在。
6. 注册页留空、确认密码不一致时，应立即出现字段提示，不进入请求等待状态。
7. 登录等待时点击注册链接离开，等旧请求完成，应留在注册页，不被强行带到首页。
8. 整页刷新后再登录之前注册的账号，应失败；这是本步内存数据重置的预期行为。

建议阅读顺序：types/auth.ts → api/auth.ts → LoginView 的 handleLogin → RegisterView 的 handleRegister。

下一步：保存并恢复登录结果，显示当前用户，完成退出登录。
