import type { RuoYiDataResponse, RuoYiResponse } from '~/types/api'
import type { LoginPayload, LoginResult, UserInfoPayload } from '~/types/auth'
import httpClient from '~/utils/request'

export async function login(payload: LoginPayload) {
  const response = await httpClient.post<RuoYiDataResponse<LoginResult>>('/login', payload, {
    skipAuth: true,
  })
  return response.data
}

export async function fetchUserInfo() {
  const response = await httpClient.get<RuoYiDataResponse<UserInfoPayload>>('/getInfo')
  return response.data
}

export async function logout() {
  const response = await httpClient.post<RuoYiDataResponse<unknown>>('/logout')
  return response.data
}

// 获取验证码图片与开关
export async function fetchCaptchaImage() {
  const response = await httpClient.get<RuoYiResponse>('/captchaImage', {
    skipAuth: true,
    timeout: 20000,
  })
  // 该接口返回的数据并不在 data 字段中，而是直接在顶层返回
  // 如 { code: 200, msg: '操作成功', captchaEnabled: true, uuid: 'xxx', img: 'base64...' }
  return response.data as unknown as {
    captchaEnabled?: boolean
    uuid?: string
    img?: string
  }
}
