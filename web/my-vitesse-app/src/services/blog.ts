import type { AxiosRequestConfig } from 'axios'
import type {
  RuoYiDataResponse,
  RuoYiListResponse,
  RuoYiResponse,
} from '~/types/api'
import type {
  ArticleListQuery,
  ArticleListResult,
  BlogArticle,
  BlogCategory,
  BlogComment,
  BlogTag,
  CommentListQuery,
  CommentListResult,
  CreateCommentPayload,
  SiteInfo,
} from '~/types/blog'
import { notifyError } from '~/utils/notification'
import httpClient from '~/utils/request'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_LOOKUP_PAGE_SIZE = 100
const DEFAULT_COMMENT_PAGE_SIZE = 10

const PUBLISHED_STATUS = '1'

const FALLBACK_SITE_INFO: SiteInfo = {
  heroTitle: '简栈 · 以简驭繁的个人博客系统',
  heroSubtitle: '写给认真经营内容的人',
  heroDescription: '简栈聚焦内容架构、知识整理与工程策略，让若依后端的真实数据成为轻盈的阅读体验。',
  heroKicker: '简栈志 · 你的内容生产栈',
  ctaText: '立即探索',
  ctaLink: '/article',
  secondaryCtaText: '关于本站',
  secondaryCtaLink: '/about',
  contactEmail: 'hello@jianzhansite.com',
  timeline: [
    {
      year: '2023',
      title: '简栈构想浮现',
      description: '提出「以简驭繁」的写作工作流，梳理个人知识栈与前端展现方式。',
    },
    {
      year: '2024',
      title: '与若依后端贯通',
      description: '完成文章、分类与标签模块的数据对接，确保管理端与前台体验一致。',
    },
    {
      year: '2025',
      title: '自托管生产可用',
      description: '加入权限、通知与缓存策略，让自托管部署也具备可观测性与稳定性。',
    },
  ],
  principles: [
    {
      title: '以简为纲',
      description: '所有能力围绕写作与发布的关键路径设计，避免多余干扰。',
    },
    {
      title: '数据自洽',
      description: '前后端统一字段语义与校验规则，保证内容在任意终端都稳定可用。',
    },
    {
      title: '持续复用',
      description: '文章、组件与写作模板都可复用，方便个人长期积累知识资产。',
    },
  ],
}



function compactParams<TRecord extends Record<string, unknown>>(input: TRecord) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

async function safeGet<T>(url: string, config?: AxiosRequestConfig) {
  const response = await httpClient.get<RuoYiResponse>(url, config)
  return response.data as RuoYiDataResponse<T> | RuoYiListResponse<T>
}

export async function fetchArticles(query: ArticleListQuery = {}): Promise<ArticleListResult> {
  const pageNum = query.pageNum && query.pageNum > 0 ? query.pageNum : 1
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : DEFAULT_PAGE_SIZE

  const requestQuery = compactParams({
    pageNum,
    pageSize,
    categoryId: query.categoryId ?? undefined,
    tagId: query.tagId ?? undefined,
    title: query.keyword ?? query.title ?? undefined,
    status: query.status ?? PUBLISHED_STATUS,
    delFlag: '0',
  })

  try {
    const response = await safeGet<BlogArticle>('/blog/article/list', {
      params: requestQuery,
    }) as RuoYiListResponse<BlogArticle>

    const rows = response?.rows ?? []
    const total = typeof response?.total === 'number' ? response.total : rows.length

    return {
      list: rows.map(row => ({
        ...row,
        summary: row.summary ?? '',
      })),
      total,
      pageNum,
      pageSize,
    }
  }
  catch (error) {
    notifyError('文章列表加载失败，请稍后重试')
    throw error
  }
}

export async function fetchArticleDetail(articleId: number): Promise<BlogArticle> {
  if (!Number.isFinite(articleId))
    throw new Error('文章 ID 无效')

  try {
    const response = await safeGet<BlogArticle>(`/blog/article/${articleId}`)
    const data = (response as RuoYiDataResponse<BlogArticle> | undefined)?.data

    if (!data)
      throw new Error('文章数据为空')

    return data
  }
  catch (error) {
    notifyError('获取文章详情失败，请稍后重试')
    throw error
  }
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  try {
    const response = await safeGet<BlogCategory>('/blog/category/list', {
      params: {
        pageNum: 1,
        pageSize: DEFAULT_LOOKUP_PAGE_SIZE,
      },
    }) as RuoYiListResponse<BlogCategory>

    return response?.rows ?? []
  }
  catch (error) {
    notifyError('分类数据加载失败')
    throw error
  }
}

export async function fetchTags(): Promise<BlogTag[]> {
  try {
    const response = await safeGet<BlogTag>('/blog/tag/list', {
      params: {
        pageNum: 1,
        pageSize: DEFAULT_LOOKUP_PAGE_SIZE,
      },
    }) as RuoYiListResponse<BlogTag>

    return response?.rows ?? []
  }
  catch (error) {
    notifyError('标签数据加载失败')
    throw error
  }
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  try {
    const response = await safeGet<SiteInfo>('/blog/site/info')
    const data = (response as RuoYiDataResponse<SiteInfo> | undefined)?.data

    if (data)
      return { ...FALLBACK_SITE_INFO, ...data }
  }
  catch (error) {
    // 保留原始错误日志，通知逻辑在 safeGet 中处理
    console.warn('[Site] 使用后备站点信息', error)
  }

  return FALLBACK_SITE_INFO
}

export async function fetchComments(query: CommentListQuery): Promise<CommentListResult> {
  if (!Number.isFinite(query.articleId))
    throw new Error('文章 ID 无效')

  const pageNum = query.pageNum && query.pageNum > 0 ? query.pageNum : 1
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : DEFAULT_COMMENT_PAGE_SIZE

  try {
    const response = await safeGet<BlogComment>('/blog/comment/list', {
      params: compactParams({
        articleId: query.articleId,
        status: '1',
        delFlag: '0',
        pageNum,
        pageSize,
      }),
    }) as RuoYiListResponse<BlogComment>

    const rows = response?.rows ?? []
    const total = typeof response?.total === 'number' ? response.total : rows.length

    return {
      list: rows,
      total,
    }
  }
  catch (error) {
    notifyError('评论列表加载失败，请稍后重试')
    throw error
  }
}

export async function submitComment(payload: CreateCommentPayload): Promise<RuoYiDataResponse<unknown>> {
  if (!payload.content)
    throw new Error('评论内容不能为空')

  try {
    const response = await httpClient.post<RuoYiDataResponse<unknown>>('/blog/comment', payload)
    return response.data
  }
  catch (error) {
    notifyError('评论提交失败，请稍后重试')
    throw error
  }
}
