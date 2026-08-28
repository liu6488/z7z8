<script setup lang="ts">
import type { PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'
import { IconEye, IconPencil, IconTrash, IconCaretRight } from '@phosphor-icons/vue'

defineProps<{ post: PostListItem }>()
</script>

<template>
  <article
    class="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-indigo-700"
  >
    <div class="mb-2 flex items-center gap-3 text-xs text-zinc-400">
      <span
        class="rounded-full px-2.5 py-0.5 font-medium"
        :class="post.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
      >
        {{ post.status === 'published' ? '已发布' : '草稿' }}
      </span>
      <span>{{ formatDate(post.createdAt) }}</span>
      <span class="flex items-center gap-1">
        <IconEye size={12} weight="fill" />
        {{ post.views }}
      </span>
    </div>

    <router-link :to="`/posts/${post.id}`" class="block">
      <h2 class="mb-1.5 text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100">
        {{ post.title }}
      </h2>
      <p class="mb-3 text-sm leading-6 text-zinc-500">
        {{ post.excerpt || '（无摘要）' }}
      </p>
    </router-link>

    <div class="flex items-center justify-between pt-2">
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in parseTags(post.tags)"
          :key="tag"
          class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ tag }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <slot name="actions" />
        <router-link
          :to="`/posts/${post.id}`"
          class="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800"
        >
          阅读全文
          <IconCaretRight size={14} weight="bold" />
        </router-link>
      </div>
    </div>
  </article>
</template>
