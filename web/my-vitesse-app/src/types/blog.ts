export interface BlogArticle {
  articleId: number
  userId?: number
  title: string
  summary?: string
  content?: string
  categoryId?: number
  categoryName?: string
  coverImageUrl?: string
  status?: string
  allowComment?: string
  viewCount?: number
  tagIds?: number[]
  createTime?: string
  updateTime?: string
}

export interface BlogArticleListItem extends BlogArticle {
  summary: string
}

export interface BlogCategory {
  categoryId: number
  name: string
  description?: string
  sort?: number
}

export interface BlogTag {
  tagId: number
  name: string
}

export interface ArticleListQuery {
  pageNum?: number
  pageSize?: number
  categoryId?: number | null
  tagId?: number | null
  title?: string
  keyword?: string
  status?: string
}

export interface ArticleListResult {
  list: BlogArticleListItem[]
  total: number
  pageNum: number
  pageSize: number
}

export interface SiteInfo {
  heroTitle: string
  heroSubtitle: string
  heroDescription?: string
  heroKicker?: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
  featuredCategoryIds?: number[]
  showcaseTagIds?: number[]
  contactEmail?: string
  timeline?: Array<{
    year: string
    title: string
    description: string
  }>
  principles?: Array<{
    title: string
    description: string
  }>
}

export interface BlogComment {
  commentId: number
  articleId: number
  userId?: number
  nickname: string
  content: string
  createTime?: string
  parentId?: number
  children?: BlogComment[]
}

export interface CommentListQuery {
  articleId: number
  pageNum?: number
  pageSize?: number
}

export interface CommentListResult {
  list: BlogComment[]
  total: number
}

export interface CreateCommentPayload {
  articleId: number
  nickname?: string
  content: string
  parentId?: number
  code?: string
  uuid?: string
}
