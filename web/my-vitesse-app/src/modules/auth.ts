import type { UserModule } from '~/types'
import { useAuthStore } from '~/stores/auth'

export const install: UserModule = ({ router }) => {
  if (!router)
    return

  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.initialized) {
      try {
        await auth.hydrate()
      }
      catch (error) {
        console.warn('[Auth] Failed to restore session', error)
      }
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (to.path === '/login' && auth.isAuthenticated) {
      const redirect = typeof to.query.redirect === 'string' && to.query.redirect.length > 0
        ? to.query.redirect
        : '/'

      return redirect
    }

    return true
  })
}
