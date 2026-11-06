# 第四步：注册页与 Vue Router

## 本步结果

| 地址         | 显示内容          |
| ------------ | ----------------- |
| `/`          | 重定向到 `/login` |
| `/login`     | 登录页            |
| `/register`  | 注册页            |
| `/home`      | 简单首页          |
| 未定义的地址 | 重定向到 `/login` |

现在登录页可以点“注册账号”进入注册页，注册页可以点“返回登录”回到登录页。
首页也提供返回登录的链接。
注册表单支持必填和两次密码一致性校验，目前通过后只显示“表单校验通过。”。
真正注册、登录和 Token 在后续步骤实现，本步没有创建账号，也没有访问控制。
因此目前可以直接通过地址访问 `/home`。

## 新增与修改的文件

- `package.json`、`package-lock.json`：添加 `vue-router` 依赖，安装命令为 `npm install vue-router@4`，本步已安装。
- `src/router/index.ts`：创建路由器，配置地址与组件的对应关系。
- `src/main.ts`：在挂载前通过 `app.use(router)` 安装路由插件。
- `src/App.vue`：用 RouterView 显示当前地址对应的页面。
- `src/views/RegisterView.vue`：注册页。
- `src/views/LoginView.vue`：把注册按钮改成 RouterLink。
- `src/views/HomeView.vue`：加入返回登录链接。
- `src/assets/auth.css`：从登录页提取出来的公共表单样式。

## 1. 路由就是地址与页面组件的映射

过去 App.vue 直接写 `<LoginView />`，所以只会显示登录页。
现在路由表声明：

```ts
{ path: '/login', name: 'login', component: LoginView }
```

- `path`：浏览器地址中的路径部分。
- `name`：我们给路由起的名称，可用于后续按名称跳转。
- `component`：访问这个路径时要显示的组件。

例如访问 `http://localhost:5173/register`，路由匹配的 path 是 `/register`。
这里仍然只有一个 HTML 入口，页面切换通过 Vue 在浏览器中完成。

`{ path: '/', redirect: '/login' }` 表示访问根地址时，自动导航到登录地址。
最后的 `/:pathMatch(.*)*` 用于匹配其他未定义的路径；当前统一返回登录页。

## 2. 创建并安装 router

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [/* 路由配置 */],
})
```

`createRouter` 创建路由器实例。
`createWebHistory` 使用浏览器 History API 管理地址，生成 `/login` 这样的路径。
`import.meta.env.BASE_URL` 是 Vite 提供的应用基础路径，目前通常是 `/`。

```ts
const app = createApp(App)
app.use(router)
app.mount('#app')
```

`app.use(router)` 把路由能力安装到 Vue 应用上，需要在 mount 之前完成。

## 3. RouterView：页面展示的位置

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

RouterView 是 Vue Router 提供的组件，代表“把当前路由匹配到的组件显示在这里”。
它不是 HTML 原生标签，也不是 iframe。

当前加载链路是：

`index.html → main.ts 安装 router → App.vue 的 RouterView → 当前页面组件`。

## 4. RouterLink：页面之间的链接

```vue
<RouterLink class="auth-link" to="/register">注册账号</RouterLink>
```

`to` 是目标路由地址。RouterLink 通常渲染成带 href 的 a 元素，保留链接的语义和常用操作。
普通左键点击站内 RouterLink 时，路由器更新地址和组件，无需重新加载整个 HTML 文档。
浏览器的前进、后退也能切换页面。切换离开后，本页的局部表单状态默认不会保留。

## 5. 注册表单：复用上一节的知识

RegisterForm 比 LoginForm 多一个 `confirmPassword` 字段。
三个输入框继续使用 v-model、字段错误提示和 @submit.prevent。
新增的判断是：

```ts
if (!form.confirmPassword) {
  errors.confirmPassword = '请再次输入密码'
} else if (form.confirmPassword !== form.password) {
  errors.confirmPassword = '两次输入的密码不一致'
}
```

密码和确认密码都使用 `autocomplete="new-password"`，因为这里是在设置新密码。
校验通过不代表注册成功。本步没有发送请求，也不把账号密码保存到浏览器存储。
下一步会通过模拟接口，把注册、登录和结果处理连起来。

## 6. 公共样式为什么搬到了 auth.css

登录和注册的卡片、输入框、按钮外观相同，所以把第二步的样式提取到公共文件。
原来的 login-page、login-card 等 class 改成了 auth-page、auth-card 等通用名称。
auth 是 authentication 的常见缩写，在这里用于命名认证页面的样式。
两页都写：

```vue
<style scoped src="../assets/auth.css"></style>
```

`src` 引用外部样式，`scoped` 依然限制样式的作用范围。
这种写法既共享样式源码，又避免把表单样式直接变成全局样式。

## 验证与练习

运行 `npm run dev`，打开终端给出的地址，然后验证：

1. 根地址是否自动变为 `/login`。
2. 点击“注册账号”，地址是否变成 `/register`，内容是否切换成注册页。
3. 点击返回登录，以及使用浏览器前进、后退，是否能正确切换。
4. 刷新 `/register`，开发服务器是否仍能显示注册页。
5. 注册时留空、两次密码不同、两次密码相同，分别观察结果。
6. 手动访问 `/home`，查看首页并返回登录。
7. 手动访问 `/unknown-page`，确认返回登录页。

部署时使用这种 History 路由模式，需要让服务器在访问前端路由时回退提供 index.html。
开发阶段 Vite 已处理这个需求，部署步骤再配置生产服务器。

小练习：读懂“点击 RouterLink → 地址变化 → 匹配 routes → RouterView 显示对应组件”的过程。

参考：[Vue Router 官方入门](https://router.vuejs.org/zh/guide/)。
