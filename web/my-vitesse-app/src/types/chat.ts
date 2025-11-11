export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  pending?: boolean
  error?: boolean
}

export interface ChatContextArticle {
  articleId: number
  title: string
  summary?: string
  source?: string
  addedAt: number
}

export type ChatToastType = 'success' | 'error' | 'info'

export interface ChatToast {
  id: string
  type: ChatToastType
  message: string
}

export interface ChatCompletionMessage {
  role: ChatRole
  content: string
}

export interface ChatCompletionPayload {
  conversationId: string
  model?: string
  stream?: boolean
  messages: ChatCompletionMessage[]
}

export interface ChatCompletionResponse {
  content?: string
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  data?: {
    content?: string
  }
}
