<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import Pagination from '~/components/Pagination.vue'
import { useArticleList } from '~/composables/useBlog'

const {
  articles,
  loading,
  total,
  page,
  pageSize,
  setPage,
} = useArticleList({ pageSize: 12 })

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

function formatDate(timestamp?: string) {
  if (!timestamp)
    return '发布时间待定'
  try {
    return timestamp.split(' ')[0]
  }
  catch {
    return timestamp
  }
}

useHead(() => ({
  title: '文章归档',
  meta: [
    { name: 'description', content: '浏览所有文章，支持分页跳转' },
  ],
}))

const isLoading = computed(() => loading.value)
</script>

<template>
  <ArcanumLayout>
    <section class="py-12 page-container lg:py-16">
      <header class="row-between">
        <div>
          <p class="eyebrow-muted-sm">文章列表</p>
          <h1 class="heading-lg">文章归档</h1>
          <p class="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
            共 {{ total }} 篇，支持页码跳转。
          </p>
        </div>
      </header>

      <div v-if="isLoading" class="mt-8 grid gap-8 md:grid-cols-2">
        <div v-for="s in 6" :key="s" class="animate-pulse surface-card">
          <div class="h-3 w-24 rounded-full bg-border-light/60 dark:bg-border-dark/60" />
          <div class="mt-4 h-6 w-3/4 rounded bg-border-light/70 dark:bg-border-dark/70" />
          <div class="mt-4 space-y-2">
            <div class="h-4 w-full rounded bg-border-light/60 dark:bg-border-dark/60" />
            <div class="h-4 w-5/6 rounded bg-border-light/50 dark:bg-border-dark/50" />
          </div>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-8 md:grid-cols-2">
        <article
          v-for="article in articles"
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
                {{ formatDate(article.createTime) }}
              </span>
            </div>
            <h3 class="mt-4 card-title">
              {{ article.title }}
            </h3>
            <p class="mt-4 body-muted-sm">
              {{ article.summary || '这篇文章暂未提供摘要，点击查看完整内容。' }}
            </p>
          </RouterLink>
        </article>
      </div>

      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <Pagination :page="page" :page-size="pageSize" :total="total" @update:page="onUpdatePage" />
      </div>
    </section>
  </ArcanumLayout>
</template>