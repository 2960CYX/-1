export function track(event: string, payload?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics:track', {
        detail: {
          event,
          payload,
        },
      }))
    }
  }
  catch (error) {
    console.warn('[Analytics] Failed to dispatch analytics event', error)
  }
}
