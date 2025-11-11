type NotificationType = 'success' | 'error' | 'info'

const EVENT_KEY = 'arcanum:notification'

export interface NotificationEventDetail {
  type: NotificationType
  message: string
}

export function notify(message: string, type: NotificationType = 'info') {
  const payload: NotificationEventDetail = { type, message }

  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent<NotificationEventDetail>(EVENT_KEY, { detail: payload }))

  if (type === 'error')
    console.error(`[${type.toUpperCase()}] ${message}`)
  else
    console.warn(`[${type.toUpperCase()}] ${message}`)
}

export function notifyError(message: string) {
  notify(message, 'error')
}

export function notifySuccess(message: string) {
  notify(message, 'success')
}

export function notifyInfo(message: string) {
  notify(message, 'info')
}

export function subscribeNotifications(handler: (detail: NotificationEventDetail) => void) {
  if (typeof window === 'undefined')
    return () => {}

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<NotificationEventDetail>).detail
    handler(detail)
  }

  window.addEventListener(EVENT_KEY, listener as EventListener)
  return () => window.removeEventListener(EVENT_KEY, listener as EventListener)
}
