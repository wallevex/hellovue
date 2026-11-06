# 第三步：表单数据绑定、提交与校验

## 本步目标

让输入框的值进入 TypeScript 数据，让提交函数读取这些值，并根据结果显示提示。
本步只做本地必填校验，不验证账号密码是否正确，不发请求，不生成 Token，也不跳转首页。

只修改了 `src/views/LoginView.vue`，沿用第二步的页面结构和样式。

## 1. 先看 script：定义数据

```ts
interface LoginForm {
  username: string
  password: string
}

const form = reactive<LoginForm>({
  username: '',
  password: '',
})
```

`interface` 是 TypeScript 的接口，用来描述对象应有哪些属性及其类型。
这里的“接口”是类型定义，不是 HTTP 接口。
`reactive<LoginForm>` 表示创建一个符合 LoginForm 类型的响应式对象。
例如 `form.username = 123` 会产生类型错误，因为 username 必须是字符串。
这些类型检查服务于开发和构建，不等于运行时的必填校验。

`reactive` 让 Vue 能追踪对象属性的变化，数据变化后更新使用它的界面。
`errors` 也是响应式对象，按字段保存错误文字；现在它的结构与 LoginForm 相同，因此复用这个类型。

```ts
const submitMessage = ref('')
```

`ref` 保存单独的响应式值，TypeScript 会从初始值推断它是字符串类型。
脚本中通过 `submitMessage.value` 读写；模板中 Vue 自动解包，直接写 `submitMessage`。
这不是唯一组织方式：表单对象也可以用 ref，本步用 reactive 展示相关字段集中管理的写法。

## 2. 看 template：连接输入框与数据

```html
<input v-model.trim="form.username" /> <input v-model="form.password" />
```

`v-model` 是双向绑定：用户输入会更新数据，数据变化也会更新输入框。
`.trim` 在同步账号数据时去掉首尾空白。
密码没有使用 `.trim`，因为密码里的空格可能是有效字符，不能擅自改变。

与前一步相比，输入框不再只是浏览器中的内容，而是有了对应的 Vue 数据。

## 3. 看提交入口和函数

```html
<form @submit.prevent="handleLogin" @input="submitMessage = ''"></form>
```

提交时，Vue 阻止浏览器默认提交，并执行 handleLogin。点击登录和在输入框内按 Enter 都使用同一个入口。
输入框的 input 事件会冒泡到 form，因此编辑任意输入框时，表单上的监听会清空上一次的通过提示。
这里是在模板中赋值，ref 自动解包，不需要写 `.value`。

`handleLogin(): void` 中的 `void` 表示函数不返回业务结果。
函数按这个顺序执行：

1. 清空上次错误和通过提示。
2. 检查去除首尾空白后的账号是否为空；为空则设置账号错误。
3. 检查密码是否为空字符串；为空则设置密码错误。
4. 有任意错误就 return，提前结束函数。
5. 都满足要求时，显示“表单校验通过。”。

两个校验使用独立的 if，因此两个字段都为空时，会同时显示两条提示。
当前错误提示在再次提交时重新计算，不做输入过程中的实时校验。
登录时先只检查必填；注册时再根据约定设计账号格式、密码长度等规则。

## 4. 看错误如何显示

```html
<p v-if="errors.username" id="username-error" class="field-error">{{ errors.username }}</p>
```

`v-if` 在错误文字不为空时创建这个元素，空字符串则不显示。
`{{ }}` 把错误数据渲染为文本。

输入框上的两个动态属性：

- `:aria-invalid="Boolean(errors.username)"`：有错误时告诉辅助工具当前字段无效；Boolean 将字符串转换成布尔值。
- `:aria-describedby="errors.username ? 'username-error' : undefined"`：有错误时关联说明文字，无错误时不设置属性。

这里的 `:` 是 `v-bind:` 的简写，表示属性值来自 JavaScript 表达式。
`条件 ? 值一 : 值二` 是三元表达式，条件成立取值一，否则取值二。

CSS 的 `input[aria-invalid='true']` 根据属性选择有错误的输入框，设置红色边框。
`role="status"` 标识提交结果提示区域，供辅助工具识别；`:empty` 在提示为空时隐藏它。

## 5. 自己验证

运行 `npm run dev`，在浏览器中依次尝试：

| 操作                                   | 预期                             |
| -------------------------------------- | -------------------------------- |
| 两个输入框都为空，点击登录             | 同时显示账号和密码错误           |
| 只输入账号，提交                       | 只显示密码错误                   |
| 账号只输入空格，密码输入任意内容，提交 | 显示账号错误                     |
| 两个字段都填写，提交                   | 显示“表单校验通过。”，留在当前页 |
| 出现通过提示后，再编辑任意输入框       | 通过提示消失                     |
| 在输入框内按 Enter                     | 与点击登录使用同一校验流程       |
| 出错后修改内容并再次提交               | 根据当前值更新错误提示           |

任意非空密码都能通过本步检查，这不代表用户已经登录。
前端校验用于及时反馈；之后接入后端时，仍要由后端校验请求并验证账号密码。
不要把密码打印到控制台或持久化到浏览器存储。

## 小练习

把错误提示改成自己的文案，然后解释下面这条链路：

`输入 → v-model 更新 form → 提交调用 handleLogin → 更新 errors / submitMessage → 页面更新`。

下一步将创建注册页，并引入 Vue Router 管理登录、注册和首页的切换。
