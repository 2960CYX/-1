<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import { fetchCaptchaImage } from '~/services/auth'
import { useAuthStore } from '~/stores/auth'
import { notifyError } from '~/utils/notification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
})

const captchaEnabled = ref(false)
const captchaImg = ref<string>('')
const captchaLoading = ref(false)

async function loadCaptcha() {
  try {
    captchaLoading.value = true
    const data = await fetchCaptchaImage()
    captchaEnabled.value = Boolean(data?.captchaEnabled)
    form.uuid = data?.uuid || ''
    captchaImg.value = data?.img ? `data:image/jpeg;base64,${data.img}` : ''
  }
  catch (error) {
    console.warn('[Captcha] 获取验证码失败', error)
  }
  finally {
    captchaLoading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
})

const loading = computed(() => authStore.loading)
const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.length > 0 ? redirect : '/'
})

async function handleSubmit() {
  try {
    await authStore.login({
      username: form.username.trim(),
      password: form.password,
      code: captchaEnabled.value ? form.code : undefined,
      uuid: captchaEnabled.value ? form.uuid : undefined,
    })
    router.replace(redirectTarget.value)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
    notifyError(message)
    // 登录失败后刷新验证码，避免验证码过期导致的连续失败
    if (captchaEnabled.value)
      loadCaptcha()
  }
}
</script>

<template>
  <ArcanumLayout>
    <section class="mx-auto max-w-xl py-20">
      <header class="mb-10 text-center space-y-4">
        <h1 class="text-3xl font-semibold">
          登录简栈控制台
        </h1>
        <p class="text-base text-text-muted-light dark:text-text-muted-dark">
          使用若依后台的账号密码完成登录后，即可访问简栈的受限内容与管理功能。
        </p>
      </header>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label for="username" class="arcanum-label">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            autocomplete="username"
            required
            class="w-full arcanum-input"
          >
        </div>

        <div class="space-y-2">
          <label for="password" class="arcanum-label">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full arcanum-input"
          >
        </div>

        <div v-if="captchaEnabled" class="space-y-2">
          <label for="code" class="arcanum-label">验证码</label>
          <div class="flex items-center gap-3">
            <input
              id="code"
              v-model="form.code"
              type="text"
              autocomplete="off"
              required
              placeholder="请输入右侧图片中的字符"
              class="flex-1 arcanum-input"
            >
            <button type="button" class="line-button" :disabled="captchaLoading" @click="loadCaptcha">
              刷新
            </button>
            <img
              v-if="captchaImg"
              :src="captchaImg"
              alt="验证码"
              class="arcanum-captcha"
              @click="loadCaptcha"
            >
          </div>
        </div>

        <button
          type="submit"
          class="w-full brand-button"
          :disabled="loading"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <footer class="mt-8 text-center text-muted-sm">
        没有账号？请联系管理员获取权限。
      </footer>
    </section>
  </ArcanumLayout>
</template>
