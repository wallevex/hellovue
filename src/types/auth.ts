// 登录和注册接口接收的数据；确认密码只用于页面校验，不传给接口。
export interface AuthCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
