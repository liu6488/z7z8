<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { IconBookOpen, IconPencil, IconMoon, IconSun } from '@phosphor-icons/vue'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
    <!-- 滚动进度条 -->
    <div class="progress-bar" :style="{ width: '0%' }" />

    <!-- 导航栏 -->
    <header class="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <RouterLink to="/" class="group flex items-center gap-3">
          <IconBookOpen size={28} weight="fill" class="text-indigo-600 transition-transform group-hover:scale-110" />
          <span class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Blog</span>
        </RouterLink>

        <nav class="flex items-center gap-2">
          <RouterLink
            to="/"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            <IconBookOpen size={18} />
            浏览
          </RouterLink>
          <button
            class="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.97]"
            @click="router.push('/posts/new')"
          >
            <IconPencil size={16} weight="fill" />
            写文章
          </button>
          <button
            class="flex items-center justify-center rounded-lg p-2 text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            :title="isDark ? '切换到亮色' : '切换到暗色'"
            @click="toggle"
          >
            <IconSun v-if="isDark" size={18} />
            <IconMoon v-else size={18} />
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="mx-auto max-w-6xl px-6 py-10">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-stone-200 dark:border-zinc-800">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm text-zinc-400 dark:text-zinc-500">
        <span>Vue 3 + Next.js + Prisma</span>
        <span>数据持久化于数据库</span>
      </div>
    </footer>
  </div>
</template>
