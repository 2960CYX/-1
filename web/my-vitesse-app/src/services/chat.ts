import type { ChatCompletionPayload, ChatCompletionResponse } from '~/types/chat'
import httpClient from '~/utils/request'

type ChatRequestBody = ChatCompletionPayload & {
  model?: string
  stream?: boolean
}

export interface ChatCompletionResult {
  content: string
  raw: ChatCompletionResponse | null
}

const DEFAULT_ENDPOINT = '/chat/completion'
const resolvedApiUrl = (import.meta.env.VITE_CHAT_API_URL || '').trim()
const resolvedApiKey = (import.meta.env.VITE_CHAT_API_KEY || '').trim()
const resolvedModel = (import.meta.env.VITE_CHAT_MODEL || '').trim()

function isAbsolute(url: string) {
  return /^https?:\/\//.test(url)
}

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

  const url = resolveEndpoint()
  const headers: Record<string, string> = {}
  if (resolvedApiKey)
    headers.Authorization = `Bearer ${resolvedApiKey}`

  const config = {
    headers,
    signal,
  }

  const resp = isAbsolute(url)
    ? await httpClient.post<ChatCompletionResponse>(url, requestBody, config)
    : await httpClient.post<ChatCompletionResponse>(url, requestBody, config)

  const data = resp.data as unknown as ChatCompletionResponse | null
  return {
    content: extractContent(data).trim(),
    raw: data,
  }
}
