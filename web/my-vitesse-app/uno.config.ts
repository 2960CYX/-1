import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      // 【Vibrant 主题】 调色板
      // 1. 品牌色 (替换为现代活力蓝)
      'brand': '#3B82F6', // (Tailwind Blue 500)
      'brand-soft': '#2563EB', // (Tailwind Blue 600)

      // 2. 背景色 (替换为纯白 / 深灰)
      'background': {
        light: '#FFFFFF', // (纯白，非常现代)
        dark: '#111827', // (Tailwind Gray 900)
      },

      // 3. 卡片/表层色 (高对比度)
      'surface': {
        light: '#F9FAFB', // (Tailwind Gray 50 - 极浅灰)
        dark: '#1F2937', // (Tailwind Gray 800)
      },

      // 4. 边框色
      'border': {
        light: '#E5E7EB', // (Tailwind Gray 200 - 清晰)
        dark: '#374151', // (Tailwind Gray 700)
      },

      // 5. 文本色 (高对比度)
      'text': {
        base: {
          light: '#111827', // (Tailwind Gray 900 - 深黑)
          dark: '#F3F4F6', // (Tailwind Gray 100 - 亮白)
        },
        muted: {
          light: '#6B7280', // (Tailwind Gray 500 - 中灰)
          dark: '#9CA3AF', // (Tailwind Gray 400)
        },
        subtle: {
          light: '#9CA3AF', // (Tailwind Gray 400)
          dark: '#6B7280', // (Tailwind Gray 500)
        },
      },

      // 6. (保留，用于 prose)
      'accent': {
        light: '#D1D5DB', // (Tailwind Gray 300)
        dark: '#4B5563', // (Tailwind Gray 600)
      },

      // 7. (用于按钮文字)
      'contrast': {
        light: '#FFFFFF', // (白色)
        dark: '#FFFFFF', // (白色)
      },
    },
    boxShadow: {
      'soft': '0 24px 48px -28px rgba(18, 24, 36, 0.32)',
      'soft-hover': '0 28px 54px -24px rgba(18, 24, 36, 0.42)',
      'soft-dark': '0 30px 60px -32px rgba(3, 8, 16, 0.70)',
    },
    fontFamily: {
      sans: '"Inter", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      serif: '"Playfair Display", "Noto Serif SC", "Songti SC", "STSong", "Times New Roman", serif',
    },
    maxWidth: {
      content: '72rem',
    },
    lineHeight: {
      relaxed: '1.75',
      snug: '1.35',
    },
  },
  shortcuts: [
    ['page-root', 'min-h-screen bg-background-light dark:bg-background-dark text-text-base-light dark:text-text-base-dark font-sans antialiased transition-colors duration-500 ease-out selection:bg-brand/15 selection:text-text-base-light dark:selection:bg-brand/20 dark:selection:text-text-base-dark'],
    ['page-container', 'mx-auto w-full max-w-content px-6 sm:px-8 lg:px-12'],
    ['brand-badge', 'inline-flex items-center gap-2 rounded-full border border-border-light/70 bg-surface-light/90 px-3 py-1 text-xs tracking-[0.4em] uppercase text-text-muted-light dark:border-border-dark/60 dark:bg-surface-dark/80 dark:text-text-muted-dark'],
    ['brand-button', 'inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-contrast-light transition-colors duration-300 hover:bg-brand-soft focus-visible:(outline-none ring-2 ring-brand/40) dark:bg-brand dark:hover:bg-brand-soft'],
    ['line-button', 'inline-flex items-center gap-2 rounded-full border border-border-light px-6 py-2.5 text-sm font-semibold text-text-base-light transition-all duration-300 hover:(border-brand text-brand) focus-visible:(outline-none ring-2 ring-brand/30) dark:border-border-dark dark:text-text-base-dark dark:hover:(border-brand text-brand)'],
    ['nav-link', 'relative text-sm font-medium text-text-muted-light transition-colors duration-300 hover:text-brand dark:text-text-muted-dark'],
    ['nav-link-active', 'text-text-base-light dark:text-text-base-dark after:(content-[""] absolute left-0 -bottom-1 h-[2px] w-full bg-brand rounded-full)'],
    ['icon-toggle', 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-light bg-surface-light text-text-base-light transition-all duration-300 hover:(border-brand text-brand) focus-visible:(outline-none ring-2 ring-brand/40) dark:border-border-dark dark:bg-surface-dark dark:text-text-base-dark dark:hover:(border-brand text-brand)'],
    ['section-heading', 'flex flex-col gap-2'],
    ['section-title', 'font-serif text-2xl font-semibold tracking-tight text-text-base-light dark:text-text-base-dark'],
    ['section-subtitle', 'text-sm text-text-muted-light dark:text-text-muted-dark'],
    ['card-title', 'font-serif text-2xl font-semibold leading-snug text-text-base-light transition-colors duration-300 group-hover:text-brand dark:text-text-base-dark'],
    ['card-meta', 'text-xs uppercase tracking-[0.35em] text-text-muted-light dark:text-text-muted-dark'],
    ['tag-pill', 'inline-flex items-center rounded-full bg-surface-light px-3 py-1 text-xs font-medium text-text-muted-light transition-colors duration-300 hover:(bg-brand/10 text-brand) group-hover:(bg-brand/10 text-brand) dark:bg-surface-dark dark:text-text-muted-dark dark:hover:(bg-brand/15 text-brand) dark:group-hover:(bg-brand/15 text-brand)'],
    ['page-shell', 'relative page-container py-16 md:py-20'],
    ['surface-card', 'relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border-light/80 bg-surface-light/95 p-8 shadow-soft transition-all duration-500 before:(pointer-events-none content-[""] absolute inset-0 rounded-[1.1rem] border border-transparent opacity-0 transition-all duration-500) after:(pointer-events-none content-[""] absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/12 to-transparent opacity-0 transition-opacity duration-500) hover:(-translate-y-1 shadow-soft-hover border-brand/50) hover:before:(border-brand/60 opacity-100) hover:after:(opacity-100) dark:border-border-dark/70 dark:bg-surface-dark/90 dark:shadow-soft-dark dark:hover:(border-brand/60 shadow-soft-dark -translate-y-0.5) dark:after:(from-brand/18)'],
    ['text-link', 'font-medium text-brand transition-colors duration-300 hover:text-brand-soft'],
    ['hero-title', 'font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-base-light dark:text-text-base-dark'],
    ['hero-lead', 'max-w-[52ch] text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark'],
    // === Arcanum 语义化新增快捷类 ===
    ['arcanum-label', 'block text-sm font-medium text-text-base-light dark:text-text-base-dark'],
    ['arcanum-input', 'rounded border border-border-light bg-surface-light px-4 py-3 text-base outline-none transition focus:border-brand dark:border-border-dark dark:bg-surface-dark'],
    ['arcanum-captcha', 'h-12 w-28 cursor-pointer rounded border border-border-light object-cover dark:border-border-dark'],
    ['card-section-header', 'space-y-4 border-b border-border-light pb-6 dark:border-border-dark'],
    ['eyebrow', 'text-xs uppercase tracking-[0.4em] text-text-subtle-light dark:text-text-subtle-dark'],
    ['eyebrow-muted-sm', 'text-xs font-semibold uppercase tracking-[0.2em] text-text-muted-light dark:text-text-muted-dark'],
    ['body-muted', 'text-base leading-relaxed text-text-muted-light dark:text-text-muted-dark'],
    ['body-muted-sm', 'text-sm leading-relaxed text-text-muted-light dark:text-text-muted-dark'],
    ['text-muted-xs', 'text-xs text-text-muted-light dark:text-text-muted-dark'],
    ['text-muted-sm', 'text-sm text-text-muted-light dark:text-text-muted-dark'],
    ['heading-xl', 'font-serif text-xl font-semibold text-text-base-light dark:text-text-base-dark'],
    ['heading-lg', 'text-lg font-semibold text-text-base-light dark:text-text-base-dark'],
    ['brand-title-xl', 'font-serif text-2xl font-semibold tracking-tight text-text-base-light dark:text-text-base-dark'],
    ['row-between', 'flex items-center justify-between'],
    ['stack-3', 'flex flex-col gap-3'],
    ['stack-4', 'flex flex-col gap-4'],
    ['stack-6', 'flex flex-col gap-6'],
    ['cluster-3', 'flex flex-wrap gap-3'],
    ['stack-responsive-between-6', 'flex flex-col gap-6 md:flex-row md:items-center md:justify-between'],
    ['stack-responsive-between-4', 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between'],
    ['layout-header', 'sticky top-0 z-50 border-b border-border-light/60 bg-surface-light/80 backdrop-blur-md transition-colors dark:border-border-dark/50 dark:bg-surface-dark/80'],
    ['layout-footer-text', 'border-t border-border-light/60 py-12 text-sm text-text-muted-light transition-colors dark:border-border-dark/50 dark:text-text-muted-dark'],
    ['toast-shell', 'pointer-events-none absolute right-4 top-2 z-[60] min-w-[240px] rounded-md border px-4 py-2 text-sm shadow-lg'],
    ['typography-prose-lg', 'prose prose-lg dark:prose-invert'],
    ['skeleton-surface', 'rounded animate-pulse bg-surface-light/70 dark:bg-surface-dark/60'],
    ['skeleton-border-60', 'rounded animate-pulse bg-border-light/60 dark:bg-border-dark/60'],
    ['skeleton-border-70', 'rounded animate-pulse bg-border-light/70 dark:bg-border-dark/70'],
    ['skeleton-border-40', 'rounded animate-pulse bg-border-light/40 dark:bg-border-dark/40'],
    ['surface-note', 'rounded border border-border-light bg-surface-light/60 p-6 text-sm text-text-muted-light dark:border-border-dark dark:bg-surface-dark/30 dark:text-text-muted-dark'],
    ['surface-dashed-note', 'rounded border border-dashed border-border-light/70 p-6 text-sm text-text-muted-light dark:border-border-dark/70 dark:text-text-muted-dark'],
    ['surface-dashed-note-sm', 'rounded border border-dashed border-border-light/70 p-4 text-sm text-text-muted-light dark:border-border-dark/50 dark:text-text-muted-dark'],
    ['surface-bordered-body-sm', 'rounded border border-border-light p-4 text-sm leading-relaxed dark:border-border-dark'],
    ['sidebar-rule', 'flex flex-col gap-1 border-l border-border-light pl-5 dark:border-border-dark'],
    ['sidebar-rule-strong', 'border-l-2 border-border-light pl-4 dark:border-border-dark'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.15,
      extraProperties: {
        'vertical-align': 'middle',
      },
    }),
    presetTypography({
      cssExtend: {
        '.prose': {
          '--un-prose-body': 'var(--un-colors-text-base-light)',
          '--un-prose-headings': 'var(--un-colors-text-base-light)',
          '--un-prose-links': 'var(--un-colors-brand)',
          '--un-prose-bold': 'var(--un-colors-text-base-light)',
          '--un-prose-counters': 'var(--un-colors-text-muted-light)',
          '--un-prose-hr': 'var(--un-colors-border-light)',
          '--un-prose-quotes': 'var(--un-colors-text-muted-light)',
          '--un-prose-quote-borders': 'var(--un-colors-accent-light)',
          '--un-prose-code': 'var(--un-colors-brand)',
          '--un-prose-th-borders': 'var(--un-colors-border-light)',
          '--un-prose-td-borders': 'var(--un-colors-border-light)',
          'font-family': 'var(--un-font-sans)',
        },
        '.prose h1, .prose h2, .prose h3, .prose h4': {
          'font-family': 'var(--un-font-serif)',
        },
        '.prose strong': {
          'font-family': 'var(--un-font-serif)',
          'font-weight': 600,
        },
        '.prose a:hover': {
          color: 'var(--un-colors-brand-soft)',
        },
        '.dark .prose': {
          '--un-prose-body': 'var(--un-colors-text-base-dark)',
          '--un-prose-headings': 'var(--un-colors-text-base-dark)',
          '--un-prose-links': 'var(--un-colors-brand)',
          '--un-prose-bold': 'var(--un-colors-text-base-dark)',
          '--un-prose-counters': 'var(--un-colors-text-muted-dark)',
          '--un-prose-hr': 'var(--un-colors-border-dark)',
          '--un-prose-quotes': 'var(--un-colors-text-muted-dark)',
          '--un-prose-quote-borders': 'var(--un-colors-accent-dark)',
          '--un-prose-code': 'var(--un-colors-accent-dark)',
          '--un-prose-th-borders': 'var(--un-colors-border-dark)',
          '--un-prose-td-borders': 'var(--un-colors-border-dark)',
        },
      },
    }),
    presetWebFonts({
      fonts: {
        serif: [
          {
            name: 'Playfair Display',
            weights: [500, 600, 700],
          },
          {
            name: 'Noto Serif SC',
            weights: [500, 600],
          },
        ],
        sans: [
          {
            name: 'Inter',
            weights: [400, 500, 600, 700],
          },
          {
            name: 'Noto Sans SC',
            weights: [400, 500, 600],
          },
        ],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: [
    'prose',
    'prose-lg',
    'dark:prose-invert',
    'group',
  ],
})
