import type { LoginPayload, UserProfile } from '~/types/auth'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchUserInfo, login as loginRequest, logout as remoteLogout } from '~/services/auth'
import { clearToken, getToken, setToken } from '~/utils/token'

let logoutEventBound = false

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const profile = ref<UserProfile | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  const resetState = () => {
    token.value = null
    profile.value = null
    permissions.value = []
    roles.value = []
  }

  if (typeof window !== 'undefined' && !logoutEventBound) {
    window.addEventListener('auth:logout', () => {
      resetState()
      initialized.value = true
    })
    logoutEventBound = true
  }

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(credentials: LoginPayload) {
    loading.value = true
    try {
      const result = await loginRequest(credentials)
      const tokenFromData = result?.data?.token as string | undefined
      const tokenTopLevel = (result as unknown as { token?: string }).token
      const expiresInFromData = result?.data?.expiresIn as number | undefined
      const expiresInTopLevel = (result as unknown as { expiresIn?: number }).expiresIn

      const resolvedToken = tokenFromData ?? tokenTopLevel
      const resolvedExpiresIn = expiresInFromData ?? expiresInTopLevel

      if (!resolvedToken)
        throw new Error(result?.msg || '登录失败')

      setToken(resolvedToken, resolvedExpiresIn)
      token.value = resolvedToken
      await hydrate(true)
    }
    finally {
      loading.value = false
    }
  }

  async function hydrate(force = false) {
    if (!token.value) {
      resetState()
      initialized.value = true
      return
    }

    if (initialized.value && !force)
      return

    try {
      const result = await fetchUserInfo()
      const payloadTopLevel = result as unknown as {
        user?: UserProfile
        permissions?: string[]
        roles?: string[]
      }

      profile.value = result.data?.user || payloadTopLevel.user || null
      permissions.value = result.data?.permissions || payloadTopLevel.permissions || []
      roles.value = result.data?.roles || payloadTopLevel.roles || []
    }
    catch (error) {
      clearToken()
      resetState()
      throw error
    }
    finally {
      initialized.value = true
    }
  }

  async function logout(options: { remote?: boolean } = {}) {
    try {
      if (options.remote)
        await remoteLogout()
    }
    catch (error) {
      console.warn('[Auth] Remote logout failed', error)
    }
    finally {
      clearToken()
      resetState()
      initialized.value = true
      if (typeof window !== 'undefined')
        window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  return {
    token,
    profile,
    permissions,
    roles,
    loading,
    initialized,
    isAuthenticated,
    login,
    logout,
    hydrate,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
