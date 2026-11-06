# 第一步：建立 Vue + TypeScript 项目骨架

本步目标：保留现有的 Vite 和 TypeScript 配置，将练习代码替换为后续登录项目的基础结构。

## 文件分工

```text
index.html                 浏览器加载的 HTML，提供 #app 挂载节点
src/
  main.ts                  创建 Vue 应用，引入全局样式，挂载到 #app
  App.vue                  根组件，目前直接显示 HomeView
  views/
    HomeView.vue           首页组件，负责首页内容和局部样式
  assets/
    main.css               全局样式
```

`views` 是我们约定用来放页面的目录，Vue 不会自动把目录里的文件变成路由。
当前通过 App.vue 导入并显示首页；后续学习 Vue Router 时，再让路由决定显示哪个页面。

## 阅读代码的顺序

1. `index.html`：找到 `id="app"` 和加载 `src/main.ts` 的 script 标签。
2. `src/main.ts`：`createApp(App)` 创建应用，`.mount('#app')` 将其挂载到 HTML 节点。
3. `src/App.vue`：`<script setup lang="ts">` 开启 TypeScript，导入的组件可直接用于模板。
4. `src/views/HomeView.vue`：模板读取 `pageTitle`，`<style scoped>` 限定本组件样式的作用范围。
5. `src/assets/main.css`：入口导入的 CSS 对整个应用生效，统一字体、背景和盒模型。

`pageTitle: string` 演示 TypeScript 类型标注。这里其实可以写成
`const pageTitle = '首页'`，TypeScript 能推断类型。它目前不需要变化，所以没有使用 `ref`。

## 启动和验证

在项目根目录执行：

```sh
npm run dev
```

打开终端打印的 Local 地址，应看到“首页”和“欢迎来到你的应用。”，其余区域留白。
修改 `HomeView.vue` 中的标题并保存，观察浏览器热更新。

```sh
npm run type-check
npm run build
```

前者检查 TypeScript 和 Vue 模板类型，后者按现有脚本同时做类型检查与生产构建。
开发服务器能显示页面，不代表类型检查一定通过。

## 本步边界

本步完成入口、根组件、首页和样式分工。后续依次加入登录表单、路由、模拟请求和 Token。
原来的通讯录练习完整保存在 `docs/examples/CrudDemo.vue.txt`，可以随时对照。

小练习：修改首页欢迎语，再分别修改全局背景与首页标题颜色，体会全局样式和 scoped 样式的分工。
