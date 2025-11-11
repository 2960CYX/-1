<script setup lang="ts">
import type { BlogArticleListItem } from '~/types/blog'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, onMounted } from 'vue'
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import Pagination from '~/components/Pagination.vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useArticleList,
  useBlogCategories,
  useBlogTags,
  useSiteInfo,
} from '~/composables/useBlog'
import { useChatStore } from '~/stores/chat'
import { notify } from '~/utils/notification'

const { siteInfo } = useSiteInfo()
const { categories, loading: categoriesLoading } = useBlogCategories()
const { tags } = useBlogTags()

const {
  articles,
  loading: articlesLoading,
  total,
  setFilters,
  query,
  page,
  pageSize,
  setPage,
} = useArticleList({ pageSize: 6 })

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const initial = Number(route.query.pageNum)
  if (Number.isFinite(initial) && initial > 1)
    setPage(initial)
})

function onUpdatePage(n: number) {
  setPage(n)
  router.replace({
    query: {
      ...route.query,
      pageNum: String(n),
    },
  })
}

// 独立的精选数据源，不受筛选影响
const {
  articles: featuredArticles,
  loading: featuredLoading,
} = useArticleList({ pageSize: 1 })

const selectedCategoryId = computed<number | null>({
  get: () => query.categoryId ?? null,
  set: (value) => {
    const normalized = value ?? null
    if ((query.categoryId ?? null) === normalized)
      return

    setFilters({ categoryId: normalized })
  },
})

const selectedTagId = computed<number | null>({
  get: () => query.tagId ?? null,
  set: (value) => {
    const normalized = value ?? null
    if ((query.tagId ?? null) === normalized)
      return

    setFilters({ tagId: normalized })
  },
})
const tagPanelOpen = ref(false)
const tagSearch = ref('')
const searchKeyword = ref(query.keyword ?? '')
const chatStore = useChatStore()
const { referenceArticles } = storeToRefs(chatStore)

const featuredArticle = computed(() => featuredArticles.value[0] ?? null)
// 卡片列表展示筛选出的全部文章，不再去除首项
const secondaryArticles = computed(() => articles.value)

const tagNameMap = computed(() => new Map(tags.value.map(tag => [tag.tagId, tag.name])))

const categoryNameMap = computed(() => new Map(categories.value.map(category => [category.categoryId, category.name])))

const selectedCategoryLabel = computed(() => {
  if (selectedCategoryId.value === null)
    return null

  return categoryNameMap.value.get(selectedCategoryId.value) ?? null
})

const selectedTagLabel = computed(() => {
  if (selectedTagId.value === null)
    return null

  return tagNameMap.value.get(selectedTagId.value) ?? null
})

const hasKeywordFilter = computed(() => searchKeyword.value.trim().length > 0)
const hasActiveFilters = computed(() => selectedCategoryId.value !== null || selectedTagId.value !== null || hasKeywordFilter.value)

const filterSummary = computed(() => {
  const parts: string[] = []
  if (selectedCategoryLabel.value)
    parts.push(selectedCategoryLabel.value)
  if (selectedTagLabel.value)
    parts.push(`#${selectedTagLabel.value}`)
  if (hasKeywordFilter.value)
    parts.push(`关键词: ${searchKeyword.value.trim()}`)

  return parts.length ? parts.join(' · ') : '全部文章 · 即刻追踪最新洞察'
})

const filteredTags = computed(() => {
  const keyword = tagSearch.value.trim().toLowerCase()
  if (!keyword)
    return tags.value

  return tags.value.filter((tag) => {
    if (!tag.name)
      return false
    return tag.name.toLowerCase().includes(keyword)
  })
})

const heroTitle = computed(() => siteInfo.value?.heroTitle ?? '简栈 · 以简驭繁的个人博客系统')
const heroSubtitle = computed(() => siteInfo.value?.heroSubtitle ?? '写给认真经营内容的人')
const heroDescription = computed(() => siteInfo.value?.heroDescription ?? '简栈聚焦内容架构、知识整理与工程策略，让若依后端的真实数据成为轻盈的阅读体验。')
const heroKicker = computed(() => siteInfo.value?.heroKicker ?? '简栈志 · 你的内容生产栈')
const primaryCtaText = computed(() => siteInfo.value?.ctaText ?? '探索文章')
const primaryCtaLink = computed(() => siteInfo.value?.ctaLink ?? '/article')
const secondaryCtaText = computed(() => siteInfo.value?.secondaryCtaText ?? '认识作者')
const secondaryCtaLink = computed(() => siteInfo.value?.secondaryCtaLink ?? '/about')
const showSecondaryCta = computed(() => {
  const link = (secondaryCtaLink.value || '').trim().toLowerCase()
  const text = (secondaryCtaText.value || '').trim().toLowerCase()
  if (!link)
    return false

  return !(link.includes('/about') || text.includes('关于'))
})

const heroStats = computed(() => [
  {
    label: '实时文章',
    value: total.value || 0,
    suffix: '篇',
  },
  {
    label: '专题分类',
    value: categories.value.length || 0,
    suffix: '类',
  },
  {
    label: '活跃标签',
    value: tags.value.length || 0,
    suffix: '枚',
  },
])

const aiContextUsage = computed(() => `${referenceArticles.value.length}/${chatStore.maxContextArticles}`)

const curatedTopics = computed(() => {
  const names = tags.value.map(tag => tag.name).filter(Boolean)
  if (names.length === 0)
    return ['设计语言', '知识星图', '工程工具', '体验度量', '思维模型']

  return names.slice(0, 8)
})

const isLoadingArticles = computed(() => articlesLoading.value)
const showEmptyState = computed(() => !isLoadingArticles.value && articles.value.length === 0 && !categoriesLoading.value)

const syncKeywordFilter = useDebounceFn(() => {
  setFilters({ keyword: searchKeyword.value.trim() })
}, 300)

watch(searchKeyword, () => {
  syncKeywordFilter()
})

watch(
  () => query.keyword,
  (value) => {
    const normalized = value ?? ''
    if (normalized !== searchKeyword.value)
      searchKeyword.value = normalized
  },
)

useHead(() => ({
  title: heroTitle.value,
  meta: [
    {
      name: 'description',
      content: heroDescription.value,
    },
  ],
}))

function formatDate(timestamp?: string) {
  if (!timestamp)
    return '发布时间待定'

  try {
    return timestamp.split(' ')[0]
  }
  catch (error) {
    console.warn('[Date] Failed to format timestamp', error)
    return timestamp
  }
}

function handleNewsletterClick() {
  notify('简栈通讯正在筹备中，敬请期待', 'info')
}

const latestUpdateLabel = computed(() => {
  const candidates: Array<string | undefined> = []
  // 优先按更新时间，其次按创建时间
  for (const a of [...featuredArticles.value, ...articles.value]) {
    candidates.push(a.updateTime)
    candidates.push(a.createTime)
  }
  const valid = candidates.filter((t): t is string => Boolean(t))
  if (valid.length === 0)
    return formatDate(featuredArticle.value?.createTime)

  const latest = valid.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  return formatDate(latest)
})

function estimateReadingMinutes(article: BlogArticleListItem) {
  const content = (article.summary || article.content || '').replace(/<[^>]+>/g, '')
  if (!content.length)
    return '约 3 分钟'

  const minutes = Math.max(3, Math.round(content.length / 500))
  return `约 ${minutes} 分钟`
}

function articleTags(article: BlogArticleListItem) {
  if (!article.tagIds || article.tagIds.length === 0)
    return []

  return article.tagIds
    .map(id => tagNameMap.value.get(id))
    .filter((name): name is string => Boolean(name))
}

function toggleCategory(categoryId: number | null) {
  selectedCategoryId.value = selectedCategoryId.value === categoryId ? null : categoryId
}

function toggleTag(tagId: number | null) {
  selectedTagId.value = selectedTagId.value === tagId ? null : tagId
}

function handleTagSelect(tagId: number | null, collapsePanel = false) {
  toggleTag(tagId)
  if (collapsePanel) {
    tagPanelOpen.value = false
    tagSearch.value = ''
  }
}

function toggleTagPanel() {
  tagPanelOpen.value = !tagPanelOpen.value
  if (!tagPanelOpen.value)
    tagSearch.value = ''
}

function clearKeyword() {
  if (!searchKeyword.value)
    return

  searchKeyword.value = ''
  setFilters({ keyword: '' })
}

function resetFilters() {
  selectedCategoryId.value = null
  selectedTagId.value = null
  tagPanelOpen.value = false
  tagSearch.value = ''
  searchKeyword.value = ''
  setFilters({ keyword: '' })
}

function addArticleToChatContext(article: BlogArticleListItem) {
  chatStore.addArticleToContext(article)
}

function focusLatestSection(options: { openTags?: boolean } = {}) {
  if (options.openTags)
    tagPanelOpen.value = true

  if (typeof window === 'undefined')
    return

  const scroll = () => {
    const latestSection = document.querySelector('#latest')
    if (latestSection instanceof HTMLElement)
      latestSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (typeof window.requestAnimationFrame === 'function')
    window.requestAnimationFrame(scroll)
  else
    scroll()
}
</script>

<template>
  <ArcanumLayout>
    <section class="flex flex-col gap-12 lg:flex-row lg:items-start">
      <div class="flex-1 space-y-8">
        <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted-light tracking-widest uppercase dark:text-text-muted-dark">
          <span class="inline-flex items-center gap-2 border border-border-light/60 rounded-full bg-white/70 px-3 py-1 text-[0.72rem] text-text-base-light font-semibold dark:border-border-dark/60 dark:bg-slate-900/40 dark:text-text-base-dark">
            <div class="i-carbon-snowflake text-base text-brand" />
            {{ heroKicker }}
          </span>
          <span class="text-[0.72rem] font-semibold">
            最近更新 · {{ latestUpdateLabel }}
          </span>
        </div>
        <p class="eyebrow-muted-sm">
          {{ heroSubtitle }}
        </p>
        <h1 class="hero-title">
          {{ heroTitle }}
        </h1>
        <p class="hero-lead">
          {{ heroDescription }}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <RouterLink class="brand-button" :to="primaryCtaLink">
            {{ primaryCtaText }}
            <div class="i-heroicons-arrow-right-20-solid text-base" />
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 line-button"
            @click="focusLatestSection({ openTags: true })"
          >
            <div class="i-carbon-tree-view-alt text-base" />
            智能筛选
          </button>
          <RouterLink
            v-if="showSecondaryCta"
            :to="secondaryCtaLink"
            class="inline-flex items-center gap-1 text-sm text-text-muted-light font-medium underline-offset-4 transition dark:text-text-muted-dark hover:text-brand"
          >
            {{ secondaryCtaText }}
            <div class="i-heroicons-arrow-up-right-20-solid text-sm" />
          </RouterLink>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="stat in heroStats"
            :key="stat.label"
            class="border border-border-light/60 rounded-2xl bg-white/70 p-4 shadow-sm dark:border-border-dark/60 dark:bg-slate-900/40"
          >
            <p class="text-xs text-text-muted-light tracking-widest uppercase dark:text-text-muted-dark">
              {{ stat.label }}
            </p>
            <p class="mt-3 text-3xl text-text-base-light font-semibold dark:text-text-base-dark">
              {{ stat.value }}
              <span class="text-base text-text-muted-light font-normal dark:text-text-muted-dark">
                {{ stat.suffix }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-xl w-full flex flex-col gap-4">
        <article v-if="featuredArticle" class="group surface-card h-auto">
          <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted-light card-meta dark:text-text-muted-dark">
            <span class="inline-flex items-center gap-2 text-brand">
              <div class="i-carbon-categories text-base" />
              {{ featuredArticle.categoryName || '未分类' }}
            </span>
            <span>
              {{ formatDate(featuredArticle.createTime) }} · {{ estimateReadingMinutes(featuredArticle) }}
            </span>
            <span class="ml-auto inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[0.72rem] text-brand font-semibold dark:bg-brand-soft/30">
              <div class="i-carbon-sparkles text-base" />
              精选推荐
            </span>
          </div>
          <RouterLink :to="`/article/${featuredArticle.articleId}`" class="mt-4 block">
            <h2 class="card-title">
              {{ featuredArticle.title }}
            </h2>
          </RouterLink>
          <p class="mt-4 text-base body-muted-sm">
            {{ featuredArticle.summary || '这篇文章正在整理简介，敬请期待。' }}
          </p>
          <div
            v-if="articleTags(featuredArticle).length"
            class="mt-6 flex flex-wrap gap-2"
          >
            <span
              v-for="tag in articleTags(featuredArticle)"
              :key="tag"
              class="tag-pill"
            >
              {{ tag }}
            </span>
          </div>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <RouterLink :to="`/article/${featuredArticle.articleId}`" class="inline-flex items-center gap-2 text-sm text-brand font-semibold transition hover:text-brand/80">
              阅读精选
              <div class="i-heroicons-book-open-20-solid text-base" />
            </RouterLink>
            <button
              type="button"
              class="inline-flex items-center gap-2 text-xs text-text-muted-light font-medium transition dark:text-text-muted-dark hover:text-brand"
              @click="addArticleToChatContext(featuredArticle)"
            >
              <div class="i-carbon-magic-wand text-base" />
              加入 AI 队列
            </button>
          </div>
        </article>
        <article v-else class="surface-card">
          <div class="h-full flex flex-col animate-pulse gap-5">
            <div class="h-4 w-32 rounded-full bg-border-light/70 dark:bg-border-dark/60" />
            <div class="h-8 w-3/4 rounded bg-border-light/80 dark:bg-border-dark/70" />
            <div class="space-y-3">
              <div class="h-4 w-full rounded bg-border-light/60 dark:bg-border-dark/50" />
              <div class="h-4 w-5/6 rounded bg-border-light/50 dark:bg-border-dark/40" />
            </div>
            <div class="mt-auto h-10 w-32 rounded-full bg-border-light/70 dark:bg-border-dark/70" />
          </div>
        </article>

        <section class="border border-brand/40 border-dashed from-white/80 to-brand-soft/10 bg-gradient-to-br p-6 dark:border-brand-soft/40 dark:from-slate-900/50 dark:to-slate-900/10 surface-card">
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted-light tracking-widest uppercase dark:text-text-muted-dark">
            <span class="inline-flex items-center gap-2 text-brand font-semibold">
              <div class="i-carbon-chat-bot text-base" />
              AI 联机引用
            </span>
            <span>上下文 {{ aiContextUsage }}</span>
          </div>
          <p class="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">
            将精选文章加入参考队列，HelpChat 会在回答时引用真实上下文，可随时扩充或移除。
          </p>
          <ul
            v-if="referenceArticles.length"
            class="mt-4 text-sm text-text-base-light space-y-2 dark:text-text-base-dark"
          >
            <li
              v-for="ctx in referenceArticles"
              :key="ctx.articleId"
              class="flex items-center gap-3 border border-border-light/60 rounded-2xl px-3 py-2 dark:border-border-dark/60"
            >
              <span class="flex-1 truncate">
                {{ ctx.title }}
              </span>
              <button
                type="button"
                class="text-xs text-text-muted-light transition dark:text-text-muted-dark hover:text-red-500"
                @click="chatStore.removeContextArticle(ctx.articleId)"
              >
                <span class="sr-only">移除 {{ ctx.title }}</span>
                <div class="i-carbon-close text-base" />
              </button>
            </li>
          </ul>
          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 text-sm line-button"
              :class="!featuredArticle ? 'cursor-not-allowed opacity-60' : ''"
              :disabled="!featuredArticle"
              @click="featuredArticle && addArticleToChatContext(featuredArticle)"
            >
              <div class="i-carbon-magic-wand text-base" />
              引用精选
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 text-sm line-button"
              @click="focusLatestSection()"
            >
              <div class="i-carbon-skip-forward text-base" />
              查看更多上下文
            </button>
          </div>
        </section>
      </div>
    </section>

    <section id="latest" class="mt-20 space-y-10">
      <header class="section-heading">
        <h2 class="text-3xl section-title">
          最新洞察
        </h2>
        <p class="section-subtitle">
          从若依后端实时获取的文章，覆盖设计系统、知识管理与工程实践。
        </p>
      </header>

      <div class="border border-border-light/60 rounded-3xl p-6 space-y-6 dark:border-border-dark/60 surface-card">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="eyebrow-muted-sm">
              精选主题筛选
            </p>
            <p class="mt-1 text-base text-text-muted-light dark:text-text-muted-dark">
              {{ filterSummary }}
            </p>
          </div>
          <div class="w-full lg:max-w-xl space-y-3">
            <label class="relative block">
              <span class="sr-only">搜索文章</span>
              <input
                v-model="searchKeyword"
                type="search"
                placeholder="搜索文章标题、摘要或关键字"
                class="w-full border border-border-light/60 rounded-2xl bg-white/70 py-2.5 pl-11 pr-12 text-sm text-text-base-light dark:border-border-dark/60 focus:border-brand dark:bg-slate-900/40 dark:text-text-base-dark focus:outline-none"
              >
              <div class="i-carbon-search pointer-events-none absolute left-4 top-1/2 text-base text-text-muted-light -translate-y-1/2 dark:text-text-muted-dark" />
              <button
                v-if="hasKeywordFilter"
                type="button"
                class="absolute right-3 top-1/2 h-8 w-8 inline-flex items-center justify-center rounded-full text-text-muted-light transition -translate-y-1/2 dark:text-text-muted-dark hover:text-brand dark:hover:text-contrast-light"
                aria-label="清除文章搜索"
                @click="clearKeyword"
              >
                <div class="i-carbon-close text-base" />
              </button>
            </label>
            <div class="flex flex-wrap gap-3 lg:justify-end">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs sm:text-sm line-button"
                :disabled="!hasActiveFilters"
                :class="!hasActiveFilters ? 'cursor-not-allowed opacity-60' : ''"
                @click="resetFilters"
              >
                <div class="i-carbon-renew text-base" />
                清空筛选
              </button>
              <button
                v-if="tags.length"
                type="button"
                class="inline-flex items-center gap-2 text-xs sm:text-sm line-button"
                :class="tagPanelOpen ? 'bg-brand text-contrast-light dark:bg-brand-soft/60' : ''"
                @click="toggleTagPanel()"
              >
                <div class="i-carbon-hash text-base" />
                {{ selectedTagLabel || '全部标签' }}
                <div
                  class="i-carbon-chevron-down text-base transition-transform"
                  :class="tagPanelOpen ? 'rotate-180' : ''"
                />
              </button>
            </div>
          </div>
        </div>

        <div v-if="categories.length" class="flex flex-nowrap gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            class="whitespace-nowrap text-xs sm:text-sm line-button"
            :class="selectedCategoryId === null ? 'bg-brand text-contrast-light dark:bg-brand-soft/60' : ''"
            @click="toggleCategory(null)"
          >
            全部分类
          </button>
          <button
            v-for="category in categories"
            :key="category.categoryId"
            type="button"
            class="whitespace-nowrap text-xs transition-colors sm:text-sm line-button"
            :class="selectedCategoryId === category.categoryId ? 'bg-brand text-contrast-light dark:bg-brand-soft/60' : ''"
            @click="toggleCategory(category.categoryId)"
          >
            {{ category.name }}
          </button>
        </div>

        <Transition name="fade">
          <div
            v-if="tagPanelOpen && tags.length"
            class="border border-border-light/60 rounded-2xl bg-white/60 p-4 dark:border-border-dark/60 dark:bg-slate-900/40"
          >
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label class="relative block flex-1">
                <input
                  v-model="tagSearch"
                  type="search"
                  placeholder="搜索标签或关键字"
                  class="w-full border border-border-light/60 rounded-full bg-transparent px-4 py-2 text-sm dark:border-border-dark/60 focus:border-brand focus:outline-none"
                >
                <div class="i-carbon-search pointer-events-none absolute right-4 top-1/2 text-base text-text-muted-light -translate-y-1/2 dark:text-text-muted-dark" />
              </label>
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs sm:text-sm line-button"
                :class="selectedTagId === null ? 'bg-brand text-contrast-light dark:bg-brand-soft/60' : ''"
                @click="handleTagSelect(null)"
              >
                <div class="i-carbon-checkmark text-base" />
                全部标签
              </button>
            </div>
            <div v-if="filteredTags.length" class="mt-4 max-h-56 flex flex-wrap gap-2 overflow-y-auto pr-1">
              <button
                v-for="tag in filteredTags"
                :key="tag.tagId"
                type="button"
                class="transition-colors tag-pill"
                :class="selectedTagId === tag.tagId ? 'bg-brand text-contrast-light dark:bg-brand-soft/60' : ''"
                @click="handleTagSelect(tag.tagId)"
              >
                {{ tag.name }}
              </button>
            </div>
            <p v-else class="mt-4 text-sm text-text-muted-light dark:text-text-muted-dark">
              未找到相关标签，请尝试其他关键字。
            </p>
          </div>
        </Transition>
      </div>

      <div v-if="isLoadingArticles" class="grid gap-8 md:grid-cols-2">
        <div v-for="skeleton in 4" :key="skeleton" class="animate-pulse surface-card">
          <div class="h-3 w-24 rounded-full bg-border-light/60 dark:bg-border-dark/60" />
          <div class="mt-4 h-6 w-3/4 rounded bg-border-light/70 dark:bg-border-dark/70" />
          <div class="mt-4 space-y-2">
            <div class="h-4 w-full rounded bg-border-light/60 dark:bg-border-dark/60" />
            <div class="h-4 w-5/6 rounded bg-border-light/50 dark:bg-border-dark/50" />
          </div>
          <div class="mt-6 flex gap-2">
            <div class="h-6 w-20 rounded-full bg-border-light/60 dark:bg-border-dark/60" />
            <div class="h-6 w-20 rounded-full bg-border-light/40 dark:bg-border-dark/40" />
          </div>
        </div>
      </div>

      <div v-else-if="showEmptyState" class="text-center surface-card">
        <h3 class="text-2xl card-title">
          暂无符合条件的文章
        </h3>
        <p class="mt-4 text-sm text-text-muted-light dark:text-text-muted-dark">
          尝试切换筛选条件或稍后再来，后台正在完善新的内容。
        </p>
        <button
          type="button"
          class="brand-button mt-6"
          @click="resetFilters()"
        >
          清除筛选，返回全部
        </button>
      </div>

      <div v-else class="grid gap-8 md:grid-cols-2">
        <article
          v-for="article in secondaryArticles"
          :key="article.articleId"
          class="group surface-card"
        >
          <RouterLink :to="`/article/${article.articleId}`" class="block">
            <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted-light card-meta dark:text-text-muted-dark">
              <span class="inline-flex items-center gap-2 text-brand">
                <div class="i-carbon-categories text-base" />
                {{ article.categoryName || '未分类' }}
              </span>
              <span>
                {{ formatDate(article.createTime) }} · {{ estimateReadingMinutes(article) }}
              </span>
            </div>
            <h3 class="mt-4 card-title">
              {{ article.title }}
            </h3>
            <p class="mt-4 body-muted-sm">
              {{ article.summary || '这篇文章暂未提供摘要，点击查看完整内容。' }}
            </p>
            <div
              v-if="articleTags(article).length"
              class="mt-6 flex flex-wrap gap-2"
            >
              <span
                v-for="tag in articleTags(article)"
                :key="tag"
                class="tag-pill"
              >
                {{ tag }}
              </span>
            </div>
          </RouterLink>
          <div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted-light dark:text-text-muted-dark">
            <span class="inline-flex items-center gap-2 border border-border-light/60 rounded-full px-3 py-1 text-[0.72rem] text-brand/80 font-medium dark:border-border-dark/60">
              <div class="i-carbon-chip text-sm" />
              AI Ready
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-text-muted-light font-medium transition dark:text-text-muted-dark hover:text-brand"
              @click="addArticleToChatContext(article)"
            >
              <div class="i-carbon-magic-wand text-base" />
              加入 AI 队列
            </button>
          </div>
        </article>
      </div>

      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="onUpdatePage" />
      </div>

      <footer v-if="total > articles.length" class="flex flex-col items-center gap-4 text-center">
        <p class="text-muted-sm">
          共 {{ total }} 篇文章，使用筛选器探索更多内容。
        </p>
        <RouterLink to="/article" class="line-button">
          浏览全部文章
          <div class="i-heroicons-squares-2x2-20-solid text-base" />
        </RouterLink>
      </footer>
    </section>

    <section class="group mt-20 surface-card">
      <div class="stack-responsive-between-6">
        <div class="space-y-3">
          <h2 class="text-2xl section-title">
            策展阅读清单
          </h2>
          <p class="text-base hero-lead md:max-w-xl">
            按标签自动聚合的主题清单，帮助你从不同维度梳理值得深读的文章、论文与工具。
          </p>
        </div>
        <button type="button" class="brand-button" @click="handleNewsletterClick">
          订阅简栈通讯
          <div class="i-carbon-email text-base" />
        </button>
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <span v-for="topic in curatedTopics" :key="topic" class="tag-pill">
          {{ topic }}
        </span>
      </div>
    </section>
  </ArcanumLayout>
</template>
