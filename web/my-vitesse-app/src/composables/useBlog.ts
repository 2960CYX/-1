import type { Ref } from 'vue'
import type {
  ArticleListQuery,
  ArticleListResult,
  BlogArticle,
  BlogArticleListItem,
  BlogCategory,
  BlogComment,
  BlogTag,
  CommentListResult,
  CreateCommentPayload,
  SiteInfo,
} from '~/types/blog'
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import {
  fetchArticleDetail,
  fetchArticles,
  fetchCategories,
  fetchComments,
  fetchSiteInfo,
  fetchTags,
  submitComment,
} from '~/services/blog'

const articleListCache = new Map<string, ArticleListResult>()
const articleDetailCache = new Map<number, BlogArticle>()
const articleCommentsCache = new Map<number, CommentListResult>()
const articleCommentsPromise = new Map<number, Promise<CommentListResult>>()

let categoriesCache: BlogCategory[] | null = null
let categoriesPromise: Promise<BlogCategory[]> | null = null

let tagsCache: BlogTag[] | null = null
let tagsPromise: Promise<BlogTag[]> | null = null

let siteInfoCache: SiteInfo | null = null
let siteInfoPromise: Promise<SiteInfo> | null = null

interface ArticleListState {
  articles: Ref<BlogArticleListItem[]>
  total: Ref<number>
  loading: Ref<boolean>
  error: Ref<unknown>
  refresh: (force?: boolean) => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: Partial<Pick<ArticleListQuery, 'categoryId' | 'tagId' | 'keyword'>>) => void
  page: Ref<number>
  pageSize: Ref<number>
  query: ArticleListQuery
}

function serializeQuery(query: ArticleListQuery) {
  const sanitized: Record<string, unknown> = {}

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '')
      return
    sanitized[key] = value
  })

  return JSON.stringify(sanitized)
}

export function useArticleList(initialQuery: ArticleListQuery = {}): ArticleListState {
  const query = reactive<ArticleListQuery>({
    pageNum: initialQuery.pageNum ?? 1,
    pageSize: initialQuery.pageSize ?? 10,
    categoryId: initialQuery.categoryId ?? null,
    tagId: initialQuery.tagId ?? null,
    keyword: initialQuery.keyword,
  })

  const articles = shallowRef<BlogArticleListItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<unknown>(null)

  const page = computed({
    get: () => query.pageNum ?? 1,
    set: (value: number) => {
      query.pageNum = value
    },
  })

  const pageSize = computed({
    get: () => query.pageSize ?? 10,
    set: (value: number) => {
      query.pageSize = value
    },
  })

  async function load(force = false) {
    const cacheKey = serializeQuery(query)

    if (!force && articleListCache.has(cacheKey)) {
      const cached = articleListCache.get(cacheKey)!
      articles.value = cached.list
      total.value = cached.total
    }

    loading.value = true
    try {
      const result = await fetchArticles(query)
      articles.value = result.list
      total.value = result.total
      articleListCache.set(cacheKey, result)
      error.value = null
    }
    catch (err) {
      error.value = err
      if (!articleListCache.has(cacheKey)) {
        articles.value = []
        total.value = 0
      }
    }
    finally {
      loading.value = false
    }
  }

  watch(
    () => serializeQuery(query),
    () => {
      load()
    },
    { immediate: true },
  )

  function setPage(nextPage: number) {
    if (!Number.isFinite(nextPage) || nextPage < 1)
      return

    page.value = nextPage
  }

  function setFilters(filters: Partial<Pick<ArticleListQuery, 'categoryId' | 'tagId' | 'keyword'>>) {
    if (filters.categoryId !== undefined)
      query.categoryId = filters.categoryId
    if (filters.tagId !== undefined)
      query.tagId = filters.tagId
    if (filters.keyword !== undefined)
      query.keyword = filters.keyword

    query.pageNum = 1
  }

  return {
    articles,
    total,
    loading,
    error,
    refresh: (force?: boolean) => load(force ?? true),
    setPage,
    setFilters,
    page,
    pageSize,
    query,
  }
}

export function useBlogCategories() {
  const categories = shallowRef<BlogCategory[]>(categoriesCache ?? [])
  const loading = ref(!categoriesCache)
  const error = ref<unknown>(null)

  async function ensureCategories(force = false) {
    if (!force && categoriesCache) {
      categories.value = categoriesCache
      loading.value = false
      return
    }

    if (!force && categoriesPromise)
      return categoriesPromise

    const promise = fetchCategories()
      .then((result) => {
        categoriesCache = result
        categories.value = result
        error.value = null
        return result
      })
      .catch((err) => {
        error.value = err
        if (!categoriesCache)
          categories.value = []
        throw err
      })
      .finally(() => {
        categoriesPromise = null
        loading.value = false
      })

    categoriesPromise = promise
    loading.value = true
    await promise
  }

  ensureCategories().catch(() => {})

  return {
    categories,
    loading,
    error,
    refresh: () => ensureCategories(true),
  }
}

export function useBlogTags() {
  const tags = shallowRef<BlogTag[]>(tagsCache ?? [])
  const loading = ref(!tagsCache)
  const error = ref<unknown>(null)

  async function ensureTags(force = false) {
    if (!force && tagsCache) {
      tags.value = tagsCache
      loading.value = false
      return
    }

    if (!force && tagsPromise)
      return tagsPromise

    const promise = fetchTags()
      .then((result) => {
        tagsCache = result
        tags.value = result
        error.value = null
        return result
      })
      .catch((err) => {
        error.value = err
        if (!tagsCache)
          tags.value = []
        throw err
      })
      .finally(() => {
        tagsPromise = null
        loading.value = false
      })

    tagsPromise = promise
    loading.value = true
    await promise
  }

  ensureTags().catch(() => {})

  return {
    tags,
    loading,
    error,
    refresh: () => ensureTags(true),
  }
}

export function useArticleDetail(articleId: Ref<number | string | undefined>) {
  const article = shallowRef<BlogArticle | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)

  async function load(force = false) {
    const parsedId = Number(articleId.value)
    if (!Number.isFinite(parsedId))
      return

    if (!force && articleDetailCache.has(parsedId)) {
      article.value = articleDetailCache.get(parsedId) || null
    }

    loading.value = true

    try {
      const result = await fetchArticleDetail(parsedId)
      article.value = result
      articleDetailCache.set(parsedId, result)
      error.value = null
    }
    catch (err) {
      error.value = err
      if (!articleDetailCache.has(parsedId))
        article.value = null
    }
    finally {
      loading.value = false
    }
  }

  watch(
    articleId,
    () => {
      load()
    },
    { immediate: true },
  )

  return {
    article,
    loading,
    error,
    refresh: (force?: boolean) => load(force ?? true),
  }
}

export function useSiteInfo() {
  const siteInfo = shallowRef<SiteInfo | null>(siteInfoCache)
  const loading = ref(!siteInfoCache)
  const error = ref<unknown>(null)

  async function ensureSiteInfo(force = false) {
    if (!force && siteInfoCache) {
      siteInfo.value = siteInfoCache
      loading.value = false
      return siteInfoCache
    }

    if (!force && siteInfoPromise)
      return siteInfoPromise

    const promise = fetchSiteInfo()
      .then((result) => {
        siteInfoCache = result
        siteInfo.value = result
        error.value = null
        return result
      })
      .catch((err) => {
        error.value = err
        if (!siteInfoCache)
          siteInfo.value = null
        throw err
      })
      .finally(() => {
        siteInfoPromise = null
        loading.value = false
      })

    siteInfoPromise = promise
    loading.value = true
    return promise
  }

  ensureSiteInfo().catch(() => {})

  return {
    siteInfo,
    loading,
    error,
    refresh: () => ensureSiteInfo(true),
  }
}

export function useArticleComments(articleId: Ref<number | string | undefined>) {
  const comments = shallowRef<BlogComment[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<unknown>(null)

  async function load(force = false) {
    const parsedId = Number(articleId.value)
    if (!Number.isFinite(parsedId))
      return

    if (!force && articleCommentsCache.has(parsedId)) {
      const cached = articleCommentsCache.get(parsedId)!
      comments.value = cached.list
      total.value = cached.total
    }

    if (!force && articleCommentsPromise.has(parsedId))
      return articleCommentsPromise.get(parsedId)

    const promise = fetchComments({ articleId: parsedId, pageNum: 1, pageSize: 200 })
      .then((result) => {
        articleCommentsCache.set(parsedId, result)
        comments.value = result.list
        total.value = result.total
        error.value = null
        return result
      })
      .catch((err) => {
        error.value = err
        if (!articleCommentsCache.has(parsedId)) {
          comments.value = []
          total.value = 0
        }
        throw err
      })
      .finally(() => {
        articleCommentsPromise.delete(parsedId)
        loading.value = false
      })

    articleCommentsPromise.set(parsedId, promise)
    loading.value = true
    return promise
  }

  watch(
    articleId,
    () => {
      load()
    },
    { immediate: true },
  )

  async function submit(payload: Omit<CreateCommentPayload, 'articleId'>) {
    const parsedId = Number(articleId.value)
    if (!Number.isFinite(parsedId))
      throw new Error('文章 ID 无效')

    return submitComment({
      ...payload,
      articleId: parsedId,
    })
  }

  return {
    comments,
    total,
    loading,
    error,
    refresh: (force?: boolean) => load(force ?? true),
    submit,
  }
}
