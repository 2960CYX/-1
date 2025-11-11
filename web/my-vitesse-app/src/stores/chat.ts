import type { BlogArticle, BlogArticleListItem } from '~/types/blog'
import type {
  ChatCompletionMessage,
  ChatContextArticle,
  ChatMessage,
  ChatToast,
  ChatToastType,
} from '~/types/chat'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createChatCompletion } from '~/services/chat'
import { track } from '~/utils/analytics'

const MAX_HISTORY_MESSAGES = 10
const MAX_CONTEXT_ARTICLES = 2
const REQUEST_TIMEOUT = 15000

const BASE_SYSTEM_PROMPT = '你是简栈的 AI 小助手，擅长总结文章、提炼重点，并以简明的中文回答访客的问题。保持口吻友好但克制，如有不确定或缺失的上下文请主动说明。'

let toastTimer: ReturnType<typeof setTimeout> | null = null

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID)
    return `${prefix}-${crypto.randomUUID()}`

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeSummary(input?: string | null) {
  if (!input)
    return ''

  const text = input
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= 360)
    return text

  return `${text.slice(0, 360)}…`
}

export const useChatStore = defineStore('chat', () => {
  const conversationId = ref(createId('c'))
  const messages = ref<ChatMessage[]>([])
  const contextArticles = ref<ChatContextArticle[]>([])
  const toast = ref<ChatToast | null>(null)
  const isSending = ref(false)
  const lastError = ref<string | null>(null)
  const controller = ref<AbortController | null>(null)

  const hasMessages = computed(() => messages.value.length > 0)
  const referenceArticles = computed(() => contextArticles.value)

  function dismissToast() {
    toast.value = null
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
  }

  function showToast(type: ChatToastType, message: string, duration = 3500) {
    toast.value = {
      id: createId('toast'),
      type,
      message,
    }

    if (toastTimer)
      clearTimeout(toastTimer)

    toastTimer = setTimeout(() => {
      toast.value = null
      toastTimer = null
    }, duration)
  }

  function resetConversation(options: { keepContext?: boolean } = {}) {
    messages.value = []
    lastError.value = null
    conversationId.value = createId('c')

    if (!options.keepContext)
      contextArticles.value = []
  }

  function cancelOngoingRequest() {
    controller.value?.abort()
    controller.value = null
    isSending.value = false
  }

  function removeContextArticle(articleId: number) {
    contextArticles.value = contextArticles.value.filter(ctx => ctx.articleId !== articleId)
  }

  function addArticleToContext(article: BlogArticle | BlogArticleListItem) {
    if (!article.articleId)
      return

    const normalized: ChatContextArticle = {
      articleId: article.articleId,
            title: article.title || '未命名文章',
      summary: normalizeSummary(article.summary || article.content || ''),
            source: article.categoryName || '简栈',
      addedAt: Date.now(),
    }

    const existingIndex = contextArticles.value.findIndex(ctx => ctx.articleId === article.articleId)
    if (existingIndex !== -1)
      contextArticles.value.splice(existingIndex, 1)

    contextArticles.value.push(normalized)
    if (contextArticles.value.length > MAX_CONTEXT_ARTICLES)
      contextArticles.value.splice(0, contextArticles.value.length - MAX_CONTEXT_ARTICLES)

    showToast('success', `已将《${normalized.title}》加入参考资料`)
  }

  function buildRequestMessages(): ChatCompletionMessage[] {
    const history = messages.value
      .filter(msg => (msg.role === 'user' || msg.role === 'assistant') && msg.content.trim().length > 0)

    const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES)

    const request: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: BASE_SYSTEM_PROMPT,
      },
    ]

    if (contextArticles.value.length) {
      const contextBlock = contextArticles.value
        .map((ctx, index) => `${index + 1}. 《${ctx.title}》 · ${ctx.source}\n摘要：${ctx.summary || '暂无摘要'}`)
        .join('\n\n')

      request.push({
        role: 'system',
        content: `以下是访客主动提供的参考资料，请在回答中优先引用，如需引用请在段末使用（引用：文章标题）：\n${contextBlock}`,
      })
    }

    trimmedHistory.forEach((msg) => {
      request.push({
        role: msg.role,
        content: msg.content,
      })
    })

    return request
  }

  async function sendUserMessage(content: string): Promise<boolean> {
    const trimmed = content.trim()
    if (!trimmed)
      return false

    if (isSending.value) {
      showToast('info', '上一条回答生成中，请稍候再试')
      return false
    }

    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    }
    messages.value.push(userMessage)

    const assistantMessage: ChatMessage = {
      id: createId('assistant'),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      pending: true,
    }
    messages.value.push(assistantMessage)

    isSending.value = true
    lastError.value = null
    track('ai_chat_send', { withContext: contextArticles.value.length > 0 })

    const requestMessages = buildRequestMessages()
    const abortController = new AbortController()
    controller.value = abortController

    let timeoutId: ReturnType<typeof setTimeout> | null = null
    timeoutId = setTimeout(() => {
      abortController.abort()
    }, REQUEST_TIMEOUT)

    try {
      const { content: reply } = await createChatCompletion({
        conversationId: conversationId.value,
        messages: requestMessages,
      }, abortController.signal)

      assistantMessage.content = reply || '（未收到内容，请稍后再试）'
      assistantMessage.pending = false
      assistantMessage.error = !reply
      return true
    }
    catch (error) {
      const isAbortError = error instanceof Error && error.name === 'AbortError'
      assistantMessage.pending = false
      assistantMessage.error = true

      if (isAbortError) {
        assistantMessage.content = '请求已超时，稍后再试。'
        showToast('error', 'AI 请求超时，已为你取消')
      }
      else if (error instanceof Error) {
        assistantMessage.content = 'AI 暂时不可用，请稍后再试。'
        showToast('error', error.message || 'AI 暂时不可用，请稍后再试')
        lastError.value = error.message
      }
      else {
        assistantMessage.content = '网络异常，请稍后再试。'
        showToast('error', '网络异常，请稍后再试')
        lastError.value = 'unknown'
      }

      track('ai_chat_error', {
        code: error instanceof Error ? error.name : 'unknown',
      })
      return false
    }
    finally {
      isSending.value = false
      controller.value = null
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }

  return {
    conversationId,
    messages,
    contextArticles,
    toast,
    isSending,
    hasMessages,
    referenceArticles,
    maxContextArticles: MAX_CONTEXT_ARTICLES,
    lastError,
    addArticleToContext,
    removeContextArticle,
    resetConversation,
    dismissToast,
    sendUserMessage,
    cancelOngoingRequest,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot))
