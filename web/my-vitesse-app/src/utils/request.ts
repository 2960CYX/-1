import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type { RuoYiResponse } from '~/types/api'
import axios, { AxiosHeaders } from 'axios'
import { notifyError } from './notification'
import { clearToken, getToken } from './token'

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
}

const DEFAULT_TIMEOUT = Number.parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)
const resolvedTimeout = Number.isNaN(DEFAULT_TIMEOUT) ? 10000 : DEFAULT_TIMEOUT
const resolvedBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const httpClient = axios.create({
  baseURL: resolvedBaseUrl || '/api',
  timeout: resolvedTimeout,
})

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const nextConfig = config as InternalAxiosRequestConfig & RequestConfig
    const token = getToken()

    if (token && !nextConfig.skipAuth) {
      if (!nextConfig.headers)
        nextConfig.headers = new AxiosHeaders()

      if (nextConfig.headers instanceof AxiosHeaders)
        nextConfig.headers.set('Authorization', `Bearer ${token}`)
      else
        (nextConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`
    }

    return nextConfig
  },
  error => Promise.reject(error),
)

httpClient.interceptors.response.use(
  (response: AxiosResponse<RuoYiResponse>) => {
    const payload = response.data as RuoYiResponse
    const code = payload.code ?? response.status

    if (code === 401) {
      const handled = handleUnauthorized(payload.msg, response.config as RequestConfig)
      if (!handled)
        notifyError(payload.msg || '登录失败，请检查账号或密码')

      return Promise.reject(new Error(payload.msg || '未授权访问'))
    }

    if (code !== 200) {
      notifyError(payload.msg || '接口请求失败')
      return Promise.reject(new Error(payload.msg || '接口请求失败'))
    }

    response.data = payload
    return response
  },
  (error: AxiosError<RuoYiResponse>) => {
    const requestConfig = error.config as RequestConfig | undefined
    const status = error.response?.status
    const message = error.response?.data?.msg || error.message || '网络异常，请稍后再试'

    if (status === 401) {
      const handled = handleUnauthorized(error.response?.data?.msg, requestConfig)
      if (handled)
        return Promise.reject(error)
    }

    notifyError(message)
    return Promise.reject(error)
  },
)

function handleUnauthorized(message?: string, config?: RequestConfig): boolean {
  if (config?.skipAuth)
    return false

  clearToken()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout'))

    const { pathname, search, hash } = window.location
    const redirect = encodeURIComponent(`${pathname}${search}${hash}`)
    const target = `/login?redirect=${redirect}`

    notifyError(message || '登录状态已失效，请重新登录')
    window.location.href = target
  }

  return true
}

export type { RequestConfig as RequestOptions }
export default httpClient
