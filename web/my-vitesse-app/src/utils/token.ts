const TOKEN_KEY = 'arcanum_token'
const TOKEN_EXPIRES_KEY = 'arcanum_token_expires_at'

function getStorage() {
  if (typeof window === 'undefined')
    return null

  try {
    return window.localStorage
  }
  catch (error) {
    console.error('[Token] Failed to access localStorage', error)
    return null
  }
}

export function setToken(token: string, expiresInSeconds?: number) {
  const storage = getStorage()
  if (!storage)
    return

  storage.setItem(TOKEN_KEY, token)

  if (expiresInSeconds && Number.isFinite(expiresInSeconds)) {
    const expiresAt = Date.now() + expiresInSeconds * 1000
    storage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt))
  }
  else {
    storage.removeItem(TOKEN_EXPIRES_KEY)
  }
}

export function getToken(): string | null {
  const storage = getStorage()
  if (!storage)
    return null

  const expiresAtRaw = storage.getItem(TOKEN_EXPIRES_KEY)
  if (expiresAtRaw) {
    const expiresAt = Number.parseInt(expiresAtRaw, 10)
    if (!Number.isNaN(expiresAt) && expiresAt <= Date.now()) {
      clearToken()
      return null
    }
  }

  return storage.getItem(TOKEN_KEY)
}

export function clearToken() {
  const storage = getStorage()
  if (!storage)
    return

  storage.removeItem(TOKEN_KEY)
  storage.removeItem(TOKEN_EXPIRES_KEY)
}
