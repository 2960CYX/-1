<script setup lang="ts">
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import { useSiteInfo } from '~/composables/useBlog'

const { siteInfo } = useSiteInfo()
const title = '简栈通讯 · 敬请期待'
const description = '简栈通讯正在筹备中，欢迎先关注我们的更新或写信与我们交流。'
const contactLink = 'https://www.jianzhan.app/#contact'
</script>

<template>
  <ArcanumLayout>
    <section class="surface-card">
      <div class="space-y-4">
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-lead">{{ description }}</p>
        <div class="stack-3">
          <RouterLink to="/" class="line-button">
            返回首页
            <div class="i-heroicons-home-20-solid text-base" />
          </RouterLink>
          <a :href="contactLink" target="_blank" rel="noopener noreferrer" class="brand-button">
            写信给我们
            <div class="i-heroicons-at-symbol-20-solid text-base" />
          </a>
        </div>
      </div>
    </section>
  </ArcanumLayout>
</template>