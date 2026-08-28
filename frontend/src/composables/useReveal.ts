import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * 滚动揭示动画辅助：监听容器内所有 [data-reveal] 元素，
 * 进入视口后添加 .is-visible 类触发 CSS 过渡。
 * 纯样式辅助，不改变任何业务逻辑。
 */
export function useReveal(containerRef: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const el = containerRef.value
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      // 无 IO 支持时直接显示，保证内容可用
      el.querySelectorAll('[data-reveal]').forEach((n) => n.classList.add('is-visible'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    )
    // 先标记容器，让初始隐藏只在 JS 可用时生效
    el.classList.add('reveal-ready')
    el.querySelectorAll('[data-reveal]').forEach((n) => observer?.observe(n))
  })

  onBeforeUnmount(() => observer?.disconnect())
}
