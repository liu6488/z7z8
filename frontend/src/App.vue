<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { PhBookOpen, PhMoon, PhPenNib, PhSun } from '@phosphor-icons/vue'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
    <!-- 滚动进度条 -->
    <div class="progress-bar" :style="{ width: '0%' }" />

    <!-- 导航栏 -->
    <header class="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <RouterLink to="/" class="group flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-orange-500 transition-all duration-300 group-hover:bg-orange-700 group-hover:text-white dark:bg-zinc-800 dark:text-orange-400 dark:group-hover:bg-orange-700 dark:group-hover:text-white">
            <PhBookOpen :size="18" weight="fill" />
          </span>
          <span class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            随笔集
          </span>
        </RouterLink>

        <nav class="flex items-center gap-2">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            :title="isDark ? '切换到亮色' : '切换到暗色'"
            @click="toggle"
          >
            <PhSun v-if="isDark" :size="18" />
            <PhMoon v-else :size="18" />
          </button>
          <button
            class="btn btn-primary h-9 px-4"
            @click="router.push('/posts/new')"
          >
            <PhPenNib :size="15" weight="fill" />
            写文章
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-zinc-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-zinc-400 dark:text-zinc-500">
        <span>随笔集</span>
        <span>Vue 3 + Next.js + Prisma</span>
      </div>
    </footer>
  </div>
</template>
