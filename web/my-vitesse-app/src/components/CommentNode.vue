<script setup lang="ts">
import type { BlogComment } from '~/types/blog'
import DOMPurify from 'dompurify'
defineOptions({ name: 'CommentNode' })

const props = defineProps<{
  node: (BlogComment & { children?: any[] })
  sanitizeText: (s?: string) => string
  getRoleLabel: (role: 'author' | 'me' | 'member' | 'guest') => string
  getCommentRole: (c: Partial<BlogComment>) => 'author' | 'me' | 'member' | 'guest'
  formatDisplayDate: (dt?: string | null) => string
}>()

const emit = defineEmits<{
  (e: 'reply', comment: BlogComment): void
}>()

function onReply() {
  emit('reply', props.node as BlogComment)
}

const allowedTags = ['strong', 'em', 'ul', 'li', 'p', 'br']
function sanitizeHtml(html?: string) {
  if (!html) return ''
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: [] })
}
</script>

<template>
  <li class="surface-bordered-body-sm">
    <div class="row-between text-muted-xs">
      <span class="inline-flex items-center gap-2">
        <span class="text-text-base-light font-medium dark:text-text-base-dark">{{ props.node.nickname }}</span>
        <span class="rounded-full bg-surface-light px-2 py-0.5 text-xs dark:bg-surface-dark">
          {{ props.getRoleLabel(props.getCommentRole(props.node)) }}
        </span>
      </span>
      <span>{{ props.formatDisplayDate(props.node.createTime) }}</span>
    </div>
    <div
      class="mt-3 comment-content text-text-base-light dark:text-text-base-dark"
      v-html="sanitizeHtml(props.node.content)"
    />
    <div class="mt-2 text-muted-xs">
      <button type="button" class="text-link" @click="onReply">回复</button>
    </div>

    <ul
      v-if="props.node.children && props.node.children.length"
      class="mt-4 space-y-3 border-l pl-4 border-surface-light dark:border-surface-dark"
    >
      <CommentNode
        v-for="child in props.node.children"
        :key="child.commentId"
        :node="child"
        :sanitizeText="props.sanitizeText"
        :getRoleLabel="props.getRoleLabel"
        :getCommentRole="props.getCommentRole"
        :formatDisplayDate="props.formatDisplayDate"
        @reply="$emit('reply', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.comment-content ul {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0 0.5rem;
}
.comment-content li {
  margin: 0.25rem 0;
}
</style>