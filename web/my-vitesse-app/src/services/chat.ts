import type { ChatCompletionPayload, ChatCompletionResponse } from '~/types/chat'

type ChatRequestBody = ChatCompletionPayload & {
  model?: string
  stream?: boolean
}

export interface ChatCompletionResult {
  content: string
  raw: ChatCompletionResponse | null
}

const DEFAULT_ENDPOINT = '/api/chat/completion'
const resolvedApiUrl = (import.meta.env.VITE_CHAT_API_URL || '').trim()
const resolvedApiKey = (import.meta.env.VITE_CHAT_API_KEY || '').trim()
const resolvedModel = (import.meta.env.VITE_CHAT_MODEL || '').trim()

function resolveEndpoint() {
  return resolvedApiUrl || DEFAULT_ENDPOINT
}

function resolveModel(model?: string) {
  if (model && model.trim().length > 0)
    return model.trim()

  if (resolvedModel)
    return resolvedModel

  return 'deepseek-chat'
}

function extractContent(response: ChatCompletionResponse | null | undefined) {
  if (!response)
    return ''

  if (typeof response.content === 'string' && response.content.trim().length > 0)
    return response.content

  if (typeof response.data?.content === 'string' && response.data.content.trim().length > 0)
    return response.data.content

  const choiceContent = response.choices?.[0]?.message?.content
  if (typeof choiceContent === 'string')
    return choiceContent

  return ''
}

export async function createChatCompletion(
  payload: ChatCompletionPayload,
  signal?: AbortSignal,
): Promise<ChatCompletionResult> {
  const endpoint = resolveEndpoint()
  const requestBody: ChatRequestBody = {
    ...payload,
    model: resolveModel(payload.model),
    stream: payload.stream ?? false,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (resolvedApiKey)
    headers.Authorization = `Bearer ${resolvedApiKey}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal,
  })

  if (!response.ok) {
    const message = await response.text().catch(() => null)
    throw new Error(message || `Chat API 请求失败（${response.status}）`)
  }

  let parsed: ChatCompletionResponse | null = null
  try {
    parsed = await response.json()
  }
  catch (error) {
    console.warn('[Chat] 无法解析响应体', error)
  }

  return {
    content: extractContent(parsed).trim(),
    raw: parsed,
  }
}
