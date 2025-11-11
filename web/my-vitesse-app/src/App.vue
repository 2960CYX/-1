<script setup lang="ts">
const isDark = useDark()
const preferredDark = usePreferredDark()

useHead({
  title: '简栈 · 以简驭繁的个人博客',
  meta: [
    {
      name: 'description',
      content: '简栈聚焦内容架构、体验设计与工程策略，将若依博客的真实数据转译为高质感的中文阅读体验。',
    },
    {
      name: 'theme-color',
      content: () => (isDark.value ? '#101823' : '#f6efe3'),
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => (preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg'),
    },
  ],
})
</script>

<template>
  <RouterView />
</template>
