<script setup lang="ts">
import type { PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'

defineProps<{ post: PostListItem }>()
</script>

<template>
  <article
    class="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
  >
    <div class="mb-1.5 flex items-center gap-2">
      <span
        class="rounded-full px-2 py-0.5 text-xs font-medium"
        :class="post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
      >
        {{ post.status === 'published' ? '已发布' : '草稿' }}
      </span>
      <span class="text-xs text-gray-400">{{ formatDate(post.createdAt) }}</span>
      <span class="text-xs text-gray-400">· {{ post.views }} 次阅读</span>
    </div>

    <router-link :to="`/posts/${post.id}`" class="block">
      <h2 class="mb-1 text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
        {{ post.title }}
      </h2>
      <p class="mb-3 line-clamp-2 text-sm leading-6 text-gray-500">
        {{ post.excerpt || '（无摘要）' }}
      </p>
    </router-link>

    <div class="flex items-center justify-between">
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in parseTags(post.tags)"
          :key="tag"
          class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
        >
          {{ tag }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <slot name="actions" />
        <router-link
          :to="`/posts/${post.id}`"
          class="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          阅读 →
        </router-link>
      </div>
    </div>
  </article>
</template>
