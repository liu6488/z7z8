<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { postsApi, type PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'
import { useReveal } from '@/composables/useReveal'
import PostCard from '@/components/PostCard.vue'
import { PhMagnifyingGlass, PhPenNib, PhTrash, PhCaretRight, PhScribbleLoop } from '@phosphor-icons/vue'

const store = usePostsStore()
const router = useRouter()
const deleting = ref<string | null>(null)
const listRef = ref<HTMLElement | null>(null)

useReveal(listRef)

onMounted(() => store.fetchPosts(1))

watch([() => store.keyword, () => store.statusFilter], () => store.fetchPosts(1))

// 搜索输入绑定到 store.keyword
const searchInput = ref('')
watch(searchInput, (val) => {
  store.keyword = val
  store.fetchPosts(1)
})

function goPage(page: number) {
  if (page < 1 || page > store.pagination.totalPages) return
  store.fetchPosts(page)
}

async function removePost(post: PostListItem) {
  if (!window.confirm(`确定删除「${post.title}」？此操作不可恢复。`)) return
  deleting.value = post.id
  try {
    await postsApi.remove(post.id)
    await store.fetchPosts(store.pagination.page)
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="space-y-10">
    <!-- Hero 区（编辑风格，左对齐非对称） -->
    <header class="max-w-2xl">
      <h1 class="rise-in text-4xl font-semibold tracking-tighter text-zinc-900 md:text-5xl dark:text-zinc-50" style="animation-delay: 0ms">
        随笔集
      </h1>
      <p class="rise-in mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400" style="animation-delay: 80ms">
        记录想法与见闻的地方。每篇文章都持久化保存，可搜索、可回看。
      </p>
      <p class="rise-in mt-2 text-sm text-zinc-400 dark:text-zinc-500" style="animation-delay: 140ms">
        {{ store.pagination.total }} 篇文章，继续写下去。
      </p>
    </header>

    <!-- 搜索与筛选 -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
        <PhMagnifyingGlass :size="16" weight="regular" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="searchInput"
          type="search"
          placeholder="搜索文章…"
          class="input pl-10"
          @keyup.enter="store.fetchPosts(1)"
        />
      </div>
      <select
        v-model="store.statusFilter"
        class="input h-[42px] w-auto"
      >
        <option value="all">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
    </div>

    <!-- 加载中（骨架屏） -->
    <div v-if="store.loading" class="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800">
      <div v-for="i in 3" :key="i" class="flex flex-col gap-3 py-7">
        <div class="flex items-center gap-3">
          <div class="skeleton h-5 w-14" />
          <div class="skeleton h-4 w-28" />
        </div>
        <div class="skeleton h-6 w-2/3" />
        <div class="skeleton h-4 w-full" />
        <div class="skeleton h-4 w-4/5" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="store.posts.length === 0" class="panel flex flex-col items-center px-6 py-20 text-center">
      <span class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
        <PhScribbleLoop :size="20" weight="light" />
      </span>
      <p class="mb-1 text-base font-medium text-zinc-700 dark:text-zinc-200">还没有文章</p>
      <p class="mb-6 text-sm text-zinc-400 dark:text-zinc-500">写下第一篇，从这里开始。</p>
      <button
        class="btn btn-primary px-6"
        @click="router.push('/posts/new')"
      >
        <PhPenNib :size="15" weight="fill" />
        写第一篇文章
      </button>
    </div>

    <!-- 文章列表（编辑杂志式行列表） -->
    <div v-else ref="listRef" class="divide-y divide-zinc-200 dark:divide-zinc-800">
      <div
        v-for="(post, index) in store.posts"
        :key="post.id"
        data-reveal
        :style="{ '--reveal-delay': `${Math.min(index, 8) * 60}ms` }"
      >
        <PostCard :post="post">
          <template #actions>
            <button
              class="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
              @click="router.push(`/posts/${post.id}/edit`)"
            >
              <PhPenNib :size="13" weight="bold" />
              编辑
            </button>
            <button
              class="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-40"
              :disabled="deleting === post.id"
              @click="removePost(post)"
            >
              <PhTrash :size="13" weight="bold" />
              {{ deleting === post.id ? '删除中…' : '删除' }}
            </button>
          </template>
        </PostCard>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="store.pagination.totalPages > 1" class="flex items-center justify-center gap-3 pt-4">
      <button
        class="btn btn-secondary"
        :disabled="store.pagination.page <= 1"
        @click="goPage(store.pagination.page - 1)"
      >
        <PhCaretRight :size="15" weight="bold" class="rotate-180" />
        上一页
      </button>
      <span class="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
        {{ store.pagination.page }} / {{ store.pagination.totalPages }}
      </span>
      <button
        class="btn btn-secondary"
        :disabled="store.pagination.page >= store.pagination.totalPages"
        @click="goPage(store.pagination.page + 1)"
      >
        下一页
        <PhCaretRight :size="15" weight="bold" />
      </button>
    </div>
  </div>
</template>
