<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChatStore } from '~/stores/chat'
import { track } from '~/utils/analytics'

const INPUT_LIMIT = 400
const BADGE_STORAGE_KEY = 'arcanum-chat-badge-first'
const BADGE_DURATION = 48 * 60 * 60 * 1000

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const chatStore = useChatStore()
const {
  messages,
  referenceArticles,
  toast,
  isSending,
  hasMessages,
} = storeToRefs(chatStore)

const isPanelOpen = ref(false)
const draft = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messagesRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const showNewBadge = ref(false)
const referencePanelCollapsed = ref(false)

const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const dragOrigin = ref({ x: 0, y: 0 })
const panelPosition = ref<{ x: number, y: number } | null>(null)
let activePointerId: number | null = null

const tokenEstimate = computed(() => {
  const length = draft.value.trim().length
  if (!length)
    return 0
  return Math.max(1, Math.round(length / 4))
})

const panelStyle = computed(() => {
  if (panelPosition.value) {
    return {
      top: `${panelPosition.value.y}px`,
      left: `${panelPosition.value.x}px`,
      bottom: 'auto',
      right: 'auto',
    }
  }

  return {
    bottom: '24px',
    right: '24px',
  }
})

function renderMarkdown(content: string) {
  if (!content.trim())
    return '<p>（暂无内容）</p>'
  return markdown.render(content)
}

function clampPanelWithinViewport() {
  if (!panelRef.value || !panelPosition.value || typeof window === 'undefined')
    return

  const width = panelRef.value.offsetWidth || 320
  const height = panelRef.value.offsetHeight || 420
  const minGap = 12
  const maxX = Math.max(minGap, window.innerWidth - width - minGap)
  const maxY = Math.max(minGap, window.innerHeight - height - minGap)

  panelPosition.value = {
    x: Math.min(Math.max(minGap, panelPosition.value.x), maxX),
    y: Math.min(Math.max(minGap, panelPosition.value.y), maxY),
  }
}

function updatePanelPosition(x: number, y: number) {
  if (!panelRef.value || typeof window === 'undefined')
    return

  const width = panelRef.value.offsetWidth || 320
  const height = panelRef.value.offsetHeight || 420
  const minGap = 12
  const maxX = Math.max(minGap, window.innerWidth - width - minGap)
  const maxY = Math.max(minGap, window.innerHeight - height - minGap)

  panelPosition.value = {
    x: Math.min(Math.max(minGap, x), maxX),
    y: Math.min(Math.max(minGap, y), maxY),
  }
}

function onHeaderPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (target.closest('button'))
    return

  if (!panelRef.value)
    return

  isDragging.value = true
  activePointerId = event.pointerId
  panelRef.value.setPointerCapture(event.pointerId)
  const rect = panelRef.value.getBoundingClientRect()
  const current = panelPosition.value ?? { x: rect.left, y: rect.top }
  dragStart.value = { x: event.clientX, y: event.clientY }
  dragOrigin.value = current
}

function onHeaderPointerMove(event: PointerEvent) {
  if (!isDragging.value)
    return

  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  updatePanelPosition(dragOrigin.value.x + deltaX, dragOrigin.value.y + deltaY)
}

function endDragging(event?: PointerEvent) {
  if (!isDragging.value)
    return

  if (event && activePointerId !== null && event.pointerId !== activePointerId)
    return

  isDragging.value = false
  if (panelRef.value && activePointerId !== null) {
    try {
      panelRef.value.releasePointerCapture(activePointerId)
    }
    catch {
      // ignore
    }
  }

  if (event && panelRef.value)
    clampPanelWithinViewport()

  activePointerId = null
}

function handleToggle() {
  if (!isPanelOpen.value) {
    isPanelOpen.value = true
    showNewBadge.value = false
    track('ai_chat_open', { withContext: referenceArticles.value.length > 0 })
    nextTick(() => {
      clampPanelWithinViewport()
      focusInput()
      scrollMessagesToBottom()
    })
  }
  else {
    isPanelOpen.value = false
  }
}

function toggleReferencePanel() {
  referencePanelCollapsed.value = !referencePanelCollapsed.value
}

function focusInput() {
  if (!textareaRef.value)
    return
  textareaRef.value.focus()
  autoResizeTextarea()
}

function scrollMessagesToBottom() {
  if (!messagesRef.value)
    return
  messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}

function autoResizeTextarea() {
  const el = textareaRef.value
  if (!el)
    return
  el.style.height = 'auto'
  const maxHeight = 140
  const next = Math.min(el.scrollHeight, maxHeight)
  el.style.height = `${next}px`
}

async function handleSend() {
  if (!draft.value.trim())
    return

  const payload = draft.value
  draft.value = ''
  autoResizeTextarea()
  const success = await chatStore.sendUserMessage(payload)
  if (!success) {
    draft.value = payload
    nextTick(autoResizeTextarea)
  }

  nextTick(() => {
    scrollMessagesToBottom()
    focusInput()
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput() {
  if (draft.value.length > INPUT_LIMIT)
    draft.value = draft.value.slice(0, INPUT_LIMIT)
  autoResizeTextarea()
}

function handleClearMessages() {
  chatStore.resetConversation({ keepContext: true })
}

function handleRemoveContext(articleId: number) {
  chatStore.removeContextArticle(articleId)
}

function handleDismissToast() {
  chatStore.dismissToast()
}

function initBadgeState() {
  if (typeof window === 'undefined')
    return
  try {
    const cached = window.localStorage.getItem(BADGE_STORAGE_KEY)
    const seenAt = cached ? Number(cached) : Date.now()
    if (!cached)
      window.localStorage.setItem(BADGE_STORAGE_KEY, String(seenAt))

    showNewBadge.value = Date.now() - seenAt < BADGE_DURATION
  }
  catch {
    showNewBadge.value = true
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isPanelOpen.value)
    isPanelOpen.value = false
}

watch(
  () => messages.value.length,
  () => {
    if (isPanelOpen.value)
      nextTick(scrollMessagesToBottom)
  },
)

watch(
  () => referenceArticles.value.length,
  (length) => {
    if (length === 0)
      referencePanelCollapsed.value = false
  },
)

watch(isPanelOpen, (value) => {
  if (value)
    nextTick(() => setTimeout(autoResizeTextarea, 0))
})

onMounted(() => {
  initBadgeState()
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', clampPanelWithinViewport)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
    window.removeEventListener('resize', clampPanelWithinViewport)
  }
})
</script>

<template>
  <div class="help-chat-root">
    <button
      type="button"
      class="chat-fab"
      aria-label="打开 AI 小助手"
      @click="handleToggle"
    >
      <span>AI</span>
      <span v-if="showNewBadge" class="chat-fab-badge">New</span>
    </button>

    <Teleport to="body">
      <Transition name="chat-panel">
        <section
          v-if="isPanelOpen"
          ref="panelRef"
          class="chat-panel"
          :style="panelStyle"
        >
          <header
            class="chat-panel-header"
            @pointerdown="onHeaderPointerDown"
            @pointermove="onHeaderPointerMove"
            @pointerup="endDragging"
            @pointercancel="endDragging"
          >
            <div>
              <p class="chat-panel-title">
                AI 小助手 <span class="chat-panel-beta">(Beta)</span>
              </p>
              <p class="chat-panel-hint">
                回答以参考资料为优先
              </p>
            </div>
            <div class="chat-panel-actions">
              <button type="button" class="icon-button" @click="handleClearMessages">
                <span class="sr-only">清空历史</span>
                <div class="i-carbon-trash-can text-base" />
              </button>
              <button type="button" class="icon-button" @click="isPanelOpen = false">
                <span class="sr-only">最小化窗口</span>
                <div class="i-carbon-subtract text-base" />
              </button>
            </div>
          </header>

          <div v-if="toast" class="chat-toast" :class="[`chat-toast-${toast.type}`]">
            <span>{{ toast.message }}</span>
            <button type="button" class="chat-toast-close" @click="handleDismissToast">
              <span class="sr-only">关闭提示</span>
              ×
            </button>
          </div>

          <section class="chat-reference" :class="referencePanelCollapsed ? 'chat-reference-collapsed' : ''">
            <header class="chat-reference-header">
              <div>
                <p>参考资料（最多 {{ chatStore.maxContextArticles }} 条）</p>
                <p v-if="referenceArticles.length" class="chat-reference-count">已添加 {{ referenceArticles.length }} 条引用</p>
              </div>
              <button type="button" class="chat-reference-toggle" @click="toggleReferencePanel">
                <span>{{ referencePanelCollapsed ? '展开' : '收起' }}</span>
                <div class="i-carbon-chevron-down text-sm transition-transform" :class="referencePanelCollapsed ? '' : 'rotate-180'" />
              </button>
            </header>
            <div v-if="!referencePanelCollapsed" class="chat-reference-body">
              <ul v-if="referenceArticles.length" class="chat-reference-list">
                <li v-for="article in referenceArticles" :key="article.articleId" class="chat-reference-item">
                  <div>
                    <p class="chat-reference-title">
                      {{ article.title }}
                    </p>
                    <p class="chat-reference-source">
                      {{ article.source }}
                    </p>
                  </div>
                  <button
                    class="chat-reference-remove"
                    type="button"
                    @click="handleRemoveContext(article.articleId)"
                  >
                    移除
                  </button>
                </li>
              </ul>
              <p v-else class="chat-reference-empty">
                可在文章卡片点击“AI 引用此文”快速注入上下文
              </p>
            </div>
          </section>

          <section ref="messagesRef" class="chat-messages">
            <div v-if="!hasMessages" class="chat-empty">
              <p class="chat-empty-title">
                向我提问：例如「请总结首页推荐的文章」
              </p>
              <p class="chat-empty-subtitle">
                我会优先参考你附加的资料
              </p>
            </div>
            <ul v-else class="chat-message-list">
              <li
                v-for="message in messages"
                :key="message.id"
                class="chat-message"
                :class="[
                  message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant',
                  message.error ? 'chat-message-error' : '',
                ]"
              >
                <p v-if="message.role === 'user'" class="chat-bubble chat-bubble-user">
                  {{ message.content }}
                </p>
                <div v-else class="chat-bubble chat-bubble-assistant">
                  <div v-if="message.pending" class="chat-skeleton">
                    <span class="chat-skeleton-line" />
                    <span class="chat-skeleton-line" />
                    <span class="chat-skeleton-line short" />
                  </div>
                  <div v-else class="chat-markdown" v-html="renderMarkdown(message.content)" />
                </div>
              </li>
            </ul>
          </section>

          <footer class="chat-input-area">
            <div class="chat-input-wrapper">
              <textarea
                ref="textareaRef"
                v-model="draft"
                class="chat-textarea"
                :maxlength="INPUT_LIMIT"
                rows="2"
                :placeholder="isSending ? 'AI 正在思考...' : '请输入你的问题'"
                @keydown="handleKeydown"
                @input="handleInput"
              />
              <div class="chat-input-meta">
                <span>Enter 发送 / Shift+Enter 换行</span>
                <span v-if="tokenEstimate" class="chat-token-hint">约 {{ tokenEstimate }} tokens</span>
                <span class="chat-count">{{ draft.length }}/{{ INPUT_LIMIT }}</span>
              </div>
            </div>
            <button
              type="button"
              class="chat-send-button"
              :disabled="isSending || !draft.trim()"
              @click="handleSend"
            >
              <span v-if="isSending">思考中...</span>
              <span v-else>发送</span>
              <div class="i-carbon-send-filled text-base" />
            </button>
          </footer>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:global(html) {
  --help-chat-panel-bg: rgba(255, 255, 255, 0.96);
  --help-chat-panel-border: rgba(15, 23, 42, 0.08);
  --help-chat-panel-shadow: 0 35px 80px -40px rgba(15, 23, 42, 0.35);
  --help-chat-text-primary: var(--un-colors-text-base-light);
  --help-chat-text-muted: var(--un-colors-text-muted-light);
  --help-chat-text-subtle: var(--un-colors-text-subtle-light);
  --help-chat-surface: rgba(248, 250, 252, 0.9);
  --help-chat-input-bg: rgba(248, 250, 252, 0.95);
  --help-chat-input-border: rgba(15, 23, 42, 0.1);
  --help-chat-fab-bg: linear-gradient(135deg, #1e88ff, #5c6cff);
  --help-chat-fab-border: transparent;
  --help-chat-fab-text: #fff;
  --help-chat-fab-shadow: 0 20px 45px rgba(59, 130, 246, 0.45);
  --help-chat-reference-bg: rgba(248, 250, 252, 0.9);
  --help-chat-reference-border: rgba(15, 23, 42, 0.08);
  --help-chat-empty-border: rgba(15, 23, 42, 0.15);
  --help-chat-user-bubble-bg: rgba(59, 130, 246, 0.18);
  --help-chat-assistant-bubble-bg: rgba(15, 23, 42, 0.05);
  --help-chat-scrollbar: rgba(148, 163, 184, 0.45);
  --help-chat-scrollbar-track: transparent;
  --help-chat-markdown-inline: rgba(15, 23, 42, 0.08);
  --help-chat-markdown-block: rgba(15, 23, 42, 0.06);
  --help-chat-skeleton: rgba(15, 23, 42, 0.08);
}

:global(html.dark) {
  --help-chat-panel-bg: rgba(15, 23, 42, 0.92);
  --help-chat-panel-border: rgba(148, 163, 184, 0.25);
  --help-chat-panel-shadow: 0 35px 70px -32px rgba(2, 6, 23, 0.85);
  --help-chat-text-primary: var(--un-colors-text-base-dark);
  --help-chat-text-muted: rgba(248, 250, 252, 0.7);
  --help-chat-text-subtle: rgba(148, 163, 184, 0.7);
  --help-chat-surface: rgba(15, 23, 42, 0.6);
  --help-chat-input-bg: rgba(15, 23, 42, 0.55);
  --help-chat-input-border: rgba(248, 250, 252, 0.12);
  --help-chat-fab-border: rgba(148, 163, 184, 0.25);
  --help-chat-fab-shadow: 0 30px 45px -28px rgba(2, 6, 23, 0.85);
  --help-chat-reference-bg: rgba(15, 23, 42, 0.65);
  --help-chat-reference-border: rgba(148, 163, 184, 0.2);
  --help-chat-empty-border: rgba(248, 250, 252, 0.25);
  --help-chat-user-bubble-bg: rgba(59, 130, 246, 0.25);
  --help-chat-assistant-bubble-bg: rgba(248, 250, 252, 0.08);
  --help-chat-scrollbar: rgba(148, 163, 184, 0.4);
  --help-chat-markdown-inline: rgba(248, 250, 252, 0.08);
  --help-chat-markdown-block: rgba(15, 23, 42, 0.65);
  --help-chat-skeleton: rgba(248, 250, 252, 0.15);
}

.help-chat-root {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 90;
  color: var(--help-chat-text-primary);
}

.chat-fab {
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid var(--help-chat-fab-border);
  background: var(--help-chat-fab-bg);
  color: var(--help-chat-fab-text);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--help-chat-fab-shadow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.chat-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 24px 55px rgba(59, 130, 246, 0.55);
}

.chat-fab-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: #f97316;
  color: #fff;
  font-size: 0.6rem;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.chat-panel-enter-active,
.chat-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.chat-panel {
  position: fixed;
  z-index: 95;
  width: min(360px, calc(100vw - 2rem));
  height: clamp(420px, 65vh, 600px);
  max-height: calc(100vh - 2rem);
  background: var(--help-chat-panel-bg);
  color: var(--help-chat-text-primary);
  border-radius: 16px;
  border: 1px solid var(--help-chat-panel-border);
  box-shadow: var(--help-chat-panel-shadow);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
  cursor: default;
}

.chat-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.chat-panel-title {
  font-size: 1rem;
  font-weight: 600;
}

.chat-panel-beta {
  font-size: 0.8rem;
  opacity: 0.65;
  margin-left: 0.35rem;
}

.chat-panel-hint {
  font-size: 0.75rem;
  color: var(--help-chat-text-muted);
}

.chat-panel-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-button {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid var(--help-chat-panel-border);
  background: var(--help-chat-surface);
  color: var(--help-chat-text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.icon-button:hover {
  border-color: rgba(59, 130, 246, 0.45);
  color: var(--help-chat-text-primary);
}

.chat-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  padding: 0.45rem 0.65rem;
  font-size: 0.78rem;
  border: 1px solid transparent;
}

.chat-toast-error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.6);
}

.chat-toast-success {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.6);
}

.chat-toast-info {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.4);
}

.chat-toast-close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.chat-reference {
  background: var(--help-chat-reference-bg);
  border: 1px solid var(--help-chat-reference-border);
  border-radius: 12px;
  padding: 0.65rem;
}

.chat-reference-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
  color: var(--help-chat-text-muted);
}

.chat-reference-count {
  margin-top: 0.15rem;
  font-size: 0.72rem;
  font-weight: normal;
  color: var(--help-chat-text-subtle);
}

.chat-reference-toggle {
  border: 1px solid transparent;
  background: transparent;
  color: var(--help-chat-text-muted);
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.chat-reference-toggle:hover {
  border-color: var(--help-chat-reference-border);
  color: var(--help-chat-text-primary);
}

.chat-reference-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-reference-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 140px;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.chat-reference-collapsed {
  padding-bottom: 0.35rem;
}

.chat-reference-item {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.78rem;
}

.chat-reference-title {
  font-weight: 600;
}

.chat-reference-source {
  font-size: 0.7rem;
  color: var(--help-chat-text-subtle);
}

.chat-reference-remove {
  border: none;
  background: transparent;
  color: #f97316;
  font-size: 0.75rem;
  cursor: pointer;
}

.chat-reference-empty {
  font-size: 0.75rem;
  color: var(--help-chat-text-muted);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.2rem;
  scrollbar-color: var(--help-chat-scrollbar) var(--help-chat-scrollbar-track);
  scrollbar-width: thin;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--help-chat-scrollbar);
  border-radius: 999px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--help-chat-scrollbar-track);
}

.chat-message-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chat-message {
  display: flex;
}

.chat-message-user {
  justify-content: flex-end;
}

.chat-message-assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 85%;
  border-radius: 16px;
  padding: 0.65rem 0.85rem;
  font-size: 0.85rem;
  line-height: 1.45;
}

.chat-bubble-user {
  background: var(--help-chat-user-bubble-bg);
  color: var(--help-chat-text-primary);
}

.chat-bubble-assistant {
  background: var(--help-chat-assistant-bubble-bg);
  color: var(--help-chat-text-primary);
}

.chat-message-error .chat-bubble-assistant {
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.chat-markdown :deep(p) {
  margin: 0 0 0.5rem;
}

.chat-markdown :deep(code) {
  background: var(--help-chat-markdown-inline);
  padding: 0.15rem 0.35rem;
  border-radius: 6px;
}

.chat-markdown :deep(pre) {
  background: var(--help-chat-markdown-block);
  padding: 0.5rem;
  border-radius: 10px;
  overflow-x: auto;
}

.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  padding-left: 1.1rem;
}

.chat-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.chat-skeleton-line {
  display: block;
  height: 0.65rem;
  border-radius: 999px;
  background: var(--help-chat-skeleton);
  animation: pulse 1.6s ease infinite;
}

.chat-skeleton-line.short {
  width: 60%;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.4;
  }
}

.chat-empty {
  height: 100%;
  border: 1px dashed var(--help-chat-empty-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1rem;
  color: var(--help-chat-text-muted);
  background: var(--help-chat-surface);
}

.chat-empty-title {
  font-weight: 600;
}

.chat-empty-subtitle {
  font-size: 0.78rem;
}

.chat-input-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-input-wrapper {
  background: var(--help-chat-input-bg);
  border-radius: 12px;
  border: 1px solid var(--help-chat-input-border);
  padding: 0.45rem;
}

.chat-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--help-chat-text-primary);
  font-size: 0.9rem;
  resize: none;
  line-height: 1.5;
}

.chat-textarea:focus {
  outline: none;
}

.chat-textarea::placeholder {
  color: var(--help-chat-text-subtle);
}

.chat-input-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--help-chat-text-muted);
  gap: 0.5rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}

.chat-token-hint {
  color: #c4b5fd;
}

.chat-count {
  margin-left: auto;
}

.chat-send-button {
  width: 100%;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 600;
  padding: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.chat-send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .help-chat-root {
    bottom: 1rem;
    right: 1rem;
  }

  .chat-panel {
    width: calc(100vw - 1.5rem);
    height: 65vh;
    left: 0.75rem !important;
    right: 0.75rem !important;
    bottom: 1rem !important;
    top: auto !important;
  }
}
</style>

