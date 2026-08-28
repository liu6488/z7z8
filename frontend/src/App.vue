<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <router-link to="/" class="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">笔</span>
          我的博客
        </router-link>
        <nav class="flex items-center gap-4 text-sm">
          <router-link to="/" class="text-gray-600 hover:text-indigo-600">首页</router-link>
          <button
            class="rounded-lg bg-indigo-600 px-4 py-1.5 font-medium text-white transition hover:bg-indigo-700"
            @click="router.push('/posts/new')"
          >
            写文章
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
      Vue 3 + Next.js + Prisma · 数据持久化于数据库
    </footer>
  </div>
</template>
