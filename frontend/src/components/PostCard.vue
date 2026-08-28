<script setup lang="ts">
import type { PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'
import { PhCaretRight, PhEye } from '@phosphor-icons/vue'

defineProps<{ post: PostListItem }>()
</script>

<template>
  <article class="group flex flex-col gap-2.5 py-7 transition-colors duration-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40">
    <!-- 元数据行 -->
    <div class="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
      <span
        class="badge"
        :class="post.status === 'published' ? 'badge-published' : 'badge-draft'"
      >
        {{ post.status === 'published' ? '已发布' : '草稿' }}
      </span>
      <span class="tabular-nums">{{ formatDate(post.createdAt) }}</span>
      <span class="flex items-center gap-1 tabular-nums">
        <PhEye :size="12" weight="fill" />
        {{ post.views }}
      </span>
    </div>

    <!-- 标题 + 摘要 -->
    <router-link :to="`/posts/${post.id}`" class="block">
      <h2 class="mb-1.5 text-xl font-semibold tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-orange-700 dark:text-zinc-100 dark:group-hover:text-orange-400">
        {{ post.title }}
      </h2>
      <p class="line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {{ post.excerpt || '（无摘要）' }}
      </p>
    </router-link>

    <!-- 标签 + 操作 -->
    <div class="mt-1 flex items-center justify-between gap-4">
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in parseTags(post.tags)"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-4">
        <slot name="actions" />
        <router-link
          :to="`/posts/${post.id}`"
          class="flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors duration-300 group-hover:text-orange-700 dark:text-zinc-500 dark:group-hover:text-orange-400"
        >
          阅读
          <PhCaretRight :size="15" weight="bold" class="arrow-slide" />
        </router-link>
      </div>
    </div>
  </article>
</template>
