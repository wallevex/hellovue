# 第二步：搭建静态登录页

## 本步改动

新增 `src/views/LoginView.vue`，搭建账号、密码、登录按钮和注册入口。
`App.vue` 改为显示 `LoginView`，原来的 `HomeView.vue` 留作登录成功后的首页。

加载链路：`index.html → main.ts → App.vue → LoginView.vue`。
当前可以输入账号密码，密码默认隐藏字符；登录不会发请求，注册入口还没有跳转。

## 页面结构

```text
main.login-page                  整个页面的主要内容
└── section.login-card           登录卡片
    ├── header.login-header      标题和介绍
    ├── form.login-form          登录表单
    │   ├── div.form-field       账号标签和输入框
    │   ├── div.form-field       密码标签和输入框
    │   └── button               登录按钮
    └── p.register-prompt        注册提示和入口
```

- `section` 表示有主题的内容区域。`aria-labelledby="login-title"` 引用标题的 id，让辅助工具识别区域名称。
- `form` 将输入框和提交按钮组织为表单，提供浏览器原生的表单语义。
- `@submit.prevent` 是 Vue 写法：监听提交，阻止浏览器默认提交导致的导航或刷新。本步尚未绑定提交处理函数。
- `label` 的 `for` 与输入框的 `id` 一致，点击标签时，对应输入框会获得焦点。
- `name` 是字段的表单名称；`id` 用于关联标签、选择元素等，两者用途不同。
- `type="text"` 是普通文本输入框；`type="password"` 隐藏屏幕上的密码字符，但不会加密密码。
- `autocomplete="username"` 和 `autocomplete="current-password"` 提示浏览器如何自动填充。
- `placeholder` 是输入为空时的提示，不能替代 label。
- `type="submit"` 表示提交表单；`type="button"` 是普通按钮。注册入口加入路由时再改成 RouterLink。

## 页面样式

样式写在 `<style scoped>` 中，避免影响首页。全局字体、背景、盒模型继续来自 `src/assets/main.css`。

| 选择器或属性                                              | 作用                                               |
| --------------------------------------------------------- | -------------------------------------------------- |
| `.login-page` 的 `display: grid` 和 `place-items: center` | 把卡片放在页面中央                                 |
| `min-height: 100vh` / `100svh`                            | 至少占满视口高度；支持时使用移动浏览器的小视口高度 |
| `.login-card` 的 `width: 100%` 和 `max-width: 420px`      | 窄屏适应可用宽度，宽屏限制宽度                     |
| `padding`                                                 | 内容与边框之间的内边距                             |
| `margin`                                                  | 元素外侧间距                                       |
| `border`、`border-radius`、`box-shadow`                   | 边框、圆角、阴影                                   |
| `gap`                                                     | 网格子元素之间的距离                               |
| `:hover`                                                  | 鼠标悬停样式                                       |
| `:focus-visible`                                          | 让键盘操作时的焦点位置清晰可见                     |
| `@media (max-width: 480px)`                               | 窄屏时减少卡片内边距                               |

## TypeScript 部分

目前只声明固定标题，保留 `<script setup lang="ts">`。
下一步再加入表单状态类型、`v-model`、提交处理和前端校验。

## 验证与练习

1. 运行 `npm run dev`，打开终端显示的根地址，应看到居中卡片。
2. 点击账号、密码标签，确认输入框获得焦点。
3. 输入文字，确认密码框隐藏字符。
4. 用 Tab 切换焦点，观察焦点边框。
5. 点击登录或在输入框按 Enter，页面应不刷新、不跳转，这是当前静态阶段的预期行为。
6. 缩窄窗口，检查卡片不会超出屏幕。

小练习：修改卡片最大宽度、按钮颜色和表单 gap，观察各项 CSS 的效果。
