<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi, type PostDetail } from '@/api/posts'
import { renderMarkdown } from '@/composables/useMarkdown'

const route = useRoute()
const router = useRouter()

const post = ref<PostDetail | null>(null)
const loading = ref(true)
const error = ref('')

const renderedContent = computed(() =>
  post.value ? renderMarkdown(post.value.content) : '',
)

onMounted(async () => {
  try {
    const res = await postsApi.get(route.params.id as string)
    post.value = res.data
  } catch (e: any) {
    error.value = e?.response?.status === 404 ? '文章不存在或已被删除' : '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="py-20 text-center text-gray-400">加载中…</div>

  <div v-else-if="error" class="py-20 text-center">
    <p class="mb-4 text-gray-500">{{ error }}</p>
    <button class="text-indigo-600 hover:underline" @click="router.push('/')">← 返回首页</button>
  </div>

  <article v-else-if="post" class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
    <header class="mb-8 border-b border-gray-100 pb-6">
      <div class="mb-2 flex items-center gap-2 text-xs text-gray-400">
        <span
          class="rounded-full px-2 py-0.5 font-medium"
          :class="post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
        >
          {{ post.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <span>{{ post.views }} 次阅读</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900">{{ post.title }}</h1>
      <div class="mt-3 flex items-center justify-between">
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in post.tags.split(',').filter(Boolean)"
            :key="tag"
            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
          >
            {{ tag }}
          </span>
        </div>
        <button
          class="text-sm text-gray-400 hover:text-indigo-600"
          @click="router.push(`/posts/${post.id}/edit`)"
        >
          编辑这篇文章
        </button>
      </div>
    </header>

    <!-- 渲染后的 Markdown 正文 -->
    <div class="markdown-body" v-html="renderedContent"></div>

    <footer class="mt-10 border-t border-gray-100 pt-6 text-sm">
      <button class="text-indigo-600 hover:underline" @click="router.push('/')">← 返回文章列表</button>
    </footer>
  </article>
</template>
