<script setup lang="ts">
import type { CreateCommentPayload } from '~/types/blog'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CommentNode from '~/components/CommentNode.vue'
import RichCommentEditor from '~/components/RichCommentEditor.vue'
import { useRoute, useRouter } from 'vue-router'
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import {
  useArticleComments,
  useArticleDetail,
  useBlogTags,
} from '~/composables/useBlog'
import { fetchCaptchaImage } from '~/services/auth'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { notifyError, notifySuccess } from '~/utils/notification'

const route = useRoute()
const router = useRouter()

const auth = useAuthStore()
const chatStore = useChatStore()
const { isAuthenticated, profile } = storeToRefs(auth)

const routeArticleId = computed(() => (route.params as { id?: string }).id)
const parsedArticleId = computed(() => Number(routeArticleId.value ?? ''))

const {
  article,
  loading: detailLoading,
  error: detailError,
  refresh: refreshDetail,
} = useArticleDetail(routeArticleId)

const {
  comments,
  total: commentTotal,
  loading: commentLoading,
  error: commentError,
  refresh: refreshComments,
  submit: submitComment,
} = useArticleComments(routeArticleId)

const { tags } = useBlogTags()

const submitting = ref(false)
const commentForm = reactive({
  nickname: '',
  content: '',
  code: '',
  uuid: '',
  parentId: 0,
})

// 评论字数限制（纯文本长度），可按需调整
const commentMaxLength = 1000

function getPlainTextLength(html?: string): number {
  const s = String(html || '')
  const div = document.createElement('div')
  div.innerHTML = s
  const text = (div.textContent || '').replace(/\u00A0/g, ' ').trim()
  return text.length
}

const contentLength = computed(() => getPlainTextLength(commentForm.content))
const contentOverLimit = computed(() => contentLength.value > commentMaxLength)

const captchaImg = ref<string>('')
const captchaEnabled = ref(false)
const captchaLoading = ref(false)

const displayNickname = computed(() => {
  const p = profile.value
  return (p?.nickName || p?.userName || '')
})

watch([isAuthenticated, profile], () => {
  if (isAuthenticated.value) {
    commentForm.nickname = displayNickname.value
    commentForm.code = ''
    commentForm.uuid = ''
  }
  else {
    commentForm.nickname = commentForm.nickname || ''
  }
}, { immediate: true })

async function loadCaptcha() {
  if (isAuthenticated.value) {
    captchaEnabled.value = false
    captchaImg.value = ''
    commentForm.code = ''
    commentForm.uuid = ''
    return
  }

  try {
    captchaLoading.value = true
    const data = await fetchCaptchaImage()
    captchaEnabled.value = Boolean(data?.captchaEnabled)
    if (captchaEnabled.value) {
      commentForm.uuid = data?.uuid || ''
      captchaImg.value = data?.img ? `data:image/jpeg;base64,${data.img}` : ''
    }
    else {
      commentForm.uuid = ''
      commentForm.code = ''
      captchaImg.value = ''
    }
  }
  catch (error) {
    captchaEnabled.value = false
    captchaImg.value = ''
    if (!isAuthenticated.value)
      notifyError('验证码加载失败，请稍后再试')
    console.warn('[Captcha] Failed to load comment captcha', error)
  }
  finally {
    captchaLoading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
})

watch(isAuthenticated, (loggedIn) => {
  if (loggedIn) {
    captchaEnabled.value = false
    captchaImg.value = ''
    commentForm.code = ''
    commentForm.uuid = ''
  }
  else {
    loadCaptcha()
  }
})

const tagNameMap = computed(() => new Map(tags.value.map(tag => [tag.tagId, tag.name])))

const articleTitle = computed(() => article.value?.title ?? '文章详情')
const articleSummary = computed(() => article.value?.summary ?? '')
const articleCategory = computed(() => article.value?.categoryName ?? '未分类')
const articlePublishedAt = computed(() => formatDisplayDate(article.value?.createTime))
const articleTags = computed(() => {
  const current = article.value
  if (!current?.tagIds || current.tagIds.length === 0)
    return []

  return current.tagIds
    .map(id => tagNameMap.value.get(id))
    .filter((name): name is string => Boolean(name))
})

const articleContent = computed(() => article.value?.content ?? '')

function sanitizeText(input?: string): string {
  if (!input)
    return ''
  const div = document.createElement('div')
  div.innerHTML = String(input)
  const text = div.textContent || ''
  return text.trim()
}

function isHtmlBlank(html?: string): boolean {
  const s = String(html || '')
  const text = s
    .replace(/<[^>]+>/g, ' ') // 去掉所有标签
    .replace(/&nbsp;/g, ' ') // 替换空格实体
    .trim()
  return text.length === 0
}

const hasComments = computed(() => comments.value.length > 0)

// 构建嵌套评论树（无限层级显示）
const commentTree = computed(() => {
  const items = comments.value.map(c => ({ ...c, children: [] as any[] }))
  const map = new Map<number, any>()
  items.forEach(c => map.set(c.commentId, c))
  const roots: any[] = []
  items.forEach((c) => {
    const pid = Number(c.parentId || 0)
    if (pid > 0 && map.has(pid))
      map.get(pid).children.push(c)
    else
      roots.push(c)
  })
  return roots
})

const authorUserId = computed(() => article.value?.userId ?? null)
const currentUserId = computed(() => profile.value?.userId ?? null)

function getCommentRole(comment: { userId?: number | null }) {
  const uid = comment?.userId ?? null
  if (uid && authorUserId.value && uid === authorUserId.value)
    return 'author' as const
  if (uid && currentUserId.value && uid === currentUserId.value)
    return 'me' as const
  if (uid)
    return 'member' as const
  return 'guest' as const
}

function getRoleLabel(role: ReturnType<typeof getCommentRole>) {
  switch (role) {
    case 'author': return '博主'
    case 'me': return '我'
    case 'member': return '用户'
    default: return '游客'
  }
}

useHead(() => ({
  title: `${articleTitle.value} · 简栈`,
  meta: [
    {
      name: 'description',
      content: articleSummary.value || '文章详情',
    },
  ],
}))

function formatDisplayDate(dateTime?: string | null) {
  if (!dateTime)
    return '发布时间待定'

  try {
    return dateTime.split(' ')[0]
  }
  catch (error) {
    console.warn('[Article] Failed to format date', error)
    return dateTime
  }
}

async function handleRetry() {
  await Promise.all([refreshDetail(true), refreshComments(true)])
}

async function handleSubmitComment() {
  if (!Number.isFinite(parsedArticleId.value)) {
    notifyError('文章信息无效，无法提交评论')
    return
  }

  const content = commentForm.content || ''
  if (isHtmlBlank(content)) {
    notifyError('请填写评论内容')
    return
  }

  // 纯文本长度限制（防止过长内容）
  if (getPlainTextLength(content) > commentMaxLength) {
    notifyError(`评论过长，最多 ${commentMaxLength} 字`)
    return
  }

  const payload: Omit<CreateCommentPayload, 'articleId'> = { content }

  // 回复父评论（仅在选择了“回复”后设置）
  if (commentForm.parentId && commentForm.parentId > 0)
    payload.parentId = commentForm.parentId

  if (!isAuthenticated.value) {
    const nickname = commentForm.nickname.trim()
    if (!nickname) {
      notifyError('请填写昵称')
      return
    }
    payload.nickname = nickname

    if (captchaEnabled.value) {
      const code = commentForm.code.trim()
      if (!code || !commentForm.uuid) {
        notifyError('请填写验证码')
        return
      }
      payload.code = code
      payload.uuid = commentForm.uuid
    }
  }

  submitting.value = true
  try {
    await submitComment(payload)
    commentForm.content = ''
    // 提交后重置回复目标
    commentForm.parentId = 0
    replyToComment.value = null

    if (isAuthenticated.value) {
      notifySuccess('评论已发布')
      await refreshComments(true)
    }
    else {
      notifySuccess('评论提交成功，待审核')
      commentForm.code = ''
      commentForm.uuid = ''
      await loadCaptcha()
    }
  }
  catch (error) {
    console.error('[Article] Failed to submit comment', error)
    if (!isAuthenticated.value && captchaEnabled.value)
      await loadCaptcha()
  }
  finally {
    submitting.value = false
  }
}

function handleBack() {
  if (history.length > 1)
    router.back()
  else
    router.push('/')
}

const detailReady = computed(() => Boolean(article.value))

function handleInjectContext() {
  if (article.value)
    chatStore.addArticleToContext(article.value)
}

// 回复交互
const replyToComment = ref<{ commentId: number; nickname: string } | null>(null)
function handleReply(comment: { commentId: number; nickname: string }) {
  replyToComment.value = { commentId: comment.commentId, nickname: comment.nickname }
  commentForm.parentId = comment.commentId
}
function cancelReply() {
  replyToComment.value = null
  commentForm.parentId = 0
}
</script>

<template>
  <ArcanumLayout>
    <section class="py-12 page-container lg:py-16">
      <button class="mb-6 inline-flex items-center gap-2 text-sm line-button" type="button" @click="handleBack">
        <div class="i-heroicons-arrow-left-20-solid text-base" />
        返回上一页
      </button>

      <div class="grid gap-10 lg:grid-cols-12">
        <article class="group lg:col-span-9 lg:row-start-1 space-y-6 surface-card">
          <header class="card-section-header space-y-4">
            <span class="brand-badge">ARTICLE</span>
            <p class="eyebrow-muted-sm">
              {{ articleCategory }}
            </p>
            <h1 class="heading-xl">
              {{ articleTitle }}
            </h1>
            <p v-if="articleSummary" class="text-base body-muted-sm">
              {{ articleSummary }}
            </p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted-light dark:text-text-muted-dark">
              <span>{{ articlePublishedAt }}</span>
              <span v-if="articleTags.length" class="flex flex-wrap items-center gap-2">
                <span
                  v-for="tagName in articleTags"
                  :key="tagName"
                  class="rounded-full bg-surface-light px-3 py-1 text-xs dark:bg-surface-dark"
                >
                  # {{ tagName }}
                </span>
              </span>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs sm:text-sm line-button"
                @click="handleInjectContext"
              >
                AI 引用此文
                <div class="i-carbon-chat-bot text-base" />
              </button>
            </div>
          </header>

          <div v-if="detailLoading" class="space-y-6">
            <div
              v-for="skeleton in 4"
              :key="`detail-skeleton-${skeleton}`"
              class="h-6 skeleton-surface"
            />
          </div>
          <div
            v-else-if="detailError"
            class="toast-shell"
          >
            文章内容加载失败，请
            <a class="text-link" href="javascript:void(0)" @click="handleRetry">重试</a>
            或返回首页。
          </div>
          <div v-else-if="detailReady" class="max-w-none typography-prose-lg" v-html="articleContent" />
          <div
            v-else
            class="surface-note"
          >
            暂未获取到文章内容。
          </div>
        </article>

        <section class="group lg:col-span-9 lg:row-start-2 space-y-4 surface-card">
          <header class="row-between">
            <h2 class="text-lg section-title">
              评论
            </h2>
            <span class="text-muted-xs">
              {{ commentTotal }} 条
            </span>
          </header>

          <div v-if="commentLoading && !hasComments" class="space-y-4">
            <div
              v-for="skeleton in 3"
              :key="`comment-skeleton-${skeleton}`"
              class="h-20 skeleton-surface"
            />
          </div>
          <div
            v-else-if="commentError"
            class="surface-note"
          >
            评论加载失败。
            <button class="text-link" type="button" @click="refreshComments(true)">
              点此重试
            </button>
          </div>
          <template v-if="false">
          <!-- 原始两层渲染（保留以便对比） -->
          <ul v-if="hasComments" class="space-y-4">
            <li
              v-for="comment in commentTree"
              :key="comment.commentId"
              class="surface-bordered-body-sm"
            >
              <div class="row-between text-muted-xs">
                <span class="inline-flex items-center gap-2">
                  <span class="text-text-base-light font-medium dark:text-text-base-dark">{{ comment.nickname }}</span>
                  <span class="rounded-full bg-surface-light px-2 py-0.5 text-xs dark:bg-surface-dark">
                    {{ getRoleLabel(getCommentRole(comment)) }}
                  </span>
                </span>
                <span>{{ formatDisplayDate(comment.createTime) }}</span>
              </div>
              <p class="mt-3 text-text-base-light dark:text-text-base-dark">
                {{ sanitizeText(comment.content) }}
              </p>
              <div class="mt-2 text-muted-xs">
                <button type="button" class="text-link" @click="handleReply(comment)">回复</button>
              </div>

              
              <ul v-if="comment.children && comment.children.length" class="mt-4 space-y-3 border-l pl-4 border-surface-light dark:border-surface-dark">
                <li v-for="child in comment.children" :key="child.commentId" class="surface-bordered-body-sm">
                  <div class="row-between text-muted-xs">
                    <span class="inline-flex items-center gap-2">
                      <span class="text-text-base-light font-medium dark:text-text-base-dark">{{ child.nickname }}</span>
                      <span class="rounded-full bg-surface-light px-2 py-0.5 text-xs dark:bg-surface-dark">
                        {{ getRoleLabel(getCommentRole(child)) }}
                      </span>
                    </span>
                    <span>{{ formatDisplayDate(child.createTime) }}</span>
                  </div>
                  <p class="mt-3 text-text-base-light dark:text-text-base-dark">
                    {{ sanitizeText(child.content) }}
                  </p>
                  <div class="mt-2 text-muted-xs">
                    <button type="button" class="text-link" @click="handleReply(child)">回复</button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
          </template>

          <!-- 新：递归组件渲染多层回复 -->
          <ul v-else-if="hasComments" class="space-y-4">
            <CommentNode
              v-for="node in commentTree"
              :key="node.commentId"
              :node="node"
              :sanitizeText="sanitizeText"
              :getRoleLabel="getRoleLabel"
              :getCommentRole="getCommentRole"
              :formatDisplayDate="formatDisplayDate"
              @reply="handleReply"
            />
          </ul>
          <p
            v-else
            class="surface-note"
          >
            暂无评论，欢迎率先分享你的观点。
          </p>
        </section>

        <section class="group lg:col-span-9 lg:row-start-3 space-y-4 surface-card">
          <h2 class="text-lg section-title">
            发布评论
          </h2>

          <p class="text-muted-xs" v-if="isAuthenticated">
            您的评论将自动通过并立即显示。
          </p>
          <p class="text-muted-xs" v-else>
            评论经博主审核后才会对外展示。
            <RouterLink class="ml-2 text-link" :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`">
              立即登录
            </RouterLink>
          </p>

          <form class="space-y-4" @submit.prevent="handleSubmitComment">
            <div v-if="replyToComment" class="surface-note row-between">
              <span>
                正在回复 @{{ replyToComment.nickname }}
              </span>
              <button type="button" class="text-link" @click="cancelReply">取消</button>
            </div>
            <div class="space-y-2">
              <label class="arcanum-label" for="comment-nickname">
                昵称
              </label>
              <input
                id="comment-nickname"
                v-model="commentForm.nickname"
                type="text"
                autocomplete="nickname"
                :disabled="isAuthenticated"
                :readonly="isAuthenticated"
                :required="!isAuthenticated"
                placeholder="请输入昵称"
                class="arcanum-input w-36"
              >
            </div>

            <div v-if="!isAuthenticated && captchaEnabled" class="space-y-2">
              <label class="arcanum-label" for="comment-code">
                验证码
              </label>
              <div class="flex items-center gap-3">
                <input
                  id="comment-code"
                  v-model="commentForm.code"
                  type="text"
                  autocomplete="off"
                  :required="captchaEnabled"
                  placeholder="请输入右侧验证码"
                  class="arcanum-input w-36"
                >
                <button type="button" class="line-button" :disabled="captchaLoading" @click="loadCaptcha">
                  <span v-if="captchaLoading">加载中...</span>
                  <span v-else>刷新</span>
                </button>
                <img
                  v-if="captchaImg"
                  :src="captchaImg"
                  alt="验证码"
                  class="arcanum-captcha"
                  @click="loadCaptcha"
                >
              </div>
            </div>

            <div class="space-y-2">
              <label class="arcanum-label" for="comment-content">
                评论内容
              </label>
              <RichCommentEditor
                v-model="commentForm.content"
                :placeholder="replyToComment ? `回复 @${replyToComment.nickname}...` : '分享你的想法...'"
                :maxLength="commentMaxLength"
                class="w-full"
              />
              <div class="text-muted-xs text-right">
                <span :class="contentOverLimit ? 'text-red-500' : ''">{{ contentLength }}/{{ commentMaxLength }}</span>
              </div>
            </div>

            <button type="submit" class="w-full brand-button" :disabled="submitting || contentOverLimit">
              <span v-if="submitting">提交中...</span>
              <span v-else>提交评论</span>
            </button>
          </form>

          <p class="text-muted-xs">
            请保持礼貌，理性交流。
          </p>
        </section>

        <aside class="lg:col-span-3 lg:col-start-10 lg:row-start-1 space-y-6">
          <section class="group space-y-4 surface-card">
            <header class="row-between">
              <h2 class="text-lg section-title">
                相关推荐
              </h2>
              <RouterLink class="text-sm text-link" to="/">
                返回首页
              </RouterLink>
            </header>
            <p class="body-muted-sm">
              当前暂无相关推荐内容。稍后将展示精选文章与专题入口。
            </p>
            <p class="text-muted-xs">
              建议先从首页的分类与标签开始探索。
            </p>
          </section>
        </aside>
      </div>
    </section>
  </ArcanumLayout>
</template>
