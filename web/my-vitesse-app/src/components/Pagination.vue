<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page: number
  pageSize: number
  total: number
  maxButtons?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxButtons: 7,
})

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const pageCount = computed(() => {
  const size = props.pageSize || 1
  const count = Math.ceil((props.total || 0) / size)
  return count > 0 ? count : 1
})

function toPage(n: number) {
  if (n < 1 || n > pageCount.value || n === props.page)
    return
  emit('update:page', n)
}

const pages = computed(() => {
  const count = pageCount.value
  const max = props.maxButtons!
  const current = props.page

  if (count <= max)
    return Array.from({ length: count }, (_, i) => i + 1) as Array<number | '...'>

  const result: (number | '...')[] = []
  result.push(1)

  const windowSize = Math.floor((max - 3) / 2) // reserve for first, last, and two ellipses
  let start = Math.max(2, current - windowSize)
  let end = Math.min(count - 1, current + windowSize)

  const desired = max - 3
  const actual = end - start + 1
  if (actual < desired) {
    const missing = desired - actual
    if (start === 2)
      end = Math.min(count - 1, end + missing)
    else if (end === count - 1)
      start = Math.max(2, start - missing)
  }

  if (start > 2)
    result.push('...')
  for (let i = start; i <= end; i++)
    result.push(i)
  if (end < count - 1)
    result.push('...')
  result.push(count)
  return result
})
</script>

<template>
  <nav
    class="flex flex-wrap items-center gap-2"
    aria-label="分页导航"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1 line-button"
      :disabled="page <= 1"
      @click="toPage(page - 1)"
    >
      <div class="i-heroicons-chevron-left-20-solid text-base" />
      上一页
    </button>

    <ul class="flex items-center gap-2">
      <li v-for="p in pages" :key="String(p)">
        <button
          v-if="p !== '...'"
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-border-light/60 px-3 py-1 text-sm transition dark:border-border-dark/60"
          :class="p === page ? 'bg-brand/10 text-brand dark:bg-brand-soft/30' : 'text-text-muted-light dark:text-text-muted-dark hover:text-brand'"
          @click="toPage(p as number)"
          :aria-current="p === page ? 'page' : undefined"
        >
          {{ p }}
        </button>
        <span v-else class="px-2 text-text-muted-light dark:text-text-muted-dark">…</span>
      </li>
    </ul>

    <button
      type="button"
      class="inline-flex items-center gap-1 line-button"
      :disabled="page >= pageCount"
      @click="toPage(page + 1)"
    >
      下一页
      <div class="i-heroicons-chevron-right-20-solid text-base" />
    </button>
  </nav>
</template>