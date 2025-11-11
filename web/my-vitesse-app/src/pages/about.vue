<script setup lang="ts">
import { computed } from 'vue'
import ArcanumLayout from '~/components/ArcanumLayout.vue'
import { useSiteInfo } from '~/composables/useBlog'
import { notify } from '~/utils/notification'

const { siteInfo } = useSiteInfo()

const aboutTitle = computed(() => '关于简栈')
const aboutDescription = computed(() => siteInfo.value?.heroDescription
  ?? '简栈致力于打造以简驭繁的个人写作工作流，让策略与执行力兼具的内容更易被构建与复用。')
const principles = computed(() => siteInfo.value?.principles ?? [])
const timeline = computed(() => siteInfo.value?.timeline ?? [])
const contactEmail = computed(() => siteInfo.value?.contactEmail ?? 'hello@jianzhansite.com')

useHead(() => ({
  title: `${aboutTitle.value} · 简栈的写作蓝图`,
  meta: [
    {
      name: 'description',
      content: aboutDescription.value,
    },
  ],
}))

function handleNewsletterClick() {
  notify('简栈通讯正在筹备中，敬请期待', 'info')
}
</script>

<template>
  <ArcanumLayout>
    <section class="space-y-12">
      <header class="group surface-card">
        <span class="brand-badge">关于</span>
        <h1 class="mt-4 text-4xl hero-title">
          {{ aboutTitle }}
        </h1>
        <p class="mt-4 text-lg hero-lead">
          {{ aboutDescription }}
        </p>
      </header>

      <section class="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <div class="group space-y-6 surface-card">
          <h2 class="text-2xl section-title">
            价值主张
          </h2>
          <p class="text-base hero-lead">
            我们相信高质感的数字产品来自严整的思考框架。简栈沿着内容、设计与工程三条脉络推进，构建可持续迭代的中文知识系统。
          </p>
          <ul v-if="principles.length" class="mt-2 space-y-4">
            <li
              v-for="principle in principles"
              :key="principle.title"
              class="sidebar-rule-strong"
            >
              <h3 class="heading-xl">
                {{ principle.title }}
              </h3>
              <p class="mt-2 body-muted-sm">
                {{ principle.description }}
              </p>
            </li>
          </ul>
          <p v-else class="text-muted-sm">
            站点暂未配置具体价值主张，我们会尽快补充内容。
          </p>
        </div>

        <article class="group typography-prose-lg surface-card">
          <h2>写作方法论</h2>
          <p>
            每篇文章通常遵循「背景 · 论证 · 模型 · 验证 · 实践」的结构。我们希望观点既有理论深度，又能落回真实业务的执行场景。
          </p>
          <h3>你会看到什么？</h3>
          <ul>
            <li>对设计系统与组件库的结构化拆解</li>
            <li>以数据与用户研究为支撑的体验决策</li>
            <li>从调研笔记到交付代码的落地流程</li>
          </ul>
          <p>
            我们更注重条理与逻辑，而非视觉噱头。所有案例均来自真实项目经历与长期验证的实践。
          </p>
        </article>
      </section>

      <section class="group surface-card">
        <h2 class="text-2xl section-title">
          里程碑
        </h2>
        <ol v-if="timeline.length" class="mt-6 space-y-4">
          <li
            v-for="item in timeline"
            :key="`${item.year}-${item.title}`"
            class="sidebar-rule"
          >
            <span class="eyebrow-muted-sm">
              {{ item.year }}
            </span>
            <p class="heading-xl">
              {{ item.title }}
            </p>
            <p class="body-muted-sm">
              {{ item.description }}
            </p>
          </li>
        </ol>
        <p v-else class="mt-4 text-muted-sm">
          站点还没有发布公开的里程碑，将在后续版本补充。
        </p>
      </section>

      <section class="group surface-card">
        <div class="stack-responsive-between-6">
          <div class="space-y-3">
            <h2 class="text-2xl section-title">
              与我们交流
            </h2>
            <p class="text-base hero-lead md:max-w-md">
              欢迎分享你的项目、团队实践或合作想法。简栈乐于与追求深度的同行交换思维。
            </p>
          </div>
          <div class="stack-3 md:items-end">
            <a class="brand-button" href="https://www.jianzhan.app/#contact" target="_blank" rel="noopener noreferrer">
              写信给我们
              <div class="i-heroicons-at-symbol-20-solid text-base" />
            </a>
            <button type="button" class="line-button" @click="handleNewsletterClick">
              订阅简栈通讯
              <div class="i-carbon-email text-base" />
            </button>
          </div>
        </div>
      </section>
    </section>
  </ArcanumLayout>
</template>
