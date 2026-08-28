<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { postsApi, type PostListItem } from '@/api/posts'
import { formatDate, parseTags } from '@/composables/useMarkdown'
import PostCard from '@/components/PostCard.vue'

const store = usePostsStore()
const router = useRouter()
const deleting = ref<string | null>(null)

onMounted(() => store.fetchPosts(1))

watch([() => store.keyword, () => store.statusFilter], () => store.fetchPosts(1))

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
  <div>
    <!-- 工具栏 -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <input
        v-model="store.keyword"
        type="search"
        placeholder="搜索文章标题或内容…"
        class="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        @keyup.enter="store.fetchPosts(1)"
      />
      <select
        v-model="store.statusFilter"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      >
        <option value="all">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
      <span class="ml-auto text-sm text-gray-500" v-if="!store.loading">
        共 {{ store.pagination.total }} 篇
      </span>
    </div>

    <!-- 加载中 -->
    <div v-if="store.loading" class="py-20 text-center text-gray-400">加载中…</div>

    <!-- 空状态 -->
    <div v-else-if="store.posts.length === 0" class="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
      <p class="mb-2 text-gray-500">还没有文章</p>
      <button
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
            class="text-xs text-gray-400 hover:text-indigo-600"
            @click="router.push(`/posts/${post.id}/edit`)"
          >
            编辑
          </button>
          <button
            class="text-xs text-gray-400 hover:text-red-600 disabled:opacity-40"
            :disabled="deleting === post.id"
            @click="removePost(post)"
          >
            {{ deleting === post.id ? '删除中…' : '删除' }}
          </button>
        </template>
      </PostCard>
    </div>

    <!-- 分页 -->
    <div v-if="store.pagination.totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <button
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        :disabled="store.pagination.page <= 1"
        @click="goPage(store.pagination.page - 1)"
      >
        上一页
      </button>
      <span class="px-2 text-sm text-gray-600">
        {{ store.pagination.page }} / {{ store.pagination.totalPages }}
      </span>
      <button
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
        :disabled="store.pagination.page >= store.pagination.totalPages"
        @click="goPage(store.pagination.page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
