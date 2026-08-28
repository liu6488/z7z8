<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { postsApi, type PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'
import PostCard from '@/components/PostCard.vue'
import { IconSearch, IconMagnifyingGlass, IconPencil, IconTrash, IconCaretRight, IconClock } from '@phosphor-icons/vue'

const store = usePostsStore()
const router = useRouter()
const deleting = ref<string | null>(null)

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
  <div class="space-y-8">
    <!-- 搜索与筛选 -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="relative flex-1">
        <IconSearch size={20} weight="regular" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="searchInput"
          type="search"
          placeholder="搜索文章标题或内容…"
          class="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          @keyup.enter="store.fetchPosts(1)"
        />
      </div>
      <select
        v-model="store.statusFilter"
        class="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="all">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
      <span class="ml-auto text-sm text-zinc-500" v-if="!store.loading">
        共 {{ store.pagination.total }} 篇
      </span>
    </div>

    <!-- 加载中 -->
    <div v-if="store.loading" class="py-20 text-center text-zinc-400">
      <IconClock size={48} weight="light" class="mx-auto mb-4 text-zinc-300" />
      <p>加载中…</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="store.posts.length === 0" class="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
      <IconPencil size={48} weight="light" class="mx-auto mb-4 text-zinc-300" />
      <p class="mb-3 text-zinc-500">还没有文章</p>
      <button
        class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.97]"
        @click="router.push('/posts/new')"
      >
        写第一篇文章
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="space-y-4">
      <PostCard v-for="post in store.posts" :key="post.id" :post="post">
        <template #actions>
          <button
            class="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-indigo-600"
            @click="router.push(`/posts/${post.id}/edit`)"
          >
            <IconPencil size={14} weight="bold" />
            编辑
          </button>
          <button
            class="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-40"
            :disabled="deleting === post.id"
            @click="removePost(post)"
          >
            <IconTrash size={14} weight="bold" />
            {{ deleting === post.id ? '删除中…' : '删除' }}
          </button>
        </template>
      </PostCard>
    </div>

    <!-- 分页 -->
    <div v-if="store.pagination.totalPages > 1" class="flex items-center justify-center gap-3 pt-4">
      <button
        class="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm transition-all hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        :disabled="store.pagination.page <= 1"
        @click="goPage(store.pagination.page - 1)"
      >
        <IconCaretRight size={16} weight="bold" class="rotate-180" />
        上一页
      </button>
      <span class="text-sm text-zinc-600 dark:text-zinc-400">
        {{ store.pagination.page }} / {{ store.pagination.totalPages }}
      </span>
      <button
        class="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm transition-all hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        :disabled="store.pagination.page >= store.pagination.totalPages"
        @click="goPage(store.pagination.page + 1)"
      >
        下一页
        <IconCaretRight size={16} weight="bold" />
      </button>
    </div>
  </div>
</template>
