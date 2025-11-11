export interface LoginPayload {
  username: string
  password: string
  code?: string
  uuid?: string
}

export interface LoginResult {
  token: string
  expiresIn?: number
  refreshToken?: string
}

export interface UserProfile {
  userId: number
  userName: string
  nickName: string
  avatar?: string
  email?: string
  phonenumber?: string
  sex?: string
  deptId?: number
}

export interface UserInfoPayload {
  permissions: string[]
  roles: string[]
  user: UserProfile
}
