<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HelpChat from '~/components/HelpChat.vue'
import { useAuthStore } from '~/stores/auth'
import { notifyError, subscribeNotifications } from '~/utils/notification'

const navLinks = [
  { label: '首页', to: '/' },
  { label: '关于', to: '/about' },
]

const isDark = useDark()
const toggleDark = useToggle(isDark)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const activePath = computed(() => route.path)

function isLinkCurrent(to: string) {
  if (to === '/')
    return activePath.value === '/'
  return activePath.value.startsWith(to)
}

const currentYear = computed(() => new Date().getFullYear())
const isAuthenticated = computed(() => authStore.isAuthenticated)
const displayName = computed(() =>
  authStore.profile?.nickName || authStore.profile?.userName || '访客',
)

async function handleLogout() {
  try {
    await authStore.logout({ remote: true })
    router.push('/login')
  }
  catch (error) {
    console.error('[Auth] Logout failed', error)
        notifyError('退出登录失败，请稍后再试')
  }
}

// 简易通知提示（顶部右侧显示，3 秒自动隐藏）
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')
let toastTimer: number | null = null

onMounted(() => {
  subscribeNotifications((detail) => {
    toastMessage.value = detail.message
    toastType.value = detail.type
    toastVisible.value = true
    if (toastTimer)
      window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      toastVisible.value = false
    }, 3000)
  })
})
</script>

<template>
  <div class="page-root">
    <header class="layout-header">
      <div class="row-between py-4 page-container lg:py-5">
        <RouterLink to="/" class="flex items-baseline gap-3">
          <span class="brand-badge">
            简栈志
          </span>
          <span class="brand-title-xl">
            简栈
          </span>
        </RouterLink>
        <nav class="flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ 'nav-link-active': isLinkCurrent(link.to) }"
          >
            {{ link.label }}
          </RouterLink>
          <button type="button" class="icon-toggle" @click="toggleDark()">
            <span class="sr-only">切换深浅模式</span>
            <div class="i-line-md-moon-filled-to-sunny-filled-loop-transition dark:i-line-md-sunny-filled-loop-to-moon-filled-transition text-xl" />
          </button>
          <RouterLink
            v-if="!isAuthenticated"
            to="/login"
            class="text-sm line-button"
          >
            登录
          </RouterLink>
          <div v-else class="flex items-center gap-3 text-sm">
            <span class="text-text-muted-light dark:text-text-muted-dark">
              欢迎，{{ displayName }}
            </span>
            <button type="button" class="text-sm line-button" @click="handleLogout">
              退出
            </button>
          </div>
        </nav>
      </div>
      <!-- 简易通知提示 -->
      <div
        v-if="toastVisible"
        class="toast-shell"
        :class="[
          toastType === 'error' ? 'border-red-400 bg-red-50 text-red-700 dark:(border-red-600 bg-red-900/30 text-red-200)'
          : toastType === 'success' ? 'border-green-400 bg-green-50 text-green-700 dark:(border-green-600 bg-green-900/30 text-green-200)'
            : 'border-slate-300 bg-surface-light text-text-base-light dark:(border-slate-600 bg-surface-dark text-text-base-dark)',
        ]"
      >
        {{ toastMessage }}
      </div>
    </header>

    <main class="page-shell">
      <slot />
    </main>

    <footer class="page-container layout-footer-text">
      <div class="stack-responsive-between-4">
        <p>© {{ currentYear }} 简栈 · 保留所有权利。</p>
        <div class="flex gap-6">
          <a class="text-link" href="mailto:hello@jianzhansite.com">联系作者</a>
          <RouterLink class="text-link" to="/about">
            关于本站
          </RouterLink>
        </div>
      </div>
    </footer>
    <HelpChat />
  </div>
</template>
